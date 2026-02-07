import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

export default function WeaponSelector({ weapons, selectedWeapon, onSelect }) {
  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel id="weapon-select-label">Select Weapon</InputLabel>
      <Select
        labelId="weapon-select-label"
        id="weapon-select"
        value={selectedWeapon?.id ?? ''}
        label="Select Weapon"
        onChange={(e) => {
          const weapon = weapons.find((w) => w.id === e.target.value)
          onSelect(weapon ?? null)
        }}
      >
        <MenuItem value="">
          <em>None</em>
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
