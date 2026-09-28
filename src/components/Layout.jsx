import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Link as RouterLink, useLocation } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'

const navItems = [
  { to: '/', labelKey: 'navEssenceLookup' },
  { to: '/version-calendar', labelKey: 'navVersionCalendar' },
]

const DRAWER_WIDTH = 260

export default function Layout({ children, maxWidth = 'md' }) {
  const { language, setLanguage, t } = useLanguage()
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar sx={{ columnGap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label={t('openNavigation')}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {t('appTitle')}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="div" sx={{ px: 2, py: 2 }}>
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
                  sx={{ color: 'text.primary', '&:hover': { color: 'text.primary' } }}
                >
                  <ListItemText primary={t(labelKey)} />
                </ListItemButton>
              )
            })}
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
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
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          py: 3,
        }}
      >
        <Container maxWidth={maxWidth} sx={{ width: '100%' }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
