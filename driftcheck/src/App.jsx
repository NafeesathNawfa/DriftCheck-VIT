import { useState } from 'react'
import BottomTabBar from './components/BottomTabBar'
import InputForm from './components/InputForm'
import LoginScreen from './components/LoginScreen'
import OverviewScreen from './components/OverviewScreen'
import WelcomeScreen from './components/WelcomeScreen'
import { hasAnyReadings } from './lib/storage'

const AUTH_KEY = 'driftcheck-authenticated'

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) === '1',
  )
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

  if (!authenticated) {
    return (
      <LoginScreen
        onLogin={() => {
          localStorage.setItem(AUTH_KEY, '1')
          setAuthenticated(true)
        }}
      />
    )
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