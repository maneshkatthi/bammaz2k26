import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import EventCard from '../components/EventCard'
import './Events.css'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/events')
      .then(r => setEvents(r.data.events || []))
      .catch(() => setError('Failed to load events. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="events-page">
      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <div className="badge badge-orange" style={{ justifyContent: 'center', marginBottom: 16 }}>All Events</div>
          <h1 className="events-page__title">
            Discover <span className="text-orange">Amazing</span> Events
          </h1>
          <p className="events-page__sub">
            50+ events across technical, cultural, gaming and more categories
          </p>
          <div className="events-page__search">
            <span className="events-page__search-icon">🔍</span>
            <input
              type="text"
              className="form-input events-page__search-input"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container section">
        {loading && (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>
        )}

        {!loading && !error && (
          <>
            <p className="events-page__count">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            </p>
            {filtered.length === 0 ? (
              <div className="events-page__empty">
                <span>🎪</span>
                <p>No events found{search ? ` for "${search}"` : ''}.</p>
              </div>
            ) : (
              <div className="events-grid">
                {filtered.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
