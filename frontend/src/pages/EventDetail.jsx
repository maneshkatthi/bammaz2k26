import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import './EventDetail.css'

export default function EventDetail() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/events/${eventId}`)
      .then(r => setEvent(r.data.event))
      .catch(e => setError(e.response?.data?.message || 'Event not found'))
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>

  if (error) return (
    <div className="page-hero">
      <div className="container">
        <div className="alert alert-error" style={{ maxWidth: 400, margin: '0 auto' }}>{error}</div>
        <Link to="/events" className="btn btn-outline" style={{ marginTop: 20 }}>← Back to Events</Link>
      </div>
    </div>
  )

  if (!event) return null

  const isPast = new Date(event.date) < new Date()
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="event-detail">
      {/* Hero */}
      <div className="event-detail__hero">
        {event.posterUrl ? (
          <img src={event.posterUrl} alt={event.name} className="event-detail__poster" />
        ) : (
          <div className="event-detail__poster-placeholder">🎪</div>
        )}
        <div className="event-detail__hero-overlay" />
        <div className="event-detail__hero-content container">
          <Link to="/events" className="event-detail__back">← Back to Events</Link>
          <h1 className="event-detail__name">{event.name}</h1>
          {isPast && <span className="badge badge-orange">Concluded</span>}
        </div>
      </div>

      <div className="container">
        <div className="event-detail__grid">
          {/* Main Info */}
          <div className="event-detail__main">
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: 16, fontSize: 22, fontFamily: 'var(--font-display)' }}>About this Event</h2>
              <p style={{ color: 'var(--white-80)', lineHeight: 1.8 }}>{event.description}</p>
            </div>
          </div>

          {/* Side Info */}
          <div className="event-detail__side">
            <div className="card event-detail__info-card">
              <h3 className="event-detail__info-title">Event Details</h3>

              <div className="event-detail__info-list">
                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">📅</span>
                  <div>
                    <div className="event-detail__info-label">Date</div>
                    <div className="event-detail__info-val">{formatDate(event.date)}</div>
                  </div>
                </div>
                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">⏰</span>
                  <div>
                    <div className="event-detail__info-label">Time</div>
                    <div className="event-detail__info-val">{event.startTime} – {event.endTime}</div>
                  </div>
                </div>
                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">👥</span>
                  <div>
                    <div className="event-detail__info-label">Team Size</div>
                    <div className="event-detail__info-val">
                      {event.teamSize === 1 ? 'Individual Event' : `Team of up to ${event.teamSize}`}
                    </div>
                  </div>
                </div>
                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">🏆</span>
                  <div>
                    <div className="event-detail__info-label">Prize Pool</div>
                    <div className="event-detail__info-val event-detail__prize">
                      ₹{event.prizePool.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="event-detail__info-item">
                  <span className="event-detail__info-icon">💰</span>
                  <div>
                    <div className="event-detail__info-label">Registration Fee</div>
                    <div className="event-detail__info-val">
                      {event.registrationFee === 0 ? (
                        <span style={{ color: '#4ade80' }}>Free</span>
                      ) : (
                        <span className="text-orange">₹{event.registrationFee}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="event-detail__cta">
                {isPast ? (
                  <div className="alert alert-error">Registration closed — event has ended.</div>
                ) : !user ? (
                  <>
                    <Link to="/signin" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Sign in to Register
                    </Link>
                    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--white-60)', marginTop: 8 }}>
                      New here? <Link to="/signup" style={{ color: 'var(--orange)' }}>Create an account</Link>
                    </p>
                  </>
                ) : user.role === 'organizer' ? (
                  <div className="alert alert-error">Organizers cannot register for events.</div>
                ) : (
                  <Link
                    to={`/events/${event.id}/register`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Register Now →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
