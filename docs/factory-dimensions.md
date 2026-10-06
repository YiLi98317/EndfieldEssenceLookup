# Factory footprint dataset

Collected from the SKLand equipment catalog on October 6, 2026. All 102 local
catalog entries were matched to their detail-page `gameEntryId` and name.
98 pages specify numeric grid dimensions; four mining devices do not.

## Local files

- `src/data/factory.json`: each machine now has `footprint`,
  `footprintStatus`, and `footprintSource`.
- `src/data/factory-dimension-sources.json`: exact area-requirement excerpts,
  detail URLs, collection date, and the site's testing-content notice.
- `scripts/import_factory_dimensions.py`: offline validation and import.

`footprint.width` is the number of grid columns and `footprint.height` is the
number of rows in a canonical orientation. The source's length (长) maps to
columns and its width (宽) maps to rows. This is a coordinate convention;
it does not establish input/output facing or port positions. A quarter-turn
rotation must swap the two dimensions.

`footprintStatus: "sourced"` means an explicit grid size was found on SKLand.
It does not mean independently checked in the live game. The wiki warns that
its content is from testing and the released game takes precedence. The
dataset's target game version has not yet been established.

## Coverage and unresolved sizes

Examples include 传送带 at 1 × 1, 精炼炉 at 3 × 3, 种植机 at 5 × 5,
灌装机 at 6 × 4, and 仓库存取线基段 at 8 × 4.

These four entries have `footprint: null` and `footprintStatus: "unknown"`:

- 水驱矿机 (`1168`)
- 二型电驱矿机 (`167`)
- 电驱矿机 (`166`)
- 便携源石矿机 (`55`)

Their area sections only require placement on an available mineral deposit.
Measure these in the game's build view before assigning numeric footprints.
Do not turn an unknown size into a verified 1 × 1 fallback.

Area excerpts also preserve restrictions such as separation distances,
placement on belts/pipes, attachment to warehouse lines, and regional limits.
These rules have not been normalized or implemented. Footprints alone are not
a complete placement specification.

## Updating and checking

Update the saved excerpts after inspecting the corresponding source pages,
then run from the repository root:

```sh
python3 scripts/import_factory_dimensions.py
python3 scripts/import_factory_dimensions.py --check
```

The importer rejects missing/extra IDs, duplicate catalog IDs, name/URL
mismatches, conflicting sizes, and nonpositive dimensions. `--check` also
ensures the catalog matches the excerpts without writing files. It uses only
the Python standard library and does not require browser credentials.

## Current simulator integration

The simulator now stores one catalog entry per placed machine anchor, derives
all occupied cells from its footprint, rejects out-of-bounds and overlapping
placements, and renders the image across the full rectangle. Existing V1 saves
continue to load because their one-cell entries are valid anchors. Unknown
mining sizes use a clearly labeled 1 × 1 approximation until measured.

Rotation and port positions are intentionally separate follow-up work: the
current footprint is shown in its canonical orientation, and no direction is
inferred from the size data.
