import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      console.error('Supabase OTP sign-in failed:', error)
      setError('We could not complete that request. Please try again.')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return <p>Check your email for the login link.</p>
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Sign in to DriftCheck</h2>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send magic link</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}