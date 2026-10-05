import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
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
  useMediaQuery,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useLanguage } from '../i18n/LanguageContext'
import {
  getLocalizedName,
  getUniqueRarities,
  getUniqueTypes,
  weaponMatchesRarity,
  weaponMatchesType,
} from '../utils/dataHelpers'

const ALL = 'all'

const WeaponIcon = memo(function WeaponIcon({ weapon, size = 64 }) {
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
      loading="lazy"
      decoding="async"
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
})

function WeaponDetails({ weapon, t, language, onDeselect }) {
  const statGroups = Array.isArray(weapon.stats)
    ? [{ label: null, stats: weapon.stats }]
    : [
        { label: t('statBasic'), stats: weapon.stats?.basic },
        { label: t('statAdditional'), stats: weapon.stats?.additional },
        { label: t('statSkill'), stats: weapon.stats?.skill },
      ]

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 2.5 }, boxSizing: 'border-box' }}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={onDeselect}
        aria-label={t('deselectWeapon')}
        sx={{ mb: 2 }}
      >
        {t('deselectWeapon')}
      </Button>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <WeaponIcon weapon={weapon} size={76} />
        <Box sx={{ minWidth: 0 }}>
          <Typography id="weapon-details-title" variant="overline" color="text.secondary">
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

      {weapon.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: 'pre-line', mb: 2 }}
        >
          {weapon.description}
        </Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: { xs: 0.75, sm: 1.25 },
          alignItems: 'start',
        }}
      >
        {!statGroups.some(({ stats }) => stats?.length) && (
          <Typography color="text.secondary" sx={{ gridColumn: '1 / -1' }}>
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

const WeaponCard = memo(function WeaponCard({ weapon, isSelected, language, onSelect }) {
  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 0,
        height: '100%',
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
      }}
    >
      <CardActionArea
        onClick={() => onSelect(isSelected ? null : weapon)}
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
})

const WeaponBrowser = memo(function WeaponBrowser({
  weapons,
  selectedWeapon,
  onSelect,
  t,
  language,
}) {
  const [rarityFilter, setRarityFilter] = useState(ALL)
  const [typeFilter, setTypeFilter] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const listRef = useRef(null)
  const isSm = useMediaQuery('(min-width: 600px)')
  const isLg = useMediaQuery('(min-width: 1200px)')
  const columnCount = isLg ? 5 : isSm ? 4 : 3
  const rowHeight = 112
  const rowGap = 8

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

  const rowCount = Math.ceil(visibleWeapons.length / columnCount)
  const firstVisibleRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2)
  const visibleRowCount = Math.ceil((viewportHeight || 600) / rowHeight) + 4
  const lastVisibleRow = Math.min(rowCount, firstVisibleRow + visibleRowCount)
  const virtualWeapons = visibleWeapons.slice(
    firstVisibleRow * columnCount,
    lastVisibleRow * columnCount
  )

  const handleListScroll = (event) => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  useEffect(() => {
    const list = listRef.current
    if (!list) return undefined

    const updateViewportHeight = () => setViewportHeight(list.clientHeight)
    updateViewportHeight()
    const observer = new ResizeObserver(updateViewportHeight)
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0
  }, [rarityFilter, typeFilter, searchQuery])

  return (
    <Box
      component="section"
      aria-labelledby="weapon-browser-title"
      sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '0 0 auto',
        }}
      >
        <Typography id="weapon-browser-title" variant="h5" sx={{ mb: 1 }}>
          {t('selectWeapon')}
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

        <TextField
          fullWidth
          size="small"
          label={t('searchWeapons')}
          placeholder={t('searchWeaponsPlaceholder')}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </Box>

      {selectedWeapon ? (
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { sm: 0.5 } }}>
          <WeaponDetails
            weapon={selectedWeapon}
            t={t}
            language={language}
            onDeselect={() => onSelect(null)}
          />
        </Box>
      ) : (
        <Box
          ref={listRef}
          onScroll={handleListScroll}
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            pr: { sm: 0.5 },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 1, mb: 1 }}>
            <Typography variant="subtitle2">{t('availableWeapons')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('weaponCount', { count: visibleWeapons.length })}
            </Typography>
          </Box>

          {visibleWeapons.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('noWeaponsFound')}</Typography>
            </Paper>
          ) : (
            <Box sx={{ position: 'relative', height: rowCount * rowHeight }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: firstVisibleRow * rowHeight,
                  left: 0,
                  right: 0,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  gridAutoRows: rowHeight - rowGap,
                  gap: `${rowGap}px`,
                }}
              >
                {virtualWeapons.map((weapon) => (
                  <WeaponCard
                    key={weapon.id}
                    weapon={weapon}
                    isSelected={false}
                    language={language}
                    onSelect={onSelect}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
})

export default function WeaponSelector({ weapons, selectedWeapon, onSelect }) {
  const { t, language } = useLanguage()

  return (
    <WeaponBrowser
      weapons={weapons}
      selectedWeapon={selectedWeapon}
      onSelect={onSelect}
      t={t}
      language={language}
    />
  )
}

export { WeaponIcon }
