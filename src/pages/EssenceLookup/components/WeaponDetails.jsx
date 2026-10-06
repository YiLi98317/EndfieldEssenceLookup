import { Box, Button, Chip, Paper, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getLocalizedName } from '../utils/dataHelpers'
import WeaponIcon from './WeaponIcon'
import styles from './styles'

export default function WeaponDetails({ weapon, t, language, onDeselect }) {
  const statGroups = Array.isArray(weapon.stats)
    ? [{ label: null, stats: weapon.stats }]
    : [
        { label: t('statBasic'), stats: weapon.stats?.basic },
        { label: t('statAdditional'), stats: weapon.stats?.additional },
        { label: t('statSkill'), stats: weapon.stats?.skill },
      ]

  return (
    <Paper variant="outlined" sx={styles.detailsPanel}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={onDeselect}
        aria-label={t('deselectWeapon')}
        sx={styles.detailsDeselectButton}
      >
        {t('deselectWeapon')}
      </Button>
      <Box sx={styles.detailsHeader}>
        <WeaponIcon weapon={weapon} size={76} />
        <Box sx={styles.detailsHeaderContent}>
          <Typography id="weapon-details-title" variant="overline" color="text.secondary">
            {t('weaponDetails')}
          </Typography>
          <Typography variant="h6" sx={styles.detailsName}>
            {getLocalizedName(weapon.name, language)}
          </Typography>
          <Box sx={styles.detailsTags}>
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
        <Typography variant="body2" color="text.secondary" sx={styles.detailsDescription}>
          {weapon.description}
        </Typography>
      )}

      <Box sx={styles.detailsStatsGrid}>
        {!statGroups.some(({ stats }) => stats?.length) && (
          <Typography color="text.secondary" sx={styles.detailsNoStats}>
            {t('weaponStatsNotAvailable', { name: getLocalizedName(weapon.name, language) })}
          </Typography>
        )}
        {statGroups.map(({ label, stats }) =>
          stats?.length ? (
            <Box key={label || 'stats'}>
              {label && (
                <Typography variant="caption" color="text.secondary" sx={styles.detailsGroupLabel}>
                  {label}
                </Typography>
              )}
              <Box sx={styles.detailsStatList}>
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
