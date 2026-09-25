import fs from 'node:fs'

const labels = (process.env.PR_LABELS || '')
  .split(',')
  .map((label) => label.trim())
  .filter(Boolean)

const bumps = ['patch', 'minor', 'major'].filter((name) => labels.includes(name))

if (!labels.includes('release')) {
  console.error('Missing required label: release')
  process.exit(1)
}

if (bumps.length !== 1) {
  console.error(
    `Need exactly one of patch, minor, or major. Found: ${bumps.join(', ') || '(none)'}`,
  )
  process.exit(1)
}

const bump = bumps[0]
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const current = pkg.version
const next = nextVersion(current, bump)
const notes = `release-notes/v${next}.md`

if (!fs.existsSync(notes)) {
  console.error(
    `Missing ${notes} (package.json is ${current}; ${bump} bump expects v${next})`,
  )
  process.exit(1)
}

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `bump=${bump}\nversion=${next}\nnotes=${notes}\n`,
  )
}

console.log(`Current ${current} + ${bump} → v${next} (${notes})`)

function nextVersion(version, kind) {
  const parts = version.split('.').map((n) => Number.parseInt(n, 10))
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    throw new Error(`Unsupported version in package.json: ${version}`)
  }

  let [major, minor, patch] = parts
  if (kind === 'major') {
    major += 1
    minor = 0
    patch = 0
  } else if (kind === 'minor') {
    minor += 1
    patch = 0
  } else {
    patch += 1
  }

  return `${major}.${minor}.${patch}`
}
