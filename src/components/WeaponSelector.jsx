import { useState, useMemo, useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
} from '@mui/material'
import { useLanguage } from '../i18n/LanguageContext'
import {
  getLocalizedName,
  flattenStats,
  getUniqueRarities,
  getUniqueTypes,
  weaponMatchesRarity,
  weaponMatchesType,
} from '../utils/dataHelpers'

const ALL = 'all'

export default function WeaponSelector({ weapons, selectedWeapon, onSelect }) {
  const { t, language } = useLanguage()
  const [rarityFilter, setRarityFilter] = useState(ALL)
  const [typeFilter, setTypeFilter] = useState(ALL)

  const rarities = useMemo(() => getUniqueRarities(weapons), [weapons])
  const types = useMemo(() => getUniqueTypes(weapons), [weapons])

  const filteredWeapons = useMemo(() => {
    return weapons.filter(
      (w) =>
        weaponMatchesRarity(w, rarityFilter) &&
        weaponMatchesType(w, typeFilter)
    )
  }, [weapons, rarityFilter, typeFilter])

  // Clear selection if selected weapon is no longer in filtered list
  useEffect(() => {
    if (
      selectedWeapon &&
      !filteredWeapons.some(
        (w) => w.id === selectedWeapon.id || String(w.id) === String(selectedWeapon.id)
      )
    ) {
      onSelect(null)
    }
  }, [filteredWeapons, selectedWeapon, onSelect])

  const handleRarityChange = (e) => {
    setRarityFilter(e.target.value)
  }

  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value)
  }

  const handleWeaponChange = (e) => {
    const value = e.target.value
    if (value === '') {
      onSelect(null)
      return
    }
    const weapon = weapons.find((w) => {
      return String(w.id) === String(value) || w.id === value || w.id === Number(value)
    })
    onSelect(weapon ?? null)
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="weapon-filter-rarity">{t('filterRarity')}</InputLabel>
            <Select
              labelId="weapon-filter-rarity"
              id="weapon-filter-rarity-select"
              value={rarityFilter}
              label={t('filterRarity')}
              onChange={handleRarityChange}
            >
              <MenuItem value={ALL}>
                <em>{t('allRarities')}</em>
              </MenuItem>
              {rarities.map((r) => (
                <MenuItem key={r} value={r}>
                  {r} ★
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="weapon-filter-type">{t('filterType')}</InputLabel>
            <Select
              labelId="weapon-filter-type"
              id="weapon-filter-type-select"
              value={typeFilter}
              label={t('filterType')}
              onChange={handleTypeChange}
            >
              <MenuItem value={ALL}>
                <em>{t('allTypes')}</em>
              </MenuItem>
              {types.map((type) => {
                const key = JSON.stringify(type)
                const label = getLocalizedName(type, language)
                return (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <FormControl fullWidth>
        <InputLabel id="weapon-select-label">{t('selectWeapon')}</InputLabel>
        <Select
          labelId="weapon-select-label"
          id="weapon-select"
          value={selectedWeapon?.id ?? ''}
          label={t('selectWeapon')}
          onChange={handleWeaponChange}
        >
          <MenuItem value="">
            <em>{t('none')}</em>
          </MenuItem>
          {filteredWeapons.map((weapon) => (
            <MenuItem key={weapon.id} value={weapon.id}>
              {getLocalizedName(weapon.name, language)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedWeapon && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {t('weaponDetails')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1 }}>
            {selectedWeapon.type && (
              <Typography variant="body2" component="span">
                {t('filterType')}: {getLocalizedName(selectedWeapon.type, language)}
              </Typography>
            )}
            {selectedWeapon.rarity != null && (
              <Typography variant="body2" component="span">
                {t('filterRarity')}: {selectedWeapon.rarity} ★
              </Typography>
            )}
          </Box>
          {selectedWeapon.stats && (
            <Box>
              {Array.isArray(selectedWeapon.stats) ? (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selectedWeapon.stats.map((stat) => (
                    <Chip key={stat} label={stat} size="small" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <>
              {selectedWeapon.stats.basic?.length > 0 && (
                <Box sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                    {t('statBasic')}:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedWeapon.stats.basic.map((stat) => (
                      <Chip key={stat} label={stat} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              {selectedWeapon.stats.additional?.length > 0 && (
                <Box sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                    {t('statAdditional')}:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedWeapon.stats.additional.map((stat) => (
                      <Chip key={stat} label={stat} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              {selectedWeapon.stats.skill?.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                    {t('statSkill')}:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedWeapon.stats.skill.map((stat) => (
                      <Chip key={stat} label={stat} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
                </>
              )}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}
