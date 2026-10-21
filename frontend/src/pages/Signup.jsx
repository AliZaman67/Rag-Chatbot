import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await signUp(email, password, fullName)
    setBusy(false)
    if (error) { setError(error.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand"><div className="orb small" /><h1>Nexus</h1></div>
          <h2>Check your inbox</h2>
          <p className="sub">We sent a confirmation link to {email}. Confirm it, then sign in.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Go to sign in</button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="orb small" />
          <h1>Nexus</h1>
        </div>
        <h2>Create your account</h2>
        <p className="sub">Start asking Nexus anything, grounded in your own docs.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={fullName}
              onChange={(e) => setFullName(e.target.value)} placeholder="Ada Lovelace" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login"><button type="button">Sign in</button></Link>
        </div>
      </div>
    </div>
  )
}
