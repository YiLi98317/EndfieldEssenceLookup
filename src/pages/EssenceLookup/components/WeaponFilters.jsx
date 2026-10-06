import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { getLocalizedName } from '../utils/dataHelpers'
import styles from './styles'

export default function WeaponFilters({
  rarities,
  types,
  rarityFilter,
  typeFilter,
  searchQuery,
  onRarityChange,
  onTypeChange,
  onSearchChange,
  language,
  t,
}) {
  return (
    <Box sx={styles.browserControls}>
      <Typography id="weapon-browser-title" variant="h5" sx={styles.browserTitle}>
        {t('selectWeapon')}
      </Typography>
      <Box sx={styles.filterGrid}>
        <FormControl fullWidth size="small">
          <InputLabel id="weapon-filter-rarity">{t('filterRarity')}</InputLabel>
          <Select
            labelId="weapon-filter-rarity"
            id="weapon-filter-rarity-select"
            value={rarityFilter}
            label={t('filterRarity')}
            onChange={(event) => onRarityChange(event.target.value)}
          >
            <MenuItem value="all">
              <em>{t('allRarities')}</em>
            </MenuItem>
            {rarities.map((rarity) => (
              <MenuItem key={rarity} value={rarity}>
                {rarity} ★
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="weapon-filter-type">{t('filterType')}</InputLabel>
          <Select
            labelId="weapon-filter-type"
            id="weapon-filter-type-select"
            value={typeFilter}
            label={t('filterType')}
            onChange={(event) => onTypeChange(event.target.value)}
          >
            <MenuItem value="all">
              <em>{t('allTypes')}</em>
            </MenuItem>
            {types.map((type) => {
              const key = JSON.stringify(type)
              return (
                <MenuItem key={key} value={key}>
                  {getLocalizedName(type, language)}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        size="small"
        label={t('searchWeapons')}
        placeholder={t('searchWeaponsPlaceholder')}
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        slotProps={{
          input: {
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t('clearSearch')}
                  edge="end"
                  size="small"
                  onClick={() => onSearchChange('')}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
    </Box>
  )
}
