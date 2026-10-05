import { useEffect, useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  Card,
  CardActionArea,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useLanguage } from '../i18n/LanguageContext'
import {
  getLocalizedName,
  getUniqueRarities,
  getUniqueTypes,
  weaponMatchesRarity,
  weaponMatchesType,
} from '../utils/dataHelpers'

const ALL = 'all'

function WeaponIcon({ weapon, size = 64 }) {
  const [imageFailed, setImageFailed] = useState(false)
  const name = getLocalizedName(weapon.name, 'zh')
  const imageSrc = weapon.image
    ? `${import.meta.env.BASE_URL}${weapon.image.replace(/^\//, '')}`
    : ''

  if (imageFailed || !imageSrc) {
    return (
      <Box
        aria-label={name}
        sx={{
          width: size,
          height: size,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 2,
          backgroundColor: 'action.hover',
          color: 'text.secondary',
          fontWeight: 700,
          fontSize: size > 50 ? '1.25rem' : '0.9rem',
        }}
      >
        {name.slice(0, 2)}
      </Box>
    )
  }

  return (
    <Box
      component="img"
      src={imageSrc}
      alt={name}
      onError={() => setImageFailed(true)}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: 2,
        backgroundColor: 'action.hover',
      }}
    />
  )
}

function WeaponDetails({ weapon, t, language }) {
  const statGroups = Array.isArray(weapon.stats)
    ? [{ label: null, stats: weapon.stats }]
    : [
        { label: t('statBasic'), stats: weapon.stats?.basic },
        { label: t('statAdditional'), stats: weapon.stats?.additional },
        { label: t('statSkill'), stats: weapon.stats?.skill },
      ]

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <WeaponIcon weapon={weapon} size={76} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary">
            {t('weaponDetails')}
          </Typography>
          <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
            {getLocalizedName(weapon.name, language)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
            {weapon.type && (
              <Chip
                size="small"
                label={getLocalizedName(weapon.type, language)}
                variant="outlined"
              />
            )}
            {weapon.rarity != null && (
              <Chip size="small" label={`${weapon.rarity} ★`} color="warning" />
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 1.25 }}>
        {!statGroups.some(({ stats }) => stats?.length) && (
          <Typography color="text.secondary">
            {t('weaponStatsNotAvailable', { name: getLocalizedName(weapon.name, language) })}
          </Typography>
        )}
        {statGroups.map(({ label, stats }) =>
          stats?.length ? (
            <Box key={label || 'stats'}>
              {label && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                >
                  {label}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {stats.map((stat) => (
                  <Chip key={stat} label={stat} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          ) : null
        )}
      </Box>
    </Paper>
  )
}

export default function WeaponSelector({ weapons, selectedWeapon, onSelect }) {
  const { t, language } = useLanguage()
  const [rarityFilter, setRarityFilter] = useState(ALL)
  const [typeFilter, setTypeFilter] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')

  const rarities = useMemo(() => getUniqueRarities(weapons), [weapons])
  const types = useMemo(() => getUniqueTypes(weapons), [weapons])

  const filteredWeapons = useMemo(
    () =>
      weapons.filter(
        (weapon) =>
          weaponMatchesRarity(weapon, rarityFilter) &&
          weaponMatchesType(weapon, typeFilter)
      ),
    [weapons, rarityFilter, typeFilter]
  )

  const visibleWeapons = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    if (!query) return filteredWeapons

    return filteredWeapons.filter((weapon) => {
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
  }, [filteredWeapons, searchQuery])

  useEffect(() => {
    if (
      selectedWeapon &&
      !filteredWeapons.some(
        (weapon) => String(weapon.id) === String(selectedWeapon.id)
      )
    ) {
      onSelect(null)
    }
  }, [filteredWeapons, selectedWeapon, onSelect])

  const handleSelect = (weapon) => {
    onSelect(weapon)
    if (weapon) {
      setSearchQuery(getLocalizedName(weapon.name, language))
    }
  }

  return (
    <Box component="section" aria-labelledby="weapon-browser-title">
      <Typography id="weapon-browser-title" variant="h5" sx={{ mb: 0.5 }}>
        {t('selectWeapon')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('weaponSearchHint')}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <FormControl fullWidth size="small">
          <InputLabel id="weapon-filter-rarity">{t('filterRarity')}</InputLabel>
          <Select
            labelId="weapon-filter-rarity"
            id="weapon-filter-rarity-select"
            value={rarityFilter}
            label={t('filterRarity')}
            onChange={(event) => setRarityFilter(event.target.value)}
          >
            <MenuItem value={ALL}>
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
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <MenuItem value={ALL}>
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

      <Autocomplete
        fullWidth
        options={filteredWeapons}
        value={selectedWeapon || null}
        inputValue={searchQuery}
        onInputChange={(_, value) => setSearchQuery(value)}
        onChange={(_, value) => handleSelect(value)}
        getOptionLabel={(weapon) => getLocalizedName(weapon?.name, language)}
        isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
        noOptionsText={t('noWeaponsFound')}
        renderOption={(props, weapon) => (
          <Box component="li" {...props} key={weapon.id} sx={{ display: 'flex', gap: 1.25 }}>
            <WeaponIcon weapon={weapon} size={40} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {getLocalizedName(weapon.name, language)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {weapon.rarity} ★ · {getLocalizedName(weapon.type, language)}
              </Typography>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('searchWeapons')}
            placeholder={t('searchWeaponsPlaceholder')}
          />
        )}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2, mb: 1 }}>
        <Typography variant="subtitle2">{t('availableWeapons')}</Typography>
        <Typography variant="caption" color="text.secondary">
          {t('weaponCount', { count: visibleWeapons.length })}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(3, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1,
        }}
      >
        {visibleWeapons.map((weapon) => {
          const isSelected = String(selectedWeapon?.id) === String(weapon.id)
          return (
            <Card
              key={weapon.id}
              variant="outlined"
              sx={{
                minWidth: 0,
                borderColor: isSelected ? 'primary.main' : 'divider',
                backgroundColor: isSelected ? 'action.selected' : 'background.paper',
              }}
            >
              <CardActionArea
                onClick={() => handleSelect(weapon)}
                selected={isSelected}
                aria-label={getLocalizedName(weapon.name, language)}
                sx={{ height: '100%', p: 1 }}
              >
                <Box sx={{ display: 'grid', justifyItems: 'center', gap: 0.75 }}>
                  <WeaponIcon weapon={weapon} size={58} />
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{ width: '100%', overflowWrap: 'anywhere', lineHeight: 1.2 }}
                  >
                    {getLocalizedName(weapon.name, language)}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>

      {visibleWeapons.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 1, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('noWeaponsFound')}</Typography>
        </Paper>
      )}

      {selectedWeapon && (
        <WeaponDetails weapon={selectedWeapon} t={t} language={language} />
      )}
    </Box>
  )
}

export { WeaponIcon }
