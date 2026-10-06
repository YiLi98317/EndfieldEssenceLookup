# Factory simulator development plan

Date: October 6, 2026

## Progress — footprint collection

The full 102-entry SKLand equipment catalog has now been inspected for area
requirements. `src/data/factory.json` contains 98 sourced numeric footprints
and four explicitly unknown mining footprints. Exact area excerpts and source
URLs are saved in `src/data/factory-dimension-sources.json`; an offline importer
validates coverage and catalog synchronization. The simulator now derives
occupied rectangles, blocks overlap/out-of-bounds placement, and renders
machines at their sourced sizes. Rotation, ports, and direction remain the
next implementation work. See [factory-dimensions.md](factory-dimensions.md)
for conventions, unresolved sizes, and maintenance commands.

## Recommendation

Build a trustworthy layout editor first, then add production analysis. The next milestone should combine **real machine footprints, rotation, and visible input/output ports**. These features share the same geometry and placement model; implementing them together avoids rebuilding the grid again for transport connections.

Start with a small, verified set of machines and one complete production chain. Design the data format for the entire catalog now, but expand coverage incrementally. Do not make collecting every recipe a prerequisite for improving placement.

Suggested sequence:

1. Verify a starter dataset and define stable data contracts.
2. Implement footprints, rotation, ports, and safe V1 save migration.
3. Add materials, recipe selection, and theoretical production rates.
4. Validate directed transport connections.
5. Connect actual material supplies and transport limits to achievable output.
6. Expand coverage, then consider time-based simulation and power.

These are simulator milestones, not proposed package version numbers.

## Current implementation

Reviewed the linked local browser page and these project files:

- `src/data/factory.json`: originally 102 catalog entries with IDs, names, images, categories, and descriptions. Footprint metadata has since been added; port, recipe, and throughput fields remain pending.
- `src/pages/FactorySimulator/model.js`: fixed 20 × 20 grid; saved `cells` maps cell indexes directly to catalog machine IDs. Placement checks only one destination cell.
- `src/pages/FactorySimulator/index.jsx`: placement, movement, rectangle selection, deletion, zoom, catalog filtering, local persistence, and footprint-aware rendering. Unknown mining sizes are visibly labeled and use a temporary 1 × 1 approximation.
- `src/pages/FactorySimulator/utils/translations.js`: English and Chinese UI text.
- The resource panel saves three generic limits (`ore`, `water`, `gas`) in units/minute. Simulation is explicitly inactive.

The current catalog also contains decorations and combat/support equipment. Catalog membership should not imply that an entry has production behavior.

## Data sources and verification

### Sources inspected

