import { useState } from 'react'
import PageHeader from './PageHeader.jsx'

const CONTACTS = [
  { name: 'Mia', phone: '+46701234567' },
  { name: 'Jonas', phone: '+46709876543' },
  { name: 'Sara', phone: '+46705551234' },
]

export default function WhatsAppComposer({ onBack }) {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const handleAIDraft = async () => {
    setAiLoading(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Write a friendly, natural WhatsApp message. Context: ${message || 'a casual check-in'}. Keep it under 50 words, conversational, no emojis. Return only the message text.`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      setMessage(text)
    } catch {}
    setAiLoading(false)
  }

  const handleSend = async () => {
    setStatus('sending')
    // In production: calls WhatsApp Business API / MCP connector
    await new Promise(r => setTimeout(r, 1000))
    setStatus('sent')
    setTimeout(() => { setStatus(null); setPhone(''); setMessage('') }, 2500)
  }

  return (
    <PageHeader
      icon="◎"
      label="WhatsApp"
      color="var(--green)"
      bg="var(--green-dim)"
      border="rgba(74,222,128,0.25)"
      onBack={onBack}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-in">

        {/* Quick contacts */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Quick Contacts</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CONTACTS.map(c => (
              <button
                key={c.phone}
                onClick={() => setPhone(c.phone)}
                style={{
                  background: phone === c.phone ? 'var(--green-dim)' : 'var(--bg-card)',
                  border: `1px solid ${phone === c.phone ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  color: phone === c.phone ? 'var(--green)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+46 70 000 00 00"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>
            Message
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
            />
            <button
              onClick={handleAIDraft}
              disabled={aiLoading}
              style={{
                position: 'absolute', bottom: 10, right: 10,
                background: 'var(--accent-glow)', border: '1px solid var(--accent-border)',
                color: 'var(--accent)', borderRadius: 6, padding: '5px 10px',
                fontSize: 11, fontWeight: 500, cursor: 'pointer', opacity: aiLoading ? 0.5 : 1,
              }}
            >
              {aiLoading ? 'Writing...' : '✦ AI Write'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Note: Requires WhatsApp Business API or a WhatsApp MCP connector
          </p>
        </div>

        {status === 'sent' ? (
          <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '12px 16px', color: 'var(--green)', fontSize: 14, fontWeight: 500 }}>
            ✓ Message sent via WhatsApp
          </div>
        ) : (
          <button
            onClick={handleSend}
            disabled={!phone || !message || status === 'sending'}
            style={{
              background: 'var(--green-dim)', border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 8, padding: '12px 20px', color: 'var(--green)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start', minWidth: 180,
              opacity: (!phone || !message) ? 0.5 : 1,
            }}
          >
            {status === 'sending' ? 'Sending...' : 'Send Message →'}
          </button>
        )}
      </div>
    </PageHeader>
  )
}

const inputStyle = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none',
}
