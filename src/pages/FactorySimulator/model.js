import catalog from '../../data/factory.json'

export const SIZE = 20
export const STORAGE_KEY = 'factory-simulator-v1'
export const machinesById = Object.fromEntries(catalog.machines.map(machine => [machine.id, machine]))
export const resourceIds = ['ore', 'water', 'gas']
export const emptyDraft = () => ({ cells: {}, limits: { ore: 0, water: 0, gas: 0 } })
export const validCell = cell => Number.isInteger(Number(cell)) && String(Number(cell)) === String(cell) && Number(cell) >= 0 && Number(cell) < SIZE * SIZE

// `cells` stores one entry per machine anchor. The footprint is derived from
// the catalog, so occupied cells never become a second source of truth.
export function footprintFor(machineId) {
  const footprint = machinesById[machineId]?.footprint
  return footprint?.width > 0 && footprint?.height > 0
    ? footprint
    : { width: 1, height: 1 }
}

export function footprintCells(machineId, anchor) {
  if (!validCell(anchor) || !Object.hasOwn(machinesById, machineId)) return []
  const { width, height } = footprintFor(machineId)
  const row = Math.floor(Number(anchor) / SIZE)
  const column = Number(anchor) % SIZE
  if (column + width > SIZE || row + height > SIZE) return []
  const cells = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) cells.push((row + y) * SIZE + column + x)
  }
  return cells
}

export function machineAt(cells, cell) {
  if (!validCell(cell)) return null
  for (const [anchor, machineId] of Object.entries(cells ?? {})) {
    if (footprintCells(machineId, anchor).includes(Number(cell))) {
      return { anchor: Number(anchor), machineId, machine: machinesById[machineId] }
    }
  }
  return null
}

export function anchorsInArea(cells, areaCells) {
  const wanted = new Set(areaCells)
  return Object.keys(cells ?? {}).filter(anchor => footprintCells(cells[anchor], anchor).some(cell => wanted.has(cell)))
}

export function occupiedCells(cells) {
  return new Set(Object.entries(cells ?? {}).flatMap(([anchor, machineId]) => footprintCells(machineId, anchor)))
}

export function cellsInArea(start, end) {
  if (!validCell(start) || !validCell(end)) return []
  const top = Math.min(Math.floor(start / SIZE), Math.floor(end / SIZE))
  const bottom = Math.max(Math.floor(start / SIZE), Math.floor(end / SIZE))
  const left = Math.min(start % SIZE, end % SIZE)
  const right = Math.max(start % SIZE, end % SIZE)
  const cells = []
  for (let row = top; row <= bottom; row++) {
    for (let column = left; column <= right; column++) cells.push(row * SIZE + column)
  }
  return cells
}

export function sanitizeDraft(value) {
  const draft = emptyDraft()
  if (!value || typeof value !== 'object') return draft
  for (const [cell, id] of Object.entries(value.cells ?? {})) {
    if (validCell(cell) && Object.hasOwn(machinesById, id) && footprintCells(id, cell).length &&
        footprintCells(id, cell).every(occupied => !machineAt(draft.cells, occupied))) {
      draft.cells[cell] = id
    }
  }
  for (const id of resourceIds) {
    const limit = value.limits?.[id]
    if (Number.isSafeInteger(limit) && limit >= 0) draft.limits[id] = limit
  }
  return draft
}

// Returning the original state makes invalid or occupied drops a no-op.
export function placeMachine(cells, machineId, destination, source = null) {
  if (!validCell(destination) || !Object.hasOwn(machinesById, machineId)) return cells
  if (source !== null && (!validCell(source) || cells[source] !== machineId)) return cells
  if (source === null && machineAt(cells, destination)) return cells
  if (source !== null && source !== destination && machineAt(cells, destination)) return cells
  const targetCells = footprintCells(machineId, destination)
  if (!targetCells.length) return cells
  if (targetCells.some(cell => {
    const occupant = machineAt(cells, cell)
    return occupant && occupant.anchor !== source
  })) return cells
  const next = { ...cells, [destination]: machineId }
  if (source !== null) delete next[source]
  return next
}
