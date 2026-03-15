import React, { useState, useRef, useEffect } from 'react'
import { chatAPI } from '../utils/api'
import { FiMessageCircle, FiX, FiSend, FiChevronDown } from 'react-icons/fi'
import { HiAcademicCap, HiSparkles } from 'react-icons/hi'

const WELCOME = {
  id: 0, role: 'bot',
  text: "Hi! I am **CourseBot** your academic assistant.\n\nI can help you with:\n**Topics & Syllabus** - What is covered in each course\n**Career Paths** - Jobs and skills you will gain\n**Study Tips** - How to prepare and succeed\n**Project Ideas** - Practical assignments\n**Prerequisites** - What you need before enrolling\n\nJust ask me anything! Try:\n- What topics are in Machine Learning?\n- Career scope of Web Development\n- Is Operating Systems hard?"
}

const SUGGESTIONS = [
  "What topics are in Machine Learning?",
  "Career scope of Web Development",
  "Study tips for Data Structures",
  "Show all available courses",
  "Recommend courses for beginners"
]

function Bubble({ text, role }) {
  const lines = text.split('\n')
  return (
    <div style={{
      maxWidth: '85%',
      padding: '10px 14px',
      borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: role === 'user'
        ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
        : 'rgba(255,255,255,0.08)',
      border: role === 'bot' ? '1px solid rgba(255,255,255,0.1)' : 'none',
      color: 'white',
      fontSize: '13px',
      lineHeight: '1.6',
      wordBreak: 'break-word'
    }}>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        const rendered = parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} style={{ color: '#c4b5fd' }}>{p.slice(2, -2)}</strong>
            : p
        )
        return <span key={i}>{rendered}{i < lines.length - 1 && <br />}</span>
      })}
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#a78bfa',
          display: 'inline-block',
          animation: 'bounce 1.2s infinite',
          animationDelay: i * 0.2 + 's'
        }} />
      ))}
    </div>
  )
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 80)
    }
  }, [open])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    else if (messages.length > 1) setUnread(u => u + 1)
  }, [messages])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg }])
    setLoading(true)
    try {
      const r = await chatAPI.send(msg)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: r.data.reply }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: 'Sorry, I could not connect. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bubblePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
          50%      { box-shadow: 0 0 0 10px rgba(124,58,237,0); }
        }
        .chat-window { animation: chatSlideUp 0.25s ease-out; }
        .bubble-btn  { animation: bubblePulse 2.5s infinite; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 99px; }
        .suggestion-chip:hover { background: rgba(124,58,237,0.3) !important; border-color: rgba(124,58,237,0.6) !important; }
        .send-btn:hover:not(:disabled) { transform: scale(1.08); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open CourseBot"
        className="bubble-btn"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open
          ? <FiChevronDown style={{ color: 'white', fontSize: 22 }} />
          : <FiMessageCircle style={{ color: 'white', fontSize: 22 }} />
        }
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: 'white', borderRadius: '50%',
            width: 20, height: 20, fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0f0c29'
          }}>{unread}</span>
        )}
        {!open && unread === 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 12, height: 12, background: '#10b981', borderRadius: '50%',
            border: '2px solid #0f0c29'
          }} />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="chat-window"
          style={{
            position: 'fixed', bottom: 100, right: 28, zIndex: 9998,
            width: 380, height: 560,
            borderRadius: 20,
            background: 'linear-gradient(180deg, #1a1535 0%, #13102b 100%)',
            border: '1px solid rgba(124,58,237,0.3)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124,58,237,0.4)'
            }}>
              <HiAcademicCap style={{ color: 'white', fontSize: 22 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>CourseBot</span>
                <HiSparkles style={{ color: '#a78bfa', fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Online · Course Doubt Assistant</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
            >
              <FiX size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                {m.role === 'bot' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <HiAcademicCap style={{ color: 'white', fontSize: 14 }} />
                  </div>
                )}
                <Bubble text={m.text} role={m.role} />
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <HiAcademicCap style={{ color: 'white', fontSize: 14 }} />
                </div>
                <TypingDots />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => send(s)} style={{
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 20, padding: '5px 12px', color: '#c4b5fd', fontSize: 11,
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '10px 12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.25)', flexShrink: 0
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Ask about any course..."
                style={{
                  flex: 1, resize: 'none', borderRadius: 14, padding: '10px 14px',
                  fontSize: 13, color: 'white', outline: 'none', maxHeight: 80,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  lineHeight: 1.5, fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
              <button
                className="send-btn"
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width: 42, height: 42, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'transform 0.2s',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.4)'
                }}
              >
                <FiSend style={{ color: 'white', fontSize: 16 }} />
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
              Press Enter to send
            </p>
          </div>
        </div>
      )}
    </>
  )
}
