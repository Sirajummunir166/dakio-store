'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductDetailClient({ store, product: p, slug, isCustomDomain }) {
  const router = useRouter()
  const [qty,       setQty]       = useState(1)
  const [activeImg, setActiveImg] = useState(p.imageUrl || null)
  const [ordered,   setOrdered]   = useState(false)
  const [copied,    setCopied]    = useState(false)

  const currency = store.currency === 'USD' ? '$' : 'Tk '
  const accent   = store.accentColor || '#111111'
  const allImgs  = [p.imageUrl, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean)
  const inStock  = p.totalStock > 0 || p.variants?.length > 0

  function copyProductLink() {
    const url = window.location.href
    navigator.clipboard.writeText(url).catch(() => {
      try {
        const el = document.createElement('textarea')
        el.value = url; el.style.position = 'fixed'; el.style.opacity = '0'
        document.body.appendChild(el); el.select(); document.execCommand('copy')
        document.body.removeChild(el)
      } catch (_) {}
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function addAndCheckout() {
    const key  = `${p.id}_default`
    const item = { key, productId: p.id, variantId: null, name: p.name, sku: p.sku || '', unitPrice: p.sellingPrice, qty, imageUrl: p.imageUrl }
    try {
      const existing = JSON.parse(localStorage.getItem(`dk_cart_${slug}`) || '[]')
      const idx = existing.findIndex(i => i.key === key)
      if (idx >= 0) { existing[idx].qty += qty } else { existing.push(item) }
      localStorage.setItem(`dk_cart_${slug}`, JSON.stringify(existing))
    } catch (_) {}
    setOrdered(true)
    router.push(isCustomDomain ? '/checkout' : `/${slug}/checkout`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href={isCustomDomain ? '/' : `/${slug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {store.logoUrl
            ? <img src={store.logoUrl} alt={store.name} style={{ height: '32px', objectFit: 'contain' }} />
            : <span style={{ fontSize: '17px', fontWeight: 900, color: '#111', letterSpacing: '-0.3px' }}>{store.name}</span>}
        </a>
        <a href={isCustomDomain ? '/' : `/${slug}`} style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ← Back to store
        </a>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>

          {/* Images */}
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div style={{ width: '100%', aspectRatio: '1', background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeImg
                ? <img src={activeImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ fontSize: '48px', color: '#d1d5db' }}>📦</div>}
            </div>
            {allImgs.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {allImgs.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(img)}
                    style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${activeImg === img ? accent : '#e5e7eb'}`, cursor: 'pointer', flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            {p.category?.name && (
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{p.category.name}</div>
            )}

            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', lineHeight: 1.3, margin: '0 0 12px', letterSpacing: '-0.3px' }}>{p.name}</h1>

            <div style={{ fontSize: '28px', fontWeight: 900, color: accent, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              {currency}{Number(p.sellingPrice).toLocaleString('en-GB')}
            </div>

            {/* Stock badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: inStock ? '#f0fdf4' : '#fef2f2', color: inStock ? '#16a34a' : '#dc2626', marginBottom: '20px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: inStock ? '#22c55e' : '#ef4444' }} />
              {inStock ? 'In Stock' : 'Out of Stock'}
            </div>

            {/* Description */}
            {p.description && (
              <div
                style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, marginBottom: '24px' }}
                dangerouslySetInnerHTML={{ __html: p.description }}
              />
            )}

            {/* Qty selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Qty</div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', background: '#f9fafb', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#374151' }}>−</button>
                <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#111' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: '36px', height: '36px', background: '#f9fafb', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#374151' }}>+</button>
              </div>
            </div>

            {/* Order button */}
            <button
              onClick={addAndCheckout}
              disabled={!inStock || ordered}
              style={{ width: '100%', padding: '14px', background: inStock ? accent : '#d1d5db', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: inStock ? 'pointer' : 'not-allowed', letterSpacing: '-0.2px', transition: 'opacity 0.15s' }}>
              {ordered ? 'Redirecting…' : inStock ? 'Order Now' : 'Out of Stock'}
            </button>

            {/* Share / Copy link */}
            <button
              onClick={copyProductLink}
              style={{ width: '100%', marginTop: '10px', padding: '11px', background: copied ? '#f0fdf4' : '#f9fafb', border: `1px solid ${copied ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: copied ? '#16a34a' : '#6b7280', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {copied ? '✓ Link Copied!' : '🔗 Copy Product Link'}
            </button>

            {/* SKU */}
            {p.sku && (
              <div style={{ marginTop: '14px', fontSize: '11px', color: '#9ca3af' }}>SKU: {p.sku}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
