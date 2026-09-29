import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PAGE_URL = 'https://endfield.hypergryph.com/#calendar'
const IMAGES_DIR = path.join(ROOT, 'public/images/version-calendar')
const VERSIONS_FILE = path.join(ROOT, 'src/data/versionCalendars.json')
const ROLES = ['title', 'timeline', 'content']

const log = (message) => console.log(`[calendar-sync] ${message}`)
const rel = (file) => path.relative(ROOT, file).split(path.sep).join('/')
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

// ---------- image helpers ----------

function imageFormat(bytes) {
  if (bytes.length > 24 && bytes.readUInt32BE(0) === 0x89504e47) return 'png'
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg'
  if (bytes.length > 30 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp'
  }
  return null
}

function imageWidth(bytes) {
  const format = imageFormat(bytes)
  if (format === 'png') return bytes.readUInt32BE(16)
  if (format === 'jpg') {
    let offset = 2
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1
        continue
      }
      const marker = bytes[offset + 1]
      const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
      if (isStartOfFrame) return bytes.readUInt16BE(offset + 7)
      offset += 2 + bytes.readUInt16BE(offset + 2)
    }
  }
  if (format === 'webp') {
    const chunk = bytes.toString('ascii', 12, 16)
    if (chunk === 'VP8X') return 1 + bytes.readUIntLE(24, 3)
    if (chunk === 'VP8 ') return bytes.readUInt16LE(26) & 0x3fff
    if (chunk === 'VP8L') return (bytes.readUInt32LE(21) & 0x3fff) + 1
  }
  throw new Error(`Cannot read image width (format: ${format ?? 'unknown'})`)
}

// ---------- versionCalendars.json ----------

// Keeps nested objects on one line to match the hand-written style of the file.
function formatVersions(entries) {
  const inline = (value) =>
    value && typeof value === 'object'
      ? `{ ${Object.entries(value).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')} }`
      : JSON.stringify(value)
  const body = entries.map((entry) => {
    const lines = Object.entries(entry).map(([k, v]) => `    ${JSON.stringify(k)}: ${inline(v)}`)
    return `  {\n${lines.join(',\n')}\n  }`
  })
  return `[\n${body.join(',\n')}\n]\n`
}

const compareVersions = (a, b) => {
  const [aMajor, aMinor] = a.split('.').map(Number)
  const [bMajor, bMinor] = b.split('.').map(Number)
  return aMajor - bMajor || aMinor - bMinor
}

const nextVersion = (version) => {
  const [major, minor] = version.split('.').map(Number)
  return `${major}.${minor + 1}`
}

// sha256 -> { version, role } for every image referenced by versionCalendars.json.
async function loadKnownAssets(versions) {
  const known = new Map()
  for (const entry of versions) {
    if (!entry.images) continue
    for (const role of ROLES) {
      const bytes = await readFile(path.join(IMAGES_DIR, entry.version, entry.images[role]))
      known.set(sha256(bytes), { version: entry.version, role })
    }
  }
  return known
}

// ---------- remote detection ----------

async function collectCandidates() {
  log('Opening official website')
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
    const networkImages = new Set()
    page.on('response', (response) => {
      if (response.request().resourceType() === 'image' && response.ok()) networkImages.add(response.url())
    })

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 90_000 })
    await page
      .waitForSelector('[class*="Calendar"] img', { state: 'attached', timeout: 90_000 })
      .catch(() => log('Calendar section selector not found; falling back to page-wide scan'))
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})

    const domCandidates = await page.evaluate(() => {
      const found = []
      const add = (url, el) => {
        if (!url || url.startsWith('data:')) return
        found.push({
          url: new URL(url, location.href).href,
          className: typeof el.className === 'string' ? el.className : '',
          inCalendar: Boolean(el.closest('[class*="Calendar"], #calendar')),
        })
      }
      for (const el of document.querySelectorAll('*')) {
        if (el.tagName === 'IMG') add(el.currentSrc || el.src, el)
        if (el.tagName === 'SOURCE' && el.srcset) add(el.srcset.split(',')[0].trim().split(/\s+/)[0], el)
        const background = getComputedStyle(el).backgroundImage
        for (const match of background.matchAll(/url\(["']?([^"')]+)["']?\)/g)) add(match[1], el)
      }
      return found
    })

    const candidates = [...domCandidates]
    for (const url of networkImages) candidates.push({ url, className: '', inCalendar: false })
    return candidates
  } finally {
    await browser.close()
  }
}

// Filenames are the primary signal; the calendar's CSS classes cover a future rename.
function roleOf(candidate) {
  const file = new URL(candidate.url).pathname.split('/').pop()
  const byName = file.match(/^(title|timeline|content)[.\-_]/i)
  if (byName) return byName[1].toLowerCase()
  if (!candidate.inCalendar) return null
  if (/Calendar_title/i.test(candidate.className)) return 'title'
  if (/Calendar_timeline/i.test(candidate.className)) return 'timeline'
  if (/Calendar_calendar/i.test(candidate.className)) return 'content'
  return null
}

