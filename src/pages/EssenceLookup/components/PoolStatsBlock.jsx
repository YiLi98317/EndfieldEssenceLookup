import { memo } from 'react'
import { Box, Chip, Typography } from '@mui/material'
import { flattenStats } from '../utils/dataHelpers'
import styles from './styles'

const PoolStatsBlock = memo(function PoolStatsBlock({ stats, hasCategorized, matchingStats, t }) {
  const statChip = (stat) => (
    <Chip
      key={stat}
      label={stat}
      size="small"
      variant={matchingStats.has(stat) ? 'filled' : 'outlined'}
      color={matchingStats.has(stat) ? 'primary' : 'default'}
    />
  )

  if (!hasCategorized) {
    return <Box component="span" sx={styles.statsList}>{flattenStats(stats).map(statChip)}</Box>
  }

  const groups = [
    { key: 'basic', label: t('statBasic') },
    { key: 'additional', label: t('statAdditional') },
    { key: 'skill', label: t('statSkill') },
  ]

  return groups.map(({ key, label }, index) =>
    stats[key]?.length > 0 ? (
      <Box key={key} sx={index < groups.length - 1 ? styles.statsSection : undefined}>
        <Typography component="span" variant="caption" color="text.secondary" sx={styles.statsLabel}>
          {label}: {' '}
        </Typography>
        <Box component="span" sx={styles.statsList}>
          {stats[key].map(statChip)}
        </Box>
      </Box>
    ) : null
  )
})

export default PoolStatsBlock
