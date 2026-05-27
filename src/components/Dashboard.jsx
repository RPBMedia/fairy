const ACTIONS = [
  {
    id: 'ask',
    icon: '◈',
    label: 'Ask Fairy',
    desc: 'Chat with your AI assistant',
    color: 'var(--accent)',
    bg: 'var(--accent-glow)',
    border: 'var(--accent-border)',
  },
  {
    id: 'email',
    icon: '✉',
    label: 'Send Email',
    desc: 'Compose via Gmail',
    color: 'var(--teal)',
    bg: 'var(--teal-dim)',
    border: 'rgba(45,212,191,0.25)',
  },
  {
    id: 'calendar',
    icon: '◷',
    label: 'Create Event',
    desc: 'Add to Google Calendar',
    color: 'var(--blue)',
    bg: 'var(--blue-dim)',
    border: 'rgba(96,165,250,0.25)',
  },
  {
    id: 'whatsapp',
    icon: '◎',
    label: 'WhatsApp',
    desc: 'Send a message',
    color: 'var(--green)',
    bg: 'var(--green-dim)',
    border: 'rgba(74,222,128,0.25)',
  },
  {
    id: 'chatgpt',
    icon: '⟡',
    label: 'Ask ChatGPT',
    desc: 'Get a second opinion',
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
    border: 'rgba(251,191,36,0.25)',
  },
]

const RECENT = [
  { type: 'email', label: 'Email to Jonas re: Q3 report', time: '2h ago', color: 'var(--teal)', icon: '✉' },
  { type: 'calendar', label: 'Team standup — Friday 9am', time: '5h ago', color: 'var(--blue)', icon: '◷' },
  { type: 'whatsapp', label: 'WhatsApp to Mia: "Running late"', time: 'Yesterday', color: 'var(--green)', icon: '◎' },
]

export default function Dashboard({ onNavigate }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ padding: '40px 48px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }} className="fade-in">
        <p style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 38,
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          {greeting} ✦
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>
          What would you like to do today?
        </p>
      </div>

      {/* Action Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 14,
        marginBottom: 48,
      }}>
        {ACTIONS.map((action, i) => (
          <button
            key={action.id}
            onClick={() => onNavigate(action.id)}
            className="fade-in"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius)',
              padding: '20px',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              animationDelay: `${i * 0.06}s`,
              animationFillMode: 'both',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-hover)'
              e.currentTarget.style.borderColor = action.border
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-card)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: action.bg,
              border: `1px solid ${action.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              color: action.color,
              marginBottom: 14,
            }}>{action.icon}</div>
            <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{action.label}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <p style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>Recent</p>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          {RECENT.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              borderBottom: i < RECENT.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ color: item.color, fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
