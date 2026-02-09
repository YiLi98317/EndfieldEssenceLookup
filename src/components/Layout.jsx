import { AppBar, Toolbar, Typography, Container, ToggleButtonGroup, ToggleButton, Box } from '@mui/material'
import { useLanguage } from '../i18n/LanguageContext'

export default function Layout({ children }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {t('appTitle')}
          </Typography>
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
        <Container maxWidth="md" sx={{ width: '100%' }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
