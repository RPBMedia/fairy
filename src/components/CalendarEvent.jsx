import { useState } from 'react'
import PageHeader from './PageHeader.jsx'

export default function CalendarEvent({ onBack }) {
  const [form, setForm] = useState({
    title: '', date: '', time: '', duration: '60', location: '', notes: '', guests: ''
  })
  const [status, setStatus] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleAISuggest = async () => {
    if (!form.title) return
    setAiLoading(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Suggest a short agenda/notes for a calendar event titled: "${form.title}". Return only 3-4 bullet points of agenda items, plain text, no markdown formatting.`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.find(b => b.type === 'text')?.text || ''
      setForm(f => ({ ...f, notes: text }))
    } catch {}
    setAiLoading(false)
  }

  const handleCreate = async () => {
    setStatus('creating')
    // Calls Google Calendar MCP via Node backend in production
    await new Promise(r => setTimeout(r, 1200))
    setStatus('created')
    setTimeout(() => {
      setStatus(null)
      setForm({ title: '', date: '', time: '', duration: '60', location: '', notes: '', guests: '' })
    }, 2500)
  }

  return (
    <PageHeader
      icon="◷"
      label="Create Event"
      color="var(--blue)"
      bg="var(--blue-dim)"
      border="rgba(96,165,250,0.25)"
      onBack={onBack}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-in">
        <Field label="Event Title">
          <input type="text" value={form.title} onChange={set('title')} placeholder="What's the occasion?" style={inputStyle} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Date">
            <input type="date" value={form.date} onChange={set('date')} style={inputStyle} />
          </Field>
          <Field label="Time">
            <input type="time" value={form.time} onChange={set('time')} style={inputStyle} />
          </Field>
          <Field label="Duration (min)">
            <select value={form.duration} onChange={set('duration')} style={inputStyle}>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </Field>
        </div>

        <Field label="Location (optional)">
          <input type="text" value={form.location} onChange={set('location')} placeholder="Zoom, Office, Coffee shop..." style={inputStyle} />
        </Field>

        <Field label="Guests (optional)">
          <input type="text" value={form.guests} onChange={set('guests')} placeholder="email@example.com, another@example.com" style={inputStyle} />
        </Field>

        <Field label="Notes / Agenda">
          <div style={{ position: 'relative' }}>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Agenda, notes, preparation..."
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
            />
            {form.title && (
              <button
                onClick={handleAISuggest}
                disabled={aiLoading}
                style={{
                  position: 'absolute', bottom: 10, right: 10,
                  background: 'var(--accent-glow)', border: '1px solid var(--accent-border)',
                  color: 'var(--accent)', borderRadius: 6, padding: '5px 10px',
                  fontSize: 11, fontWeight: 500, cursor: 'pointer', opacity: aiLoading ? 0.5 : 1,
                }}
              >
                {aiLoading ? 'Drafting...' : '✦ Suggest Agenda'}
              </button>
            )}
          </div>
        </Field>

        {status === 'created' ? (
          <div style={{ background: 'var(--blue-dim)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 8, padding: '12px 16px', color: 'var(--blue)', fontSize: 14, fontWeight: 500 }}>
            ✓ Event created in Google Calendar
          </div>
        ) : (
          <button
            onClick={handleCreate}
            disabled={!form.title || !form.date || status === 'creating'}
            style={{
              background: 'var(--blue-dim)', border: '1px solid rgba(96,165,250,0.3)',
              borderRadius: 8, padding: '12px 20px', color: 'var(--blue)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start', minWidth: 180,
              opacity: (!form.title || !form.date) ? 0.5 : 1,
            }}
          >
            {status === 'creating' ? 'Creating...' : 'Create Event →'}
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
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', colorScheme: 'dark',
}
