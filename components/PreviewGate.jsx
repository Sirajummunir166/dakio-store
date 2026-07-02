export default function PreviewGate({ error }) {
  const messages = {
    missing_token: 'A preview token is required. Open preview from your Dakio dashboard.',
    invalid_or_expired: 'This preview link has expired or is invalid. Generate a new link from Settings.',
    invalid_token: 'This preview link is invalid.',
    theme_mismatch: 'The preview token does not match this theme.',
    slug_mismatch: 'This preview link is for a different store.',
    invalid_theme: 'This theme preview is not available.',
    server_misconfigured: 'Preview is temporarily unavailable.',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '420px', textAlign: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px 28px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '8px' }}>Preview unavailable</div>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
          {messages[error] || 'Unable to open this preview.'}
        </p>
      </div>
    </div>
  )
}
