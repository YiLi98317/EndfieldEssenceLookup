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

export default function FarmPlaceResults({ weapon, pools }) {
  if (!weapon) {
    return (
      <Typography color="text.secondary">
        Select a weapon to see where you can farm its essence.
      </Typography>
    )
  }

  const matchingPools = getMatchingPools(weapon, pools)

  if (matchingPools.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">
          No farm place drops all required stats ({weapon.stats.join(', ')}) for{' '}
          {weapon.name}. You cannot farm the ideal essence for this weapon.
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Farm these places for {weapon.name} (needs: {weapon.stats.join(', ')}):
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
