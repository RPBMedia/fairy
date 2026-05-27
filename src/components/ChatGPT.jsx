import { useState, useRef, useEffect } from 'react'

const STORAGE_INSTRUCTIONS = 'fairy_chatgpt_instructions'
const DEFAULT_INSTRUCTIONS = 'You are a helpful, concise assistant.'

export default function ChatGPT({ onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [instructions, setInstructions] = useState(
    () => localStorage.getItem(STORAGE_INSTRUCTIONS) || DEFAULT_INSTRUCTIONS
  )
  const [instructionsDraft, setInstructionsDraft] = useState(instructions)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Add your OpenAI API key to the .env file as VITE_OPENAI_API_KEY, then restart the dev server.',
      }])
      setLoading(false)
      return
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: instructions }, ...history],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'No response.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }])
    }

    setLoading(false)
  }

  const saveInstructions = () => {
    setInstructions(instructionsDraft)
    localStorage.setItem(STORAGE_INSTRUCTIONS, instructionsDraft)
    setShowSettings(false)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={onBack} style={backBtnStyle}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--amber-dim)',
              border: '1px solid rgba(251,191,36,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'var(--amber)',
            }}>⟡</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 22,
              fontStyle: 'italic', fontWeight: 400, color: 'var(--text-primary)',
            }}>ChatGPT</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              style={iconBtnStyle}
              title="Clear conversation"
            >
              ↺ Clear
            </button>
          )}
          <button
            onClick={() => { setInstructionsDraft(instructions); setShowSettings(s => !s) }}
            style={{ ...iconBtnStyle, color: showSettings ? 'var(--amber)' : undefined }}
            title="Custom instructions"
          >
            ⚙ Instructions
          </button>
        </div>
      </div>

      {/* Custom instructions panel */}
      {showSettings && (
        <div style={{
          padding: '16px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}>
          <label style={labelStyle}>Custom Instructions (system prompt)</label>
          <textarea
            value={instructionsDraft}
            onChange={e => setInstructionsDraft(e.target.value)}
            rows={3}
            placeholder="Describe how ChatGPT should behave — your preferences, background, tone..."
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveInstructions} style={primaryBtnStyle}>Save</button>
            <button onClick={() => setShowSettings(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, lineHeight: 2 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⟡</div>
            <div>Your personal ChatGPT</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {instructions === DEFAULT_INSTRUCTIONS
                ? 'Set custom instructions via ⚙ to personalize responses'
                : 'Custom instructions active'}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? 'var(--amber-dim)' : 'var(--bg-card)',
              border: msg.role === 'user'
                ? '1px solid rgba(251,191,36,0.25)'
                : '1px solid var(--border)',
              color: msg.role === 'user' ? 'var(--amber)' : 'var(--text-secondary)',
              fontSize: 14,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '14px 14px 14px 4px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: 13,
            }}>
              <span style={{ animation: 'pulse 1s infinite' }}>◉</span> Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '16px 32px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message ChatGPT... (Shift+Enter for new line)"
          rows={1}
          style={{
            ...inputStyle,
            flex: 1,
            resize: 'none',
            maxHeight: 120,
            overflowY: 'auto',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            ...primaryBtnStyle,
            opacity: !input.trim() || loading ? 0.4 : 1,
            flexShrink: 0,
          }}
        >
          Send →
        </button>
      </div>
    </div>
  )
}

const backBtnStyle = {
  fontSize: 12, color: 'var(--text-muted)', fontWeight: 500,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
}

const iconBtnStyle = {
  fontSize: 12, color: 'var(--text-muted)', fontWeight: 500,
  background: 'none', border: '1px solid var(--border)',
  borderRadius: 6, cursor: 'pointer', padding: '5px 10px',
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 500,
  color: 'var(--text-muted)', letterSpacing: '0.06em',
  textTransform: 'uppercase', marginBottom: 7,
}

const inputStyle = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', lineHeight: 1.7, boxSizing: 'border-box',
}

const primaryBtnStyle = {
  background: 'var(--amber-dim)', border: '1px solid rgba(251,191,36,0.3)',
  borderRadius: 8, padding: '10px 18px', color: 'var(--amber)',
  fontSize: 14, fontWeight: 500, cursor: 'pointer',
}

const ghostBtnStyle = {
  background: 'none', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 18px', color: 'var(--text-muted)',
  fontSize: 14, cursor: 'pointer',
}