- **Primary source: [SKLand equipment catalog](https://wiki.skland.com/endfield/catalog?mainTypeId=1&subTypeId=5&header=0).** The user confirmed this is the source of the existing machine catalog and image URLs. Inspected the catalog and clicked through to [灌装机, entry 176](https://wiki.skland.com/endfield/detail?mainTypeId=1&subTypeId=5&gameEntryId=176&header=0) in Chrome on October 6, 2026. Its `gameEntryId=176` matches local machine ID `176`. The page explicitly states length 6 grid cells and width 4 grid cells, resolving the ambiguous three-dimensional value from END Wiki for this machine. It includes recipe quantities, cycle times, power demand, and basic/gas-liquid modes plus hidden recipes. One listed basic recipe consumes 5 紫晶质瓶 and 5 柑实粉末 to produce 1 柑实罐头 in 10 seconds: theoretical consumption is 30/min for each ingredient and output is 6/min. The manufacturing recipe for building the machine is a separate section and must not be imported as one of its production recipes. Filled containers appear as a container name plus “已盛装” and contents; preserve that contents identity during normalization. No exact port coordinates or conveyor capacity were established from this inspected machine page. The site displays a testing-content notice, so retain version provenance and verify against the targeted live game release.
- [END Wiki equipment directory](https://end.wiki/zh-Hans/factory/buildings/): candidate starting point for building details. Its inspected directory lists 69 buildings, versus 102 entries locally, so it is not a confirmed complete replacement for our catalog.
- [END Wiki 灌装机](https://end.wiki/zh-Hans/factory/buildings/filling-powder-mc-1/): inspected detail page includes placement dimensions (`6×4×4`), power information, and recipe inputs/outputs with cycle times. It gives us a concrete extraction lead, but does not establish exact grid port coordinates. Do not assume which dimension is height or how dimensions translate to grid cells without checking.
- [EnKAD](https://enkad.enka.network/): existing blueprint editor and production-capacity planner, useful for comparing interaction and results. The inspected home page advertises a newer beta separately from its main version; always identify the game version used for comparisons. No reusable API or dataset license was verified here.
- [JamboChen/endfield-calc](https://github.com/JamboChen/endfield-calc): the project's own README documents recipe planning, circular dependencies, facility counts, and power calculations. The repository identifies an MIT license. Evaluate its data and provenance before reusing anything; this inspection did not verify individual recipe records or upstream data permissions.

Some wiki pages failed to load during research. This is source discovery, not a completed data audit. No exact conveyor rate or machine port map is approved by this plan.

### Acquisition workflow

1. Establish which game release/region the simulator targets and record that in dataset metadata.
2. Use SKLand as the primary source of the already-downloaded Chinese catalog. Preserve its entry IDs and existing image mapping; create explicit mappings for other sources instead of joining only on translated names. The filling-machine match is verified; validate the remaining IDs during import.
3. Collect machine dimensions and recipes from SKLand detail pages, including each relevant mode and hidden-recipe section. Separate machine construction recipes from machine processing recipes. Prefer a documented export/API if one exists; otherwise use a repeatable detail-page importer after evaluating source access and reuse terms. Browser control has been verified for reading these pages; a bulk import mechanism has not yet been implemented.
4. Verify footprint orientation, port positions, allowed connections, and transport behavior against the current game's build view/tooltips or controlled measurements. Store references or screenshots for observations.
5. Keep local normalized JSON bundled with the app, so GitHub Pages and Electron do not depend on a live wiki at runtime.
6. Record source URL, retrieval date, game version, and verification status per record or field group. Store raw source dimensions separately from normalized grid footprint.
7. Use a small curated override file for manual corrections. Import updates should produce reviewable diffs and must not erase overrides or verified values when a source is unavailable.

Unknown values remain unknown. Show “size unverified” where necessary and exclude unverified equipment from accurate placement/analysis; a separately labeled approximation mode may retain it for rough planning. Never quietly convert an unknown footprint to a verified 1 × 1.

## Data and state design

Separate catalog definitions from placed instances and derived analysis:

- **Machine definition:** existing catalog ID and display metadata; behavior kind (production, transport, source, sink, storage, power, decoration/support); grid footprint width/height; allowed rotations; ports; supported recipes/modes; optional verified power, buffer, and transport metadata.
- **Port definition:** stable port ID; local boundary cell `(x, y)`; outward-facing side (`north/east/south/west`); role (`input/output/bidirectional` only where verified); transport medium; optional capacity and material restrictions. A port's outward-facing side is distinct from flow direction: input travels inward.
- **Material definition:** stable ID, localized names/icon, physical form and transport compatibility, source classification, and provenance. Bottled liquid is a distinct transported item from the liquid itself.
- **Recipe definition:** stable ID; compatible machine IDs/modes; arrays of input and output `{ materialId, quantity }`; cycle duration in seconds; verification/version metadata. Preserve multiple outputs, byproducts, alternative recipes, and returned containers.
- **Placed instance:** unique instance ID, machine definition ID, anchor `(x, y)`, quarter-turn rotation, chosen recipe/mode, and device configuration such as source material or filter settings.
- **Saved layout:** schema version, dataset version, grid dimensions, instances, per-material supply limits, and user configuration. Occupied-cell indexes, connections, and calculation results are derived rather than independent saved truths.

Use positive finite durations and capacities, valid ID references, and explicit units. Validate that ports lie on the footprint boundary and rotations are permitted. Keep data validation and geometry logic independent of React.

## Milestone 1 — Verified starter data

Tasks:

- Select a source/sink, conveyor, a square production machine, and a rectangular production machine. Add a second input recipe to exercise multi-input behavior.
- Collect and verify their footprints, port maps, recipes, and relevant transport capacities.
- Define normalized data and provenance formats; add import/validation tooling and coverage reporting.
- Create one reference chain using those machines and materials. Keep a record of expected geometry and rates.

Done when: every starter record has traceable evidence, schema validation passes, and unknown fields are distinguishable from measured or sourced facts. Full-catalog ingestion can continue after this milestone.

## Milestone 2 — Accurate layout and direction

Tasks:

- Replace cell-to-machine saves with placed instances and derive an occupancy map from rotated footprints.
- Keep the grid for hit testing and keyboard access; draw each machine once as an overlay spanning its occupied cells, with an outline and readable name/icon.
- Add placement previews covering the whole footprint, including invalid overlap and out-of-bounds previews.
- Add a visible rotate control and `R` shortcut for preview/selected instances; rotation changes footprint and ports together. Avoid shortcuts while typing in inputs.
- Show directional arrows on belts. Show input/output markers on machine edges, with shape/arrows as well as color; expose details on hover and selection. Keep marker size readable under zoom.
- Show all ports while placing/connecting and selected-machine ports in normal view; optionally offer an always-visible ports toggle.
- Moving checks all destination cells while ignoring the moved instance's own existing occupancy. Reject invalid moves/rotations without altering the layout.
- Selecting any covered cell selects the instance. Rectangle selection includes machines touched by the rectangle; deletion removes whole instances, deduplicated by instance ID.
- Update occupied-area counts and all footprint labels to use real data.

Save migration:

- Preserve the original `factory-simulator-v1` save as a backup and write a separate versioned V2 format.
- Convert each old cell entry into an instance with a documented default orientation; mark its orientation as needing review.
- Expanding old 1 × 1 entries may create overlaps or go outside the grid. Surface affected instances in a relocation/review list; do not silently drop or reposition them.
- Keep unsupported/unknown definitions recoverable. Prevent saving a migration result that silently loses machines or old limits.

Done when: verified square and rectangular machines rotate correctly, cannot overlap or leave the grid, and work through click placement, dragging, selection, deletion, zoom, keyboard use, and save/reload. V1 conflicts can be resolved without losing the original layout.

## Milestone 3 — Materials and recipes

Tasks:

- Add searchable material and recipe datasets linked by IDs.
- Let users select a compatible recipe for each placed production machine.
- Show inputs, quantities, outputs/byproducts, cycle time, and full-utilization rates in the selected-machine panel.
- Distinguish idle/no-recipe equipment from configured production machines.
- Expand recipe coverage by complete production chains; report verified coverage by game version.

For cycle duration `T` seconds and quantity `q`, theoretical rate is `q × 60 / T` units/minute. Each input and output has its own rate. A machine therefore does not have one universal “carrying rate”; its production requirements depend on the selected recipe.

Done when: a configured multi-input recipe displays correct per-material rates, incompatible recipes cannot be assigned, and recipe selection survives save/reload.

## Milestone 4 — Directed transport network

Tasks:

- Derive directed connections from world-space ports, adjacency, facing, and compatible transport media. Merely touching a machine's body does not create a connection.
- Give belts explicit inlet/outlet topology, including supported bends. Do not assume every adjacent belt connects.
- Model bridges as separate channels so crossing routes do not merge. Add splitters, mergers, filters, and pipes only with verified behavior.
- Configure physical source/sink instances. A sidebar budget alone does not inject material into an arbitrary belt or machine.
- Highlight disconnected inputs, backward connections, incompatible media, and missing outputs. Recalculate connections after edits.

Done when: the reference chain is connected correctly, reversing a belt breaks the expected route, rotating a machine moves its connection points, and invalid adjacency is explained visually.

## Milestone 5 — Supply and throughput analysis

Start with steady-state analysis of supported production networks. Time-based movement and item animation can follow once the numbers are trustworthy.

Tasks:

- Replace the generic ore/water/gas controls with per-material supply limits. Keep solid/liquid/gas groupings as display categories, not interchangeable resources.
- Associate source instances with material IDs and share each material's budget across all its sources to prevent double counting.
- Define zero as no supply and provide an explicit unlimited setting. Preserve legacy generic budgets for review instead of guessing how to allocate them across materials.
- Use units/minute in the UI; normalize consistently in the calculation engine. Convert to units/second only for optional display.
- Separate transport capacity, travel latency, buffer capacity, and machine production rate. Several serial belt cells do not multiply route capacity; a shared belt carries the combined flow of all materials on it.
- For each machine, solve a cycle rate bounded by its recipe duration, all incoming ingredients, route/port capacities, and all output destinations. Preserve material balance and handle blocked byproducts explicitly.
- Begin with acyclic, single-material routes and explicit allocation rules for shared supplies. Add merges/splits and mixed belts after verifying their sharing behavior; unconstrained maximum flow can overstate achievable output when routing rules are fixed.
- Report theoretical versus supply/transport-constrained production, utilization, supply used/remaining, and bottleneck explanations. Clearly label any assumed unlimited storage or power.
- Detect cycles and unsupported device behavior and report them as unanalysed until handled. Later support recycling/plant loops using conservation constraints and explicit startup inventory requirements; do not recurse indefinitely or promise that a steady-state solution can start from empty buffers.

Illustrative math, **not Endfield constants**: a recipe using 2 A + 1 B to produce 1 C every 4 seconds has a ceiling of 15 C/min and demands 30 A/min + 15 B/min. With only 18 A/min available, output is at most 9 C/min before other constraints. A hypothetical belt carrying 12 total items/min may impose another limit depending on which streams share it.

Done when: changing one material's budget changes the reference chain's achievable output correctly, adding another consumer cannot duplicate supply, serial belt length does not increase capacity, and bottlenecks identify the material/device/route involved. Conservation checks pass.

## Later work

- Complete materials, machine footprints/ports, recipes, and transport coverage for the chosen game release, with a visible verification status.
- Power demand and coverage; mining placement constraints; storage behavior; regional restrictions; additional device modes.
- Deterministic time-based simulation for startup delay, travel time, buffers, blockage, splitting fairness, and recycling loops. Keep animated item rendering separate from numerical state.
- Larger/configurable land, blueprint import/export, undo/redo, and optional target-output planning.
- Automatic layout or recipe optimization only after manual layout and rate calculations are reliable.

## Suggested implementation boundaries

Keep `model.js` as a small facade or split it into focused modules for geometry, layout actions, save migration, and validation. Add separate modules for network derivation and production analysis. Keep catalog, materials, and recipes in `src/data/`; add an offline importer under `scripts/`. Extract grid rendering and selection/recipe panels from `index.jsx` as their responsibilities grow. Continue English/Chinese translations and existing base-URL handling for deployed assets.

Use meaningful checks for each milestone: geometry rotations and collisions; preservation of V1 data; data referential integrity; directed connectivity; material conservation; supply sharing; and a reference production chain. Perform browser checks of placement and visual markers, then run the existing lint/build scripts for implementation changes. This plan-only change does not require app tests.

## Immediate next task

Deliver Milestones 1–2 for a verified starter set: **real footprints + rotation + ports + safe save migration**. First verify one square and one rectangular machine plus the basic conveyor and warehouse connections. Collect recipe/rate fields during that research, but keep production analysis as a subsequent milestone. This produces an immediately useful layout editor and the geometry needed for all later simulation work.
