import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  Box,
} from '@mui/material'
import { getMatchingPools } from '../utils/essenceLogic'
import { useLanguage } from '../i18n/LanguageContext'
import { getLocalizedName, flattenStats } from '../utils/dataHelpers'

export default function FarmPlaceResults({ weapon, pools }) {
  const { t, language } = useLanguage()

  if (!weapon) {
    return (
      <Typography color="text.secondary">
        {t('selectWeaponHint')}
      </Typography>
    )
  }

  const matchingPools = getMatchingPools(weapon, pools)
  const weaponName = getLocalizedName(weapon.name, language)
  const statsList = flattenStats(weapon.stats)
  const statsStr = statsList.join(', ')

  if (matchingPools.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">
          {t('noFarmPlace', { name: weaponName, stats: statsStr })}
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {t('farmThesePlaces', { name: weaponName, stats: statsStr })}
      </Typography>
      <List component={Paper}>
        {matchingPools.map((pool) => {
          const poolName = getLocalizedName(pool.name, language)
          const poolStatsList = flattenStats(pool.stats)
          return (
            <ListItem key={pool.id} divider>
              <ListItemText
                primary={poolName}
                secondary={
                  <Box component="span" sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {poolStatsList.map((stat) => (
                      <Chip key={stat} label={stat} size="small" variant="outlined" />
                    ))}
                  </Box>
                }
              />
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}
