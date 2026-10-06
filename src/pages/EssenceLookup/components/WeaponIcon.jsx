import { memo, useState } from 'react'
import { Box } from '@mui/material'
import { getLocalizedName } from '../utils/dataHelpers'
import styles from './styles'

const WeaponIcon = memo(function WeaponIcon({ weapon, size = 64 }) {
  const [imageFailed, setImageFailed] = useState(false)
  const name = getLocalizedName(weapon.name, 'zh')
  const imageSrc = weapon.image
    ? `${import.meta.env.BASE_URL}${weapon.image.replace(/^\//, '')}`
    : ''

  if (imageFailed || !imageSrc) {
    return (
      <Box aria-label={name} sx={styles.weaponIconFallback(size)}>
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
      sx={styles.weaponIcon(size)}
    />
  )
})

export default WeaponIcon
