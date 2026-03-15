import React, { useState, useRef, useEffect, useCallback } from 'react'
import { chatAPI } from '../utils/api'
import { FiMic, FiMicOff, FiX, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

function speakText(text, onEnd) {
  window.speechSynthesis.cancel()
  const clean = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/-/g, ' ')
  const utter = new SpeechSynthesisUtterance(clean)
  utter.lang = 'en-US'
  utter.rate = 0.92
  utter.pitch = 1.1
  utter.volume = 1

  const loadVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    const pick = voices.find(v => v.lang === 'en-US' && /female|zira|samantha|karen/i.test(v.name))
      || voices.find(v => v.lang === 'en-US')
      || voices[0]
    if (pick) utter.voice = pick
    utter.onend = () => onEnd && onEnd()
    utter.onerror = () => onEnd && onEnd()
    window.speechSynthesis.speak(utter)
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    loadVoice()
  } else {
    window.speechSynthesis.onvoiceschanged = loadVoice
  }
}

const ST = { IDLE: 'idle', LISTENING: 'listening', THINKING: 'thinking', SPEAKING: 'speaking' }

export default function VoiceAssistant() {
  const [open, setOpen]           = useState(false)
  const [status, setStatus]       = useState(ST.IDLE)
  const [liveText, setLiveText]   = useState('')
  const [history, setHistory]     = useState([])
  const [muted, setMuted]         = useState(false)
  const [error, setError]         = useState('')
  const finalRef   = useRef('')
  const recogRef   = useRef(null)
  const histRef    = useRef(null)
  const statusRef  = useRef(ST.IDLE)

  const setStatusBoth = s => { setStatus(s); statusRef.current = s }

  useEffect(() => {
    if (histRef.current) histRef.current.scrollTop = histRef.current.scrollHeight
  }, [history])

  useEffect(() => () => {
    window.speechSynthesis.cancel()
    recogRef.current?.abort()
  }, [])

  const handleAnswer = useCallback(async (said) => {
    if (!said.trim()) { setStatusBoth(ST.IDLE); return }
    setStatusBoth(ST.THINKING)
    setHistory(h => [...h, { role: 'user', text: said }])
    try {
      const r = await chatAPI.send(said)
      const ans = r.data.reply
      setHistory(h => [...h, { role: 'bot', text: ans }])
      if (!muted) {
        setStatusBoth(ST.SPEAKING)
        speakText(ans, () => setStatusBoth(ST.IDLE))
      } else {
        setStatusBoth(ST.IDLE)
      }
    } catch {
      setError('Could not get a response. Please try again.')
      setStatusBoth(ST.IDLE)
    }
  }, [muted])

  const startListening = () => {
    if (!SpeechRecognition) {
      setError('Voice input not supported. Please use Chrome or Edge.')
      return
    }
    setError('')
    setLiveText('')
    finalRef.current = ''

    const recog = new SpeechRecognition()
    recog.lang = 'en-US'
    recog.continuous = false
    recog.interimResults = true
    recog.maxAlternatives = 1
    recogRef.current = recog

    recog.onstart = () => setStatusBoth(ST.LISTENING)

    recog.onresult = e => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      if (final) finalRef.current += final
      setLiveText(finalRef.current || interim)
    }

    recog.onerror = e => {
      if (e.error === 'no-speech') setError('No speech detected. Tap mic and try again.')
      else if (e.error !== 'aborted') setError(`Error: ${e.error}. Try again.`)
      setStatusBoth(ST.IDLE)
    }

    recog.onend = () => {
      const said = finalRef.current.trim()
      if (said) {
        handleAnswer(said)
      } else {
        setStatusBoth(ST.IDLE)
      }
    }

    recog.start()
  }

  const stopListening = () => {
    recogRef.current?.stop()
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setStatusBoth(ST.IDLE)
  }

  const handleMicClick = () => {
    if (status === ST.LISTENING) stopListening()
    else if (status === ST.SPEAKING) stopSpeaking()
    else if (status === ST.IDLE) startListening()
  }

  const labels = {
    [ST.IDLE]:      'Tap mic and ask a question',
    [ST.LISTENING]: 'Listening... speak now',
    [ST.THINKING]:  'Getting answer...',
    [ST.SPEAKING]:  'Speaking... tap to stop',
  }

  const micGrad = {
    [ST.IDLE]:      'linear-gradient(135deg,#6d28d9,#4338ca)',
    [ST.LISTENING]: 'linear-gradient(135deg,#ef4444,#dc2626)',
    [ST.THINKING]:  'linear-gradient(135deg,#f59e0b,#d97706)',
    [ST.SPEAKING]:  'linear-gradient(135deg,#10b981,#059669)',
  }

  const micIcon = status === ST.LISTENING
    ? <FiMicOff style={{ color:'white', fontSize:26 }} />
    : <FiMic style={{ color:'white', fontSize:26 }} />

  return (
    <>
      <style>{`
        @keyframes va-slide { from{opacity:0;transform:translateY(14px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes va-ripple { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.4);opacity:0} }
        @keyframes va-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)} 60%{box-shadow:0 0 0 14px rgba(239,68,68,0)} }
        @keyframes va-wave   { 0%,100%{height:5px} 50%{height:22px} }
        @keyframes va-dot    { 0%,80%,100%{transform:scale(0.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
        .va-window { animation: va-slide .22s ease-out; }
        .va-pulse  { animation: va-pulse 1.3s infinite; }
        .va-scroll::-webkit-scrollbar { width:3px; }
        .va-scroll::-webkit-scrollbar-thumb { background:rgba(124,58,237,.4); border-radius:99px; }
      `}</style>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Voice Assistant"
        style={{
          position:'fixed', bottom:100, right:28, zIndex:9999,
          width:50, height:50, borderRadius:'50%', border:'none', cursor:'pointer',
          background: open ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'linear-gradient(135deg,#6d28d9,#4338ca)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 6px 24px rgba(109,40,217,.55)',
          transition:'transform .2s, box-shadow .2s',
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.12)';e.currentTarget.style.boxShadow='0 8px 28px rgba(109,40,217,.75)'}}
        onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 6px 24px rgba(109,40,217,.55)'}}
      >
        {open ? <FiX style={{color:'white',fontSize:18}}/> : <FiMic style={{color:'white',fontSize:18}}/>}
        <span style={{
          position:'absolute', top:-2, right:-2,
          width:14, height:14, borderRadius:'50%',
          background:'linear-gradient(135deg,#a78bfa,#818cf8)',
          border:'2px solid #0f0c29',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <HiSparkles style={{color:'white',fontSize:7}}/>
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="va-window" style={{
          position:'fixed', bottom:164, right:28, zIndex:9998,
          width:340, borderRadius:20,
          background:'linear-gradient(180deg,#1a1535 0%,#13102b 100%)',
          border:'1px solid rgba(124,58,237,.3)',
          boxShadow:'0 24px 64px rgba(0,0,0,.65)',
          overflow:'hidden'
        }}>

          {/* Header */}
          <div style={{
            padding:'13px 16px',
            background:'linear-gradient(135deg,rgba(109,40,217,.3),rgba(67,56,202,.2))',
            borderBottom:'1px solid rgba(255,255,255,.08)',
            display:'flex', alignItems:'center', gap:10
          }}>
            <div style={{
              width:38, height:38, borderRadius:12, flexShrink:0,
              background:'linear-gradient(135deg,#6d28d9,#4338ca)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 12px rgba(109,40,217,.4)'
            }}>
              <FiMic style={{color:'white',fontSize:17}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{color:'white',fontWeight:700,fontSize:14}}>Voice Assistant</span>
                <HiSparkles style={{color:'#a78bfa',fontSize:12}}/>
              </div>
              <span style={{color:'rgba(255,255,255,.4)',fontSize:11}}>Speak your course question</span>
            </div>
            <button onClick={()=>setMuted(m=>!m)} title={muted?'Unmute':'Mute'} style={{
              background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)',
              borderRadius:8, width:30, height:30, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color: muted ? '#f59e0b' : 'rgba(255,255,255,.5)'
            }}>
              {muted ? <FiVolumeX size={14}/> : <FiVolume2 size={14}/>}
            </button>
          </div>

          {/* Mic area */}
          <div style={{padding:'22px 16px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:14}}>

            {/* Mic button */}
            <div style={{position:'relative', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {status === ST.LISTENING && <>
                <span style={{position:'absolute',width:84,height:84,borderRadius:'50%',background:'rgba(239,68,68,.18)',animation:'va-ripple 1.4s infinite'}}/>
                <span style={{position:'absolute',width:84,height:84,borderRadius:'50%',background:'rgba(239,68,68,.12)',animation:'va-ripple 1.4s .5s infinite'}}/>
              </>}
              <button
                onClick={handleMicClick}
                className={status === ST.LISTENING ? 'va-pulse' : ''}
                style={{
                  width:72, height:72, borderRadius:'50%', border:'none', cursor:'pointer',
                  background: micGrad[status],
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: status === ST.LISTENING ? 'none' : '0 8px 24px rgba(109,40,217,.45)',
                  transition:'background .3s',
                  position:'relative', zIndex:1
                }}
              >
                {micIcon}
              </button>
            </div>

            {/* Wave bars */}
            {(status === ST.LISTENING || status === ST.SPEAKING) && (
              <div style={{display:'flex',gap:4,alignItems:'center',height:28}}>
                {[0,1,2,3,4,5,6].map(i=>(
                  <span key={i} style={{
                    width:4, borderRadius:99, display:'inline-block',
                    background: status === ST.LISTENING ? '#ef4444' : '#10b981',
                    animation:`va-wave .8s ${i*.1}s infinite ease-in-out`
                  }}/>
                ))}
              </div>
            )}

            {/* Thinking dots */}
            {status === ST.THINKING && (
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                {[0,1,2].map(i=>(
                  <span key={i} style={{
                    width:9, height:9, borderRadius:'50%', background:'#f59e0b', display:'inline-block',
                    animation:`va-dot .9s ${i*.2}s infinite`
                  }}/>
                ))}
              </div>
            )}

            {/* Status label */}
            <p style={{color:'rgba(255,255,255,.5)',fontSize:12,margin:0,textAlign:'center'}}>
              {labels[status]}
              {muted && status === ST.SPEAKING &&
                <span style={{color:'#f59e0b',marginLeft:6}}>(muted)</span>}
            </p>

            {/* Live transcript */}
            {liveText && (
              <div style={{
                width:'100%', padding:'9px 13px', borderRadius:12,
                background:'rgba(124,58,237,.12)', border:'1px solid rgba(124,58,237,.25)',
                fontSize:13, color:'#c4b5fd', lineHeight:1.5
              }}>
                <span style={{fontSize:10,color:'rgba(255,255,255,.3)',display:'block',marginBottom:3}}>YOU SAID</span>
                {liveText}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                width:'100%', padding:'8px 12px', borderRadius:10,
                background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)',
                fontSize:12, color:'#fca5a5'
              }}>{error}</div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{borderTop:'1px solid rgba(255,255,255,.07)'}}>
              <div className="va-scroll" ref={histRef} style={{
                maxHeight:190, overflowY:'auto',
                padding:'10px 14px', display:'flex', flexDirection:'column', gap:8
              }}>
                {history.map((h,i)=>(
                  <div key={i} style={{display:'flex', justifyContent: h.role==='user'?'flex-end':'flex-start'}}>
                    <div style={{
                      maxWidth:'86%', padding:'7px 12px',
                      borderRadius: h.role==='user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: h.role==='user'
                        ? 'linear-gradient(135deg,#6d28d9,#4338ca)'
                        : 'rgba(255,255,255,.07)',
                      border: h.role==='bot' ? '1px solid rgba(255,255,255,.08)' : 'none',
                      fontSize:12, color:'rgba(255,255,255,.88)', lineHeight:1.55
                    }}>
                      {h.text.replace(/\*\*/g,'')}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:'6px 14px 10px', display:'flex', justifyContent:'flex-end'}}>
                <button onClick={()=>{setHistory([]);setLiveText('');setError('')}} style={{
                  background:'none', border:'none', color:'rgba(255,255,255,.25)',
                  fontSize:11, cursor:'pointer'
                }}>Clear</button>
              </div>
            </div>
          )}

          {/* Hint */}
          <div style={{padding:'8px 16px 14px', borderTop: history.length?'none':'1px solid rgba(255,255,255,.06)'}}>
            <p style={{color:'rgba(255,255,255,.18)',fontSize:11,textAlign:'center',margin:0}}>
              Try: "What topics are in Machine Learning?"
            </p>
          </div>
        </div>
      )}
    </>
  )
}
