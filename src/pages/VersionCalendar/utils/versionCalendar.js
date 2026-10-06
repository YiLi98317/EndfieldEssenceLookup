import versions from '../../../data/versionCalendars.json'

const imageBase = `${import.meta.env.BASE_URL}images/version-calendar/`

// Content images are slightly narrower than the 1920px title/timeline. The timeline is
// scaled by the inverse of contentWidthRatio and cropped on the left so its dates line
// up with the content columns.
export const versionCalendars = versions.map((entry) => {
  if (!entry.images) return { ...entry, hasCalendar: false }
  const dir = `${imageBase}${entry.version}/`
  return {
    ...entry,
    hasCalendar: true,
    titleImage: `${dir}${entry.images.title}`,
    timelineImage: `${dir}${entry.images.timeline}`,
    contentImage: `${dir}${entry.images.content}`,
    contentWidthRatio: entry.contentWidth / entry.timelineWidth,
  }
})

export const latestVersionCalendar = versionCalendars.find((entry) => entry.hasCalendar)
