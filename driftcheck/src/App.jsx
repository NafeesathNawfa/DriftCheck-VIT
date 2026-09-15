import { useEffect, useState } from 'react'
import AddBaseline from './components/AddBaseline'
import BottomTabBar from './components/BottomTabBar'
import LoginScreen from './components/LoginScreen'
import OverviewScreen from './components/OverviewScreen'
import WelcomeScreen from './components/WelcomeScreen'
import { hasAnyReadings, setCurrentAccount } from './lib/storage'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [route, setRoute] = useState({ name: 'welcome' })
  const [profilePing, setProfilePing] = useState(0)
  const [pendingDetailId, setPendingDetailId] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCheckingSession(false)
      return undefined
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setCheckingSession(false)
      if (session) {
        setCurrentAccount(session.user.email)
        setRoute(hasAnyReadings() ? { name: 'overview' } : { name: 'welcome' })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const goBaseline = (biomarkerId = null) =>
    setRoute({ name: 'baseline', biomarkerId })
  const goOverview = () => setRoute({ name: 'overview' })
  const goBackFromBaseline = () =>
    setRoute(hasAnyReadings() ? { name: 'overview' } : { name: 'welcome' })

  const handleTab = (id) => {
    if (id === 'home') goOverview()
    if (id === 'add') goBaseline()
    if (id === 'profile') {
      goOverview()
      setProfilePing((n) => n + 1)
    }
  }

  const handleLogin = (email) => {
    setCurrentAccount(email)
    setRoute(hasAnyReadings() ? { name: 'overview' } : { name: 'welcome' })
  }

  if (checkingSession) {
    return null // or a loading spinner
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />
  }

  let screen
  if (route.name === 'baseline') {
    screen = (
      <AddBaseline
        biomarkerId={route.biomarkerId}
        onBack={goBackFromBaseline}
        onDone={(savedBiomarkerId) => {
          setPendingDetailId(savedBiomarkerId ?? route.biomarkerId ?? null)
          goOverview()
        }}
      />
    )
  } else if (route.name === 'overview') {
    screen = (
      <OverviewScreen
        session={session}
        userName="friend"
        userEmail={session.user.email}
        onAddResult={(biomarkerId) => goBaseline(biomarkerId)}
        openProfile={profilePing}
        jumpToDetailId={pendingDetailId}
        onDetailShown={() => setPendingDetailId(null)}
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
      <BottomTabBar
        active={route.name === 'baseline' ? 'add' : 'home'}
        onSelect={handleTab}
      />
    </>
  )
}

export default App