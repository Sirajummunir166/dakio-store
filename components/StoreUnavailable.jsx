'use client'

export default function StoreUnavailable() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#fafafa',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 400 }}>
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          backgroundColor: '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
        }}>
          &#8987;
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 10px' }}>
          Store Temporarily Unavailable
        </h1>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
          This store is having a brief interruption. Please try again in a moment.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '11px 28px',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          Try Again
        </button>
        <p style={{ marginTop: 24, fontSize: 13, color: '#aaa' }}>
          If this continues, please contact the store owner.
        </p>
      </div>
    </div>
  )
}
