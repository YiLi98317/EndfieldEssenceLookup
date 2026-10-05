import { useState } from 'react'
import { Box } from '@mui/material'
import { weapons, pools } from '../data'
import Layout from '../components/Layout'
import WeaponSelector from '../components/WeaponSelector'
import FarmPlaceResults from '../components/FarmPlaceResults'

export default function EssenceLookupPage() {
  const [selectedWeapon, setSelectedWeapon] = useState(null)

  return (
    <Layout maxWidth="xl">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'minmax(0, 1fr) minmax(0, 1fr)',
          },
          gap: { xs: 3, md: 4 },
          alignItems: 'start',
        }}
      >
        <WeaponSelector
          weapons={weapons}
          selectedWeapon={selectedWeapon}
          onSelect={setSelectedWeapon}
        />
        <Box
          component="section"
          aria-labelledby="farm-locations-title"
          sx={{
            minWidth: 0,
            position: { md: 'sticky' },
            top: { md: 24 },
          }}
        >
          <FarmPlaceResults weapon={selectedWeapon} pools={pools} weapons={weapons} />
        </Box>
      </Box>
    </Layout>
  )
}
