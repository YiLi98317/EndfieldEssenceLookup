import { Box } from '@mui/material'
import { useLanguage } from '../../../i18n/LanguageContext'
import styles from './styles'

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
    <Box sx={styles.calendar}>
      <Box
        sx={styles.stickyHeader}
      >
        {titleImage && (
          <Box
            component="img"
            src={titleImage}
            alt={titleAlt ?? t('versionCalendarTitleAlt')}
            sx={styles.image}
          />
        )}
        {timelineImage && (
          <Box sx={styles.timelineContainer}>
            <Box
              component="img"
              src={timelineImage}
              alt={timelineAlt ?? t('versionCalendarTimelineAlt')}
              sx={styles.timelineImage(timelineScale)}
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
          sx={styles.image}
        />
      )}
    </Box>
  )
}
