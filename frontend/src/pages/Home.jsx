import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import './Home.css'

/* ── Countdown ──────────────────────────────────────────────── */
function Countdown({ targetDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <div className="countdown">
      {Object.entries(time).map(([label, val]) => (
        <div key={label} className="countdown__unit">
          <span className="countdown__val">{String(val).padStart(2, '0')}</span>
          <span className="countdown__label">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Stats ──────────────────────────────────────────────────── */
const STATS = [
  { icon: '🎓', value: '10K+', label: 'Students' },
  { icon: '🎪', value: '50+', label: 'Events' },
  { icon: '🏛️', value: '100+', label: 'Colleges' },
  { icon: '⭐', value: 'Infinite', label: 'Experiences' },
]

/* ── Event Categories ───────────────────────────────────────── */
const CATEGORIES = [
  { icon: '🤖', img: '/robo.jpg', title: 'Technical Events', subtitle: 'Code • Build • Innovate' },
  { icon: '🎤', img: '/mic.jpg', title: 'Cultural Events', subtitle: 'Music • Dance • Art' },
  { icon: '🎮', img: "/gaming.jpg", title: 'Gaming Events', subtitle: 'Play • Compete • Win' },
  { icon: '💡', img: "/bulb.jpg", title: 'Workshops', subtitle: 'Learn • Explore • Grow' },
  { icon: '🏆', img: "/trophy.jpg", title: 'Special Events', subtitle: 'Fun • Surprises • More' },
]

export default function Home() {
  const [events, setEvents] = useState([])
  const EVENT_DATE = '2026-02-12T10:00:00'

  useEffect(() => {
    api.get('/events').then(r => setEvents(r.data.events || [])).catch(() => {})
  }, [])

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__bg">
          <img src="/college2.png" alt="CMR College" className="hero__bg-img" />
          <div className="hero__overlay" />
        </div>

        <div className="hero__content container">
          <div className="hero__left">
            <div className="hero__script">Ideas &bull; Talent &bull; Together</div>
            <img src="/logo.png" alt="Bammaz2k26" className="hero__logo" />
            <p className="hero__subtitle">Annual Technical &amp; Cultural Fest</p>
            <p className="hero__college">CMR College of Engineering &amp; Technology</p>

            <div className="hero__info">
              <span>📅 FEB 12 – 14, 2026</span>
              <span>📍 CMR College, Kandlakoya, Hyderabad</span>
            </div>

            <div className="hero__tagline">
              <span>BIGGER</span>&bull;<span>BOLDER</span>&bull;<span>BRIGHTER</span>
            </div>

            <div className="hero__cta">
              <Link to="/signup" className="btn btn-primary">Register Now →</Link>
              <Link to="/events" className="btn btn-outline">Explore Events ↓</Link>
            </div>
          </div>

          <div className="hero__right">
            <span className="hero__accent">More<br/>than<br/>a Fest</span>
          </div>
        </div>
      </section>

      {/* ── COUNTDOWN + STATS ── */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar__inner">
            <Countdown targetDate={EVENT_DATE} />
            <div className="stats-bar__divider" />
            <div className="stats-bar__stats">
              {STATS.map(s => (
                <div key={s.label} className="stat-item">
                  <span className="stat-item__icon">{s.icon}</span>
                  <span className="stat-item__val">{s.value}</span>
                  <span className="stat-item__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLORE EVENTS ── */}
      <section className="section explore">
        <div className="container">
          <div className="explore__header">
            <div>
              <div className="section-label">Explore Events</div>
              <h2 className="explore__title">
                Where Every<br/>
                <span className="text-orange">Passion</span> Finds a Stage.
              </h2>
              <p className="explore__sub">
                From technical challenges to cultural shows,<br/>
                there's something for everyone.
              </p>
            </div>
            <Link to="/events" className="btn btn-outline">View All Events →</Link>
          </div>

          <div className="categories">
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className="category-card">
                <div className="category-card__img">
                  {cat.img ? (
                    <img src={cat.img} alt={cat.title} />
                  ) : (
                    <span className="category-card__emoji">{cat.icon}</span>
                  )}
                  <div className="category-card__overlay" />
                </div>
                <div className="category-card__info">
                  <h3>{cat.title}</h3>
                  <p>{cat.subtitle}</p>
                </div>
                <Link to="/events" className="category-card__arrow">→</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section about-section">
        <div className="container">
          <div className="about-section__grid">
            <div className="about-section__text">
              <div className="section-label">About Bammaz 2K26</div>
              <h2 className="about-section__title">
                A Celebration of<br/>
                <span className="text-orange">Ideas, Talent</span> and{' '}
                <span className="text-orange">Togetherness.</span>
              </h2>
              <p className="about-section__desc">
                BAMMAZ 2K26 is the annual technical &amp; cultural fest of CMR College of
                Engineering and Technology, bringing together innovation, creativity and
                diversity under one grand celebration.
              </p>
              <Link to="/about" className="btn btn-primary" style={{ marginTop: '8px' }}>
                Know More →
              </Link>
            </div>
            <div className="about-section__images">
              <img src="/college1.png" alt="College campus" className="about-section__img about-section__img--main" />
              <img src="/college2.png" alt="CMR College" className="about-section__img about-section__img--sub" />
              <div className="about-section__watermark">
                Create<br/>Compete<br/>Connect<br/>Grow
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VENUE ── */}
      <section className="section venue-section">
        <div className="container">
          <div className="venue-section__inner">
            <div className="venue-section__left">
              <div className="section-label">Our Venue 📍</div>
              <h2 className="venue-section__title">
                CMR College of<br/>Engineering and Technology
              </h2>
              <p className="venue-section__addr">Kandlakoya, Hyderabad, Telangana</p>
              <a
                href="https://maps.google.com/?q=CMR+College+of+Engineering+and+Technology+Kandlakoya"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ marginTop: '20px' }}
              >
                View on Map →
              </a>
            </div>
            <div className="venue-section__img-wrap">
              <img src="/college1.png" alt="CMR College" className="venue-section__img" />
            </div>
            <div className="venue-section__features">
              {['Spacious Campus', 'Great Infrastructure', 'Easy Accessibility', 'Student Friendly Facilities'].map(f => (
                <div key={f} className="venue-feature">
                  <span className="venue-feature__dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="cta-banner__bg" />
        <div className="container">
          <div className="cta-banner__inner">
            <div>
              <p className="cta-banner__pre">Be a Part of</p>
              <img src="/logo.png" alt="Bammaz2k26" className="cta-banner__logo" />
            </div>
            <div className="cta-banner__right">
              <Link to="/signup" className="btn btn-gold">Register Now →</Link>
              <p className="cta-banner__note">DON'T JUST WATCH. BE THE EXPERIENCE.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
