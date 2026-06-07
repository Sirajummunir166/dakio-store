'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DISTRICTS, DHAKA_DISTRICTS, getThanas, detectLocation } from '../lib/bd-locations'
import TrackingScripts from './TrackingScripts'
import { storeHome } from '../lib/routes'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'

function fmt(price, currency) {
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Tk '
  return `${sym}${Number(price || 0).toLocaleString('en-GB')}`
}

export default function CheckoutClient({ store, slug }) {
  const router = useRouter()
  const accent = store?.accentColor || '#111'
  const FONT = "'Inter', sans-serif"

  const insideDhakaCharge  = store?.deliveryInsideDhaka  ?? 60
  const outsideDhakaCharge = store?.deliveryOutsideDhaka ?? 120

  const [cart, setCart]         = useState([])
  const [cartReady, setCartReady] = useState(false)
  const [form, setForm]         = useState({ name: '', phone: '', address: '', note: '' })
  const [district, setDistrict]   = useState('')
  const [thana, setThana]         = useState('')
  const [autoDetected, setAutoDetected] = useState(false)
  const [formErr, setFormErr]   = useState('')
  const [placing, setPlacing]   = useState(false)
  const [orderNum, setOrderNum] = useState('')

  const [couponCode, setCouponCode]         = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponErr, setCouponErr]           = useState('')
  const [appliedCoupon, setAppliedCoupon]   = useState(null)
  const [couponLoading, setCouponLoading]   = useState(false)

  const [summaryOpen, setSummaryOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`dk_cart_${slug}`) || '[]')
      setCart(saved)
    } catch {}
    setCartReady(true)
  }, [slug])

  // Fire InitiateCheckout once the cart is loaded and non-empty.
  // Generate checkoutEventId for browser/server Meta deduplication — stored in sessionStorage
  // so tryLeadCapture can pass it to the server-side CAPI InitiateCheckout call later.
  useEffect(() => {
    if (!cartReady || !cart.length) return
    try {
      const checkoutEventId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      try { sessionStorage.setItem(`dk_checkout_eid_${slug}`, checkoutEventId) } catch {}

      const total    = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0)
      const currency = store?.currency || 'BDT'
      window.fbq?.('track', 'InitiateCheckout', {
        value:      total,
        currency,
        num_items:  cart.reduce((s, i) => s + i.qty, 0),
      }, { eventID: checkoutEventId })
      window.dataLayer?.push({
        event:    'begin_checkout',
        value:    total,
        currency,
        items:    cart.map(i => ({ item_id: i.productId, item_name: i.name, price: i.unitPrice, quantity: i.qty })),
      })
    } catch {}
  }, [cartReady]) // eslint-disable-line

  const cartTotal    = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const cartCount    = cart.reduce((s, i) => s + i.qty, 0)
  const isInsideDhaka = DHAKA_DISTRICTS.includes(district)
  const shippingCharge = district ? (isInsideDhaka ? insideDhakaCharge : outsideDhakaCharge) : 0
  const orderTotal   = cartTotal + shippingCharge - (couponDiscount || 0)

  function handleAddressBlur(val) {
    if (!val.trim()) return
    const { district: d, thana: t } = detectLocation(val)
    if (d) {
      setDistrict(d)
      if (t) setThana(t)
      setAutoDetected(true)
    } else {
      setAutoDetected(false)
    }
  }

  async function applyCoupon(code) {
    if (!code.trim()) return
    setCouponLoading(true); setCouponErr('')
    try {
      const r = await fetch(`${API}/coupons/validate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), slug, subtotal: cartTotal }),
      })
      const data = await r.json()
      if (data.valid) {
        setAppliedCoupon(data.coupon)
        setCouponDiscount(data.discount)
        setCouponErr('')
      } else {
        setCouponErr(data.error || 'Invalid coupon')
      }
    } catch {
      setCouponErr('Invalid coupon code')
    }
    setCouponLoading(false)
  }

  function removeCoupon() {
    setAppliedCoupon(null); setCouponDiscount(0); setCouponCode(''); setCouponErr('')
  }

  const leadSaved = useRef(false)

  function tryLeadCapture() {
    if (leadSaved.current || !cart.length || !form.name.trim() || form.phone.length < 8) return
    leadSaved.current = true

    // Generate leadEventId for Meta browser/server Lead deduplication.
    // Only fire browser Lead if storefront.js didn't already fire it this session
    // (prevents double Lead when user filled product-page form then navigated here).
    const leadEventId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const alreadyFiredLead = (() => { try { return !!sessionStorage.getItem(`dk_lead_fired_${slug}`) } catch { return false } })()
    if (!alreadyFiredLead) {
      try {
        const val = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0)
        window.fbq?.('track', 'Lead', {
          value:    val,
          currency: store?.currency || 'BDT',
        }, { eventID: leadEventId })
        try { sessionStorage.setItem(`dk_lead_fired_${slug}`, '1') } catch {}
      } catch {}
    }

    // Read checkoutEventId set by the InitiateCheckout effect above —
    // server uses it to coordinate server-side CAPI InitiateCheckout with the browser event.
    const checkoutEventId = (() => { try { return sessionStorage.getItem(`dk_checkout_eid_${slug}`) || undefined } catch { return undefined } })()

    fetch(`${API}/store/${slug}/leads`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:      form.name,
        phone:     form.phone,
        address:   form.address  || undefined,
        city:      thana         || undefined,
        district:  district      || undefined,
        cart:      cart.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
        cartValue: cart.reduce((s, i) => s + i.qty * i.unitPrice, 0),
        sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        leadEventId:     alreadyFiredLead ? undefined : leadEventId,
        checkoutEventId: checkoutEventId || undefined,
      }),
      keepalive: true,
    }).catch(() => {})
  }

  useEffect(() => {
    window.addEventListener('beforeunload', tryLeadCapture)
    return () => window.removeEventListener('beforeunload', tryLeadCapture)
  }, [cart, form, district, thana]) // eslint-disable-line

  useEffect(() => {
    if (!cart.length || !form.name.trim() || form.phone.length < 8 || leadSaved.current) return
    const t = setTimeout(tryLeadCapture, 20000)
    return () => clearTimeout(t)
  }, [cart, form]) // eslint-disable-line

  async function placeOrder() {
    if (!form.name.trim())      { setFormErr('Please enter your name'); return }
    if (form.phone.length < 10) { setFormErr('Enter a valid phone number'); return }
    if (!district)              { setFormErr('Could not detect your area — please select district below'); return }
    setFormErr(''); setPlacing(true)
    // Generate event_id for Meta browser+server deduplication
    const metaEventId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    try {
      const r = await fetch(`${API}/store/${slug}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name,
          phone:   form.phone,
          address: form.address,
          city:    thana,
          district,
          note:    form.note || undefined,
          items:   cart,
          paymentMethod: 'COD',
          shippingCharge,
          discount:    couponDiscount,
          couponCode:  appliedCoupon?.code || null,
          metaEventId,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Order failed')
      // Fire browser-side Purchase with matching event_id for deduplication with server CAPI event
      try {
        const currency = store?.currency || 'BDT'
        window.fbq?.('track', 'Purchase', {
          value:        orderTotal,
          currency,
          order_id:     data.orderNumber,
          content_ids:  cart.map(i => i.productId),
          content_type: 'product',
          num_items:    cart.reduce((s, i) => s + i.qty, 0),
        }, { eventID: metaEventId })
        window.dataLayer?.push({
          event:          'purchase',
          value:          orderTotal,
          currency,
          transaction_id: data.orderNumber,
          items: cart.map(i => ({ item_id: i.productId, item_name: i.name, price: i.unitPrice, quantity: i.qty })),
        })
      } catch {}
      localStorage.removeItem(`dk_cart_${slug}`)
      setCart([])
      setOrderNum(data.orderNumber)
    } catch (e) {
      setFormErr(e.message || 'Order failed. Try again.')
    }
    setPlacing(false)
  }

  const inputStyle = {
    width: '100%', padding: '13px 14px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '15px', outline: 'none', fontFamily: FONT,
    boxSizing: 'border-box', color: '#111', background: '#fff',
    WebkitAppearance: 'none',
  }
  const selectStyle = {
    ...inputStyle,
    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
    paddingRight: '36px', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
  }
  const fieldFocus = e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22` }
  const fieldBlur  = e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }

  /* ── Success screen ─────────────────────────────────────── */
  if (orderNum) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: '24px', background: '#fff' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '0 0 8px', textAlign: 'center' }}>Order placed!</h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 6px', textAlign: 'center' }}>Thank you, {form.name.split(' ')[0]}.</p>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 28px', textAlign: 'center' }}>Order {orderNum} · We&apos;ll contact you at {form.phone}</p>
        <button onClick={() => router.push(storeHome(slug))}
          style={{ padding: '14px 32px', background: accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          Continue shopping
        </button>
      </div>
    )
  }

  /* ── Empty cart ──────────────────────────────────────────── */
  if (cartReady && cart.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: '24px', background: '#fff' }}>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>Your cart is empty.</p>
        <button onClick={() => router.push(storeHome(slug))}
          style={{ padding: '13px 28px', background: accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          Back to store
        </button>
      </div>
    )
  }

  const summaryProps = {
    cart, store, cartTotal, cartCount, shippingCharge, district,
    isInsideDhaka, couponCode, setCouponCode, couponDiscount, couponErr,
    appliedCoupon, couponLoading, applyCoupon, removeCoupon,
    orderTotal, accent, inputStyle, fieldFocus, fieldBlur, FONT,
  }

  /* ── Main checkout ──────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100dvh', background: '#fff', fontFamily: FONT }}>
      <TrackingScripts store={store} />

      {/* Header */}
      <div style={{ borderBottom: '1px solid #e8e8e8', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto' }}>
        <button onClick={() => router.push(storeHome(slug))}
          style={{ fontSize: '13px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: FONT, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <span style={{ fontSize: '17px', fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>{store?.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9ca3af', fontSize: '12px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Secure
        </div>
      </div>

      {/* Mobile: collapsible order summary */}
      <div className="checkout-mobile-summary">
        <button onClick={() => setSummaryOpen(o => !o)}
          style={{ width: '100%', padding: '14px 20px', background: '#f9f9f7', border: 'none', borderBottom: '1px solid #e8e8e8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Show order summary ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: summaryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#111' }}>{fmt(orderTotal, store?.currency)}</span>
        </button>
        {summaryOpen && (
          <div style={{ background: '#f9f9f7', borderBottom: '1px solid #e8e8e8', padding: '16px 20px' }}>
            <OrderSummaryContent {...summaryProps} />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex' }}>

        {/* Form column */}
        <div style={{ flex: '1 1 0', padding: '32px 20px 80px', minWidth: 0 }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>

            {/* Contact */}
            <SectionTitle>Contact</SectionTitle>
            <Field label="Full name" required>
              <input type="text" placeholder="Your full name" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
            </Field>
            <Field label="Phone number" required>
              <input type="tel" placeholder="01XXXXXXXXX" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
            </Field>

            {/* Shipping */}
            <SectionTitle style={{ marginTop: '28px' }}>Shipping address</SectionTitle>
            <Field label="Full address">
              <textarea placeholder="House, road, area, village…" value={form.address} rows={2}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                onBlur={e => { fieldBlur(e); handleAddressBlur(e.target.value) }}
                onFocus={e => { fieldFocus(e) }}
                style={{ ...inputStyle, resize: 'none', paddingTop: '10px', lineHeight: 1.5 }} />
            </Field>

            {/* District / Thana — always visible, auto-fills from address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '4px' }}>
              <Field label="District" required>
                <div style={{ position: 'relative' }}>
                  <select value={district} onChange={e => { setDistrict(e.target.value); setThana(''); setAutoDetected(false) }}
                    style={{ ...selectStyle, color: district ? '#111' : '#9ca3af' }}
                    onFocus={fieldFocus} onBlur={fieldBlur}>
                    <option value="">Select district</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </Field>
              <Field label="Thana / Upazila">
                <div style={{ position: 'relative' }}>
                  <select value={thana} onChange={e => setThana(e.target.value)}
                    disabled={!district}
                    style={{ ...selectStyle, color: thana ? '#111' : '#9ca3af', opacity: district ? 1 : 0.5 }}
                    onFocus={fieldFocus} onBlur={fieldBlur}>
                    <option value="">Select thana</option>
                    {getThanas(district).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </Field>
            </div>
            {autoDetected && district && (
              <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Auto-detected from address
              </div>
            )}

            {/* Delivery charge indicator */}
            {district && (
              <div style={{ padding: '12px 14px', borderRadius: '9px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isInsideDhaka ? '#eff6ff' : '#fefce8', border: `1px solid ${isInsideDhaka ? '#bfdbfe' : '#fef08a'}` }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: isInsideDhaka ? '#1d4ed8' : '#854d0e' }}>
                  {isInsideDhaka ? '📍 Inside Dhaka' : '📦 Outside Dhaka'} delivery
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{fmt(shippingCharge, store?.currency)}</span>
              </div>
            )}

            <Field label="Order note" optional>
              <input type="text" placeholder="Special instructions (optional)" value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
            </Field>

            {/* Shipping method */}
            <SectionTitle style={{ marginTop: '20px' }}>Shipping method</SectionTitle>
            <div style={{ border: `1.5px solid ${accent}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', background: `${accent}08` }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>Cash on Delivery (COD)</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Pay when your order arrives</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: district ? '#111' : '#16a34a' }}>
                {district ? fmt(shippingCharge, store?.currency) : 'Free'}
              </div>
            </div>

            {/* Error */}
            {formErr && (
              <div style={{ fontSize: '13px', color: '#dc2626', marginBottom: '16px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                {formErr}
              </div>
            )}

            {/* CTA */}
            <button onClick={placeOrder} disabled={placing}
              style={{ width: '100%', padding: '17px', background: placing ? '#9ca3af' : accent, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: placing ? 'not-allowed' : 'pointer', fontFamily: FONT, letterSpacing: '0.02em', transition: 'opacity 0.15s' }}>
              {placing ? 'Placing order…' : `Complete order · ${fmt(orderTotal, store?.currency)}`}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
              {['Refund policy', 'Privacy policy', 'Terms of service'].map(p => (
                <span key={p} style={{ fontSize: '11px', color: '#c4c4c4', cursor: 'pointer' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: right summary column */}
        <div className="checkout-desktop-summary" style={{ width: '420px', flexShrink: 0, background: '#f9f9f7', borderLeft: '1px solid #e8e8e8', padding: '40px 40px 80px', overflowY: 'auto' }}>
          <OrderSummaryContent {...summaryProps} />
        </div>

      </div>

      {/* Responsive styles */}
      <style>{`
        .checkout-mobile-summary { display: none; }
        .checkout-desktop-summary { display: block !important; }
        @media (max-width: 768px) {
          .checkout-mobile-summary { display: block; }
          .checkout-desktop-summary { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function SectionTitle({ children, style }) {
  return (
    <div style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '14px', ...style }}>
      {children}
    </div>
  )
}

function Field({ label, children, required, optional }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: '#e53e3e', marginLeft: '3px' }}>*</span>}
        {optional && <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '5px', fontWeight: 400 }}>(optional)</span>}
      </label>
      {children}
    </div>
  )
}

function OrderSummaryContent({
  cart, store, cartTotal, cartCount, shippingCharge, district,
  couponCode, setCouponCode, couponDiscount, couponErr,
  appliedCoupon, couponLoading, applyCoupon, removeCoupon,
  orderTotal, accent, inputStyle, fieldFocus, fieldBlur, FONT,
}) {
  return (
    <>
      {/* Items */}
      <div style={{ marginBottom: '20px' }}>
        {cart.map(item => (
          <div key={item.key || item.productId} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '56px', height: '70px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                    </div>}
              </div>
              <div style={{ position: 'absolute', top: '-7px', right: '-7px', minWidth: '20px', height: '20px', background: '#6b7280', borderRadius: '50%', fontSize: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, padding: '0 4px' }}>{item.qty}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', lineHeight: 1.3, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              {item.sku && <div style={{ fontSize: '11px', color: '#bbb' }}>SKU: {item.sku}</div>}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', flexShrink: 0 }}>{fmt(item.qty * item.unitPrice, store?.currency)}</div>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }}>
        {appliedCoupon ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                {appliedCoupon.code} — {appliedCoupon.type === 'PERCENT' ? `${appliedCoupon.amount}% off` : `${fmt(couponDiscount, store?.currency)} off`}
              </span>
            </div>
            <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#9ca3af', fontFamily: FONT, padding: 0 }}>Remove</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && applyCoupon(couponCode)}
                placeholder="Discount code"
                style={{ ...inputStyle, flex: 1, fontSize: '13px', padding: '11px 14px' }}
                onFocus={fieldFocus} onBlur={fieldBlur} />
              <button onClick={() => applyCoupon(couponCode)} disabled={couponLoading || !couponCode.trim()}
                style={{ padding: '11px 16px', background: couponCode.trim() ? accent : '#e5e7eb', color: couponCode.trim() ? '#fff' : '#9ca3af', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: couponCode.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap', fontFamily: FONT, transition: 'all 0.15s' }}>
                {couponLoading ? '…' : 'Apply'}
              </button>
            </div>
            {couponErr && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px' }}>{couponErr}</div>}
          </>
        )}
      </div>

      {/* Totals */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '9px' }}>
          <span>Subtotal · {cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          <span style={{ color: '#111', fontWeight: 500 }}>{fmt(cartTotal, store?.currency)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '9px' }}>
          <span>Shipping{district ? ` (${district})` : ''}</span>
          {district
            ? <span style={{ color: '#111', fontWeight: 500 }}>{fmt(shippingCharge, store?.currency)}</span>
            : <span style={{ color: '#9ca3af' }}>Select district</span>}
        </div>
        {couponDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a', marginBottom: '9px' }}>
            <span>Discount</span>
            <span style={{ fontWeight: 600 }}>−{fmt(couponDiscount, store?.currency)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '14px', borderTop: '1px solid #d1d5db' }}>
          <div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#111' }}>Total</span>
            <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>({store?.currency || 'BDT'})</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>{fmt(orderTotal, store?.currency)}</span>
        </div>
      </div>
    </>
  )
}
