# Factory footprint dataset

Collected from the SKLand equipment catalog and AKEDatabase on October 6, 2026.
All 102 local catalog entries were matched to their SKLand detail-page ID and
name. AKEDatabase supplies 92 machine layouts directly; the remaining 10
transport/decorative entries retain their SKLand dimensions.

## Local files

- `src/data/factory.json`: each machine now has `footprint`,
  `footprintStatus`, and `footprintSource`.
- `src/data/factory-dimension-sources.json`: exact area-requirement excerpts,
  detail URLs, collection date, and the site's testing-content notice.
- `src/data/akedatabase-machine-layouts.json`: normalized layouts from the
  current AKEDatabase `FactoryBuildingTable` and Chinese text table, including
  2D/3D ranges and local input/output ports.
- `scripts/sync_akedatabase.py`: fetches the manifest's latest AKEDatabase
  version, writes the normalized layout snapshot, and merges matched records.
- `scripts/import_factory_dimensions.py`: offline validation and import.

`footprint.width` is the number of grid columns and `footprint.height` is the
number of rows in a canonical orientation. The source's length (长) maps to
columns and its width (宽) maps to rows. This is a coordinate convention;
it does not establish input/output facing or port positions. A quarter-turn
rotation must swap the two dimensions.

`footprintStatus: "sourced"` means an explicit grid size was found in the
current merged sources. For the 92 matched machines, AKEDatabase's
`range.width × range.depth` projection is authoritative; for the remaining 10,
the value is from SKLand. The AKEDatabase game/hotfix, table URLs, retrieval
time, and table hashes are recorded under the root `akedatabase.source` object
in `factory.json` and in the normalized layout snapshot.

## Coverage and source boundaries

Examples include 传送带 at 1 × 1, 精炼炉 at 3 × 3, 种植机 at 5 × 5,
灌装机 at 6 × 4, and 仓库存取线基段 at 8 × 4.

The current AKEDatabase `FactoryBuildingTable` response does not contain the
10 local logistics names (`传送带`, splitters, mergers, bridges,
and related entrances). Those records are listed in `factory.json` under
`akedatabase.unmatchedMachineNames`; their SKLand dimensions remain available,
but they do not yet have AKEDatabase port records.

Area excerpts also preserve restrictions such as separation distances,
placement on belts/pipes, attachment to warehouse lines, and regional limits.
These rules have not been normalized or implemented. Footprints alone are not
a complete placement specification.

## Updating and checking

To refresh the primary layout source, run from the repository root:

```sh
python3 scripts/sync_akedatabase.py
```

Then validate the SKLand excerpts and merged catalog:

```sh
python3 scripts/import_factory_dimensions.py
python3 scripts/import_factory_dimensions.py --check
```

The importers reject missing/extra IDs, duplicate catalog IDs, name/URL
mismatches, conflicting sizes, nonpositive dimensions, and mismatched
AKEDatabase footprints. The sync command records the selected manifest version
so a refresh produces a reviewable data diff.

## Current simulator integration

The simulator now stores one catalog entry per placed machine anchor, derives
all occupied cells from its footprint, rejects out-of-bounds and overlapping
placements, and renders the image across the full rectangle. Existing V1 saves
continue to load because their one-cell entries are valid anchors. Any future
unknown source record must remain explicitly marked instead of being silently
converted to a 1 × 1 approximation.

The grid now renders AKEDatabase input/output markers on matched machines.
Markers distinguish input/output roles and belt/pipe media; the selected
machine panel reports the counts. Placement rotation is still a follow-up, so
the current markers are shown in the source's canonical local orientation.
