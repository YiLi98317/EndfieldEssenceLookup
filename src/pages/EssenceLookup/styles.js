const styles = {
  pageGrid: {
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(0, 1fr)',
      md: 'minmax(0, 1fr) minmax(0, 1fr)',
    },
    gridTemplateRows: {
      xs: 'minmax(0, 1fr) minmax(0, 1fr)',
      md: 'minmax(0, 1fr)',
    },
    gap: { xs: 3, md: 4 },
    alignItems: 'start',
  },
  resultsSection: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
  },
}

export default styles
