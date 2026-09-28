import Layout from '../components/Layout'
import VersionCalendar from '../components/VersionCalendar'
import { currentVersionCalendar } from '../data/versionCalendar'

export default function VersionCalendarPage() {
  return (
    <Layout maxWidth="lg">
      <VersionCalendar {...currentVersionCalendar} />
    </Layout>
  )
}
