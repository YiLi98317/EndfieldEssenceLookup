import { memo, useEffect, useRef, useState } from 'react'
import { Box, Paper, Typography, useMediaQuery } from '@mui/material'
import WeaponCard from './WeaponCard'
import styles from './styles'

const ROW_HEIGHT = 112
const ROW_GAP = 8

const WeaponList = memo(function WeaponList({ weapons, language, onSelect, filterKey, t }) {
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const listRef = useRef(null)
  const isSm = useMediaQuery('(min-width: 600px)')
  const isLg = useMediaQuery('(min-width: 1200px)')
  const columnCount = isLg ? 5 : isSm ? 4 : 3
  const rowCount = Math.ceil(weapons.length / columnCount)
  const firstVisibleRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2)
  const visibleRowCount = Math.ceil((viewportHeight || 600) / ROW_HEIGHT) + 4
  const lastVisibleRow = Math.min(rowCount, firstVisibleRow + visibleRowCount)
  const virtualWeapons = weapons.slice(firstVisibleRow * columnCount, lastVisibleRow * columnCount)

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
  }, [filterKey])

  return (
    <Box ref={listRef} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)} sx={styles.weaponList}>
      <Box sx={styles.availableWeaponsBar}>
        <Typography variant="subtitle2">{t('availableWeapons')}</Typography>
        <Typography variant="caption" color="text.secondary">
          {t('weaponCount', { count: weapons.length })}
        </Typography>
      </Box>

      {weapons.length === 0 ? (
        <Paper variant="outlined" sx={styles.emptyState}>
          <Typography color="text.secondary">{t('noWeaponsFound')}</Typography>
        </Paper>
      ) : (
        <Box sx={styles.virtualList(rowCount, ROW_HEIGHT)}>
          <Box sx={styles.virtualGrid(columnCount, firstVisibleRow, ROW_HEIGHT, ROW_GAP)}>
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
  )
})

export default WeaponList
