import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleSignout = () => {
    signout()
    navigate('/')
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Events', to: '/events' },
    { label: 'Venue', to: '/venue' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Contact', to: '/contact' },
  ]

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <img src="/logo.png" alt="Bammaz2k26" className="navbar__logo-img" />
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`navbar__link ${isActive(link.to) ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="navbar__actions">
          <img src="/collage_logo.jpg" alt="CMR" className="navbar__cmr-logo" />

          {user ? (
            <div className="navbar__user">
              <span className="navbar__user-badge">
                {user.role === 'organizer' ? '🎯' : '🎓'}
              </span>
              <Link
                to={user.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/student'}
                className="navbar__username"
              >
                {user.name.split(' ')[0]}
              </Link>
              <button className="btn btn-outline navbar__signout" onClick={handleSignout}>
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/signin" className="btn btn-primary">
              Register Now →
            </Link>
          )}

          {/* Hamburger */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar__mobile-link ${isActive(link.to) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
        {user ? (
          <>
            <Link
              to={user.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/student'}
              className="navbar__mobile-link"
            >
              My Dashboard
            </Link>
            <button className="btn btn-outline" onClick={handleSignout} style={{ margin: '8px 16px' }}>
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/signin" className="btn btn-primary" style={{ margin: '8px 16px' }}>
            Register Now →
          </Link>
        )}
      </div>
    </nav>
  )
}
