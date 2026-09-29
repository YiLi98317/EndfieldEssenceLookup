"""Detects the current Endfield version calendar on the official website and syncs it into the repo.

Only touches public/images/version-calendar/ and src/data/versionCalendars.json; committing and
opening a PR is left to the GitHub workflow.

Usage: python scripts/sync_calendar.py
"""

import asyncio
import hashlib
import json
import re
import struct
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import Error as PlaywrightError
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
PAGE_URL = "https://endfield.hypergryph.com/#calendar"
IMAGES_DIR = ROOT / "public/images/version-calendar"
VERSIONS_FILE = ROOT / "src/data/versionCalendars.json"
ROLES = ("title", "timeline", "content")
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/140.0.0.0 Safari/537.36"
)


def log(message):
    print(f"[calendar-sync] {message}", flush=True)


def rel(file):
    return Path(file).relative_to(ROOT).as_posix()


def sha256(data):
    return hashlib.sha256(data).hexdigest()


# ---------- image helpers ----------


def image_format(data):
    if len(data) > 24 and data[:4] == b"\x89PNG":
        return "png"
    if len(data) > 4 and data[0] == 0xFF and data[1] == 0xD8:
        return "jpg"
    if len(data) > 30 and data[0:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


def image_width(data):
    fmt = image_format(data)
    if fmt == "png":
        return struct.unpack_from(">I", data, 16)[0]
    if fmt == "jpg":
        offset = 2
        while offset + 9 < len(data):
            if data[offset] != 0xFF:
                offset += 1
                continue
            marker = data[offset + 1]
            is_start_of_frame = 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC)
            if is_start_of_frame:
                return struct.unpack_from(">H", data, offset + 7)[0]
            offset += 2 + struct.unpack_from(">H", data, offset + 2)[0]
    if fmt == "webp":
        chunk = data[12:16]
        if chunk == b"VP8X":
            return 1 + int.from_bytes(data[24:27], "little")
        if chunk == b"VP8 ":
            return struct.unpack_from("<H", data, 26)[0] & 0x3FFF
        if chunk == b"VP8L":
            return (struct.unpack_from("<I", data, 21)[0] & 0x3FFF) + 1
    raise RuntimeError(f"Cannot read image width (format: {fmt or 'unknown'})")


# ---------- versionCalendars.json ----------


def to_json(value):
    return json.dumps(value, ensure_ascii=False)


# Keeps nested objects on one line to match the hand-written style of the file.
def format_versions(entries):
    def inline(value):
        if isinstance(value, dict):
            return "{ " + ", ".join(f"{to_json(k)}: {to_json(v)}" for k, v in value.items()) + " }"
        return to_json(value)

    body = []
    for entry in entries:
        lines = [f"    {to_json(k)}: {inline(v)}" for k, v in entry.items()]
        body.append("  {\n" + ",\n".join(lines) + "\n  }")
    return "[\n" + ",\n".join(body) + "\n]\n"


def version_key(version):
    major, minor = version.split(".")
    return int(major), int(minor)


def next_version(version):
    major, minor = version_key(version)
    return f"{major}.{minor + 1}"


# sha256 -> {version, role} for every image referenced by versionCalendars.json.
def load_known_assets(versions):
    known = {}
    for entry in versions:
        if not entry.get("images"):
            continue
        for role in ROLES:
            data = (IMAGES_DIR / entry["version"] / entry["images"][role]).read_bytes()
            known[sha256(data)] = {"version": entry["version"], "role": role}
    return known


# ---------- remote detection ----------

SCAN_DOM = """
() => {
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
    if (el.tagName === 'SOURCE' && el.srcset) add(el.srcset.split(',')[0].trim().split(/\\s+/)[0], el)
    const background = getComputedStyle(el).backgroundImage
    for (const match of background.matchAll(/url\\(["']?([^"')]+)["']?\\)/g)) add(match[1], el)
  }
  return found
}
"""


async def collect_candidates():
    log("Opening official website")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await browser.new_page(viewport={"width": 1920, "height": 1080})
            network_images = []

            def on_response(response):
                if response.request.resource_type == "image" and response.ok:
                    if response.url not in network_images:
                        network_images.append(response.url)

            page.on("response", on_response)

            await page.goto(PAGE_URL, wait_until="domcontentloaded", timeout=90_000)
            try:
                await page.wait_for_selector('[class*="Calendar"] img', state="attached", timeout=90_000)
            except PlaywrightError:
                log("Calendar section selector not found; falling back to page-wide scan")
            try:
                await page.wait_for_load_state("networkidle", timeout=30_000)
            except PlaywrightError:
                pass

            candidates = await page.evaluate(SCAN_DOM)
            for url in network_images:
                candidates.append({"url": url, "className": "", "inCalendar": False})
            return candidates
        finally:
            await browser.close()


# Filenames are the primary signal; the calendar's CSS classes cover a future rename.
def role_of(candidate):
    file = urlparse(candidate["url"]).path.split("/")[-1]
    by_name = re.match(r"^(title|timeline|content)[.\-_]", file, re.IGNORECASE)
    if by_name:
        return by_name.group(1).lower()
    if not candidate["inCalendar"]:
        return None
    class_name = candidate["className"]
    if re.search(r"Calendar_title", class_name, re.IGNORECASE):
        return "title"
    if re.search(r"Calendar_timeline", class_name, re.IGNORECASE):
        return "timeline"
    if re.search(r"Calendar_calendar", class_name, re.IGNORECASE):
        return "content"
    return None


