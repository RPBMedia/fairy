import { useState, useRef, useEffect } from 'react'
import PageHeader from './PageHeader.jsx'

const SUGGESTIONS = [
  'Schedule a meeting with Jonas tomorrow at 10am',
  'Draft a follow-up email to the design team',
  'Send Sara a WhatsApp to confirm dinner',
  'Summarise my tasks for today',
]

export default function AskFairy({ onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setLoading(true)

    try {
      const history = [...messages, { role: 'user', content: userText }]
      const res = await fetch('http://localhost:3002/api/ask', {
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

  return (
    <PageHeader
      icon="◈"
      label="Ask Fairy"
      color="var(--accent)"
      bg="var(--accent-glow)"
      border="var(--accent-border)"
      onBack={onBack}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Suggestions (shown when empty) */}
        {messages.length === 0 && (
          <div style={{ marginBottom: 28 }} className="fade-in">
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Try asking</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20, maxHeight: 420, overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? 'var(--accent-glow)' : 'var(--bg-card)',
                  border: `1px solid ${m.role === 'user' ? 'var(--accent-border)' : 'var(--border)'}`,
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '10px 14px',
                  fontSize: 13,
                  color: m.role === 'user' ? 'var(--accent)' : 'var(--text-secondary)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '14px 14px 14px 4px', padding: '10px 14px',
                  fontSize: 13, color: 'var(--text-muted)',
                }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>✦ Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Ask Fairy anything..."
            rows={2}
            style={{
              flex: 1,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
              resize: 'none',
              lineHeight: 1.6,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() ? 'var(--accent-glow)' : 'var(--bg-card)',
              border: `1px solid ${input.trim() ? 'var(--accent-border)' : 'var(--border)'}`,
              borderRadius: 10,
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: input.trim() ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 16,
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >→</button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Enter to send · Shift+Enter for new line</p>
      </div>
    </PageHeader>
  )
}
