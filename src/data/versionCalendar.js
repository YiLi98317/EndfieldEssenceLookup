const currentBase = `${import.meta.env.BASE_URL}images/version-calendar/current/`

export const currentVersionCalendar = {
  titleImage: `${currentBase}title.png`,
  timelineImage: `${currentBase}timeline.png`,
  contentImage: `${currentBase}content.jpg`,
  // content.jpg is 1849px wide vs 1920px for title/timeline; it must stay at the
  // same scale and right-aligned for its date columns to line up with the timeline.
  contentWidthRatio: 1849 / 1920,
}
