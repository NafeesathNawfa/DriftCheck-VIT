import { useState } from 'react'
import AddBaseline from './components/AddBaseline'
import BottomTabBar from './components/BottomTabBar'
import LoginScreen from './components/LoginScreen'
import OverviewScreen from './components/OverviewScreen'
import WelcomeScreen from './components/WelcomeScreen'
import { hasAnyReadings, setCurrentAccount } from './lib/storage'

const AUTH_KEY = 'driftcheck-authenticated'

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) === '1',
  )
  const [route, setRoute] = useState(() =>
    hasAnyReadings() ? { name: 'overview' } : { name: 'welcome' },
  )

  const goBaseline = (biomarkerId = null) =>
    setRoute({ name: 'baseline', biomarkerId })
  const goOverview = () => setRoute({ name: 'overview' })
  const goBackFromBaseline = () =>
    setRoute(hasAnyReadings() ? { name: 'overview' } : { name: 'welcome' })

  const handleTab = (id) => {
    if (id === 'log') goBaseline()
  }

  const handleLogin = (email) => {
    setCurrentAccount(email)
    localStorage.setItem(AUTH_KEY, '1')
    setAuthenticated(true)
    setRoute(
      hasAnyReadings() ? { name: 'overview' } : { name: 'welcome' },
    )
  }

  if (!authenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  let screen
  if (route.name === 'baseline') {
    screen = (
      <AddBaseline
        biomarkerId={route.biomarkerId}
        onBack={goBackFromBaseline}
        onDone={goOverview}
      />
    )
  } else if (route.name === 'overview') {
    screen = (
      <OverviewScreen
        userName="friend"
        onAddResult={(biomarkerId) => goBaseline(biomarkerId)}
      />
    )
  } else {
    screen = (
      <WelcomeScreen
        userName="friend"
        onManualEntry={() => goBaseline()}
        onSelectBiomarker={(biomarker) => goBaseline(biomarker.id)}
      />
    )
  }

  return (
    <>
      {screen}
      <BottomTabBar active={route.name === 'baseline' ? 'log' : ''} onSelect={handleTab} />
    </>
  )
}

export default App