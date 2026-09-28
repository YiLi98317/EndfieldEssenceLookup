import { Typography } from '@mui/material'
import Layout from '../components/Layout'
import VersionCalendar from '../components/VersionCalendar'
import { currentVersionCalendar } from '../data/versionCalendar'
import { useLanguage } from '../i18n/LanguageContext'

export default function VersionCalendarPage() {
  const { t } = useLanguage()

  return (
    <Layout maxWidth="lg">
      <Typography variant="h5" component="h2" gutterBottom>
        {t('versionCalendarTitle')}
      </Typography>
      <VersionCalendar {...currentVersionCalendar} />
    </Layout>
  )
}
