import { AppBar, Toolbar, Typography, Container } from '@mui/material'

export default function Layout({ children }) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1">
            Endfield Essence Lookup
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>{children}</Container>
    </>
  )
}
