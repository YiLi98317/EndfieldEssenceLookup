import { useState } from 'react'
import { weapons, pools } from './data/dummyData'
import Layout from './components/Layout'
import WeaponSelector from './components/WeaponSelector'
import FarmPlaceResults from './components/FarmPlaceResults'

function App() {
  const [selectedWeapon, setSelectedWeapon] = useState(null)

  return (
    <Layout>
      <WeaponSelector
        weapons={weapons}
        selectedWeapon={selectedWeapon}
        onSelect={setSelectedWeapon}
      />
      <FarmPlaceResults weapon={selectedWeapon} pools={pools} />
    </Layout>
  )
}

export default App
