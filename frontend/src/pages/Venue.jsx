import './StaticPages.css'

export default function Venue() {
  return (
    <div className="static-page">
      <div className="page-hero">
        <div className="container">
          <div className="badge badge-orange" style={{ justifyContent: 'center', marginBottom: 16 }}>Our Venue</div>
          <h1>CMR College of <span className="text-orange">Engineering &amp; Technology</span></h1>
          <p>Kandlakoya, Hyderabad, Telangana</p>
        </div>
      </div>

      <div className="container section">
        <div className="about-grid">
          <div>
            <div className="section-label">Location</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Find Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {[
                { icon: '📍', label: 'Address', val: 'CMR College of Engineering & Technology, Kandlakoya Village, Medchal Road, Hyderabad – 501 401' },
                { icon: '📞', label: 'Phone', val: '+91 86765 43210' },
                { icon: '✉', label: 'Email', val: 'bammaz2k26@cmrcet.ac.in' },
              ].map(i => (
                <div key={i.label} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{i.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--white-60)', marginBottom: 2 }}>{i.label}</div>
                    <div style={{ fontSize: 15 }}>{i.val}</div>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://maps.google.com/?q=CMR+College+of+Engineering+and+Technology+Kandlakoya"
              target="_blank" rel="noreferrer"
              className="btn btn-primary"
            >
              Open in Google Maps →
            </a>
          </div>
          <div>
            <img src="/college2.png" alt="CMR College campus" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-orange)', marginBottom: 16 }} />
            <img src="/college1.png" alt="CMR grounds" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }} />
          </div>
        </div>

        <div className="stat-cards" style={{ marginTop: 48 }}>
          {['Spacious Campus', 'Great Infrastructure', 'Easy Accessibility', 'Student-Friendly Facilities'].map(f => (
            <div key={f} className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600 }}>{f}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
