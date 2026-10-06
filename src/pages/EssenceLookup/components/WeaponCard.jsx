import { memo } from 'react'
import { Box, Card, CardActionArea, Typography } from '@mui/material'
import { getLocalizedName } from '../utils/dataHelpers'
import WeaponIcon from './WeaponIcon'
import styles from './styles'

const WeaponCard = memo(function WeaponCard({ weapon, isSelected, language, onSelect }) {
  return (
    <Card variant="outlined" sx={styles.weaponCard(isSelected)}>
      <CardActionArea
        onClick={() => onSelect(isSelected ? null : weapon)}
        selected={isSelected}
        aria-label={getLocalizedName(weapon.name, language)}
        sx={styles.weaponCardAction}
      >
        <Box sx={styles.weaponCardContent}>
          <WeaponIcon weapon={weapon} size={58} />
          <Typography variant="caption" align="center" sx={styles.weaponCardName}>
            {getLocalizedName(weapon.name, language)}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  )
})

export default WeaponCard
