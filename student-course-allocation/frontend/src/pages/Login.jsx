import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-app center-screen" style={{ position: 'relative', overflow: 'hidden', padding: 16 }}>
      <div className="orb orb-violet" style={{ width: 400, height: 400, top: '-20%', left: '-10%' }} />
      <div className="orb orb-indigo" style={{ width: 400, height: 400, bottom: '-20%', right: '-10%' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'slideUp 0.35s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 16 }}>
            <HiAcademicCap style={{ color: 'white', fontSize: 40 }} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', margin: 0 }}>CourseAlloc</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4, fontSize: 14 }}>Smart Course Allocation System</p>
        </div>

        <div className="card-glass" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 24 }}>Sign In</h2>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Email Address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input type="email" required className="input" placeholder="you@university.edu"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input type="password" required className="input" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px 20px', fontSize: 15, marginTop: 8 }}>
              {loading ? <div className="spinner-sm" /> : <><FiLogIn /> Sign In</>}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 24 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600 }}>Register</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="card" style={{ marginTop: 16, padding: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Demo Credentials</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button onClick={() => setForm({ email: 'admin@university.edu', password: 'admin123' })}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <p style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 4, fontSize: 13 }}>Admin</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>admin@university.edu</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>admin123</p>
            </button>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 }}>
              <p style={{ fontWeight: 700, color: '#6ee7b7', marginBottom: 4, fontSize: 13 }}>Student</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Register a new</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>account below</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
