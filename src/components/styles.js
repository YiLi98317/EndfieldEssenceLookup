const DRAWER_WIDTH = 260

const styles = {
  factoryShell: { height: '100dvh', minHeight: 0 },
  factoryMain: { py: 2 },
  factoryContainer: { px: { xs: 1, sm: 2 } },
  shell: (fullHeight) => ({
    minHeight: '100vh',
    ...(fullHeight ? { height: '100vh', overflow: 'hidden' } : {}),
    display: 'flex',
    flexDirection: 'column',
  }),
  toolbar: { columnGap: 1 },
  appTitle: { flexGrow: 1 },
  drawer: { width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' },
  drawerTitle: { px: 2, py: 2 },
  navItem: { color: 'text.primary', '&:hover': { color: 'text.primary' } },
  drawerSpacer: { flexGrow: 1 },
  languageSection: { p: 2 },
  languageLabel: { mb: 1 },
  main: (fullHeight) => ({
    flex: 1,
    width: '100%',
    py: 3,
    ...(fullHeight
      ? {
          minHeight: 0,
          height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
          boxSizing: 'border-box',
          overflow: 'hidden',
        }
      : {}),
  }),
  container: (fullHeight) => ({
    width: '100%',
    ...(fullHeight ? { height: '100%' } : {}),
  }),
}

export default styles
