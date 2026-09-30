import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signin() {
  const { signin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const successMsg = location.state?.message

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Email and password are required'); return }
    setError('')
    setLoading(true)
    try {
      const user = await signin(form.email, form.password)
      if (user.role === 'organizer') navigate('/dashboard/organizer')
      else navigate('/dashboard/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="Bammaz2k26" style={{ height: 72, margin: '0 auto 16px', filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.4))' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--white-60)', fontSize: 14, marginTop: 6 }}>Sign in to your Bammaz2k26 account</p>
        </div>

        {successMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{successMsg}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="signin-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="signin-password" type="password" className="form-input" placeholder="Your password" value={form.password} onChange={set('password')} />
          </div>
          <button id="signin-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--white-60)', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--orange)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
