import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import CourseSelection from './pages/CourseSelection'
import AllocationResult from './pages/AllocationResult'
import AdminDashboard from './pages/AdminDashboard'
import AdminCourses from './pages/AdminCourses'
import AdminStudents from './pages/AdminStudents'
import ChatBot from './components/ChatBot'
import VoiceAssistant from './components/VoiceAssistant'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div style={{ background: '#0f0c29', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white', fontFamily: 'Inter,sans-serif', padding: 32, textAlign: 'center' }}>
        <h2 style={{ color: '#f87171', marginBottom: 12, fontSize: 22 }}>App Error</h2>
        <pre style={{ color: '#a78bfa', fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, maxWidth: 600, overflow: 'auto', textAlign: 'left' }}>
          {this.state.error?.message}
        </pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 24px', background: '#7c3aed', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontSize: 14 }}>
          Reload
        </button>
      </div>
    )
    return this.props.children
  }
}

const Guard = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="center-screen bg-app">
      <div className="spinner" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  if (!adminOnly && user.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

// Student-only floating widgets
const StudentWidgets = () => {
  const { user } = useAuth()
  if (!user || user.role === 'admin') return null
  return (
    <>
      <VoiceAssistant />
      <ChatBot />
    </>
  )
}

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1535', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
        <Navbar />
        <StudentWidgets />
        <Routes>
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/dashboard"      element={<Guard><StudentDashboard /></Guard>} />
          <Route path="/courses"        element={<Guard><CourseSelection /></Guard>} />
          <Route path="/results"        element={<Guard><AllocationResult /></Guard>} />
          <Route path="/admin"          element={<Guard adminOnly><AdminDashboard /></Guard>} />
          <Route path="/admin/courses"  element={<Guard adminOnly><AdminCourses /></Guard>} />
          <Route path="/admin/students" element={<Guard adminOnly><AdminStudents /></Guard>} />
          <Route path="*"               element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
)

export default App
