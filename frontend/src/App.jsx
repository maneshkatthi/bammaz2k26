import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Venue from './pages/Venue'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import RegisterForm from './pages/RegisterForm'
import StudentDashboard from './pages/StudentDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'

function Layout({ children, noFooter }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!noFooter && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/events" element={<Layout><Events /></Layout>} />
          <Route path="/events/:eventId" element={<Layout><EventDetail /></Layout>} />
          <Route path="/venue" element={<Layout><Venue /></Layout>} />
          <Route path="/faq" element={<Layout><FAQ /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />

          {/* Auth */}
          <Route path="/signup" element={<Layout noFooter><Signup /></Layout>} />
          <Route path="/signin" element={<Layout noFooter><Signin /></Layout>} />

          {/* Student protected */}
          <Route path="/events/:eventId/register" element={
            <ProtectedRoute role="student">
              <Layout><RegisterForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student" element={
            <ProtectedRoute role="student">
              <Layout><StudentDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Organizer protected */}
          <Route path="/dashboard/organizer" element={
            <ProtectedRoute role="organizer">
              <Layout noFooter><OrganizerDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
