import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './LoginScreen.css'

const DEMO_EMAIL = 'demo@driftcheck.app'
const DEMO_PASSWORD = 'driftcheck123'

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' or 'signup'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const accountEmail = email.trim().toLowerCase()
    if (!accountEmail || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    setLoading(true)

    if (mode === 'login') {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: accountEmail,
        password,
      })
      setLoading(false)
      if (signInError) {
        setError(signInError.message)
        return
      }
      onLogin(data.user.email, false)
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: accountEmail,
        password,
      })
      setLoading(false)
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      onLogin(data.user.email, true)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <p className="login-wordmark">DriftCheck</p>

        <h1 className="login-title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Sign in to view your health baseline.'
            : 'Sign up to start tracking your baseline.'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder={DEMO_EMAIL}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={DEMO_PASSWORD}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-accent btn-block login-submit"
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <button
          type="button"
          className="login-forgot"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Log in'}
        </button>

        <div className="demo-box">
          <strong>Demo credentials</strong>
          <p>
            Email: {DEMO_EMAIL}
            <br />
            Password: {DEMO_PASSWORD}
          </p>
        </div>
      </section>
    </main>
  )
}

export default LoginScreen