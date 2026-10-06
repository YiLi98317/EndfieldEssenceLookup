import {
  startTransition,
  useCallback,
  useDeferredValue,
  useState,
} from 'react'
import { Box } from '@mui/material'
import { weapons, pools } from '../../data'
import WeaponSelector from './components/WeaponSelector'
import FarmPlaceResults from './components/FarmPlaceResults'
import styles from './styles'

export default function EssenceLookupPage() {
  const [selectedWeapon, setSelectedWeapon] = useState(null)
  const deferredSelectedWeapon = useDeferredValue(selectedWeapon)

  const handleWeaponSelect = useCallback((weapon) => {
    startTransition(() => setSelectedWeapon(weapon))
  }, [])

  return (
    <Box sx={styles.pageGrid}>
      <WeaponSelector
        weapons={weapons}
        selectedWeapon={selectedWeapon}
        onSelect={handleWeaponSelect}
      />
      <Box component="section" aria-labelledby="farm-locations-title" sx={styles.resultsSection}>
        <FarmPlaceResults
          weapon={deferredSelectedWeapon}
          pools={pools}
          weapons={weapons}
        />
      </Box>
    </Box>
  )
}
