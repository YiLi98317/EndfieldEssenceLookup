const currentBase = `${import.meta.env.BASE_URL}images/version-calendar/current/`

export const currentVersionCalendar = {
  titleImage: `${currentBase}title.png`,
  timelineImage: `${currentBase}timeline.png`,
  contentImage: `${currentBase}content.jpg`,
  // content.jpg is 1849px wide vs 1920px for title/timeline. The timeline is scaled
  // by the inverse and cropped on the left so its dates line up with the content columns.
  contentWidthRatio: 1849 / 1920,
}
