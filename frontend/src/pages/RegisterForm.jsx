import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import './RegisterForm.css'

export default function RegisterForm() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null) // registration object

  const [form, setForm] = useState({
    name: user?.name || '',
    branch: '',
    year: user?.year || '',
    phoneNumber: '',
    rollNumber: user?.rollNumber || '',
    section: '',
    teamName: '',
    teamMembers: [],
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    api.get(`/events/${eventId}`)
      .then(r => setEvent(r.data.event))
      .catch(() => setError('Event not found'))
      .finally(() => setLoading(false))
  }, [eventId])

  const isTeam = event && event.teamSize > 1

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const setMember = (idx, field) => (e) => {
    setForm(f => {
      const members = [...f.teamMembers]
      members[idx] = { ...members[idx], [field]: e.target.value }
      return { ...f, teamMembers: members }
    })
  }

  const addMember = () => {
    if (form.teamMembers.length < event.teamSize - 1) {
      setForm(f => ({ ...f, teamMembers: [...f.teamMembers, { name: '', rollNumber: '' }] }))
    }
  }

  const removeMember = (idx) => {
    setForm(f => ({ ...f, teamMembers: f.teamMembers.filter((_, i) => i !== idx) }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.branch.trim()) errs.branch = 'Branch is required'
    if (!form.year || form.year < 1 || form.year > 4) errs.year = 'Year must be 1–4'
    if (!/^\d{10}$/.test(form.phoneNumber)) errs.phoneNumber = '10-digit phone number required'
    if (!form.rollNumber.trim()) errs.rollNumber = 'Roll number is required'
    if (!form.section.trim()) errs.section = 'Section is required'
    if (isTeam && !form.teamName.trim()) errs.teamName = 'Team name is required for team events'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        name: form.name,
        branch: form.branch,
        year: Number(form.year),
        phoneNumber: form.phoneNumber,
        rollNumber: form.rollNumber,
        section: form.section,
        ...(isTeam && { teamName: form.teamName, teamMembers: form.teamMembers }),
      }
      const res = await api.post(`/events/${eventId}/register`, payload)
      setSuccess(res.data.registration)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  if (error && !event) return (
    <div className="page-hero"><div className="container">
      <div className="alert alert-error">{error}</div>
      <Link to="/events" className="btn btn-outline" style={{ marginTop: 16 }}>← Back to Events</Link>
    </div></div>
  )

  if (success) return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up" style={{ maxWidth: 540 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#4ade80', marginBottom: 8 }}>Registered!</h2>
          <p style={{ color: 'var(--white-60)', marginBottom: 24 }}>You have successfully registered for <strong>{event.name}</strong></p>
          <div className="reg-success__id">
            <div style={{ fontSize: 12, color: 'var(--white-60)', marginBottom: 4 }}>YOUR REGISTRATION ID</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--orange)', fontFamily: 'var(--font-display)', letterSpacing: 2 }}>{success.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Link to="/dashboard/student" className="btn btn-primary">My Registrations</Link>
            <Link to="/events" className="btn btn-outline">Explore More Events</Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="reg-page">
      <div className="page-hero" style={{ paddingBottom: 40 }}>
        <div className="container">
          <Link to={`/events/${eventId}`} className="event-detail__back">← Back to Event</Link>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginTop: 8 }}>Register for <span className="text-orange">{event?.name}</span></h1>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="reg-form-wrap">
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate className="reg-form">
            <div className="reg-form__section">
              <h3 className="reg-form__section-title">Personal Information</h3>
              <div className="reg-form__grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input id="reg-name" className="form-input" placeholder="Your full name" value={form.name} onChange={set('name')} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <input id="reg-branch" className="form-input" placeholder="e.g. CSE, ECE, MECH" value={form.branch} onChange={set('branch')} />
                  {errors.branch && <span className="form-error">{errors.branch}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <select id="reg-year" className="form-input" value={form.year} onChange={set('year')}>
                    <option value="">Select Year</option>
                    {[1,2,3,4].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.year && <span className="form-error">{errors.year}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input id="reg-phone" className="form-input" placeholder="10-digit number" value={form.phoneNumber} onChange={set('phoneNumber')} maxLength={10} />
                  {errors.phoneNumber && <span className="form-error">{errors.phoneNumber}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input id="reg-roll" className="form-input" placeholder="e.g. 23XX1A0501" value={form.rollNumber} onChange={set('rollNumber')} />
                  {errors.rollNumber && <span className="form-error">{errors.rollNumber}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Section *</label>
                  <input id="reg-section" className="form-input" placeholder="e.g. A, B, C" value={form.section} onChange={set('section')} />
                  {errors.section && <span className="form-error">{errors.section}</span>}
                </div>
              </div>
            </div>

            {isTeam && (
              <div className="reg-form__section">
                <h3 className="reg-form__section-title">Team Information <span style={{ fontSize: 14, color: 'var(--white-60)', fontWeight: 400 }}>(Team of {event.teamSize})</span></h3>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Team Name *</label>
                  <input id="reg-teamname" className="form-input" placeholder="Your team name" value={form.teamName} onChange={set('teamName')} />
                  {errors.teamName && <span className="form-error">{errors.teamName}</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--white-60)', marginBottom: 12 }}>
                  You are the team lead. Add up to {event.teamSize - 1} team member{event.teamSize - 1 > 1 ? 's' : ''} below:
                </p>
                {form.teamMembers.map((m, i) => (
                  <div key={i} className="reg-form__member">
                    <div className="reg-form__grid" style={{ flex: 1 }}>
                      <div className="form-group">
                        <label className="form-label">Member {i + 1} Name</label>
                        <input className="form-input" placeholder="Full name" value={m.name} onChange={setMember(i, 'name')} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Roll Number</label>
                        <input className="form-input" placeholder="Roll number" value={m.rollNumber} onChange={setMember(i, 'rollNumber')} />
                      </div>
                    </div>
                    <button type="button" className="reg-form__remove" onClick={() => removeMember(i)}>✕</button>
                  </div>
                ))}
                {form.teamMembers.length < event.teamSize - 1 && (
                  <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={addMember}>
                    + Add Team Member
                  </button>
                )}
              </div>
            )}

            <button id="reg-submit" type="submit" className="btn btn-primary reg-form__submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Registration →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
