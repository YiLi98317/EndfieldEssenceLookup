import catalog from '../../data/factory.json'

export const SIZE = 20
export const STORAGE_KEY = 'factory-simulator-v1'
export const machinesById = Object.fromEntries(catalog.machines.map(machine => [machine.id, machine]))
export const resourceIds = ['ore', 'water', 'gas']
export const emptyDraft = () => ({ cells: {}, limits: { ore: 0, water: 0, gas: 0 } })
export const validCell = cell => Number.isInteger(Number(cell)) && String(Number(cell)) === String(cell) && Number(cell) >= 0 && Number(cell) < SIZE * SIZE

export function sanitizeDraft(value) {
  const draft = emptyDraft()
  if (!value || typeof value !== 'object') return draft
  for (const [cell, id] of Object.entries(value.cells ?? {})) {
    if (validCell(cell) && Object.hasOwn(machinesById, id)) draft.cells[cell] = id
  }
  for (const id of resourceIds) {
    const limit = value.limits?.[id]
    if (Number.isSafeInteger(limit) && limit >= 0) draft.limits[id] = limit
  }
  return draft
}

// Returning the original state makes invalid or occupied drops a no-op.
export function placeMachine(cells, machineId, destination, source = null) {
  if (!validCell(destination) || !Object.hasOwn(machinesById, machineId) || cells[destination]) return cells
  if (source !== null && (!validCell(source) || cells[source] !== machineId)) return cells
  const next = { ...cells, [destination]: machineId }
  if (source !== null) delete next[source]
  return next
}
