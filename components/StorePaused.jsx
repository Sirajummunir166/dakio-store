'use client'

/**
 * The shop while its owner starts it over (dakio-api DAKIO_START_OVER_PLAN.md
 * R8): closed for a few minutes with a "back soon" note, then it opens again
 * on its own. Shoppers aren't told why — only that it's short.
 */
export default function StorePaused({ store }) {
  const name = store?.name || ''
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fafafa', padding: '24px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 420 }}>
        {store?.logoUrl
          ? <img src={store.logoUrl} alt={name} style={{ maxHeight: 56, maxWidth: 180, objectFit: 'contain', margin: '0 auto 20px', display: 'block' }} />
          : name && <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 18 }}>{name}</div>}
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 10px' }}>
          We&apos;re updating the shop
        </h1>
        <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, margin: '0 0 6px' }}>
          Back in a few minutes. Please come back shortly.
        </p>
        <p lang="bn" style={{ color: '#555', fontSize: 15, lineHeight: 1.7, margin: '0 0 26px' }}>
          দোকানটি আপডেট হচ্ছে। কয়েক মিনিট পর আবার আসুন।
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 6, padding: '11px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
