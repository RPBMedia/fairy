import { useState, useRef, useEffect } from 'react'
import PageHeader from './PageHeader.jsx'

const EXAMPLES = [
  'Add dinner tonight at 20:00 at Restaurant X with my wife',
  'Schedule a dentist appointment next Monday at 10am for 1 hour',
  "What's on my calendar this week?",
  'Delete my meeting on Friday',
  "Move Thursday's call to Friday at the same time",
]

export default function CalendarEvent({ onBack }) {
  const [messages, setMessages] = useState([]) // { role: 'user'|'assistant', content }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3002/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `✗ ${err.message}` }])
    }
    setLoading(false)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (input.trim()) send(input.trim()) }
  }

  return (
    <PageHeader
      icon="◷"
      label="Calendar"
      color="var(--blue)"
      bg="var(--blue-dim)"
      border="rgba(96,165,250,0.25)"
      onBack={onBack}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-in">

        {/* Conversation */}
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={labelStyle}>Examples</p>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => send(ex)}
                style={exampleBtn}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'; e.currentTarget.style.color = 'var(--blue)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                {ex}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user' ? 'var(--blue-dim)' : 'var(--bg-card)',
                  border: msg.role === 'user' ? '1px solid rgba(96,165,250,0.25)' : '1px solid var(--border)',
                  color: msg.role === 'user' ? 'var(--blue)' : 'var(--text-secondary)',
                  fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '12px 12px 12px 4px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: 13,
                }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>◉</span> Working...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={messages.length === 0 ? 'Add dinner tonight at 20:00...' : 'Reply...'}
            rows={1}
            style={{ ...inputStyle, flex: 1, resize: 'none' }}
          />
          <button
            onClick={() => input.trim() && send(input.trim())}
            disabled={!input.trim() || loading}
            style={{ ...sendBtn, opacity: !input.trim() || loading ? 0.4 : 1 }}
          >
            {loading ? '...' : '→'}
          </button>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={clearBtn} title="Clear">↺</button>
          )}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -8 }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </PageHeader>
  )
}

const labelStyle = {
  fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2,
}

const inputStyle = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
}

const exampleBtn = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 7,
  padding: '8px 12px', color: 'var(--text-muted)', fontSize: 13,
  cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, color 0.15s',
}

const sendBtn = {
  background: 'var(--blue-dim)', border: '1px solid rgba(96,165,250,0.3)',
  borderRadius: 8, padding: '10px 16px', color: 'var(--blue)',
  fontSize: 16, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
}

const clearBtn = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 8,
  padding: '10px 12px', color: 'var(--text-muted)', fontSize: 14,
  cursor: 'pointer', flexShrink: 0,
}
