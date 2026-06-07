'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkoutPath } from '../lib/routes'

export default function ProductDetailClient({ store, product: p, slug, isCustomDomain }) {
  const router = useRouter()

  const [qty,             setQty]             = useState(1)
  const [activeImg,       setActiveImg]       = useState(p.imageUrl || null)
  const [ordered,         setOrdered]         = useState(false)
  const [copied,          setCopied]          = useState(false)
  const [accordion,       setAccordion]       = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  const currency    = store.currency === 'USD' ? '$' : 'Tk '
  const accent      = store.accentColor || '#111111'
  const allImgs     = [p.imageUrl, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean)
  const hasVariants = p.variants && p.variants.length > 0
  const needsVariant = hasVariants && !selectedVariant

  const activeVariant  = hasVariants ? selectedVariant : null
  const displayPrice   = activeVariant?.price != null ? activeVariant.price : p.sellingPrice
  const variantStock   = activeVariant ? activeVariant.stock : p.totalStock
  const inStock        = hasVariants
    ? (needsVariant ? true : (variantStock > 0))
    : (p.totalStock > 0)
  const oos = hasVariants ? (!needsVariant && variantStock <= 0) : (p.totalStock <= 0)

  const accordions = [
    {
      id: 'features', label: 'Features',
      content: (
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#555', lineHeight: 2 }}>
          {['Premium quality material', 'Comfortable fit', 'Easy to care for', 'Available in multiple sizes', 'Suitable for everyday use'].map(i => <li key={i}>{i}</li>)}
        </ul>
      ),
    },
    {
      id: 'care', label: 'Care Instructions',
      content: (
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#555', lineHeight: 2 }}>
          {['Machine wash cold', 'Do not bleach', 'Iron on medium heat', 'Air dry recommended'].map(i => <li key={i}>{i}</li>)}
        </ul>
      ),
    },
    {
      id: 'delivery', label: 'Delivery & Returns',
      content: (
        <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>
          Free delivery on orders above Tk 1,500. Standard delivery 2–5 business days. Returns accepted within 7 days of delivery.
        </div>
      ),
    },
  ]

  function addAndCheckout() {
    const variantId = activeVariant?.id || null
    const key       = `${p.id}_${variantId || 'default'}`
    const name      = activeVariant ? `${p.name} — ${activeVariant.name}` : p.name
    const sku       = activeVariant?.sku || p.sku || ''
    const unitPrice = displayPrice
    const item      = { key, productId: p.id, variantId, name, sku, unitPrice, qty, imageUrl: p.imageUrl }
    try {
      const existing = JSON.parse(localStorage.getItem(`dk_cart_${slug}`) || '[]')
      const idx = existing.findIndex(i => i.key === key)
      if (idx >= 0) { existing[idx].qty += qty } else { existing.push(item) }
      localStorage.setItem(`dk_cart_${slug}`, JSON.stringify(existing))
    } catch (_) {}
    setOrdered(true)
    router.push(checkoutPath(slug))
  }

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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href={isCustomDomain ? '/' : `/${slug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {store.logoUrl
            ? <img src={store.logoUrl} alt={store.name} style={{ height: '32px', objectFit: 'contain' }} />
            : <span style={{ fontSize: '17px', fontWeight: 900, color: '#111', letterSpacing: '-0.3px' }}>{store.name}</span>}
        </a>
        <a href={isCustomDomain ? '/' : `/${slug}`} style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textDecoration: 'none' }}>← Back</a>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '32px 16px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'start' }}>

          {/* Images */}
          <div>
            <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3f4f6' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeImg
                  ? <img src={activeImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ fontSize: '48px', color: '#d1d5db' }}>📦</div>}
              </div>
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
          <div>
            {p.category?.name && (
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>{p.category.name}</div>
            )}

            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', lineHeight: 1.25, margin: '0 0 12px', letterSpacing: '-0.3px' }}>{p.name}</h1>

            <div style={{ fontSize: '28px', fontWeight: 900, color: accent, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              {currency}{Number(displayPrice).toLocaleString('en-GB')}
            </div>

            {/* Stock badge */}
            {!hasVariants && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: inStock ? '#f0fdf4' : '#fef2f2', color: inStock ? '#16a34a' : '#dc2626', marginBottom: '20px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: inStock ? '#22c55e' : '#ef4444' }} />
                {inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            )}

            {/* Description */}
            {p.description && (
              <div
                style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, marginBottom: '24px' }}
                dangerouslySetInnerHTML={{ __html: p.description }}
              />
            )}

            {/* Variant selector */}
            {hasVariants && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>SELECT OPTION</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {p.variants.map(v => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)} disabled={v.stock <= 0}
                      style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600, border: `1.5px solid ${selectedVariant?.id === v.id ? accent : '#e0e0e0'}`, background: selectedVariant?.id === v.id ? accent : '#fff', color: selectedVariant?.id === v.id ? '#fff' : v.stock <= 0 ? '#d1d5db' : '#374151', borderRadius: '8px', cursor: v.stock <= 0 ? 'not-allowed' : 'pointer', textDecoration: v.stock <= 0 ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* "Select option" prompt */}
            {needsVariant && (
              <div style={{ padding: '12px 14px', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                Please select an option to continue
              </div>
            )}

            {/* Out of stock */}
            {oos && (
              <div style={{ padding: '12px 14px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '20px', textAlign: 'center' }}>
                OUT OF STOCK
              </div>
            )}

            {/* Qty + Order Now */}
            {!oos && !needsVariant && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Qty</div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', background: '#f9fafb', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#374151' }}>−</button>
                    <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#111' }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ width: '36px', height: '36px', background: '#f9fafb', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#374151' }}>+</button>
                  </div>
                </div>

                <button
                  onClick={addAndCheckout}
                  disabled={ordered}
                  style={{ width: '100%', padding: '14px', background: ordered ? '#9ca3af' : accent, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: ordered ? 'not-allowed' : 'pointer', letterSpacing: '-0.2px', transition: 'opacity 0.15s', marginBottom: '10px' }}>
                  {ordered ? 'Redirecting…' : `Order Now — ${currency}${Number(displayPrice * qty).toLocaleString('en-GB')}`}
                </button>
              </>
            )}

            {/* Copy link */}
            <button
              onClick={copyProductLink}
              style={{ width: '100%', padding: '11px', background: copied ? '#f0fdf4' : '#f9fafb', border: `1px solid ${copied ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: copied ? '#16a34a' : '#6b7280', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
              {copied ? '✓ Link Copied!' : '🔗 Copy Product Link'}
            </button>

            {/* Accordions */}
            {accordions.map(a => (
              <div key={a.id} style={{ borderTop: '1px solid #e8e8e8' }}>
                <button onClick={() => setAccordion(accordion === a.id ? null : a.id)}
                  style={{ width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#111', textAlign: 'left' }}>
                  {a.label}
                  <span style={{ transform: accordion === a.id ? 'rotate(90deg)' : 'none', transition: '0.2s', fontSize: '16px', color: '#9ca3af' }}>›</span>
                </button>
                {accordion === a.id && <div style={{ paddingBottom: '16px' }}>{a.content}</div>}
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e8e8e8' }} />

            {/* SKU */}
            {p.sku && (
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#9ca3af' }}>SKU: {p.sku}</div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
