import { Navigate, Route, Routes } from 'react-router'
import EssenceLookupPage from './pages/EssenceLookup'
import VersionCalendarPage from './pages/VersionCalendar'
import FactorySimulatorPage from './pages/FactorySimulator'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<EssenceLookupPage />} />
      <Route path="/version-calendar" element={<VersionCalendarPage />} />
      <Route path="/factory-simulator" element={<FactorySimulatorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
