import { Routes, Route, Navigate } from 'react-router'
import EssenceLookupPage from './pages/EssenceLookupPage'
import VersionCalendarPage from './pages/VersionCalendarPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EssenceLookupPage />} />
      <Route path="/version-calendar" element={<VersionCalendarPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
