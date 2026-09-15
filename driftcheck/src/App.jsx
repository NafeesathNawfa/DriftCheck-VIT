import { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Please enter your email address and password.");
      return;
    }

    setMessage(`Login submitted for ${email}`);
  }

  function handleBiometricLogin() {
    setMessage("Biometric sign-in will be connected here.");
  }

  function handleAppleLogin() {
    setMessage("Apple sign-in will be connected here.");
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="brand-panel">
          <p className="brand-wordmark">DriftCheck</p>

          <div className="brand-copy">
            <h1>Your health baseline at a glance.</h1>
            <p>
              Compare new lab results against your personal history and stay one
              step ahead of your health.
            </p>
          </div>

          <ul className="brand-points">
            <li>
              <span className="point-dot" aria-hidden="true" />
              Track lab results over time
            </li>
            <li>
              <span className="point-dot" aria-hidden="true" />
              256-bit encrypted health data
            </li>
            <li>
              <span className="point-dot" aria-hidden="true" />
              HIPAA compliant &amp; private
            </li>
          </ul>
        </div>

        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="e.g. sarah@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field-group">
              <div className="password-heading">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}

            <button type="submit" className="sign-in-button">
              Sign In <span aria-hidden="true">→</span>
            </button>
          </form>

          <button
            type="button"
            className="biometric-button"
            onClick={handleBiometricLogin}
          >
            <span className="fingerprint-icon" aria-hidden="true">
              ◎
            </span>
            Sign in with Face ID or Touch ID
          </button>

          <div className="divider" aria-hidden="true">
            <span />
            <p>or</p>
            <span />
          </div>

          <button
            type="button"
            className="apple-button"
            onClick={handleAppleLogin}
          >
            <span className="apple-icon" aria-hidden="true">
              ●
            </span>
            Continue with Apple
          </button>

          <p className="signup-line">
            Don&apos;t have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </section>

      <div className="security-badge">
        <span aria-hidden="true">✓</span>
        256-bit encrypted health data • HIPAA Compliant
      </div>
    </main>
  );
}

export default App;