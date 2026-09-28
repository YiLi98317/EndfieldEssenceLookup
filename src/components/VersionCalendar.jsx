import { Box } from '@mui/material'
import { useLanguage } from '../i18n/LanguageContext'

const imageSx = {
  display: 'block',
  width: '100%',
  height: 'auto',
}

export default function VersionCalendar({
  titleImage,
  timelineImage,
  contentImage,
  contentWidthRatio = 1,
  titleAlt,
  timelineAlt,
  contentAlt,
}) {
  const { t } = useLanguage()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      {titleImage && (
        <Box
          component="img"
          src={titleImage}
          alt={titleAlt ?? t('versionCalendarTitleAlt')}
          sx={imageSx}
        />
      )}
      {timelineImage && (
        <Box
          component="img"
          src={timelineImage}
          alt={timelineAlt ?? t('versionCalendarTimelineAlt')}
          loading="lazy"
          sx={imageSx}
        />
      )}
      {contentImage && (
        <Box
          component="img"
          src={contentImage}
          alt={contentAlt ?? t('versionCalendarContentAlt')}
          loading="lazy"
          sx={{ ...imageSx, width: `${contentWidthRatio * 100}%`, alignSelf: 'flex-end' }}
        />
      )}
    </Box>
  )
}
