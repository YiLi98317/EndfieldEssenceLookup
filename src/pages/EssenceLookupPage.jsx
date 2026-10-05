import {
  Profiler,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Box } from '@mui/material'
import { weapons, pools } from '../data'
import Layout from '../components/Layout'
import WeaponSelector from '../components/WeaponSelector'
import FarmPlaceResults from '../components/FarmPlaceResults'

export default function EssenceLookupPage() {
  const [selectedWeapon, setSelectedWeapon] = useState(null)
  const deferredSelectedWeapon = useDeferredValue(selectedWeapon)
  const selectionTimingRef = useRef(null)

  const handleWeaponSelect = useCallback((weapon) => {
    const startedAt = performance.now()
    const nextId = weapon?.id ?? null

    if (import.meta.env.DEV) {
      console.debug(`[weapon-select] ${nextId ?? 'clear'} queued`)
    }

    selectionTimingRef.current = { startedAt, nextId }
    startTransition(() => setSelectedWeapon(weapon))
  }, [])

  const handleProfilerRender = useCallback((id, phase, actualDuration, baseDuration) => {
    if (import.meta.env.DEV) {
      console.debug(
        `[perf] ${id} ${phase}: actual ${actualDuration.toFixed(1)}ms, base ${baseDuration.toFixed(
          1
        )}ms`
      )
    }
  }, [])

  useEffect(() => {
    const pending = selectionTimingRef.current
    if (!pending) return undefined

    const frame = requestAnimationFrame(() => {
      const duration = performance.now() - pending.startedAt
      if (import.meta.env.DEV) {
        console.debug(
          `[weapon-select] ${pending.nextId ?? 'clear'} rendered in ${duration.toFixed(1)}ms`
        )
      }
      if (selectionTimingRef.current === pending) selectionTimingRef.current = null
    })

    return () => cancelAnimationFrame(frame)
  }, [selectedWeapon])

  return (
    <Layout maxWidth="xl" fullHeight>
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 1fr) minmax(0, 1fr)',
          },
          gridTemplateRows: { xs: 'minmax(0, 1fr) minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
          gap: { xs: 3, md: 4 },
          alignItems: 'start',
        }}
      >
        <Profiler id="weapon-selector" onRender={handleProfilerRender}>
          <WeaponSelector
            weapons={weapons}
            selectedWeapon={selectedWeapon}
            onSelect={handleWeaponSelect}
          />
        </Profiler>
        <Box
          component="section"
          aria-labelledby="farm-locations-title"
          sx={{
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Profiler id="farm-results" onRender={handleProfilerRender}>
            <FarmPlaceResults
              weapon={deferredSelectedWeapon}
              pools={pools}
              weapons={weapons}
            />
          </Profiler>
        </Box>
      </Box>
    </Layout>
  )
}
