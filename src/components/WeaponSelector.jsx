import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useLanguage } from '../i18n/LanguageContext'

export default function WeaponSelector({ weapons, selectedWeapon, onSelect }) {
  const { t } = useLanguage()
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
          const weapon = weapons.find((w) => w.id === e.target.value)
          onSelect(weapon ?? null)
        }}
      >
        <MenuItem value="">
          <em>{t('none')}</em>
        </MenuItem>
        {weapons.map((weapon) => (
          <MenuItem key={weapon.id} value={weapon.id}>
            {weapon.name} ({weapon.stats.join(', ')})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
