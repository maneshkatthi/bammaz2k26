import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import OrganizerEventForm from './OrganizerEventForm'
import './Dashboard.css'

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [viewRegsId, setViewRegsId] = useState(null)
  const [regs, setRegs] = useState([])
  const [regsLoading, setRegsLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchEvents = () => {
    setLoading(true)
    api.get('/events/mine')
      .then(r => setEvents(r.data.events || []))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvents() }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`)
      setDeleteConfirm(null)
      fetchEvents()
    } catch { setError('Failed to delete event.') }
  }

  const viewRegistrations = (id) => {
    setViewRegsId(id)
    setRegsLoading(true)
    api.get(`/events/${id}/registrations`)
      .then(r => setRegs(r.data.registrations || []))
      .catch(() => setRegs([]))
      .finally(() => setRegsLoading(false))
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (showForm || editEvent) return (
    <OrganizerEventForm
      event={editEvent}
      onClose={() => { setShowForm(false); setEditEvent(null) }}
      onSaved={() => { setShowForm(false); setEditEvent(null); fetchEvents() }}
    />
  )

  if (viewRegsId) {
    const ev = events.find(e => e.id === viewRegsId)
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <div className="container">
            <div className="dashboard__header-inner">
              <div>
                <button onClick={() => setViewRegsId(null)} className="dashboard__back">← Back</button>
                <h1 className="dashboard__name">{ev?.name} — Registrations</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="container section">
          {regsLoading && <div className="loading-center"><div className="spinner" /></div>}
          {!regsLoading && regs.length === 0 && (
            <div className="dashboard__empty"><span>📋</span><p>No registrations yet.</p></div>
          )}
          {!regsLoading && regs.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <p style={{ marginBottom: 16, color: 'var(--white-60)' }}>{regs.length} registration{regs.length !== 1 ? 's' : ''}</p>
              <table className="regs-table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Roll No.</th><th>Branch</th><th>Yr</th><th>Sec</th><th>Phone</th><th>Team</th><th>Registered</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {regs.map(r => (
                    <tr key={r.id}>
                      <td className="text-orange">{r.id}</td>
                      <td>{r.name}</td>
                      <td>{r.rollNumber}</td>
                      <td>{r.branch}</td>
                      <td>{r.year}</td>
                      <td>{r.section}</td>
                      <td>{r.phoneNumber}</td>
                      <td>{r.teamName || '—'}</td>
                      <td>{new Date(r.registeredAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className="badge badge-orange">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete Event?</h3>
            <p>This will permanently delete the event and <strong>all its registrations</strong>. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-primary" style={{ background: '#dc2626' }} onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard__header">
        <div className="container">
          <div className="dashboard__header-inner">
            <div>
              <p className="dashboard__welcome">Organizer Dashboard</p>
              <h1 className="dashboard__name">{user?.name} 🎯</h1>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Event</button>
          </div>
        </div>
      </div>

      <div className="container section">
        <h2 className="dashboard__section-title">My Events</h2>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {loading && <div className="loading-center"><div className="spinner" /></div>}
        {!loading && events.length === 0 && (
          <div className="dashboard__empty">
            <span>🎪</span>
            <p>No events yet. Create your first event!</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>Create Event</button>
          </div>
        )}
        {!loading && events.length > 0 && (
          <div className="org-events">
            {events.map(ev => (
              <div key={ev.id} className="org-event card">
                <div className="org-event__poster">
                  {ev.posterUrl ? <img src={ev.posterUrl} alt={ev.name} /> : <span>🎪</span>}
                </div>
                <div className="org-event__info">
                  <h3 className="org-event__name">{ev.name}</h3>
                  <div className="org-event__meta">
                    <span>📅 {formatDate(ev.date)}</span>
                    <span>⏰ {ev.startTime} – {ev.endTime}</span>
                    <span>💰 ₹{ev.registrationFee}</span>
                    <span>👥 Team of {ev.teamSize}</span>
                    <span>🏆 ₹{ev.prizePool.toLocaleString()}</span>
                  </div>
                </div>
                <div className="org-event__actions">
                  <button className="btn btn-outline org-event__btn" onClick={() => viewRegistrations(ev.id)}>👁 Registrations</button>
                  <button className="btn btn-outline org-event__btn" onClick={() => setEditEvent(ev)}>✏️ Edit</button>
                  <button className="btn org-event__btn org-event__delete" onClick={() => setDeleteConfirm(ev.id)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
