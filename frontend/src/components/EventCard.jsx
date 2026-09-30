import { Link } from 'react-router-dom'
import './EventCard.css'

export default function EventCard({ event }) {
  const {
    id, name, description, date, startTime, endTime,
    registrationFee, teamSize, prizePool, posterUrl,
  } = event

  const formatDate = (d) => {
    const dt = new Date(d)
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isPast = new Date(date) < new Date()

  return (
    <div className="event-card">
      {/* Poster */}
      <div className="event-card__poster">
        {posterUrl ? (
          <img src={posterUrl} alt={name} />
        ) : (
          <div className="event-card__poster-placeholder">
            <span>🎪</span>
          </div>
        )}
        {isPast && <div className="event-card__past-badge">Concluded</div>}
        {!isPast && registrationFee === 0 && (
          <div className="event-card__free-badge">FREE</div>
        )}
      </div>

      {/* Content */}
      <div className="event-card__content">
        <h3 className="event-card__title">{name}</h3>
        <p className="event-card__desc">{description}</p>

        <div className="event-card__meta">
          <div className="event-card__meta-item">
            <span className="event-card__meta-icon">📅</span>
            <span>{formatDate(date)}</span>
          </div>
          <div className="event-card__meta-item">
            <span className="event-card__meta-icon">⏰</span>
            <span>{startTime} – {endTime}</span>
          </div>
          <div className="event-card__meta-item">
            <span className="event-card__meta-icon">👥</span>
            <span>{teamSize === 1 ? 'Individual' : `Team of ${teamSize}`}</span>
          </div>
          <div className="event-card__meta-item">
            <span className="event-card__meta-icon">🏆</span>
            <span>₹{prizePool.toLocaleString()}</span>
          </div>
        </div>

        <div className="event-card__footer">
          <div className="event-card__fee">
            {registrationFee === 0 ? (
              <span className="event-card__fee-free">Free Entry</span>
            ) : (
              <span className="event-card__fee-amount">₹{registrationFee}</span>
            )}
          </div>
          <Link to={`/events/${id}`} className="btn btn-primary event-card__btn">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}
