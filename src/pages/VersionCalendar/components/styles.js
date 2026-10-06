const image = {
  display: 'block',
  width: '100%',
  height: 'auto',
}

const styles = {
  calendar: { display: 'flex', flexDirection: 'column', width: '100%' },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: 'background.default',
  },
  image,
  timelineContainer: { overflow: 'hidden' },
  timelineImage: (timelineScale) => ({
    ...image,
    width: `${timelineScale * 100}%`,
    ml: `${(1 - timelineScale) * 100}%`,
  }),
}

export default styles
