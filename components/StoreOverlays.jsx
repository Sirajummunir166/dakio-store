'use client'
import { useState } from 'react'
import { X, ChevronRight, ShoppingBag, Package } from 'lucide-react'
import { fmt } from '../lib/storefront'

/* ── Announcement Bar ────────────────────────────────────── */
export function AnnouncementBar({ message, accent = '#111' }) {
  const [visible, setVisible] = useState(true)
  if (!message || !visible) return null
  return (
    <div style={{ background: accent, color: '#fff', fontSize: '12px', fontWeight: 600, textAlign: 'center', padding: '8px 40px', position: 'relative', letterSpacing: '0.03em' }}>
      {message}
      <button onClick={() => setVisible(false)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', lineHeight: 1, display:'flex', alignItems:'center' }}><X size={14} /></button>
    </div>
  )
}

/* ── Social Links Footer ─────────────────────────────────── */
export function SocialFooter({ store, slug, accent = '#111' }) {
  const { facebookUrl, instagramUrl, whatsappNumber } = store || {}
  const trackUrl = slug ? `/${slug}/track` : '/track'
  return (
    <div style={{ borderTop: '1px solid #e5e7eb' }}>
      {(facebookUrl || instagramUrl || whatsappNumber) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '16px 20px 10px' }}>
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noreferrer" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              Facebook
            </a>
          )}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noreferrer" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              Instagram
            </a>
          )}
          {whatsappNumber && (
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" style={{ color: '#16a34a', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              WhatsApp
            </a>
          )}
        </div>
      )}
      <div style={{ textAlign: 'center', padding: '10px 20px 20px' }}>
        <a href={trackUrl} style={{ fontSize: '12px', fontWeight: 600, color: accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Track My Order
        </a>
      </div>
    </div>
  )
}

