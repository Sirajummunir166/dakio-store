'use client'

export default function PreviewBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: '#92400e',
        color: '#fff',
        textAlign: 'center',
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      Preview Mode — Not visible to customers
    </div>
  )
}
