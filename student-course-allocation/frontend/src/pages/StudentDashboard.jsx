import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { coursesAPI, prefsAPI, allocAPI } from '../utils/api'
import { FiBook, FiCheckCircle, FiClock, FiArrowRight, FiAward, FiUsers, FiStar } from 'react-icons/fi'

const semester = 'Fall 2024'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [prefs, setPrefs] = useState([])
  const [allocs, setAllocs] = useState([])

  useEffect(() => {
    coursesAPI.getAll().then(r => setCourses(r.data.courses || [])).catch(() => {})
    prefsAPI.get(semester).then(r => setPrefs(r.data.preferences || [])).catch(() => {})
    allocAPI.result(semester).then(r => setAllocs(r.data.allocations || [])).catch(() => {})
  }, [])

  const allocated = allocs.filter(a => a.status === 'allocated')
  const waitlisted = allocs.filter(a => a.status === 'waitlist')

  const stats = [
    { icon: FiBook,        label: 'Available Courses', value: courses.length,    grad: 'linear-gradient(135deg,#7c3aed,#4f46e5)', glow: 'rgba(124,58,237,0.3)' },
    { icon: FiStar,        label: 'Preferences Set',   value: prefs.length,      grad: 'linear-gradient(135deg,#ec4899,#db2777)', glow: 'rgba(236,72,153,0.3)' },
    { icon: FiCheckCircle, label: 'Allocated',          value: allocated.length,  grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.3)' },
    { icon: FiClock,       label: 'Waitlisted',         value: waitlisted.length, grad: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,0.3)' },
  ]

  return (
    <div className="bg-app animate-fade-in">
      <div className="page">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 4 }}>Semester: {semester}</p>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: 'white', margin: 0 }}>
            Welcome back, <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{user?.department}</p>
        </div>

        {/* Stats */}
        <div className="grid-stats" style={{ marginBottom: 32 }}>
          {stats.map(({ icon: Icon, label, value, grad, glow }) => (
            <div key={label} className="stat-card" style={{ boxShadow: `0 8px 24px ${glow}` }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ color: 'white', fontSize: 20 }} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Quick Actions */}
          <div className="card-glass">
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/courses" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.08)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(124,58,237,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; e.currentTarget.style.background = 'rgba(124,58,237,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiBook style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>Select Courses</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Rank your course preferences</p>
                  </div>
                </div>
                <FiArrowRight style={{ color: '#a78bfa' }} />
              </Link>

              <Link to="/results" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.08)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; e.currentTarget.style.background = 'rgba(16,185,129,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'; e.currentTarget.style.background = 'rgba(16,185,129,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCheckCircle style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>View Results</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Check your allocation status</p>
                  </div>
                </div>
                <FiArrowRight style={{ color: '#6ee7b7' }} />
              </Link>
            </div>
          </div>

          {/* My Preferences */}
          <div className="card-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>My Preferences</h2>
              {prefs.length > 0 && <Link to="/courses" style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>Edit →</Link>}
            </div>
            {prefs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <FiAward style={{ fontSize: 40, color: 'rgba(255,255,255,0.1)', display: 'block', margin: '0 auto 12px' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No preferences submitted yet</p>
                <Link to="/courses" style={{ color: '#a78bfa', fontSize: 14, fontWeight: 600, display: 'inline-block', marginTop: 8 }}>Select courses →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prefs.slice(0, 5).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.04)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{p.rank_order}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 500, fontSize: 13, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.course_name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{p.code} · {p.credits} credits</p>
                    </div>
                  </div>
                ))}
                {prefs.length > 5 && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>+{prefs.length - 5} more</p>}
              </div>
            )}
          </div>
        </div>

        {/* Available Courses Preview */}
        {courses.length > 0 && (
          <div className="card-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>Available Courses</h2>
              <Link to="/courses" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                <FiBook size={13} /> Select Courses
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {courses.slice(0, 6).map(c => (
                <div key={c.id} style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="badge badge-purple">{c.code}</span>
                    <span className="badge badge-blue">{c.credits} cr</span>
                  </div>
                  <p style={{ fontWeight: 600, color: 'white', fontSize: 13 }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{c.department}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                    {c.time_slot && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={10} />{c.time_slot}</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers size={10} />{c.capacity} seats</span>
                  </div>
                </div>
              ))}
            </div>
            {courses.length > 6 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/courses" style={{ fontSize: 14, color: '#a78bfa', fontWeight: 600 }}>View all {courses.length} courses →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
