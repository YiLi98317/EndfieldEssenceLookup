import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useLanguage } from '../i18n/LanguageContext'
import { getLocalizedName, flattenStats } from '../utils/dataHelpers'

export default function WeaponSelector({ weapons, selectedWeapon, onSelect }) {
  const { t, language } = useLanguage()
  const selectLabel = t('selectWeapon')
  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel id="weapon-select-label">{selectLabel}</InputLabel>
      <Select
        labelId="weapon-select-label"
        id="weapon-select"
        value={selectedWeapon?.id ?? ''}
        label={selectLabel}
        onChange={(e) => {
          const value = e.target.value
          const weapon = weapons.find((w) => {
            // Handle both numeric and string IDs
            return String(w.id) === String(value) || w.id === value || w.id === Number(value)
          })
          onSelect(weapon ?? null)
        }}
      >
        <MenuItem value="">
          <em>{t('none')}</em>
        </MenuItem>
        {weapons.map((weapon) => {
          const weaponName = getLocalizedName(weapon.name, language)
          const statsList = flattenStats(weapon.stats)
          return (
            <MenuItem key={weapon.id} value={weapon.id}>
              {weaponName} ({statsList.join(', ')})
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
