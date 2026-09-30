import { useState } from 'react'
import api from '../services/api'
import './Dashboard.css'

const EMPTY = { name: '', description: '', date: '', startTime: '', endTime: '', registrationFee: '', teamSize: '1', prizePool: '0', posterUrl: '' }

export default function OrganizerEventForm({ event, onClose, onSaved }) {
  const isEdit = !!event
  const [form, setForm] = useState(event ? {
    name: event.name,
    description: event.description,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    registrationFee: String(event.registrationFee),
    teamSize: String(event.teamSize),
    prizePool: String(event.prizePool),
    posterUrl: event.posterUrl || '',
  } : EMPTY)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.description.trim()) errs.description = 'Required'
    if (!form.date) errs.date = 'Required'
    if (!form.startTime) errs.startTime = 'Required'
    if (!form.endTime) errs.endTime = 'Required'
    if (form.endTime && form.startTime && form.endTime <= form.startTime) errs.endTime = 'End time must be after start time'
    if (form.registrationFee === '' || Number(form.registrationFee) < 0) errs.registrationFee = 'Must be ≥ 0'
    if (!form.teamSize || Number(form.teamSize) < 1) errs.teamSize = 'Must be ≥ 1'
    if (form.prizePool === '' || Number(form.prizePool) < 0) errs.prizePool = 'Must be ≥ 0'
    return errs
  }

  const handlePosterUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const data = new FormData()
    data.append('poster', file)
    setUploading(true)
    try {
      const res = await api.post('/uploads/poster', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(f => ({ ...f, posterUrl: res.data.posterUrl }))
    } catch (err) {
      setApiError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({}); setApiError('')
    setLoading(true)
    const payload = {
      name: form.name,
      description: form.description,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      registrationFee: Number(form.registrationFee),
      teamSize: Number(form.teamSize),
      prizePool: Number(form.prizePool),
      posterUrl: form.posterUrl || null,
    }
    try {
      if (isEdit) await api.put(`/events/${event.id}`, payload)
      else await api.post('/events', payload)
      onSaved()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save event'
      setApiError(msg)
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="container">
          <div className="dashboard__header-inner">
            <div>
              <button onClick={onClose} className="dashboard__back">← Back to Events</button>
              <h1 className="dashboard__name">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80, paddingTop: 40 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {apiError && <div className="alert alert-error" style={{ marginBottom: 20 }}>{apiError}</div>}
          <form onSubmit={handleSubmit} noValidate className="event-form">
            <div className="event-form__section">
              <h3 className="reg-form__section-title">Event Information</h3>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Event Name *</label>
                <input className="form-input" placeholder="e.g. Hackathon 2k26" value={form.name} onChange={set('name')} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={4} placeholder="Describe your event..." value={form.description} onChange={set('description')} style={{ resize: 'vertical' }} />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>
              <div className="reg-form__grid">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.date} onChange={set('date')} />
                  {errors.date && <span className="form-error">{errors.date}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input type="time" className="form-input" value={form.startTime} onChange={set('startTime')} />
                    {errors.startTime && <span className="form-error">{errors.startTime}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input type="time" className="form-input" value={form.endTime} onChange={set('endTime')} />
                    {errors.endTime && <span className="form-error">{errors.endTime}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="event-form__section">
              <h3 className="reg-form__section-title">Pricing & Teams</h3>
              <div className="reg-form__grid">
                <div className="form-group">
                  <label className="form-label">Registration Fee (₹) *</label>
                  <input type="number" min="0" className="form-input" placeholder="0 for free" value={form.registrationFee} onChange={set('registrationFee')} />
                  {errors.registrationFee && <span className="form-error">{errors.registrationFee}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Team Size *</label>
                  <input type="number" min="1" className="form-input" placeholder="1 for individual" value={form.teamSize} onChange={set('teamSize')} />
                  {errors.teamSize && <span className="form-error">{errors.teamSize}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Prize Pool (₹) *</label>
                  <input type="number" min="0" className="form-input" placeholder="e.g. 10000" value={form.prizePool} onChange={set('prizePool')} />
                  {errors.prizePool && <span className="form-error">{errors.prizePool}</span>}
                </div>
              </div>
            </div>

            <div className="event-form__section">
              <h3 className="reg-form__section-title">Event Poster</h3>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Paste Poster URL (optional)</label>
                <input className="form-input" placeholder="https://..." value={form.posterUrl} onChange={set('posterUrl')} />
              </div>
              <p style={{ textAlign: 'center', color: 'var(--white-40)', fontSize: 13, margin: '8px 0' }}>— or —</p>
              <div className="form-group">
                <label className="form-label">Upload Image (JPEG / PNG / WebP, max 2MB)</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePosterUpload} style={{ color: 'var(--white-60)', fontSize: 14 }} />
                {uploading && <p style={{ fontSize: 13, color: 'var(--orange)' }}>Uploading…</p>}
                {form.posterUrl && !uploading && <p style={{ fontSize: 13, color: '#4ade80' }}>✓ Poster set</p>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }} disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Update Event →' : 'Create Event →'}
              </button>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
