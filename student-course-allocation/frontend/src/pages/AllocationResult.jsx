import React, { useState, useEffect } from 'react'
import { allocAPI } from '../utils/api'
import { FiCheckCircle, FiClock, FiXCircle, FiBook } from 'react-icons/fi'

export default function AllocationResult() {
  const [allocs, setAllocs] = useState([])
  const [loading, setLoading] = useState(true)
  const semester = 'Fall 2024'

  useEffect(() => {
    allocAPI.result(semester).then(r => setAllocs(r.data.allocations || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const allocated = allocs.filter(a => a.status === 'allocated')
  const waitlisted = allocs.filter(a => a.status === 'waitlist')
  const rejected = allocs.filter(a => a.status === 'rejected')
  const totalCredits = allocated.reduce((s, a) => s + (a.credits || 0), 0)

  if (loading) return (
    <div className="bg-app center-screen"><div className="spinner" /></div>
  )

  const statusBadge = status => {
    if (status === 'allocated') return <span className="badge badge-allocated">Allocated</span>
    if (status === 'waitlist')  return <span className="badge badge-waitlist">Waitlist</span>
    return <span className="badge badge-rejected">Rejected</span>
  }

  return (
    <div className="bg-app animate-fade-in">
      <div className="page">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: 'white', margin: 0 }}>Allocation Results</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Your course allocation for {semester}</p>
        </div>

        {allocs.length === 0 ? (
          <div className="card-glass" style={{ textAlign: 'center', padding: '80px 24px' }}>
            <FiBook style={{ fontSize: 48, color: 'rgba(255,255,255,0.1)', display: 'block', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>No Results Yet</h3>
            <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Allocation hasn't been run yet. Check back later.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { icon: FiCheckCircle, label: 'Allocated',     count: allocated.length,  sub: `${totalCredits} total credits`,    grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.2)' },
                { icon: FiClock,       label: 'Waitlisted',    count: waitlisted.length, sub: 'Pending seat availability',         grad: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,0.2)' },
                { icon: FiXCircle,     label: 'Not Allocated', count: rejected.length,   sub: 'No seats available',               grad: 'linear-gradient(135deg,#ef4444,#dc2626)', glow: 'rgba(239,68,68,0.2)' },
              ].map(({ icon: Icon, label, count, sub, grad, glow }) => (
                <div key={label} className="stat-card" style={{ boxShadow: `0 8px 24px ${glow}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ color: 'white', fontSize: 20 }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{count} courses</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-glass">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 16 }}>Detailed Results</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th><th>Code</th><th>Credits</th><th>Time Slot</th><th>Score</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocs.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500, color: 'white' }}>{a.course_name}</td>
                        <td><span className="badge badge-purple">{a.code}</span></td>
                        <td style={{ color: 'rgba(255,255,255,0.6)' }}>{a.credits}</td>
                        <td style={{ color: 'rgba(255,255,255,0.6)' }}>{a.time_slot || '—'}</td>
                        <td style={{ color: 'rgba(255,255,255,0.6)' }}>{a.allocation_score ? `${(a.allocation_score * 100).toFixed(0)}%` : '—'}</td>
                        <td>{statusBadge(a.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
