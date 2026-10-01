import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <img src="/logo.png" alt="Bammaz2k26" className="footer__logo" />
            <p className="footer__tagline">
              Ideas &bull; Talent &bull; Together
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/venue">Venue</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Venue */}
          <div className="footer__col">
            <h4 className="footer__heading">Venue</h4>
            <ul className="footer__list">
              <li><Link to="/venue">Venue Plan</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__heading">Contact Us</h4>
            <ul className="footer__list footer__contact">
              <li>
                <span>✉</span>
                <a href="mailto:bammaz2k26@cmrcet.ac.in">bammaz2k26@cmrcet.ac.in</a>
              </li>
              <li>
                <span>📞</span>
                <a href="tel:+918676543210">+91 86765 43210</a>
              </li>
              <li>
                <span>📍</span>
                <span>CMR College, Kandlakoya, Hyderabad</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer__col">
            <h4 className="footer__heading">Follow Us</h4>
            <div className="footer__socials">
              <a href="#" aria-label="Instagram" className="footer__social-btn">📷</a>
              <a href="#" aria-label="YouTube" className="footer__social-btn">▶</a>
              <a href="#" aria-label="LinkedIn" className="footer__social-btn">in</a>
              <a href="#" aria-label="Twitter/X" className="footer__social-btn">𝕏</a>
            </div>
            <p className="footer__slogan">
              &ldquo;Ideas &bull; Talent &bull; Together&rdquo;
            </p>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {year} BAMMAZ 2K26. All rights reserved.</p>
          <div className="footer__bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
