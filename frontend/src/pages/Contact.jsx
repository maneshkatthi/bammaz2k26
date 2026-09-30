import './StaticPages.css'

export default function Contact() {
  return (
    <div className="static-page">
      <div className="page-hero">
        <div className="container">
          <div className="badge badge-orange" style={{ justifyContent: 'center', marginBottom: 16 }}>Contact</div>
          <h1>Get in <span className="text-orange">Touch</span></h1>
          <p>We're here to help with any questions about Bammaz 2K26</p>
        </div>
      </div>

      <div className="container section">
        <div className="about-grid">
          <div>
            <div className="section-label">Contact Information</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>Reach Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '✉', label: 'Email', val: 'bammaz2k26@cmrcet.ac.in', link: 'mailto:bammaz2k26@cmrcet.ac.in' },
                { icon: '📞', label: 'Phone', val: '+91 86765 43210', link: 'tel:+918676543210' },
                { icon: '📍', label: 'Address', val: 'CMR College of Engineering & Technology, Kandlakoya Village, Medchal Road, Hyderabad – 501 401' },
              ].map(i => (
                <div key={i.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(249,115,22,0.1)', border: '1px solid var(--border-orange)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {i.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--white-60)', marginBottom: 2 }}>{i.label}</div>
                    {i.link ? <a href={i.link} style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 15 }}>{i.val}</a>
                      : <span style={{ fontSize: 15 }}>{i.val}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-display)' }}>Send a Message</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" rows={4} placeholder="Your message…" style={{ resize: 'vertical' }} />
              </div>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }}>Send Message →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