/* ── Cart Drawer ─────────────────────────────────────────── */
export function CartDrawer({ cart, products, store, cartCount, cartTotal, cartOpen, setCartOpen, changeQty, removeFromCart, setView, accent = '#111' }) {
  if (!cartOpen) return null
  const FONT = "'Inter', sans-serif"
  return (
    <>
      <div onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 299 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(400px, 100vw)', background: '#fff', zIndex: 300, display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: '15px', color: '#111' }}>Cart ({cartCount})</span>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}><X size={18} /></button>
        </div>
        {cart.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <ShoppingBag size={40} strokeWidth={1} color="#ccc" />
            <div style={{ fontSize: '14px', color: '#aaa' }}>Your cart is empty</div>
            <button onClick={() => setCartOpen(false)}
              style={{ padding: '10px 24px', background: accent, color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: '4px' }}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {cart.map(item => {
                const prod = products.find(x => x.id === item.productId)
                const itemKey = item.key || item.productId
                return (
                  <div key={itemKey} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ width: '64px', height: '80px', background: '#f0f0f0', flexShrink: 0, overflow: 'hidden' }}>
                      {prod?.imageUrl ? <img src={prod.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}><Package size={22} color="#ccc" strokeWidth={1.5} /></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3, marginBottom: '4px', color: '#111' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>{fmt(item.unitPrice, store?.currency)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', width: 'fit-content' }}>
                        <button onClick={() => changeQty(itemKey, -1)} style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>−</button>
                        <span style={{ fontSize: '13px', fontWeight: 700, width: '28px', textAlign: 'center', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', lineHeight: '28px' }}>{item.qty}</span>
                        <button onClick={() => changeQty(itemKey, 1)} style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <button onClick={() => removeFromCart(itemKey)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc' }}><X size={13} /></button>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{fmt(item.qty * item.unitPrice, store?.currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#888' }}>
                <span>Subtotal</span><span>{fmt(cartTotal, store?.currency)}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', marginBottom: '12px' }}>Shipping calculated at checkout</div>
              <button onClick={() => { setCartOpen(false); setView('checkout') }}
                style={{ width: '100%', padding: '14px', background: accent, color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Checkout — {fmt(cartTotal, store?.currency)}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

/* ── Quick Add Modal ─────────────────────────────────────── */
export function QuickAddModal({ product, store, accent = '#111', onAdd, onClose, onFull }) {
  const [qty, setQty] = useState(1)
  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? null : undefined)
  const activeVariant = hasVariants ? selectedVariant : null
  const displayPrice = activeVariant?.price != null ? activeVariant.price : product.sellingPrice
  const variantStock = activeVariant ? activeVariant.stock : product.totalStock
  const oos = variantStock !== undefined && variantStock <= 0
  const needsVariant = hasVariants && !selectedVariant
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 249 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', zIndex: 250, width: 'min(460px, calc(100vw - 24px))', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}><X size={14} /></button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f0f0f0' }}>
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}><Package size={36} color="#ccc" strokeWidth={1.2} /></div>}
          </div>
          <div style={{ padding: '22px 18px', display: 'flex', flexDirection: 'column' }}>
            {product.category && <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{product.category.name}</div>}
            <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px', color: '#111' }}>{product.name}</div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: accent }}>{fmt(displayPrice, store?.currency)}</div>
            {hasVariants && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' }}>Select Option</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {product.variants.map(v => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)} disabled={v.stock <= 0}
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, border: `1.5px solid ${selectedVariant?.id === v.id ? accent : '#e0e0e0'}`, background: selectedVariant?.id === v.id ? accent : '#fff', color: selectedVariant?.id === v.id ? '#fff' : v.stock <= 0 ? '#d1d5db' : '#374151', borderRadius: '6px', cursor: v.stock <= 0 ? 'not-allowed' : 'pointer', textDecoration: v.stock <= 0 ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {needsVariant ? (
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>Please select an option above</div>
            ) : !oos ? (
              <>
                <div style={{ display: 'flex', border: '1px solid #e0e0e0', marginBottom: '12px', width: 'fit-content' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>−</button>
                  <span style={{ fontSize: '13px', fontWeight: 700, width: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
                </div>
                <button onClick={() => onAdd(product, qty, activeVariant)} style={{ padding: '11px', background: accent, color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', marginBottom: '8px' }}>ADD TO CART</button>
              </>
            ) : <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '12px' }}>SOLD OUT</div>}
            <button onClick={onFull} style={{ padding: '9px', background: 'transparent', color: '#666', border: '1px solid #e0e0e0', fontSize: '11px', cursor: 'pointer' }}>View Full Details</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Product Detail Page ─────────────────────────────────── */
export function ProductDetailPage({ product, store, accent = '#111', onAdd, onClose }) {
  const [qty, setQty]         = useState(1)
  const [activeThumb]         = useState(0)
  const [accordion, setAcc]   = useState(null)
  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? null : undefined)
  const activeVariant = hasVariants ? selectedVariant : null
  const displayPrice = activeVariant?.price != null ? activeVariant.price : product.sellingPrice
  const variantStock = activeVariant ? activeVariant.stock : product.totalStock
  const oos = variantStock !== undefined && variantStock <= 0
  const needsVariant = hasVariants && !selectedVariant

  const accordions = [
    { id: 'features', label: 'Features', content: <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#555', lineHeight: 2 }}>{['Premium quality material','Comfortable fit','Easy to care for','Available in multiple sizes','Suitable for everyday use'].map(i => <li key={i}>{i}</li>)}</ul> },
    { id: 'care', label: 'Care Instructions', content: <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#555', lineHeight: 2 }}>{['Machine wash cold','Do not bleach','Iron on medium heat','Air dry recommended'].map(i => <li key={i}>{i}</li>)}</ul> },
    { id: 'delivery', label: 'Delivery & Returns', content: <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>Free delivery on orders above Tk 1,500. Standard delivery 2-5 business days. Returns accepted within 7 days of delivery.</div> },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 200, overflowY: 'auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #e8e8e8', zIndex: 10, padding: '0 24px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{ fontSize: '13px', color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
        <span style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>{store?.name}</span>
        <div style={{ width: '60px' }} />
      </div>
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '56px', alignItems: 'start' }}>
          <div>
            <div style={{ width: '100%', paddingBottom: '125%', position: 'relative', background: '#f0f0f0', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}><Package size={64} color="#ccc" strokeWidth={1} /></div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ paddingBottom: '125%', position: 'relative', background: '#f0f0f0', overflow: 'hidden', outline: activeThumb === i ? `2px solid ${accent}` : '2px solid transparent', outlineOffset: '2px' }}>
                  <div style={{ position: 'absolute', inset: 0 }}>
                    {product.imageUrl && <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeThumb === i ? 1 : 0.55 }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {product.category && <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', marginBottom: '10px' }}>{product.category.name}</div>}
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.3px' }}>{product.name}</h1>
            <div style={{ fontSize: '24px', fontWeight: 900, color: accent, marginBottom: '20px' }}>{fmt(displayPrice, store?.currency)}</div>
            {product.description && <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7, marginBottom: '24px' }}>{product.description}</p>}
            {hasVariants && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Select Option</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {product.variants.map(v => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)} disabled={v.stock <= 0}
                      style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600, border: `1.5px solid ${selectedVariant?.id === v.id ? accent : '#e0e0e0'}`, background: selectedVariant?.id === v.id ? accent : '#fff', color: selectedVariant?.id === v.id ? '#fff' : v.stock <= 0 ? '#d1d5db' : '#374151', borderRadius: '8px', cursor: v.stock <= 0 ? 'not-allowed' : 'pointer', textDecoration: v.stock <= 0 ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {needsVariant ? (
              <div style={{ padding: '12px', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>Please select an option to continue</div>
            ) : !oos ? (
              <>
                <div style={{ display: 'flex', border: '1px solid #e0e0e0', marginBottom: '14px', width: 'fit-content' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>−</button>
                  <span style={{ fontSize: '15px', fontWeight: 700, width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: '40px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>+</button>
                </div>
                <button onClick={() => onAdd(product, qty, activeVariant)} style={{ width: '100%', padding: '15px', background: accent, color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>
                  Add to Cart — {fmt(displayPrice * qty, store?.currency)}
                </button>
              </>
            ) : <div style={{ padding: '14px', background: '#fee2e2', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '24px', textAlign: 'center' }}>OUT OF STOCK</div>}
            {accordions.map(a => (
              <div key={a.id} style={{ borderTop: '1px solid #e8e8e8' }}>
                <button onClick={() => setAcc(accordion === a.id ? null : a.id)}
                  style={{ width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#111', textAlign: 'left' }}>
                  {a.label}
                  <span style={{ transform: accordion === a.id ? 'rotate(90deg)' : 'none', transition: '0.2s' }}>›</span>
                </button>
                {accordion === a.id && <div style={{ paddingBottom: '16px' }}>{a.content}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Checkout + Success ──────────────────────────────────── */
export function CheckoutPage({ cart, products, store, cartTotal, form, setForm, formErr, placing, placeOrder, setView, accent = '#111',
  couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon }) {
  const FONT = "'Inter', sans-serif"
  const inputStyle = { width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '14px', outline: 'none', fontFamily: FONT, boxSizing: 'border-box', color: '#111', background: '#fff', transition: 'border-color 0.15s' }
  const fieldFocus = e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22` }
  const fieldBlur  = e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 399, display: 'flex', flexDirection: 'column', fontFamily: FONT, background: '#fff' }}>

      {/* ── Header ── */}
      <div style={{ height: '64px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', flexShrink: 0 }}>
        <button onClick={() => setView('home')} style={{ fontSize: '13px', color: '#999', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>{store?.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9ca3af', fontSize: '12px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Secure checkout
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left: Form ── */}
        <div style={{ flex: '0 0 58%', overflowY: 'auto', padding: '40px 6% 80px' }}>
          <div style={{ maxWidth: '480px', marginLeft: 'auto' }}>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '36px', fontSize: '12px', color: '#9ca3af' }}>
              <span style={{ color: '#111', fontWeight: 600 }}>Cart</span>
              <ChevronRight size={12} />
              <span style={{ color: '#111', fontWeight: 600 }}>Information</span>
              <ChevronRight size={12} />
              <span>Shipping</span>
              <ChevronRight size={12} />
              <span>Payment</span>
            </div>

            {/* Contact */}
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Contact</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>Full name <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>Phone number <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
            </div>

            {/* Shipping Address */}
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Shipping address</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>Address</label>
              <input type="text" placeholder="House, road, area" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>City</label>
              <input type="text" placeholder="Dhaka" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '5px', fontWeight: 500 }}>Order note <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <input type="text" placeholder="Special instructions for your order" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
            </div>

            {/* Shipping Method */}
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Shipping method</div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: '#f9f9f9' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>Cash on Delivery</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Pay when your order arrives at your door</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>Free</div>
              </div>
            </div>

            {/* Payment */}
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Payment</div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', background: '#fafafa' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>All payments collected on delivery (COD)</span>
            </div>

            {formErr && (
              <div style={{ fontSize: '13px', color: '#dc2626', margin: '0 0 16px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                {formErr}
              </div>
            )}

            <button onClick={placeOrder} disabled={placing}
              style={{ width: '100%', padding: '16px', background: placing ? '#9ca3af' : accent, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 700, cursor: placing ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', transition: 'opacity 0.15s' }}>
              {placing ? 'Placing order…' : 'Complete order'}
            </button>

            {/* Footer policy links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
              {['Refund policy', 'Privacy policy', 'Terms of service'].map(p => (
                <span key={p} style={{ fontSize: '11px', color: '#9ca3af', cursor: 'pointer' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div style={{ flex: '0 0 42%', overflowY: 'auto', background: '#f5f5f3', borderLeft: '1px solid #e8e8e8' }}>
          <div style={{ position: 'sticky', top: 0, padding: '40px 8% 40px', maxWidth: '420px' }}>

            {/* Items */}
            <div style={{ marginBottom: '20px' }}>
              {cart.map(item => {
                const prod = products.find(x => x.id === item.productId)
                const itemKey = item.key || item.productId
                return (
                  <div key={itemKey} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '64px', height: '80px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                        {prod?.imageUrl
                          ? <img src={prod.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}><Package size={20} color="#ccc" strokeWidth={1.5} /></div>}
                      </div>
                      <div style={{ position: 'absolute', top: '-8px', right: '-8px', minWidth: '22px', height: '22px', background: '#6b7280', borderRadius: '50%', fontSize: '11px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, padding: '0 4px' }}>{item.qty}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', lineHeight: 1.3, marginBottom: '3px' }}>{item.name}</div>
                      {item.variantName && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.variantName}</div>}
                      {item.sku && <div style={{ fontSize: '11px', color: '#bbb' }}>SKU: {item.sku}</div>}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', flexShrink: 0 }}>{fmt(item.qty * item.unitPrice, store?.currency)}</div>
                  </div>
                )
              })}
            </div>

            {/* Coupon */}
            <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                      {appliedCoupon.code} — {appliedCoupon.type === 'PERCENT' ? `${appliedCoupon.amount}% off` : `${fmt(couponDiscount, store?.currency)} off`}
                    </span>
                  </div>
                  <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#9ca3af', padding: 0 }}>Remove</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon(couponCode)}
                        placeholder="Discount code"
                        style={{ ...inputStyle, paddingLeft: '34px', background: '#fff' }}
                        onFocus={fieldFocus} onBlur={fieldBlur} />
                    </div>
                    <button onClick={() => applyCoupon(couponCode)} disabled={couponLoading || !couponCode.trim()}
                      style={{ padding: '12px 18px', background: couponCode.trim() ? accent : '#e5e7eb', color: couponCode.trim() ? '#fff' : '#9ca3af', border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 600, cursor: couponCode.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                  {couponErr && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px' }}>{couponErr}</div>}
                </>
              )}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                <span>Subtotal · {cart.reduce((s, i) => s + i.qty, 0)} {cart.reduce((s, i) => s + i.qty, 0) === 1 ? 'item' : 'items'}</span>
                <span style={{ color: '#111', fontWeight: 500 }}>{fmt(cartTotal, store?.currency)}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a', marginBottom: '10px' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600 }}>−{fmt(couponDiscount, store?.currency)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                <span>Shipping</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '14px', borderTop: '1px solid #d1d5db' }}>
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#111' }}>Total</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>({store?.currency || 'BDT'})</span>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>{fmt(cartTotal - (couponDiscount || 0), store?.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SuccessPage({ orderNum, form, setView, setForm, accent = '#111' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 399, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><polyline points="5,14 11,20 23,8" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', marginBottom: '10px' }}>Order Confirmed</div>
      <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111', marginBottom: '8px', textAlign: 'center' }}>Thank you, {form.name.split(' ')[0]}!</h2>
      <p style={{ fontSize: '14px', color: '#888', marginBottom: '28px', textAlign: 'center', maxWidth: '320px', lineHeight: 1.65 }}>
        Order <strong style={{ color: '#111' }}>{orderNum}</strong> received. We'll call <strong style={{ color: '#111' }}>{form.phone}</strong> to confirm delivery.
      </p>
      <button onClick={() => { setView('home'); setForm({ name: '', phone: '', address: '', city: '', note: '' }) }}
        style={{ padding: '13px 36px', background: accent, color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Continue Shopping
      </button>
    </div>
  )
}
