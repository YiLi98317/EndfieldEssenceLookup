import { useState } from 'react'
import { FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material'
import Layout from '../components/Layout'
import VersionCalendar from '../components/VersionCalendar'
import { latestVersionCalendar, versionCalendars } from '../data/versionCalendar'
import { useLanguage } from '../i18n/LanguageContext'

function formatReleaseDate(releaseDate, language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(releaseDate))
}

export default function VersionCalendarPage() {
  const { language, t } = useLanguage()
  const [selectedVersion, setSelectedVersion] = useState(latestVersionCalendar.version)
  const calendar = versionCalendars.find((entry) => entry.version === selectedVersion)

  const versionLabel = (entry) =>
    `${entry.version} — ${language === 'zh' ? entry.titleZh : entry.title}`

  const versionDetails = (entry) =>
    [
      t('versionCalendarReleased', { date: formatReleaseDate(entry.releaseDate, language) }),
      entry.version === latestVersionCalendar.version && t('versionCalendarLatest'),
      !entry.hasCalendar && t('versionCalendarNotArchived'),
    ]
      .filter(Boolean)
      .join(' · ')

  return (
    <Layout maxWidth="lg">
      <FormControl size="small" sx={{ mb: 2, minWidth: 280, maxWidth: '100%' }}>
        <InputLabel id="version-calendar-select-label">{t('versionCalendarVersion')}</InputLabel>
        <Select
          labelId="version-calendar-select-label"
          label={t('versionCalendarVersion')}
          value={calendar.version}
          onChange={(event) => setSelectedVersion(event.target.value)}
          renderValue={() => versionLabel(calendar)}
        >
          {versionCalendars.map((entry) => (
            <MenuItem key={entry.version} value={entry.version} disabled={!entry.hasCalendar}>
              <ListItemText primary={versionLabel(entry)} secondary={versionDetails(entry)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <VersionCalendar
        key={calendar.version}
        titleImage={calendar.titleImage}
        timelineImage={calendar.timelineImage}
        contentImage={calendar.contentImage}
        contentWidthRatio={calendar.contentWidthRatio}
      />
    </Layout>
  )
}
