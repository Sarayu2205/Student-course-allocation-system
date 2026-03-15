import React, { useState, useEffect, useRef, useCallback } from 'react'
import { notifAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { FiBell, FiX, FiCheck, FiCheckCircle } from 'react-icons/fi'
import { HiAcademicCap } from 'react-icons/hi'

const TYPE_STYLE = {
  allocated: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', dot: '#10b981', label: 'Allocated' },
  waitlist:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b', label: 'Waitlisted' },
  rejected:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  dot: '#ef4444', label: 'Not Allocated' },
  info:      { bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', dot: '#a78bfa', label: 'Info' },
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default function NotificationBell() {
  const [notifs, setNotifs]   = useState([])
  const [unread, setUnread]   = useState(0)
  const [open, setOpen]       = useState(false)
  const prevUnread            = useRef(0)
  const prevIds               = useRef(new Set())
  const panelRef              = useRef(null)

  const load = useCallback(async () => {
    try {
      const r = await notifAPI.get()
      const list = r.data.notifications || []
      const cnt  = r.data.unread || 0

      // Show toast for brand-new notifications
      list.forEach(n => {
        if (!prevIds.current.has(n.id) && !n.is_read) {
          const style = TYPE_STYLE[n.type] || TYPE_STYLE.info
          toast(n.title, {
            icon: n.type === 'allocated' ? '🎉' : n.type === 'waitlist' ? '⏳' : '📢',
            style: {
              background: '#1a1535', color: '#fff',
              border: `1px solid ${style.border}`,
              borderRadius: '12px', fontSize: '13px'
            },
            duration: 5000,
          })
        }
        prevIds.current.add(n.id)
      })

      setNotifs(list)
      setUnread(cnt)
      prevUnread.current = cnt
    } catch { /* silent */ }
  }, [])

  // Poll every 10 seconds
  useEffect(() => {
    load()
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [load])

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open && unread > 0) {
      await notifAPI.readAll()
      setUnread(0)
      setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })))
    }
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative', background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
          width: 38, height: 38, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: unread > 0 ? '#a78bfa' : 'rgba(255,255,255,0.5)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = unread > 0 ? '#a78bfa' : 'rgba(255,255,255,0.5)' }}
        title="Notifications"
      >
        <FiBell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: 'white', borderRadius: '50%',
            width: 18, height: 18, fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0f0c29', lineHeight: 1
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 46, right: 0, zIndex: 9999,
          width: 360, maxHeight: 480,
          background: 'linear-gradient(180deg,#1a1535,#13102b)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          animation: 'notifSlide .2s ease-out'
        }}>
          <style>{`@keyframes notifSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,70,229,0.15))',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FiBell style={{ color: 'white', fontSize: 15 }} />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>Notifications</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>
                  {notifs.length === 0 ? 'No notifications' : `${notifs.length} total`}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {notifs.length > 0 && (
                <button onClick={async () => { await notifAPI.readAll(); setUnread(0); setNotifs(p => p.map(n => ({...n, is_read:1}))) }}
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 8px', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiCheck size={11} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
                <FiX size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', maxHeight: 380 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <FiBell style={{ fontSize: 36, color: 'rgba(255,255,255,0.1)', display: 'block', margin: '0 auto 12px' }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>No notifications yet</p>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 4 }}>You will be notified when courses are allocated</p>
              </div>
            ) : (
              notifs.map((n, i) => {
                const s = TYPE_STYLE[n.type] || TYPE_STYLE.info
                return (
                  <div key={n.id} style={{
                    padding: '12px 16px',
                    borderBottom: i < notifs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    background: n.is_read ? 'transparent' : s.bg,
                    transition: 'background 0.2s',
                    cursor: 'default'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : s.bg}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: s.bg, border: `1px solid ${s.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <HiAcademicCap style={{ color: s.dot, fontSize: 16 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <p style={{ color: 'white', fontWeight: n.is_read ? 500 : 700, fontSize: 13, margin: 0, lineHeight: 1.3 }}>{n.title}</p>
                          {!n.is_read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0, marginTop: 3 }} />}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '4px 0 0', lineHeight: 1.5 }}>{n.message}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.dot, borderRadius: 99, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>{s.label}</span>
                          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{timeAgo(n.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
