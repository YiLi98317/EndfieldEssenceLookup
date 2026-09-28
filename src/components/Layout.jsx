import { AppBar, Toolbar, Typography, Container, ToggleButtonGroup, ToggleButton, Box, Button } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router'
import { useLanguage } from '../i18n/LanguageContext'

const navItems = [
  { to: '/', labelKey: 'navEssenceLookup' },
  { to: '/version-calendar', labelKey: 'navVersionCalendar' },
]

export default function Layout({ children, maxWidth = 'md' }) {
  const { language, setLanguage, t } = useLanguage()
  const { pathname } = useLocation()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 1, py: 1 }}>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {t('appTitle')}
          </Typography>
          <Box component="nav" sx={{ display: 'flex', gap: 0.5 }}>
            {navItems.map(({ to, labelKey }) => {
              const active = pathname === to
              return (
                <Button
                  key={to}
                  component={RouterLink}
                  to={to}
                  color="inherit"
                  aria-current={active ? 'page' : undefined}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: active ? 'rgba(255,255,255,0.16)' : 'transparent',
                    '&:hover': { color: 'inherit', backgroundColor: 'rgba(255,255,255,0.24)' },
                  }}
                >
                  {t(labelKey)}
                </Button>
              )
            })}
          </Box>
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={(_, value) => value != null && setLanguage(value)}
            size="small"
            sx={{ '& .MuiToggleButton-root': { color: 'inherit', borderColor: 'rgba(255,255,255,0.5)' } }}
          >
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="zh">中文</ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
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
