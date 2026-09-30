import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', rollNumber: '', year: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.rollNumber.trim()) errs.rollNumber = 'Roll number is required'
    if (!form.year || form.year < 1 || form.year > 4) errs.year = 'Year must be 1–4'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      await signup({ ...form, year: Number(form.year) })
      navigate('/signin', { state: { message: 'Account created! Please sign in.' } })
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.'
      setApiError(msg)
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="Bammaz2k26" style={{ height: 72, margin: '0 auto 16px', filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.4))' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)' }}>Create Account</h1>
          <p style={{ color: 'var(--white-60)', fontSize: 14, marginTop: 6 }}>Join Bammaz2k26 as a student</p>
        </div>

        {apiError && <div className="alert alert-error" style={{ marginBottom: 20 }}>{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="signup-name" className="form-input" placeholder="Manesh Katthi" value={form.name} onChange={set('name')} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input id="signup-roll" className="form-input" placeholder="23XX1A0501" value={form.rollNumber} onChange={set('rollNumber')} />
              {errors.rollNumber && <span className="form-error">{errors.rollNumber}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select id="signup-year" className="form-input" value={form.year} onChange={set('year')}>
                <option value="">Select</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.year && <span className="form-error">{errors.year}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="signup-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="signup-password" type="password" className="form-input" placeholder="Minimum 8 characters" value={form.password} onChange={set('password')} />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button id="signup-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--white-60)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: 'var(--orange)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