def fetch_bytes(url):
    request = urllib.request.Request(url, headers={"Referer": PAGE_URL, "User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Download failed ({error.code}): {url}") from None


async def download(url):
    data = await asyncio.to_thread(fetch_bytes, url)
    if not data:
        raise RuntimeError(f"Downloaded file is empty: {url}")
    fmt = image_format(data)
    if not fmt:
        raise RuntimeError(f"Not a PNG/JPEG/WebP image: {url}")
    return {"url": url, "bytes": data, "format": fmt, "sha256": sha256(data)}


# Returns one downloaded asset per role, or raises if the page no longer exposes a clear calendar.
async def detect_calendar():
    candidates = await collect_candidates()
    by_role = {role: [] for role in ROLES}
    for candidate in candidates:
        role = role_of(candidate)
        if role:
            by_role[role].append(candidate)
    candidate_urls = {c["url"] for group in by_role.values() for c in group}
    log(f"Found {len(candidate_urls)} candidate assets")

    detected = {}
    for role in ROLES:
        scoped = [c for c in by_role[role] if c["inCalendar"]]
        urls = list(dict.fromkeys(c["url"] for c in (scoped or by_role[role])))
        if not urls:
            raise RuntimeError(
                f'No "{role}" calendar image found on {PAGE_URL}. The website structure may have changed.'
            )
        for url in urls:
            log(f"Candidate ({role}): {url}")
        assets = await asyncio.gather(*(download(url) for url in urls))
        distinct = list({a["sha256"]: a for a in assets}.values())
        if len(distinct) > 1:
            listing = "\n  ".join(a["url"] for a in distinct)
            raise RuntimeError(
                f'Found {len(distinct)} different "{role}" images; cannot tell which is the calendar:\n  {listing}'
            )
        detected[role] = distinct[0]
    return detected


# ---------- updates ----------


def save_image(version, role, asset):
    file = IMAGES_DIR / version / f"{role}.{asset['format']}"
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_bytes(asset["bytes"])
    log(f"Downloaded: {rel(file)} ({asset['url']})")
    return file.name


def widths(detected):
    return {
        "contentWidth": image_width(detected["content"]["bytes"]),
        "timelineWidth": image_width(detected["timeline"]["bytes"]),
    }


def add_version(versions, latest, detected):
    version = next_version(latest["version"])
    index = next((i for i, v in enumerate(versions) if v["version"] == version), None)
    existing = versions[index] if index is not None else None
    if existing and existing.get("images"):
        raise RuntimeError(f"Version {version} already has a calendar; refusing to overwrite")
    if (IMAGES_DIR / version).exists():
        raise RuntimeError(f"{rel(IMAGES_DIR / version)} already exists; refusing to overwrite")
    log(f"New calendar detected: {version}")

    images = {role: save_image(version, role, detected[role]) for role in ROLES}

    def keep(key):
        return existing.get(key) if existing else None

    release_date = keep("releaseDate")
    entry = {
        "version": version,
        "title": keep("title"),
        "titleZh": keep("titleZh"),
        "releaseDate": release_date if release_date is not None else datetime.now(timezone.utc).date().isoformat(),
        "images": images,
        **widths(detected),
    }
    if existing:
        versions[index] = entry
    else:
        versions.insert(0, entry)


# Same title image with a different timeline/content means Hypergryph revised the current calendar.
def revise_version(latest, detected, changed_roles, known):
    owner = known[detected["title"]["sha256"]]["version"]
    if owner != latest["version"]:
        raise RuntimeError(f"Title matches older version {owner}, but timeline/content changed; refusing to modify it")
    for role in changed_roles:
        previous = latest["images"][role]
        saved = save_image(owner, role, detected[role])
        if previous != saved:
            (IMAGES_DIR / owner / previous).unlink(missing_ok=True)
        latest["images"] = {**latest["images"], role: saved}
        log(f"Updated calendar: {owner} {role}")
    latest.update(widths(detected))


# ---------- main ----------


async def main():
    versions = json.loads(VERSIONS_FILE.read_text(encoding="utf-8"))
    known = load_known_assets(versions)
    detected = await detect_calendar()

    changed_roles = []
    for role in ROLES:
        match = known.get(detected[role]["sha256"])
        if match:
            log(f"Known calendar: {match['version']} {role} ({detected[role]['url']})")
        else:
            changed_roles.append(role)
    if not changed_roles:
        log("No new Endfield calendar detected")
        return

    with_images = sorted((v for v in versions if v.get("images")), key=lambda v: version_key(v["version"]), reverse=True)
    if not with_images:
        raise RuntimeError(f"No existing calendar versions in {rel(VERSIONS_FILE)}")
    latest = with_images[0]

    if "title" in changed_roles:
        add_version(versions, latest, detected)
    else:
        revise_version(latest, detected, changed_roles, known)

    VERSIONS_FILE.write_text(format_versions(versions), encoding="utf-8", newline="\n")
    log(f"Updated {rel(VERSIONS_FILE)}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as error:
        print(f"[calendar-sync] ERROR: {error}", file=sys.stderr, flush=True)
        sys.exit(1)
