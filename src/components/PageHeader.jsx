export default function PageHeader({ icon, label, color, bg, border, onBack, children }) {
  return (
    <div style={{ padding: '40px 48px', maxWidth: 720, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--text-muted)',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 28,
          transition: 'color 0.15s',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Back
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }} className="fade-in">
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: bg,
          border: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          color,
        }}>{icon}</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--text-primary)',
        }}>{label}</h1>
      </div>
      {children}
    </div>
  )
}
