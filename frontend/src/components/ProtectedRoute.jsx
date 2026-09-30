import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute — wraps routes that need authentication.
 * @param {string} role - 'student' | 'organizer' | null (any authenticated)
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  if (role && user.role !== role) {
    // Redirect to their correct dashboard
    const dash = user.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/student'
    return <Navigate to={dash} replace />
  }

  return children
}
