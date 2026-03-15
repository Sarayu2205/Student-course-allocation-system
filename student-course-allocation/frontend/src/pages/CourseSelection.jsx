import React, { useState, useEffect } from 'react'
import { coursesAPI, prefsAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiX, FiArrowUp, FiArrowDown, FiSend, FiBook, FiClock, FiUsers, FiSearch } from 'react-icons/fi'

const semester = 'Fall 2024'

export default function CourseSelection() {
  const [courses, setCourses] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    coursesAPI.getAll().then(r => setCourses(r.data.courses || [])).catch(() => {})
    prefsAPI.get(semester).then(r => {
      const prefs = r.data.preferences || []
      setSelected(prefs.map(p => ({
        course: { id: p.course_id, name: p.course_name, code: p.code, credits: p.credits, time_slot: p.time_slot, capacity: p.capacity, department: p.department },
        rank: p.rank_order
      })))
    }).catch(() => {})
  }, [])

  const isSelected = id => selected.some(s => s.course.id === id)
  const addCourse = course => { if (!isSelected(course.id)) setSelected(prev => [...prev, { course, rank: prev.length + 1 }]) }
  const removeCourse = id => setSelected(prev => prev.filter(s => s.course.id !== id).map((s, i) => ({ ...s, rank: i + 1 })))
  const moveUp = idx => {
    if (idx === 0) return
    setSelected(prev => { const a = [...prev]; [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; return a.map((s,i) => ({...s, rank: i+1})) })
  }
  const moveDown = idx => setSelected(prev => {
    if (idx === prev.length - 1) return prev
    const a = [...prev]; [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; return a.map((s,i) => ({...s, rank: i+1}))
  })

  const handleSubmit = async () => {
    if (selected.length === 0) { toast.error('Select at least one course'); return }
    setLoading(true)
    try {
      await prefsAPI.submit({ preferences: selected.map(s => ({ course_id: s.course.id, rank: s.rank })), semester })
      toast.success('Preferences submitted!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const filtered = courses.filter(c => !isSelected(c.id) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  )

  const iconBtn = (onClick, children, hoverColor = 'rgba(255,255,255,0.1)') => (
    <button onClick={onClick} style={{ width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverColor; e.currentTarget.style.color = 'white' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
      {children}
    </button>
  )

  return (
    <div className="bg-app animate-fade-in">
      <div className="page">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: 'white', margin: 0 }}>Course Preferences</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Select and rank your preferred courses for {semester}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Available */}
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>Available <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 400 }}>({filtered.length})</span></h2>
            </div>
            <div className="search-wrap" style={{ marginBottom: 16 }}>
              <FiSearch className="search-icon" />
              <input className="input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 520 }}>
              {filtered.map(course => (
                <div key={course.id} style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span className="badge badge-purple">{course.code}</span>
                        <span className="badge badge-blue">{course.credits} cr</span>
                      </div>
                      <p style={{ fontWeight: 600, color: 'white', fontSize: 13 }}>{course.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{course.department}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        {course.time_slot && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={10} />{course.time_slot}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers size={10} />{course.capacity} seats</span>
                      </div>
                    </div>
                    <button onClick={() => addCourse(course)} style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <FiBook style={{ fontSize: 40, color: 'rgba(255,255,255,0.1)', display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.3)' }}>{search ? 'No courses match' : 'All courses selected'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected */}
          <div className="card-glass" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>My Preferences <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 400 }}>({selected.length})</span></h2>
              {selected.length > 0 && (
                <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                  {loading ? <div className="spinner-sm" /> : <><FiSend size={13} /> Submit</>}
                </button>
              )}
            </div>
            {selected.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
                <FiBook style={{ fontSize: 48, color: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>No courses selected</p>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 4 }}>Click + to add from the left</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 520 }}>
                {selected.map((s, idx) => (
                  <div key={s.course.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.rank}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.course.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.course.code} · {s.course.credits} cr</p>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {iconBtn(() => moveUp(idx), <FiArrowUp size={12} />)}
                      {iconBtn(() => moveDown(idx), <FiArrowDown size={12} />)}
                      {iconBtn(() => removeCourse(s.course.id), <FiX size={12} />, 'rgba(239,68,68,0.2)')}
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', paddingTop: 8 }}>Rank 1 = highest priority</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
