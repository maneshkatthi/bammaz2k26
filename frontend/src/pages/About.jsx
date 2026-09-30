import { Link } from 'react-router-dom'
import './StaticPages.css'

export default function About() {
  return (
    <div className="static-page">
      <div className="page-hero">
        <div className="container">
          <div className="badge badge-orange" style={{ justifyContent: 'center', marginBottom: 16 }}>About</div>
          <h1>About <span className="text-orange">Bammaz 2K26</span></h1>
          <p>A Celebration of Ideas, Talent and Togetherness</p>
        </div>
      </div>

      <div className="container section">
        <div className="about-grid">
          <div>
            <div className="section-label">Our Story</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 20 }}>
              CMR's Annual Grand <span className="text-orange">Fest</span>
            </h2>
            <p className="static-text">
              BAMMAZ 2K26 is the annual technical &amp; cultural fest of CMR College of Engineering
              and Technology, Kandlakoya, Hyderabad. Bringing together students from across
              Telangana and beyond, the fest celebrates innovation, creativity, and diversity
              under one grand celebration.
            </p>
            <p className="static-text">
              With 50+ events spanning technical competitions, cultural performances, gaming
              tournaments, and workshops, Bammaz 2K26 offers something for every student.
              Whether you're a coder, dancer, artist, or gamer — there's a stage for you.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
              <Link to="/events" className="btn btn-primary">Explore Events →</Link>
              <Link to="/signup" className="btn btn-outline">Register Now</Link>
            </div>
          </div>
          <div>
            <img src="/college1.png" alt="CMR College" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-orange)' }} />
          </div>
        </div>

        <div className="stat-cards">
          {[
            { icon: '🎓', val: '10K+', label: 'Students Expected' },
            { icon: '🎪', val: '50+', label: 'Events' },
            { icon: '🏛️', val: '100+', label: 'Colleges' },
            { icon: '🏆', val: '₹5L+', label: 'Total Prize Pool' },
          ].map(s => (
            <div key={s.label} className="stat-card card">
              <div className="stat-card__icon">{s.icon}</div>
              <div className="stat-card__val">{s.val}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
