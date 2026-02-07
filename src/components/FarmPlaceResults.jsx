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

export default function FarmPlaceResults({ weapon, pools }) {
  const { t } = useLanguage()

  if (!weapon) {
    return (
      <Typography color="text.secondary">
        {t('selectWeaponHint')}
      </Typography>
    )
  }

  const matchingPools = getMatchingPools(weapon, pools)
  const statsStr = weapon.stats.join(', ')

  if (matchingPools.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">
          {t('noFarmPlace', { name: weapon.name, stats: statsStr })}
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {t('farmThesePlaces', { name: weapon.name, stats: statsStr })}
      </Typography>
      <List component={Paper}>
        {matchingPools.map((pool) => (
          <ListItem key={pool.id} divider>
            <ListItemText
              primary={pool.name}
              secondary={
                <Box component="span" sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  {pool.stats.map((stat) => (
                    <Chip key={stat} label={stat} size="small" variant="outlined" />
                  ))}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
