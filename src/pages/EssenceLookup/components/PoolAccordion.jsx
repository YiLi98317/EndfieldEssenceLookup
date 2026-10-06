import { memo, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { getFarmableTogetherWeapons } from '../utils/essenceLogic'
import { flattenStats, getLocalizedName } from '../utils/dataHelpers'
import PoolStatsBlock from './PoolStatsBlock'
import styles from './styles'

const PoolAccordion = memo(function PoolAccordion({
  pool,
  weapon,
  weapons,
  language,
  matchingStats,
  t,
}) {
  const [expanded, setExpanded] = useState(false)
  const stats = pool.stats
  const hasCategorized =
    stats &&
    typeof stats === 'object' &&
    (stats.basic?.length || stats.additional?.length || stats.skill?.length)
  const poolName = getLocalizedName(pool.name, language)
  const farmableWeapons = useMemo(
    () => (expanded ? getFarmableTogetherWeapons(pool, weapons, weapon) : []),
    [expanded, pool, weapons, weapon]
  )

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, nextExpanded) => setExpanded(nextExpanded)}
      disableGutters
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={styles.accordion}
    >
      <AccordionSummary
        expandIcon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          </svg>
        }
      >
        <Box sx={styles.poolSummary}>
          <Typography variant="subtitle1" fontWeight={600}>
            {poolName}
          </Typography>
          <Box component="div" sx={styles.poolSummaryStats}>
            <PoolStatsBlock
              stats={stats}
              hasCategorized={hasCategorized}
              matchingStats={matchingStats}
              t={t}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="subtitle2" color="text.secondary" sx={styles.farmableTogetherTitle}>
          {t('farmableTogether')}
        </Typography>
        {farmableWeapons.length > 0 ? (
          <List dense disablePadding>
            {farmableWeapons.map((w) => {
              const wName = getLocalizedName(w.name, language)
              const wStatsList = flattenStats(w.stats)
              const typeLabel = w.type ? ` · ${getLocalizedName(w.type, language)}` : ''
              const rarityLabel = w.rarity != null ? ` · ${w.rarity}★` : ''
              const selectStat =
                (weapon.stats.additional?.[0] != null &&
                w.stats.additional?.[0] === weapon.stats.additional?.[0]
                  ? w.stats.additional[0]
                  : null) ??
                (weapon.stats.skill?.[0] != null &&
                w.stats.skill?.[0] === weapon.stats.skill?.[0]
                  ? w.stats.skill[0]
                  : null)

              return (
                <ListItem key={w.id} disablePadding sx={styles.farmableWeaponItem}>
                  <ListItemText
                    primary={`${wName}${typeLabel}${rarityLabel}`}
                    secondary={
                      wStatsList.length > 0 ? (
                        <Box component="span" sx={styles.farmableWeaponStats}>
                          {wStatsList.map((s) => (
                            <Chip
                              key={s}
                              label={s}
                              size="small"
                              variant={s === selectStat ? 'filled' : 'outlined'}
                              sx={s === selectStat ? styles.matchingWeaponChip : undefined}
                            />
                          ))}
                        </Box>
                      ) : null
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              )
            })}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('noFarmableTogether')}
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  )
})

export default PoolAccordion
