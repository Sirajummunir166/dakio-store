'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    color: '#ea580c', bg: '#fff7ed', dot: '#fb923c' },
  APPROVED:   { label: 'Confirmed', color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6' },
  PROCESSING: { label: 'Processing', color: '#7c3aed', bg: '#faf5ff', dot: '#8b5cf6' },
  SHIPPED:    { label: 'Shipped',   color: '#ca8a04', bg: '#fefce8', dot: '#eab308' },
  DELIVERED:  { label: 'Delivered', color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  CANCELLED:  { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
  RETURNED:   { label: 'Returned',  color: '#ea580c', bg: '#fff7ed', dot: '#ea580c' },
  FAILED:     { label: 'Failed',    color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
  FOLLOW_UP:  { label: 'Follow Up', color: '#7c3aed', bg: '#faf5ff', dot: '#8b5cf6' },
}

const TIMELINE = ['PENDING', 'APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function TrackOrderClient({ store, slug }) {
  const accent = store?.accentColor || '#111111'
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  async function handleTrack(e) {
    e.preventDefault()
    if (!orderNumber.trim() || !phone.trim()) return
    setLoading(true); setError(''); setOrder(null)
    try {
      const res = await fetch(`${API}/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}&slug=${slug}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Order not found'); return }
      setOrder(data)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const st = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING) : null
  const currentStep = order ? TIMELINE.indexOf(order.status) : -1

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: accent, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={`/${slug}`} style={{ color: '#fff', textDecoration: 'none', fontSize: '13px', opacity: 0.85 }}>← Back to Store</a>
        {store?.logoUrl && <img src={store.logoUrl} alt={store.name} style={{ height: '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />}
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{store?.name}</div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111', marginBottom: '6px', textAlign: 'center' }}>Track Your Order</h1>
        <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '28px' }}>
          Enter your order number and phone number to see your order status.
        </p>

        {/* Search form */}
        <form onSubmit={handleTrack} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order Number</label>
            <input
              type="text"
              placeholder="e.g. ORD-2025-0001"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: '0.05em', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number</label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading || !orderNumber.trim() || !phone.trim()}
            style={{ width: '100%', padding: '13px', background: (!orderNumber.trim() || !phone.trim()) ? '#e5e7eb' : accent, border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: (!orderNumber.trim() || !phone.trim()) ? '#9ca3af' : '#fff', cursor: (loading || !orderNumber.trim() || !phone.trim()) ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {loading ? 'Searching…' : 'Track Order'}
          </button>
        </form>

        {/* Order result */}
        {order && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Status banner */}
            <div style={{ background: st.bg, borderBottom: `1px solid ${st.dot}33`, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: st.dot + '22', border: `2px solid ${st.dot}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: st.dot, display: 'block' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: st.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Order Status</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: st.color }}>{st.label}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Order</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', fontFamily: 'monospace' }}>{order.orderNumber}</div>
              </div>
            </div>

            {/* Timeline */}
            {!['CANCELLED','RETURNED','FAILED'].includes(order.status) && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  {/* Progress line */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', height: '2px', background: '#e5e7eb', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: '14px', left: '14px', height: '2px', background: accent, zIndex: 1, width: currentStep >= 0 ? `${(currentStep / (TIMELINE.length - 1)) * 100}%` : '0%', transition: 'width 0.4s' }} />
                  {TIMELINE.map((step, i) => {
                    const done = i <= currentStep
                    const cfg = STATUS_CONFIG[step]
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, flex: 1 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? accent : '#fff', border: `2px solid ${done ? accent : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                          {done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: done ? 700 : 400, color: done ? accent : '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>{cfg.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Order details */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Order Details</div>

              {/* Items */}
              <div style={{ marginBottom: '16px' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '1px' }}>Qty: {item.qty}</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Tk {Number(item.total).toLocaleString('en-BD')}</div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#111', marginBottom: '6px' }}>
                  <span>Total</span>
                  <span>Tk {Number(order.total).toLocaleString('en-BD')}</span>
                </div>
                {Number(order.due) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                    <span>Due</span>
                    <span>Tk {Number(order.due).toLocaleString('en-BD')}</span>
                  </div>
                )}
                {Number(order.paid) > 0 && Number(order.due) === 0 && (
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, textAlign: 'center', marginTop: '4px' }}>✓ Fully Paid</div>
                )}
              </div>

              {/* Shipping info */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {order.shippingMethod && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>DELIVERY VIA</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginTop: '2px' }}>{order.shippingMethod}</div>
                  </div>
                )}
                {order.courierTrackingId && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>TRACKING ID</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', fontFamily: 'monospace', marginTop: '2px' }}>{order.courierTrackingId}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>ORDER DATE</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginTop: '2px' }}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
              Need help? Contact <strong style={{ color: '#374151' }}>{store?.name}</strong>
              {store?.whatsappNumber && (
                <a href={`https://wa.me/${store.whatsappNumber}`} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
                  WhatsApp →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
