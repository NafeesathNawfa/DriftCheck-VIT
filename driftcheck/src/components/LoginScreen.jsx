import { useEffect, useState } from 'react'
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureDemoAccount,
  getAccount,
  hashPassword,
  registerAccount,
} from '../lib/storage'
import './LoginScreen.css'

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ensureDemoAccount()
  }, [])

  function handleSubmit(event) {
    event.preventDefault()

    const accountEmail = email.trim().toLowerCase()
    if (!accountEmail || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    const account = getAccount(accountEmail)
    if (account && account.passwordHash !== hashPassword(password)) {
      setError('Incorrect password for this account.')
      return
    }

    const isNew = registerAccount(accountEmail, hashPassword(password))
    setError('')
    onLogin(accountEmail, isNew)
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <p className="login-wordmark">DriftCheck</p>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to view your health baseline.</p>

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
              autoComplete="current-password"
              required
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
          >
            Log in
          </button>
        </form>

        <button
          type="button"
          className="login-forgot"
          onClick={() =>
            alert('Password recovery is not available in this demo.')
          }
        >
          Forgot password?
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