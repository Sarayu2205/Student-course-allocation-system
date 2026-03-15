import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notifAPI } from '../utils/api'
import { HiAcademicCap } from 'react-icons/hi'
import { FiLogOut, FiBell, FiCheck, FiCheckCircle, FiClock, FiXCircle, FiInfo } from 'react-icons/fi'
import toast from 'react-hot-toast'

function NotifIcon({ type }) {
  if (type === 'allocated')  return <FiCheckCircle style={{ color: '#10b981', fontSize: 15, flexShrink: 0 }} />
  if (type === 'waitlist')   return <FiClock       style={{ color: '#f59e0b', fontSize: 15, flexShrink: 0 }} />
  if (type === 'rejected')   return <FiXCircle     style={{ color: '#ef4444', fontSize: 15, flexShrink: 0 }} />
  return                            <FiInfo        style={{ color: '#818cf8', fontSize: 15, flexShrink: 0 }} />
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

function NotifPanel({ notifs, unread, onReadAll, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 9999,
      width: 360, maxHeight: 480,
      background: 'linear-gradient(180deg,#1a1535,#13102b)',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      animation: 'notifSlide .2s ease-out'
    }}>
      <div style={{
        padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(124,58,237,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiBell style={{ color: '#a78bfa', fontSize: 16 }} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Notifications</span>
          {unread > 0 && (
            <span style={{
              background: '#7c3aed', color: 'white', borderRadius: 99,
              fontSize: 11, fontWeight: 700, padding: '1px 7px'
            }}>{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={onReadAll} style={{
            background: 'none', border: 'none', color: '#a78bfa',
            fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
          }}>
            <FiCheck size={12} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ overflowY: 'auto', maxHeight: 400 }}>
        {notifs.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
            <FiBell style={{ fontSize: 32, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
            No notifications yet
          </div>
        ) : notifs.map(n => (
          <div key={n.id} style={{
            padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: n.is_read ? 'transparent' : 'rgba(124,58,237,0.08)',
            transition: 'background 0.2s'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: n.type === 'allocated' ? 'rgba(16,185,129,0.15)'
                        : n.type === 'waitlist'  ? 'rgba(245,158,11,0.15)'
                        : n.type === 'rejected'  ? 'rgba(239,68,68,0.15)'
                        : 'rgba(129,140,248,0.15)'
            }}>
              <NotifIcon type={n.type} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontWeight: 600, fontSize: 13, margin: '0 0 3px' }}>{n.title}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 4px', lineHeight: 1.5 }}>{n.message}</p>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{timeAgo(n.created_at)}</span>
            </div>
            {!n.is_read && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: 4 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs]       = useState([])
  const [unread, setUnread]       = useState(0)
  const prevUnread = useRef(0)
  const panelRef   = useRef(null)

  // Poll notifications every 15s for students
  useEffect(() => {
    if (!user || user.role === 'admin') return
    const fetch = () => {
      notifAPI.get().then(r => {
        const newUnread = r.data.unread
        setNotifs(r.data.notifications || [])
        setUnread(newUnread)
        // Toast popup for new notifications
        if (newUnread > prevUnread.current && prevUnread.current >= 0) {
          const latest = r.data.notifications?.[0]
          if (latest && !latest.is_read) {
            toast(latest.title, {
              icon: latest.type === 'allocated' ? '🎉' : latest.type === 'waitlist' ? '⏳' : '📢',
              style: { background: '#1a1535', color: '#fff', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 12, fontSize: 13 },
              duration: 5000,
            })
          }
        }
        prevUnread.current = newUnread
      }).catch(() => {})
    }
    fetch()
    const id = setInterval(fetch, 15000)
    return () => clearInterval(id)
  }, [user])

  // Close panel on outside click
  useEffect(() => {
    const handler = e => { if (panelRef.current && !panelRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleReadAll = () => {
    notifAPI.readAll().then(() => {
      setNotifs(n => n.map(x => ({ ...x, is_read: 1 })))
      setUnread(0)
      prevUnread.current = 0
    }).catch(() => {})
  }

  if (!user) return null

  const isAdmin = user.role === 'admin'
  const links = isAdmin
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/courses', label: 'Courses' }, { to: '/admin/students', label: 'Students' }]
    : [{ to: '/dashboard', label: 'Dashboard' }, { to: '/courses', label: 'Select Courses' }, { to: '/results', label: 'My Results' }]

  return (
    <>
      <style>{`
        @keyframes notifSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bellRing { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-15deg)} 40%{transform:rotate(15deg)} 60%{transform:rotate(-10deg)} 80%{transform:rotate(10deg)} }
        .bell-ring { animation: bellRing 0.6s ease; }
      `}</style>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124,58,237,0.4)'
            }}>
              <HiAcademicCap style={{ color: 'white', fontSize: 18 }} />
            </div>
            <span style={{ fontWeight: 700, color: 'white', fontSize: 17 }}>CourseAlloc</span>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
              background: isAdmin ? 'rgba(245,158,11,0.2)' : 'rgba(124,58,237,0.2)',
              color: isAdmin ? '#fcd34d' : '#c4b5fd',
              border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.3)'}`
            }}>{isAdmin ? 'Admin' : 'Student'}</span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', gap: 4 }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.2s',
                background: location.pathname === l.to ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent',
                color: location.pathname === l.to ? 'white' : 'rgba(255,255,255,0.6)',
                boxShadow: location.pathname === l.to ? '0 4px 12px rgba(124,58,237,0.3)' : 'none'
              }}>{l.label}</Link>
            ))}
          </div>

          {/* Right: bell + user + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Bell — students only */}
            {!isAdmin && (
              <div style={{ position: 'relative' }} ref={panelRef}>
                <button
                  onClick={() => setNotifOpen(o => !o)}
                  className={unread > 0 ? 'bell-ring' : ''}
                  style={{
                    width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: notifOpen ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)', position: 'relative', transition: 'all 0.2s'
                  }}
                >
                  <FiBell size={17} />
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: -3, right: -3,
                      background: '#ef4444', color: 'white', borderRadius: '50%',
                      width: 18, height: 18, fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #0f0c29'
                    }}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </button>
                {notifOpen && (
                  <NotifPanel
                    notifs={notifs}
                    unread={unread}
                    onReadAll={handleReadAll}
                    onClose={() => setNotifOpen(false)}
                  />
                )}
              </div>
            )}

            {/* User chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '6px 10px'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 12
              }}>{user.name?.[0]?.toUpperCase()}</div>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user.department}</p>
              </div>
            </div>

            {/* Logout */}
            <button onClick={() => { logout(); navigate('/login') }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 10, border: '1px solid transparent',
              background: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              fontSize: 13, transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'none' }}
            >
              <FiLogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
