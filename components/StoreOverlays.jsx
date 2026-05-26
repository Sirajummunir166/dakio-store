'use client'
import { useState } from 'react'
import { X, ChevronRight, ShoppingBag } from 'lucide-react'
import { fmt } from '../lib/storefront'

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
                return (
                  <div key={item.productId} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ width: '64px', height: '80px', background: '#f0f0f0', flexShrink: 0, overflow: 'hidden' }}>
                      {prod?.imageUrl ? <img src={prod.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3, marginBottom: '4px', color: '#111' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>{fmt(item.unitPrice, store?.currency)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', width: 'fit-content' }}>
                        <button onClick={() => changeQty(item.productId, -1)} style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>−</button>
                        <span style={{ fontSize: '13px', fontWeight: 700, width: '28px', textAlign: 'center', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', lineHeight: '28px' }}>{item.qty}</span>
                        <button onClick={() => changeQty(item.productId, 1)} style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc' }}><X size={13} /></button>
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
  const oos = product.totalStock !== undefined && product.totalStock <= 0
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 249 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', zIndex: 250, width: 'min(460px, calc(100vw - 24px))', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}><X size={14} /></button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f0f0f0' }}>
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📦</div>}
          </div>
          <div style={{ padding: '22px 18px', display: 'flex', flexDirection: 'column' }}>
            {product.category && <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{product.category.name}</div>}
            <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px', color: '#111' }}>{product.name}</div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: accent }}>{fmt(product.sellingPrice, store?.currency)}</div>
            {!oos ? (
              <>
                <div style={{ display: 'flex', border: '1px solid #e0e0e0', marginBottom: '12px', width: 'fit-content' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>−</button>
                  <span style={{ fontSize: '13px', fontWeight: 700, width: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
                </div>
                <button onClick={() => onAdd(product, qty)} style={{ padding: '11px', background: accent, color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', marginBottom: '8px' }}>ADD TO CART</button>
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
  const oos = product.totalStock !== undefined && product.totalStock <= 0

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
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>📦</div>}
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
            <div style={{ fontSize: '24px', fontWeight: 900, color: accent, marginBottom: '20px' }}>{fmt(product.sellingPrice, store?.currency)}</div>
            {product.description && <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7, marginBottom: '24px' }}>{product.description}</p>}
            {!oos ? (
              <>
                <div style={{ display: 'flex', border: '1px solid #e0e0e0', marginBottom: '14px', width: 'fit-content' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>−</button>
                  <span style={{ fontSize: '15px', fontWeight: 700, width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: '40px', height: '44px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>+</button>
                </div>
                <button onClick={() => onAdd(product, qty)} style={{ width: '100%', padding: '15px', background: accent, color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>
                  Add to Cart — {fmt(product.sellingPrice * qty, store?.currency)}
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
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 399, display: 'flex', flexDirection: 'column', fontFamily: FONT, background: '#fff' }}>
      <div style={{ height: '56px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
        <button onClick={() => setView('home')} style={{ fontSize: '13px', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
        <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: '16px', fontWeight: 900, color: '#111' }}>{store?.name}</span>
        <div />
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: '0 0 55%', overflowY: 'auto', padding: '48px 5% 80px', borderRight: '1px solid #e8e8e8' }}>
          <div style={{ maxWidth: '460px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '32px', fontSize: '12px', color: '#bbb' }}>
              <span style={{ color: '#111', fontWeight: 700 }}>Contact</span>
              <ChevronRight size={11} /><span>Delivery</span><ChevronRight size={11} /><span>Payment</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '14px' }}>Contact</div>
            {[
              { key: 'name', label: 'Full name', type: 'text', placeholder: 'Your full name', req: true },
              { key: 'phone', label: 'Phone number', type: 'tel', placeholder: '01XXXXXXXXX', req: true },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '4px' }}>{f.label}{f.req && <span style={{ color: '#e53e3e' }}> *</span>}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '11px 13px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none', fontFamily: FONT, boxSizing: 'border-box', color: '#111' }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
            ))}
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: '22px 0 14px' }}>Delivery</div>
            {[
              { key: 'address', label: 'Address', type: 'text', placeholder: 'House, road, area' },
              { key: 'city', label: 'City', type: 'text', placeholder: 'Dhaka' },
              { key: 'note', label: 'Order note', type: 'text', placeholder: 'Special instructions (optional)' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '4px' }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '11px 13px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none', fontFamily: FONT, boxSizing: 'border-box', color: '#111' }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
            ))}
            {/* Coupon */}
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: '22px 0 12px' }}>Coupon</div>
            {appliedCoupon ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                  🎉 {appliedCoupon.code} — {appliedCoupon.type === 'PERCENT' ? `${appliedCoupon.amount}% off` : `Tk ${couponDiscount} off`}
                </span>
                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#9ca3af' }}>Remove</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon(couponCode)}
                  placeholder="Enter coupon code"
                  style={{ flex: 1, padding: '11px 13px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none', fontFamily: FONT, boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                <button onClick={() => applyCoupon(couponCode)} disabled={couponLoading || !couponCode.trim()}
                  style={{ padding: '11px 16px', background: accent, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {couponLoading ? '…' : 'Apply'}
                </button>
              </div>
            )}
            {couponErr && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px' }}>{couponErr}</div>}

            <div style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: '22px 0 12px' }}>Payment</div>
            <div style={{ border: `1.5px solid ${accent}`, borderRadius: '6px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Cash on Delivery (COD)</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>Pay when your order arrives</div>
              </div>
            </div>
            {formErr && <div style={{ fontSize: '13px', color: '#dc2626', margin: '14px 0', padding: '11px 13px', background: '#fef2f2', borderRadius: '4px' }}>{formErr}</div>}
            <button onClick={placeOrder} disabled={placing}
              style={{ width: '100%', padding: '15px', background: placing ? '#555' : accent, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 700, cursor: placing ? 'not-allowed' : 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: '20px' }}>
              {placing ? 'Placing Order…' : 'Complete Order'}
            </button>
          </div>
        </div>
        <div style={{ flex: '0 0 45%', overflowY: 'auto', padding: '48px 5% 80px', background: '#fafafa' }}>
          <div style={{ maxWidth: '360px' }}>
            {cart.map(item => {
              const prod = products.find(x => x.id === item.productId)
              return (
                <div key={item.productId} style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '60px', height: '75px', background: '#e8e8e8', overflow: 'hidden' }}>
                      {prod?.imageUrl ? <img src={prod.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📦</div>}
                    </div>
                    <div style={{ position: 'absolute', top: '-7px', right: '-7px', minWidth: '20px', height: '20px', background: '#555', borderRadius: '50%', fontSize: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{item.qty}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '2px' }}>{item.name}</div>
                    {item.sku && <div style={{ fontSize: '11px', color: '#bbb' }}>{item.sku}</div>}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', flexShrink: 0 }}>{fmt(item.qty * item.unitPrice, store?.currency)}</div>
                </div>
              )
            })}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                <span>Subtotal</span><span>{fmt(cartTotal, store?.currency)}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a', marginBottom: '8px' }}>
                  <span>Discount ({appliedCoupon?.code})</span><span>- {fmt(couponDiscount, store?.currency)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '16px' }}>
                <span style={{ color: '#666' }}>Shipping</span><span style={{ color: '#16a34a', fontWeight: 600 }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#111', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <span>Total</span><span>{fmt(cartTotal - (couponDiscount || 0), store?.currency)}</span>
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
