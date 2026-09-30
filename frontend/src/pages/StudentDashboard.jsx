import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/registrations/mine')
      .then(r => setRegistrations(r.data.registrations || []))
      .catch(() => setError('Failed to load your registrations.'))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const formatTime = (ts) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div className="container">
          <div className="dashboard__header-inner">
            <div>
              <p className="dashboard__welcome">Welcome back,</p>
              <h1 className="dashboard__name">{user?.name} 👋</h1>
              <p className="dashboard__role">Student • {user?.rollNumber}</p>
            </div>
            <Link to="/events" className="btn btn-primary">Explore Events →</Link>
          </div>
        </div>
      </div>

      <div className="container section">
        <h2 className="dashboard__section-title">My Registrations</h2>

        {loading && <div className="loading-center"><div className="spinner" /></div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && registrations.length === 0 && (
          <div className="dashboard__empty">
            <span>📋</span>
            <p>You haven't registered for any events yet.</p>
            <Link to="/events" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Events</Link>
          </div>
        )}

        {!loading && registrations.length > 0 && (
          <div className="reg-list">
            {registrations.map(reg => (
              <div key={reg.id} className="reg-item card">
                <div className="reg-item__top">
                  <div>
                    <h3 className="reg-item__event">{reg.eventName}</h3>
                    <p className="reg-item__date">📅 {formatDate(reg.eventDate)}</p>
                  </div>
                  <div className="reg-item__id-wrap">
                    <div className="reg-item__id-label">Registration ID</div>
                    <div className="reg-item__id">{reg.id}</div>
                  </div>
                </div>
                <div className="reg-item__meta">
                  <span>👤 {reg.name}</span>
                  <span>🏛️ {reg.branch} – Yr {reg.year} – Sec {reg.section}</span>
                  {reg.teamName && <span>👥 Team: {reg.teamName}</span>}
                  <span>🕐 Registered {formatTime(reg.registeredAt)}</span>
                </div>
                <div className="reg-item__status">
                  <span className={`badge ${reg.status === 'registered' ? 'badge-orange' : ''}`}>
                    {reg.status}
                  </span>
                  <Link to={`/events/${reg.eventId}`} className="reg-item__link">View Event →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
