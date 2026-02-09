import { useState } from 'react'
import { Box } from '@mui/material'
import { weapons, pools } from './data'
import Layout from './components/Layout'
import WeaponSelector from './components/WeaponSelector'
import FarmPlaceResults from './components/FarmPlaceResults'

function App() {
  const [selectedWeapon, setSelectedWeapon] = useState(null)

  return (
    <Layout>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'background.default',
          pb: 2,
        }}
      >
        <WeaponSelector
          weapons={weapons}
          selectedWeapon={selectedWeapon}
          onSelect={setSelectedWeapon}
        />
      </Box>
      <FarmPlaceResults weapon={selectedWeapon} pools={pools} weapons={weapons} />
    </Layout>
  )
}

export default App
