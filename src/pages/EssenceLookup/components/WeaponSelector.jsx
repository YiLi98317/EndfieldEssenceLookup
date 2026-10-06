import { useMemo, useState } from 'react'
import { Box } from '@mui/material'
import { useLanguage } from '../../../i18n/LanguageContext'
import {
  getUniqueRarities,
  getUniqueTypes,
  weaponMatchesRarity,
  weaponMatchesType,
} from '../utils/dataHelpers'
import WeaponDetails from './WeaponDetails'
import WeaponFilters from './WeaponFilters'
import WeaponList from './WeaponList'
import styles from './styles'

const ALL = 'all'

export default function WeaponSelector({ weapons, selectedWeapon, onSelect }) {
  const { t, language } = useLanguage()
  const [rarityFilter, setRarityFilter] = useState(ALL)
  const [typeFilter, setTypeFilter] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')

  const rarities = useMemo(() => getUniqueRarities(weapons), [weapons])
  const types = useMemo(() => getUniqueTypes(weapons), [weapons])

  const visibleWeapons = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    return weapons.filter((weapon) => {
      if (!weaponMatchesRarity(weapon, rarityFilter) || !weaponMatchesType(weapon, typeFilter)) {
        return false
      }
      if (!query) return true

      const searchableText = [
        weapon.name?.en,
        weapon.name?.zh,
        weapon.type?.en,
        weapon.type?.zh,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
      return searchableText.includes(query)
    })
  }, [weapons, rarityFilter, typeFilter, searchQuery])

  const filterKey = JSON.stringify([rarityFilter, typeFilter, searchQuery])

  return (
    <Box component="section" aria-labelledby="weapon-browser-title" sx={styles.browser}>
      <WeaponFilters
        rarities={rarities}
        types={types}
        rarityFilter={rarityFilter}
        typeFilter={typeFilter}
        searchQuery={searchQuery}
        onRarityChange={setRarityFilter}
        onTypeChange={setTypeFilter}
        onSearchChange={setSearchQuery}
        language={language}
        t={t}
      />
      {selectedWeapon ? (
        <Box sx={styles.selectedWeaponContainer}>
          <WeaponDetails
            weapon={selectedWeapon}
            t={t}
            language={language}
            onDeselect={() => onSelect(null)}
          />
        </Box>
      ) : (
        <WeaponList
          weapons={visibleWeapons}
          language={language}
          onSelect={onSelect}
          filterKey={filterKey}
          t={t}
        />
      )}
    </Box>
  )
}
