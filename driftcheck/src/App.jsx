import { useState } from 'react'
import BottomTabBar from './components/BottomTabBar'
import InputForm from './components/InputForm'
import OverviewScreen from './components/OverviewScreen'
import WelcomeScreen from './components/WelcomeScreen'
import { hasAnyReadings } from './lib/storage'

function App() {
  const [route, setRoute] = useState(() =>
    hasAnyReadings() ? { name: 'overview' } : { name: 'welcome' },
  )

  const goWelcome = () => setRoute({ name: 'welcome' })
  const goLog = (biomarkerId = null) =>
    setRoute({ name: 'log', biomarkerId })
  const goOverview = () => setRoute({ name: 'overview' })

  const handleTab = (id) => {
    if (id === 'log') goLog()
  }

  let screen
  if (route.name === 'log') {
    screen = (
      <InputForm
        biomarkerId={route.biomarkerId}
        onBack={goWelcome}
        onDone={goOverview}
      />
    )
  } else if (route.name === 'overview') {
    screen = <OverviewScreen userName="friend" />
  } else {
    screen = (
      <WelcomeScreen
        userName="friend"
        onManualEntry={() => goLog()}
        onSelectBiomarker={(biomarker) => goLog(biomarker.id)}
      />
    )
  }

  return (
    <>
      {screen}
      <BottomTabBar active={route.name === 'log' ? 'log' : ''} onSelect={handleTab} />
    </>
  )
}

export default App