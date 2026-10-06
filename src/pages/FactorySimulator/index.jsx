import { useEffect, useRef, useState } from 'react'
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, TextField } from '@mui/material'
import FactoryOutlinedIcon from '@mui/icons-material/FactoryOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import catalog from '../../data/factory.json'
import { useLanguage } from '../../i18n/LanguageContext'
import { factoryTranslations } from './utils/translations'
import { SIZE, STORAGE_KEY, machinesById, resourceIds, emptyDraft, sanitizeDraft, placeMachine, cellsInArea } from './model'
import styles from './styles'

function loadDraft() {
  try { return sanitizeDraft(JSON.parse(localStorage.getItem(STORAGE_KEY))) }
  catch { return emptyDraft() }
}

function MachineImage({ machine }) {
  const [failed, setFailed] = useState(false)
  return failed
    ? <FactoryOutlinedIcon aria-hidden="true" />
    : <img src={`${import.meta.env.BASE_URL}${machine.image}`} alt="" loading="lazy" draggable={false} onError={() => setFailed(true)} />
}

export default function FactorySimulatorPage() {
  const { language } = useLanguage()
  const text = factoryTranslations[language] ?? factoryTranslations.en
  const [draft, setDraft] = useState(loadDraft)
  const [selection, setSelection] = useState(null)
  const [area, setArea] = useState(null)
  const [areaMode, setAreaMode] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [fitSize, setFitSize] = useState(400)
  const gridScroll = useRef(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [hovered, setHovered] = useState(null)
  const [message, setMessage] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const saveStatus = useRef(null)
  const drag = useRef(null)
  const suppressClick = useRef(false)
  const areaCells = cellsInArea(area?.start, area?.end)
  const selectedCells = new Set(areaCells)
  const selectedCount = areaCells.filter(cell => draft.cells[cell]).length
  const gridSize = fitSize * zoom / 100
  const selectedMachine = selection && machinesById[selection.machineId]
  const visibleMachines = catalog.machines.filter(machine =>
    (category === 'all' || machine.categoryId === category) &&
    `${machine.name} ${machine.description}`.toLowerCase().includes(search.trim().toLowerCase()),
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      saveStatus.current.textContent = text.saved
    } catch {
      saveStatus.current.textContent = text.saveError
    }
  }, [draft, text])

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setFitSize(Math.max(32, Math.min(entry.contentRect.width, entry.contentRect.height)))
    })
    observer.observe(gridScroll.current)
    return () => observer.disconnect()
  }, [])

  function deselect() {
    setSelection(null)
    setArea(null)
  }

  function selectMachine(item) {
    setArea(null)
    setAreaMode(false)
    setSelection(item)
  }

  function place(cell, item = selection) {
    if (!item) return
    const next = placeMachine(draft.cells, item.machineId, cell, item.source)
    if (next === draft.cells) {
      setMessage(text.blocked)
      return
    }
    setDraft({ ...draft, cells: next })
    setMessage(item.source === null ? text.placed : text.moved)
    selectMachine({ machineId: item.machineId, source: item.source === null ? null : cell })
  }

  function startDrag(event, machineId, source = null) {
    if (event.button !== 0) return
    suppressClick.current = false
    setArea(null)
    setAreaMode(false)
    drag.current = { machineId, source, x: event.clientX, y: event.clientY, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function startArea(event, cell) {
    if (event.button !== 0) return
    suppressClick.current = false
    drag.current = { kind: 'area', start: cell, x: event.clientX, y: event.clientY, moved: false }
    if (areaMode) {
      setSelection(null)
      setArea({ start: cell, end: cell })
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function cellAtPointer(event) {
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-factory-cell]')
    return target ? Number(target.dataset.factoryCell) : null
  }

  function moveDrag(event) {
    const item = drag.current
    if (!item) return
    if (!item.moved && Math.hypot(event.clientX - item.x, event.clientY - item.y) < 5) return
    item.moved = true
    if (item.kind === 'area') {
      const cell = cellAtPointer(event)
      setSelection(null)
      if (cell !== null) setArea({ start: item.start, end: cell })
      return
    }
    setSelection({ machineId: item.machineId, source: item.source })
    setHovered(cellAtPointer(event))
  }

  function endDrag(event) {
    const item = drag.current
    if (item?.moved) {
      suppressClick.current = true
      const cell = cellAtPointer(event)
      if (cell !== null) {
        if (item.kind === 'area') setArea({ start: item.start, end: cell })
        else place(cell, item)
      }
    }
    cancelDrag()
  }

  function cancelDrag() {
    drag.current = null
    setHovered(null)
  }

  function removeSelected() {
    if (!area && selection?.source == null) return
    const cells = { ...draft.cells }
    for (const cell of area ? areaCells : [selection.source]) delete cells[cell]
    setDraft({ ...draft, cells })
    deselect()
    setMessage(area ? text.areaRemoved : text.removed)
  }

  function navigateGrid(event, cell) {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -SIZE, ArrowDown: SIZE }[event.key]
    if (delta !== undefined) {
      event.preventDefault()
      const next = Math.max(0, Math.min(SIZE * SIZE - 1, cell + delta))
      event.currentTarget.parentElement.children[next].focus()
    }
    if (event.key === 'Escape') { cancelDrag(); deselect() }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      removeSelected()
    }
  }

  return (
    <Box sx={styles.page}>
      <div className="factory-workspace">
        <aside className="factory-sidebar">
          <header className="factory-heading">
            <div><div className="factory-eyebrow">ENDFIELD / INDUSTRY</div><h2>{text.title}</h2><p>{text.intro}</p></div>
            <Chip label={text.badge} size="small" variant="outlined" />
          </header>
          <section className="factory-panel factory-resource-panel" aria-labelledby="factory-limits-title">
            <h3 id="factory-limits-title">{text.limits}</h3><p>{text.limitsHint}</p>
            {resourceIds.map(id => <TextField key={id} label={text[id]} type="number" size="small" fullWidth value={draft.limits[id]} helperText={text.units}
              slotProps={{ htmlInput: { min: 0, step: 1, max: Number.MAX_SAFE_INTEGER } }}
              onChange={event => {
                const value = Number(event.target.value)
                if (Number.isSafeInteger(value) && value >= 0) setDraft({ ...draft, limits: { ...draft.limits, [id]: value } })
              }} />)}
            <div className="factory-simulation-note"><strong>{text.inactive}</strong><p>{text.inactiveHint}</p></div>
          </section>
          <section className="factory-panel factory-selection" aria-labelledby="factory-selected-title">
            <h3 id="factory-selected-title">{text.selected}</h3>
            {area ? <>
              <p>{areaCells.length} {text.selectedCells} · {selectedCount} {text.selectedMachines}</p>
              <div className="factory-selection-actions">
                <Button size="small" color="error" disabled={!selectedCount} onClick={removeSelected}>{text.removeArea}</Button>
                <Button size="small" onClick={deselect}>{text.cancel}</Button>
              </div>
            </> : selectedMachine ? <>
              <div className="factory-selected-machine"><MachineImage key={selectedMachine.id} machine={selectedMachine} /><strong>{selectedMachine.name}</strong><Chip label="1 × 1" size="small" /></div>
              <p lang="zh-Hans">{selectedMachine.description}</p><p>{selection.source === null ? text.placeHint : text.moveHint}</p>
              <div className="factory-selection-actions">
                {selection.source !== null && <Button size="small" color="error" onClick={removeSelected}>{text.remove}</Button>}
                <Button size="small" onClick={deselect}>{text.cancel}</Button>
              </div>
            </> : <p>{text.selectHint}</p>}
          </section>
        </aside>
        <section className="factory-land factory-panel" aria-labelledby="factory-land-title">
          <div className="factory-land-heading">
            <div><h3 id="factory-land-title">{text.land} <span>20 × 20</span></h3><p>{Object.keys(draft.cells).length} / 400 {text.occupied} · {text.footprint}</p></div>
            <Button size="small" startIcon={<DeleteOutlineIcon />} disabled={!Object.keys(draft.cells).length} onClick={() => setConfirmClear(true)}>{text.clear}</Button>
          </div>
          <p className="factory-instructions">{text.instructions}</p>
          <div className="factory-grid-toolbar">
            <Button size="small" variant={areaMode ? 'contained' : 'outlined'} aria-pressed={areaMode} onClick={() => {
              setAreaMode(!areaMode); deselect()
            }}>{text.selectArea}</Button>
            <Button size="small" color="error" disabled={!selectedCount} onClick={removeSelected}>{text.removeArea}{selectedCount ? ` (${selectedCount})` : ''}</Button>
            <div className="factory-zoom-controls" role="group" aria-label={text.zoom}>
              <Button size="small" aria-label={text.zoomOut} disabled={zoom <= 50} onClick={() => setZoom(value => Math.max(50, value - 25))}>−</Button>
              <span aria-live="polite">{zoom}%</span>
              <Button size="small" aria-label={text.zoomIn} disabled={zoom >= 300} onClick={() => setZoom(value => Math.min(300, value + 25))}>+</Button>
              <Button size="small" onClick={() => {
                setZoom(100); gridScroll.current.scrollTo(0, 0)
              }}>{text.fitGrid}</Button>
            </div>
          </div>
          <div className="factory-grid-scroll" ref={gridScroll}>
            <div className="factory-grid-stage" style={{ minWidth: gridSize, minHeight: gridSize }}>
              <div className="factory-grid" style={{ width: gridSize, height: gridSize }} role="group" aria-label={text.grid}>
                {Array.from({ length: SIZE * SIZE }, (_, cell) => {
                  const machine = machinesById[draft.cells[cell]]
                  const selected = selectedCells.has(cell) || selection?.source === cell
                  const preview = hovered === cell
                  const position = `${text.row} ${Math.floor(cell / SIZE) + 1}, ${text.column} ${cell % SIZE + 1}`
                  return (
                    <button
                      type="button" key={cell}
                      className={`factory-cell${machine ? ' occupied' : ''}${selected ? ' selected' : ''}${preview ? machine ? ' blocked' : ' preview' : ''}`}
                      aria-label={`${position}: ${machine?.name ?? text.empty}`}
                      aria-pressed={selected} title={`${position}${machine ? ` · ${machine.name}` : ''}`}
                      data-factory-cell={cell}
                      draggable={false}
                      onPointerDown={event => {
                        if (areaMode || !machine) startArea(event, cell)
                        else startDrag(event, machine.id, cell)
                      }}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={cancelDrag}
                      onClick={() => {
                        if (suppressClick.current) { suppressClick.current = false; return }
                        if (areaMode) {
                          setSelection(null); setArea({ start: cell, end: cell })
                        } else if (machine) selectMachine({ machineId: machine.id, source: cell })
                        else if (selection) place(cell)
                        else { setArea({ start: cell, end: cell }) }
                      }}
                      onKeyDown={event => navigateGrid(event, cell)}
                    >
                      {machine && <MachineImage key={machine.id} machine={machine} />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="factory-status"><span role="status">{message || text.footprint}</span><span ref={saveStatus} /></div>
        </section>

        <section className="factory-panel factory-catalog" aria-labelledby="factory-catalog-title">
          <div className="factory-catalog-heading"><div><h3 id="factory-catalog-title">{text.catalog} <span>{visibleMachines.length} / {catalog.machines.length}</span></h3><p>{text.source}</p></div>
            <div className="factory-catalog-filters"><TextField size="small" label={text.search} value={search} onChange={event => setSearch(event.target.value)} type="search" />
              <TextField select size="small" label={text.category} value={category} onChange={event => setCategory(event.target.value)}>
                <MenuItem value="all">{text.all}</MenuItem>
                {catalog.categories.map(item => <MenuItem key={item.id} value={item.id}>{text.categories[item.id] ?? item.name}</MenuItem>)}
              </TextField></div>
          </div>
          <div className="factory-machine-tray">
            {visibleMachines.map(machine => <button type="button" key={machine.id} draggable={false}
              className={`factory-machine-card${selection?.machineId === machine.id && selection.source === null ? ' selected' : ''}`}
              aria-pressed={selection?.machineId === machine.id && selection.source === null}
              title={`${machine.name}\n${machine.description}`}
              onClick={() => {
                if (suppressClick.current) { suppressClick.current = false; return }
                selectMachine({ machineId: machine.id, source: null })
              }}
              onPointerDown={event => startDrag(event, machine.id)} onPointerMove={moveDrag}
              onPointerUp={endDrag} onPointerCancel={cancelDrag}>
              <MachineImage machine={machine} /><span lang="zh-Hans">{machine.name}</span><small>1 × 1</small>
            </button>)}
            {!visibleMachines.length && <p className="factory-empty-results">{text.noResults}</p>}
          </div>
        </section>
      </div>
      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} aria-labelledby="factory-clear-title">
        <DialogTitle id="factory-clear-title">{text.clearTitle}</DialogTitle><DialogContent><DialogContentText>{text.clearBody}</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setConfirmClear(false)}>{text.keep}</Button><Button color="error" onClick={() => {
          setDraft({ ...draft, cells: {} }); deselect(); setMessage(text.cleared); setConfirmClear(false)
        }}>{text.clear}</Button></DialogActions>
      </Dialog>
    </Box>
  )
}
