import { AppBar, Toolbar, Typography, Container, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { useLanguage } from '../i18n/LanguageContext'

export default function Layout({ children }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <>
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
      <Container sx={{ py: 3 }}>{children}</Container>
    </>
  )
}
