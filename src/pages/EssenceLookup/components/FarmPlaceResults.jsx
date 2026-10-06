import { useMemo } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { useLanguage } from '../../../i18n/LanguageContext'
import { getMatchingPools } from '../utils/essenceLogic'
import { flattenStats, getLocalizedName } from '../utils/dataHelpers'
import PoolAccordion from './PoolAccordion'
import styles from './styles'

export default function FarmPlaceResults({ weapon, pools, weapons = [] }) {
  const { t, language } = useLanguage()
  const weaponStatsSet = useMemo(() => new Set(flattenStats(weapon?.stats)), [weapon])
  const matchingPools = useMemo(() => getMatchingPools(weapon, pools), [weapon, pools])

  if (!weapon) {
    return (
      <Paper variant="outlined" sx={styles.resultsPanel}>
        <Typography id="farm-locations-title" variant="h5" sx={styles.resultsTitle}>
          {t('farmLocations')}
        </Typography>
        <Typography color="text.secondary">{t('selectWeaponHint')}</Typography>
      </Paper>
    )
  }

  const weaponName = getLocalizedName(weapon.name, language)
  const statsList = flattenStats(weapon.stats)
  const statsStr = statsList.join(', ')

  if (statsList.length === 0) {
    return (
      <Paper variant="outlined" sx={styles.resultsPanel}>
        <Typography id="farm-locations-title" variant="h5" sx={styles.resultsTitle}>
          {t('farmLocations')}
        </Typography>
        <Typography color="text.secondary">
          {t('weaponStatsNotAvailable', { name: weaponName })}
        </Typography>
      </Paper>
    )
  }

  if (matchingPools.length === 0) {
    return (
      <Paper variant="outlined" sx={styles.resultsPanel}>
        <Typography id="farm-locations-title" variant="h5" sx={styles.resultsTitle}>
          {t('farmLocations')}
        </Typography>
        <Typography color="error">
          {t('noFarmPlace', { name: weaponName, stats: statsStr })}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper variant="outlined" sx={styles.resultsPanelWithList}>
      <Typography id="farm-locations-title" variant="h5" sx={styles.resultsTitleWithList}>
        {t('farmLocations')}
      </Typography>
      <Box sx={styles.resultsList}>
        {matchingPools.map((pool) => (
          <PoolAccordion
            key={`${weapon.id}-${pool.id}`}
            pool={pool}
            weapon={weapon}
            weapons={weapons}
            language={language}
            matchingStats={weaponStatsSet}
            t={t}
          />
        ))}
      </Box>
    </Paper>
  )
}
