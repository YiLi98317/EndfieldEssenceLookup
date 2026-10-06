import { useState } from 'react'
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Link as RouterLink, useLocation } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'
import styles from './styles'

const navItems = [
  { to: '/', labelKey: 'navEssenceLookup' },
  { to: '/version-calendar', labelKey: 'navVersionCalendar' },
]

export default function Layout({ children }) {
  const { language, setLanguage, t } = useLanguage()
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const fullHeight = pathname === '/'

  return (
    <Box sx={styles.shell(fullHeight)}>
      <AppBar position="static">
        <Toolbar sx={styles.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label={t('openNavigation')}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" sx={styles.appTitle}>
            {t('appTitle')}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={styles.drawer}>
          <Typography variant="h6" component="div" sx={styles.drawerTitle}>
            {t('appTitle')}
          </Typography>
          <Divider />
          <List component="nav">
            {navItems.map(({ to, labelKey }) => {
              const active = pathname === to
              return (
                <ListItemButton
                  key={to}
                  component={RouterLink}
                  to={to}
                  selected={active}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setDrawerOpen(false)}
                  sx={styles.navItem}
                >
                  <ListItemText primary={t(labelKey)} />
                </ListItemButton>
              )
            })}
          </List>
          <Box sx={styles.drawerSpacer} />
          <Divider />
          <Box sx={styles.languageSection}>
            <Typography variant="caption" color="text.secondary" component="div" sx={styles.languageLabel}>
              {t('language')}
            </Typography>
            <ToggleButtonGroup
              value={language}
              exclusive
              fullWidth
              onChange={(_, value) => value != null && setLanguage(value)}
              size="small"
            >
              <ToggleButton value="en">EN</ToggleButton>
              <ToggleButton value="zh">中文</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Drawer>
      <Box component="main" sx={styles.main(fullHeight)}>
        <Container maxWidth={fullHeight ? 'xl' : 'lg'} sx={styles.container(fullHeight)}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
