const NAV = [
  { id: 'dashboard', icon: '✦', label: 'Home' },
  { id: 'ask', icon: '◈', label: 'Ask Fairy' },
  { id: 'email', icon: '✉', label: 'Send Email' },
  { id: 'calendar', icon: '◷', label: 'Calendar' },
  { id: 'whatsapp', icon: '◎', label: 'WhatsApp' },
  { id: 'chatgpt', icon: '⟡', label: 'ChatGPT' },
]

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside style={{
      width: 220,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '28px 24px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #c084fc, #818cf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}>✦</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: 'var(--text-primary)',
            fontStyle: 'italic',
            letterSpacing: '-0.3px',
          }}>Fairy</span>
        </div>
        <p style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 6,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>Your day assistant</p>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 12px', flex: 1 }}>
        {NAV.map(item => {
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: active ? 'var(--accent-glow)' : 'transparent',
                border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: active ? 500 : 400,
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                marginBottom: 2,
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: 'var(--accent)',
          }}>✦</div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>Connected</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gmail · Calendar</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
