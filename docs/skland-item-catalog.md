# SKLand item catalog source

The SKLand item catalog was inspected on October 6, 2026:

<https://wiki.skland.com/endfield/catalog?mainTypeId=1&subTypeId=6&header=0>

The page currently renders **283 item entries**. Each entry exposes a name,
two description paragraphs, an image URL, and a clickable detail page. Detail
URLs use the same stable shape as the machine pages:

`https://wiki.skland.com/endfield/detail?mainTypeId=1&subTypeId=6&gameEntryId=<id>&header=0`

For example, the 赤铜块 detail page is entry `1233`:

<https://wiki.skland.com/endfield/detail?mainTypeId=1&subTypeId=6&gameEntryId=1233&header=0>

The raw catalog snapshot is saved at
[`src/data/skland-item-catalog.json`](../src/data/skland-item-catalog.json). It
contains all 283 visible cards with their names, descriptions, and image URLs.
Detail URLs and `gameEntryId` values are included for the pages inspected so
far; unresolved records are left with `url: null` rather than guessed IDs.

Its detail page shows the item category, storage/use information, and
industrial-processing relationships. The processing tables identify the
machine, input quantities, and output quantities. They are the right source
for normalizing recipes, while the machine detail pages remain the source for
cycle times, modes, power, and placement constraints.

The catalog includes substantially more than factory materials: raw ores,
liquids, gases, powders, blocks, fibers, containers, seeds and crops, food,
combat consumables, batteries, equipment parts, currencies, and progression
values. Do not treat every catalog item as a transportable factory material.

## Recommended normalization boundary

Start with items that appear in industrial-processing tables or machine
recipes. Give each such item a stable SKLand `gameEntryId`, localized name,
image URL, physical form (`solid`, `liquid`, `gas`, or `container`), and source
URL. Preserve containers as distinct items from their contents; for example a
filled container is not the same transport item as the liquid inside it.

Keep gameplay-only entries in the source inventory but exclude them from
production calculations until a recipe or machine relationship proves they
belong in the factory network. Keep the site's testing-content notice and
retrieval date with the normalized records, as with the machine footprint
dataset.

## Next extraction task

Build an offline browser-assisted importer for the industrial subset. For each
selected detail page, capture the processing tables as recipe candidates and
retain the original table text for review. Separate regular processing,
liquid-mode processing, gas-mode processing, and item-use/storage sections.
Do not infer cycle time from item pages when the table omits it; join the
recipe candidate to the machine detail page before calculating rates.
