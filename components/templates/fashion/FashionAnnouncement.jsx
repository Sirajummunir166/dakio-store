'use client'

export default function FashionAnnouncement({ config, storeMessage, onDismiss }) {
  const enabled = config.announcement?.enabled !== false
  const text = config.announcement?.text || storeMessage
  if (!enabled || !text) return null

  return (
    <div className="ft-announce">
      {text}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>×</button>
      )}
    </div>
  )
}
