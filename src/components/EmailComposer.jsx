import { useState } from 'react'
import PageHeader from './PageHeader.jsx'

export default function EmailComposer({ onBack }) {
  const [form, setForm] = useState({ to: '', subject: '', body: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [aiLoading, setAiLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleAIDraft = async () => {
    if (!form.subject) return
    setAiLoading(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Write a professional, concise email body for the subject: "${form.subject}". ${form.to ? `It is addressed to ${form.to}.` : ''} Return only the email body text, no subject line, no greeting formalities needed beyond a natural opener.`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      setForm(f => ({ ...f, body: text }))
    } catch {
      // silently fail
    }
    setAiLoading(false)
  }

  const handleSend = async () => {
    setStatus('sending')
    try {
      const res = await fetch('http://localhost:3002/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setStatus('sent')
      setTimeout(() => {
        setStatus(null)
        setForm({ to: '', subject: '', body: '' })
      }, 2500)
    } catch (err) {
      setStatus({ error: err.message })
    }
  }

  return (
    <PageHeader
      icon="✉"
      label="Send Email"
      color="var(--teal)"
      bg="var(--teal-dim)"
      border="rgba(45,212,191,0.25)"
      onBack={onBack}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-in">
        <Field label="To">
          <input
            type="text"
            value={form.to}
            onChange={set('to')}
            placeholder="recipient@email.com"
            style={inputStyle}
          />
        </Field>
        <Field label="Subject">
          <input
            type="text"
            value={form.subject}
            onChange={set('subject')}
            placeholder="What's this about?"
            style={inputStyle}
          />
        </Field>
        <Field label="Body">
          <div style={{ position: 'relative' }}>
            <textarea
              value={form.body}
              onChange={set('body')}
              placeholder="Write your message..."
              rows={8}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
            />
            {form.subject && (
              <button
                onClick={handleAIDraft}
                disabled={aiLoading}
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  opacity: aiLoading ? 0.5 : 1,
                }}
              >
                {aiLoading ? 'Drafting...' : '✦ AI Draft'}
              </button>
            )}
          </div>
        </Field>

        {status === 'sent' ? (
          <div style={successBanner}>✓ Email sent successfully</div>
        ) : status?.error ? (
          <div style={{ ...successBanner, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            ✗ {status.error}
          </div>
        ) : (
          <button
            onClick={handleSend}
            disabled={!form.to || !form.subject || !form.body || status === 'sending'}
            style={sendBtn(status === 'sending')}
          >
            {status === 'sending' ? 'Sending...' : 'Send Email →'}
          </button>
        )}
      </div>
    </PageHeader>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 14px',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s',
}

const successBanner = {
  background: 'var(--teal-dim)',
  border: '1px solid rgba(45,212,191,0.3)',
  borderRadius: 'var(--radius-sm)',
  padding: '12px 16px',
  color: 'var(--teal)',
  fontSize: 14,
  fontWeight: 500,
}

const sendBtn = (loading) => ({
  background: 'var(--teal-dim)',
  border: '1px solid rgba(45,212,191,0.3)',
  borderRadius: 'var(--radius-sm)',
  padding: '12px 20px',
  color: 'var(--teal)',
  fontSize: 14,
  fontWeight: 500,
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.6 : 1,
  transition: 'all 0.15s',
  textAlign: 'center',
  alignSelf: 'flex-start',
  minWidth: 160,
})
