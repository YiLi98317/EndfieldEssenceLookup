#!/usr/bin/env python3
"""Validate saved SKLand area excerpts and attach footprints to the catalog.

This is an offline importer. It does not access browser sessions or credentials.
Length maps to grid columns (width), source width to grid rows (height).
"""

import argparse
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "src/data/factory-dimension-sources.json"
CATALOG = ROOT / "src/data/factory.json"
SIZE_PATTERN = re.compile(r"长\s*(\d+)\s*格[、，,\s]*宽\s*(\d+)\s*格")


def apply_dimensions(catalog, source):
    machines = catalog["machines"]
    ids = [machine["id"] for machine in machines]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate machine IDs in catalog")
    entries = source["entries"]
    if set(entries) != set(ids):
        raise ValueError("Source IDs must exactly match catalog IDs")
    if source["units"] != "grid-cells":
        raise ValueError("Only explicit grid-cell dimensions are supported")

    known = 0
    akedatabase = 0
    for machine in machines:
        entry = entries[machine["id"]]
        url = urlparse(entry["url"])
        query = parse_qs(url.query)
        if (url.scheme != "https" or url.netloc != "wiki.skland.com"
                or url.path != "/endfield/detail"
                or query.get("gameEntryId") != [machine["id"]]
                or query.get("subTypeId") != ["5"]):
            raise ValueError(f"Invalid source URL for {machine['id']}")
        if entry["name"] != machine["name"]:
            raise ValueError(f"Source name mismatch for {machine['id']}")
        text = entry["areaRequirement"]
        matches = SIZE_PATTERN.findall(text)
        unique_sizes = set(matches)
        if len(unique_sizes) > 1:
            raise ValueError(f"Conflicting sizes for {machine['id']}")
        # AKEDatabase is the current machine-layout authority. Keep the SKLand
        # excerpt validated for provenance, but do not overwrite a footprint
        # already merged from FactoryBuildingTable.
        if machine.get("akedatabase"):
            ak_footprint = machine["akedatabase"].get("footprint") or {}
            expected = {"width": ak_footprint.get("width"), "height": ak_footprint.get("depth")}
            if machine.get("footprint") != expected:
                raise ValueError(f"AKEDatabase footprint mismatch for {machine['id']}")
            akedatabase += 1
            continue
        if matches:
            length, width = map(int, matches[0])
            if min(length, width) <= 0:
                raise ValueError(f"Nonpositive size for {machine['id']}")
            machine["footprint"] = {"width": length, "height": width}
            machine["footprintStatus"] = "sourced"
            known += 1
        else:
            machine["footprint"] = None
            machine["footprintStatus"] = "unknown"
        machine["footprintSource"] = entry["url"]
    return known, akedatabase


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--check", action="store_true", help="Validate without writing")
    args = parser.parse_args()
    catalog = json.loads(CATALOG.read_text())
    original = json.loads(CATALOG.read_text())
    source = json.loads(args.source.read_text())
    known, akedatabase = apply_dimensions(catalog, source)
    if args.check:
        if original != catalog:
            raise ValueError("Catalog dimensions are out of sync; run importer without --check")
    else:
        CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    resolved = known + akedatabase
    print(f"{len(catalog['machines'])} entries validated; {akedatabase} AKEDatabase footprints; "
          f"{known} SKLand-only footprints; {len(catalog['machines']) - resolved} unresolved")


if __name__ == "__main__":
    main()
