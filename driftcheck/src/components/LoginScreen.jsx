import { useState } from 'react'
import PrivacyNoticeModal from './PrivacyNoticeModal'
import './LoginScreen.css'

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()

    const demoEmail = 'demo@driftcheck.app'
    const demoPassword = 'driftcheck123'

    if (
      email.trim().toLowerCase() === demoEmail &&
      password === demoPassword
    ) {
      setError('')
      onLogin()
    } else {
      setError('Incorrect login details. Use the demo credentials below.')
    }
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
            placeholder="demo@driftcheck.app"
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
              placeholder="driftcheck123"
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
            Email: demo@driftcheck.app
            <br />
            Password: driftcheck123
          </p>
        </div>

        <div className="login-privacy-footer">
          <button
            type="button"
            className="privacy-badge-btn"
            onClick={() => setShowPrivacy(true)}
          >
            <span>🛡️</span>
            <span>Privacy Protected · Defense-in-Depth</span>
          </button>
          <p className="prototype-disclaimer">
            Hackathon prototype. Not a certified clinical production system.
          </p>
        </div>
      </section>

      <PrivacyNoticeModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </main>
  )
}

export default LoginScreen