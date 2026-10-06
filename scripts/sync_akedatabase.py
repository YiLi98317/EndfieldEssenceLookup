#!/usr/bin/env python3
"""Fetch AKEDatabase factory tables and merge verified ports into factory.json.

The public AKEDatabase manifest is the version source of truth.  The importer
only uses the manifest, FactoryBuildingTable, and I18nTextTable_CN; it does not
depend on a third-party planner's exported or inferred layout data.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FACTORY_PATH = ROOT / "src/data/factory.json"
LAYOUT_PATH = ROOT / "src/data/akedatabase-machine-layouts.json"
BASE_URL = "https://data.akedata.wiki"
USER_AGENT = "EndfieldEssenceLookup/0.3 AKEDatabase importer"


def fetch_json(url: str):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = response.read()
    return json.loads(payload), hashlib.sha256(payload).hexdigest()


def clean_version(value: str) -> str:
    value = str(value or "").strip()
    if not re.fullmatch(r"[A-Za-z0-9._-]+", value):
        raise ValueError(f"Invalid AKEDatabase version component: {value!r}")
    return value


def pick_version(manifest: dict, game_version: str | None, hotfix: str | None) -> dict:
    if game_version or hotfix:
        game_version = clean_version(game_version or "")
        hotfix = clean_version(hotfix or "")
        for item in manifest.get("versions", []):
            if item.get("gameVersion") == game_version and item.get("hotfixVersion") == hotfix:
                return item
        raise ValueError(f"AKEDatabase version not found: {game_version}@{hotfix}")
    latest = manifest.get("latest")
    for item in manifest.get("versions", []):
        if item.get("id") == latest:
            return item
    raise ValueError("AKEDatabase manifest does not contain its latest version")


def edges_for(x: int, z: int, width: int, depth: int) -> list[str]:
    edges = []
    if x == 0:
        edges.append("x0")
    if x == width - 1:
        edges.append("xmax")
    if z == 0:
        edges.append("z0")
    if z == depth - 1:
        edges.append("zmax")
    return edges


def canonical_name(value: str) -> str:
    """Make harmless punctuation/roman-numeral differences joinable."""
    return re.sub(r"\s+", "", str(value or "")).replace("Ⅰ", "I").replace("Ⅱ", "II").replace("Ⅲ", "III")


def normalize_port(raw: dict, role: str, width: int, depth: int) -> dict:
    trans = raw.get("trans") or {}
    position = trans.get("position") or {}
    rotation = trans.get("rotation") or {}
    x = int(position.get("x", 0))
    y = int(position.get("y", 0))
    z = int(position.get("z", 0))
    return {
        "index": raw.get("index"),
        "role": role,
        "medium": "pipe" if raw.get("isPipe") else "belt",
        "position": {"x": x, "y": y, "z": z},
        "edges": edges_for(x, z, width, depth),
        "facing": rotation.get("y"),
    }


def normalize_layouts(buildings: dict, texts: dict, source: dict) -> list[dict]:
    layouts = []
    for building_id, building in buildings.items():
        size = building.get("range") or {}
        width = size.get("width")
        depth = size.get("depth")
        height = size.get("height")
        if not all(isinstance(value, int) and value > 0 for value in (width, depth, height)):
            continue
        name_info = building.get("name") or {}
        name_id = name_info.get("id")
        name = texts.get(str(name_id)) or name_info.get("text") or building_id
        ports = [
            normalize_port(port, "input", width, depth)
            for port in building.get("inputPorts") or []
        ] + [
            normalize_port(port, "output", width, depth)
            for port in building.get("outputPorts") or []
        ]
        layouts.append({
            "buildingId": building_id,
            "name": name,
            "nameId": name_id,
            "footprint": {"width": width, "depth": depth, "height": height},
            "ports": ports,
        })
    return layouts


def select_layout(candidates: list[dict], machine: dict) -> dict | None:
    if not candidates:
        return None
    # AKEDatabase keeps no-port variants for some buildings. Prefer the normal
    # runtime building when both variants have the same visible name.
    current = machine.get("footprint") or {}
    matching_size = [candidate for candidate in candidates
                     if candidate["footprint"]["width"] == current.get("width")
                     and candidate["footprint"]["depth"] == current.get("height")]
    pool = matching_size or candidates
    return sorted(pool, key=lambda item: ("_nop_" in item["buildingId"], item["buildingId"]))[0]


def merge_factory(layouts: list[dict], source: dict) -> dict:
    with FACTORY_PATH.open(encoding="utf-8") as handle:
        factory = json.load(handle)
    by_name = defaultdict(list)
    for layout in layouts:
        by_name[canonical_name(layout["name"])].append(layout)
    unmatched = []
    matched = 0
    for machine in factory.get("machines", []):
        layout = select_layout(by_name.get(canonical_name(machine.get("name")), []), machine)
        if layout is None:
            unmatched.append(machine.get("name"))
            continue
        matched += 1
        footprint = layout["footprint"]
        machine["akedatabase"] = {
            "buildingId": layout["buildingId"],
            "nameId": layout["nameId"],
            "footprint": footprint,
            "ports": layout["ports"],
        }
        # The local footprint is the 2D (width × depth) projection of the
        # game range. Keep the 3D height under the source-specific field.
        machine["footprint"] = {"width": footprint["width"], "height": footprint["depth"]}
        machine["footprintStatus"] = "sourced"
        machine["footprintSource"] = source["tableUrl"]
    factory["akedatabase"] = {
        "source": source,
        "matchedMachines": matched,
        "catalogMachines": len(factory.get("machines", [])),
        "unmatchedMachineNames": sorted(set(unmatched)),
    }
    return factory


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--game-version")
    parser.add_argument("--hotfix")
    parser.add_argument("--base-url", default=BASE_URL)
    parser.add_argument("--no-merge", action="store_true", help="write the normalized layout file only")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    manifest, manifest_hash = fetch_json(f"{base_url}/manifest.json")
    version = pick_version(manifest, args.game_version, args.hotfix)
    table_base = f"{base_url}/{version['tableCfgPath'].strip('/') }"
    building_url = f"{table_base}/FactoryBuildingTable.json"
    text_url = f"{table_base}/I18nTextTable_CN.json"
    buildings, building_hash = fetch_json(building_url)
    texts, text_hash = fetch_json(text_url)
    retrieved_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    source = {
        "provider": "AKEDatabase",
        "baseUrl": base_url,
        "manifestUrl": f"{base_url}/manifest.json",
        "gameVersion": version["gameVersion"],
        "hotfixVersion": version["hotfixVersion"],
        "publishedAt": version.get("publishedAt"),
        "retrievedAt": retrieved_at,
        "tableUrl": building_url,
        "textTableUrl": text_url,
        "manifestSha256": manifest_hash,
        "buildingTableSha256": building_hash,
        "textTableSha256": text_hash,
    }
    layouts = normalize_layouts(buildings, texts, source)
    LAYOUT_PATH.write_text(json.dumps({"source": source, "machines": layouts}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not args.no_merge:
        FACTORY_PATH.write_text(json.dumps(merge_factory(layouts, source), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"AKEDatabase {version['gameVersion']} / {version['hotfixVersion']}: {len(layouts)} layouts; wrote {LAYOUT_PATH}")
    if not args.no_merge:
        print(f"Merged matched layouts into {FACTORY_PATH}")


if __name__ == "__main__":
    main()
