import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiLayers } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'

const DEPTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Business Administration','Mathematics','Physics']

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'Computer Science' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.register(form)
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-app center-screen" style={{ position: 'relative', overflow: 'hidden', padding: 16 }}>
      <div className="orb orb-violet" style={{ width: 400, height: 400, top: '-20%', right: '-10%' }} />
      <div className="orb orb-indigo" style={{ width: 400, height: 400, bottom: '-20%', left: '-10%' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'slideUp 0.35s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', marginBottom: 16 }}>
            <HiAcademicCap style={{ color: 'white', fontSize: 40 }} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', margin: 0 }}>CourseAlloc</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4, fontSize: 14 }}>Create your student account</p>
        </div>

        <div className="card-glass" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 24 }}>Create Account</h2>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Full Name</label>
              <div className="input-wrap">
                <FiUser className="input-icon" />
                <input type="text" required className="input" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input type="email" required className="input" placeholder="you@university.edu"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Department</label>
              <div className="input-wrap">
                <FiLayers className="input-icon" />
                <select className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input type="password" required minLength={6} className="input" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px 20px', fontSize: 15, marginTop: 8 }}>
              {loading ? <div className="spinner-sm" /> : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
