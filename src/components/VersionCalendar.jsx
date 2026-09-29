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
  const timelineScale = 1 / contentWidthRatio

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'background.default',
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
          <Box sx={{ overflow: 'hidden' }}>
            <Box
              component="img"
              src={timelineImage}
              alt={timelineAlt ?? t('versionCalendarTimelineAlt')}
              sx={{
                ...imageSx,
                width: `${timelineScale * 100}%`,
                ml: `${(1 - timelineScale) * 100}%`,
              }}
            />
          </Box>
        )}
      </Box>
      {contentImage && (
        <Box
          component="img"
          src={contentImage}
          alt={contentAlt ?? t('versionCalendarContentAlt')}
          loading="lazy"
          sx={imageSx}
        />
      )}
    </Box>
  )
}