async function download(url) {
  const response = await fetch(url, { headers: { Referer: PAGE_URL } })
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const format = imageFormat(bytes)
  if (!format) throw new Error(`Not a PNG/JPEG/WebP image: ${url}`)
  return { url, bytes, format, sha256: sha256(bytes) }
}

// Returns one downloaded asset per role, or throws if the page no longer exposes a clear calendar.
async function detectCalendar() {
  const candidates = await collectCandidates()
  const byRole = Object.fromEntries(ROLES.map((role) => [role, []]))
  for (const candidate of candidates) {
    const role = roleOf(candidate)
    if (role) byRole[role].push(candidate)
  }
  const candidateUrls = new Set(Object.values(byRole).flat().map((c) => c.url))
  log(`Found ${candidateUrls.size} candidate assets`)

  const detected = {}
  for (const role of ROLES) {
    const scoped = byRole[role].filter((c) => c.inCalendar)
    const urls = [...new Set((scoped.length ? scoped : byRole[role]).map((c) => c.url))]
    if (urls.length === 0) {
      throw new Error(`No "${role}" calendar image found on ${PAGE_URL}. The website structure may have changed.`)
    }
    const assets = await Promise.all(urls.map(download))
    const distinct = [...new Map(assets.map((a) => [a.sha256, a])).values()]
    if (distinct.length > 1) {
      throw new Error(
        `Found ${distinct.length} different "${role}" images; cannot tell which is the calendar:\n  ${distinct
          .map((a) => a.url)
          .join('\n  ')}`,
      )
    }
    detected[role] = distinct[0]
  }
  return detected
}

// ---------- updates ----------

async function saveImage(version, role, asset) {
  const file = path.join(IMAGES_DIR, version, `${role}.${asset.format}`)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, asset.bytes)
  log(`Downloaded: ${rel(file)} (${asset.url})`)
  return path.basename(file)
}

const widths = (detected) => ({
  contentWidth: imageWidth(detected.content.bytes),
  timelineWidth: imageWidth(detected.timeline.bytes),
})

async function addVersion(versions, latest, detected) {
  const version = nextVersion(latest.version)
  const index = versions.findIndex((v) => v.version === version)
  const existing = versions[index]
  if (existing?.images) throw new Error(`Version ${version} already has a calendar; refusing to overwrite`)
  if (existsSync(path.join(IMAGES_DIR, version))) {
    throw new Error(`${rel(path.join(IMAGES_DIR, version))} already exists; refusing to overwrite`)
  }
  log(`New calendar detected: ${version}`)

  const images = {}
  for (const role of ROLES) images[role] = await saveImage(version, role, detected[role])

  const entry = {
    version,
    title: existing?.title ?? null,
    titleZh: existing?.titleZh ?? null,
    releaseDate: existing?.releaseDate ?? new Date().toISOString().slice(0, 10),
    images,
    ...widths(detected),
  }
  if (existing) versions[index] = entry
  else versions.unshift(entry)
}

// Same title image with a different timeline/content means Hypergryph revised the current calendar.
async function reviseVersion(latest, detected, changedRoles, known) {
  const owner = known.get(detected.title.sha256).version
  if (owner !== latest.version) {
    throw new Error(`Title matches older version ${owner}, but timeline/content changed; refusing to modify it`)
  }
  for (const role of changedRoles) {
    const previous = latest.images[role]
    const saved = await saveImage(owner, role, detected[role])
    if (previous !== saved) await rm(path.join(IMAGES_DIR, owner, previous), { force: true })
    latest.images = { ...latest.images, [role]: saved }
    log(`Updated calendar: ${owner} ${role}`)
  }
  Object.assign(latest, widths(detected))
}

// ---------- main ----------

async function main() {
  const versions = JSON.parse(await readFile(VERSIONS_FILE, 'utf8'))
  const known = await loadKnownAssets(versions)
  const detected = await detectCalendar()

  const changedRoles = ROLES.filter((role) => {
    const match = known.get(detected[role].sha256)
    if (match) log(`Known calendar: ${match.version} ${role} (${detected[role].url})`)
    return !match
  })
  if (changedRoles.length === 0) {
    log('No new Endfield calendar detected')
    return
  }

  const latest = versions.filter((v) => v.images).sort((a, b) => compareVersions(b.version, a.version))[0]
  if (!latest) throw new Error(`No existing calendar versions in ${rel(VERSIONS_FILE)}`)

  if (changedRoles.includes('title')) await addVersion(versions, latest, detected)
  else await reviseVersion(latest, detected, changedRoles, known)

  await writeFile(VERSIONS_FILE, formatVersions(versions))
  log(`Updated ${rel(VERSIONS_FILE)}`)
}

main().catch((error) => {
  console.error(`[calendar-sync] ERROR: ${error.message}`)
  process.exit(1)
})
