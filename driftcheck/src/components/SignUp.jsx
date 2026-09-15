// src/components/SignUp.jsx
import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Sends the user back to your root page upon confirmation
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      console.error('Supabase sign-up failed:', error)
      setMessage('We could not complete that request. Please try again.')
    } else {
      setMessage('Check your email for the confirmation link!')
    }
  }

  return (
    <form onSubmit={handleSignUp}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Sign Up</button>
      {message && <p>{message}</p>}
    </form>
  )
}