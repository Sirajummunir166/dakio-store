'use client'
import { useState, useEffect } from 'react'
import { Phone, Package, CheckCircle2, Truck, XCircle, RotateCcw } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}


function lighten(hex, amt = 0.9) {
  try {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    return `rgb(${Math.round(r+(255-r)*amt)},${Math.round(g+(255-g)*amt)},${Math.round(b+(255-b)*amt)})`
  } catch { return '#f3f4f6' }
}

function statusColor(step, accent) {
  if (step === 4)  return '#16a34a'
  if (step === -1) return '#dc2626'
  if (step === -2) return '#ea580c'
  return accent
}

function StatusIcon({ step, accent, size = 22 }) {
  if (step === 4)  return <CheckCircle2 size={size} color="#16a34a" />
  if (step === -1) return <XCircle      size={size} color="#dc2626" />
  if (step === -2) return <RotateCcw    size={size} color="#ea580c" />
  if (step === 3)  return <Truck        size={size} color={accent} />
  return                   <Package     size={size} color={accent} />
}

export default function TrackOrderDirect({ store, slug, code }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const accent  = store?.accentColor || '#111111'
  const normCode = (code || '').replace(/^#/, '').trim().toUpperCase()

  useEffect(() => {
    if (!normCode || !slug) { setError('Invalid tracking link.'); setLoading(false); return }
    fetch(`${API}/public/tracking/${encodeURIComponent(slug)}/${encodeURIComponent(normCode)}`)
      .then(async r => {
        const json = await r.json()
        if (!r.ok) throw new Error(json.error || 'Order not found.')
        setData(json)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const sColor = data ? statusColor(data.statusStep, accent) : accent

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } a { text-decoration: none; }`}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 14px 40px' }}>

        {/* ── Status card with logo ── */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px 22px 22px', marginBottom: 10, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', textAlign: 'center' }}>

          {/* Merchant logo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 16, background: lighten(accent, 0.88), border: `2px solid ${lighten(accent, 0.7)}`, marginBottom: 16, overflow: 'hidden' }}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
              : <span style={{ fontSize: 24, fontWeight: 900, color: accent }}>{store?.name?.[0] || 'S'}</span>
            }
          </div>

          {loading && (
            <>
              <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </>
          )}

          {error && !loading && (
            <>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Order Not Found</p>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{error}</p>
            </>
          )}

          {data && !loading && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                <StatusIcon step={data.statusStep} accent={accent} />
                <p style={{ fontSize: 22, fontWeight: 800, color: sColor, letterSpacing: '-0.02em' }}>{data.displayStatus}</p>
              </div>
              <span style={{ display: 'inline-block', background: '#f3f4f6', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#6b7280', fontFamily: 'monospace', letterSpacing: '0.06em' }}>#{normCode}</span>
              {data.updatedAt && <p style={{ fontSize: 11, color: '#d1d5db', marginTop: 10 }}>Updated {fmtDate(data.updatedAt)}</p>}
            </>
          )}
        </div>

        {data && (
          <>
            {/* Timeline */}
            {!data.isTerminal && data.timeline?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <p style={s.sec}>Order Progress</p>
                {data.timeline.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 22, flexShrink: 0 }}>
                      <div style={{ width: step.current ? 22 : 18, height: step.current ? 22 : 18, borderRadius: '50%', background: step.done ? accent : '#e5e7eb', boxShadow: step.current ? `0 0 0 4px ${accent}28` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {step.done && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      {i < data.timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26, background: step.done ? accent : '#e5e7eb', opacity: 0.3, marginTop: 3 }} />}
                    </div>
                    <div style={{ paddingBottom: i < data.timeline.length - 1 ? 24 : 0, paddingTop: 2 }}>
                      <p style={{ fontSize: 14, fontWeight: step.current ? 700 : 500, color: step.done ? '#111827' : '#9ca3af' }}>{step.label}</p>
                      {step.current && <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700, color: accent, background: lighten(accent, 0.85), padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Current</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Items */}
            {data.items?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <p style={s.sec}>Items in this order</p>
                {data.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i < data.items.length-1 ? 12 : 0, marginBottom: i < data.items.length-1 ? 12 : 0, borderBottom: i < data.items.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: lighten(accent, 0.88), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={15} color={accent} />
                    </div>
                    <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#111827' }}>{item.name}</p>
                    <span style={{ fontSize: 12, fontWeight: 700, color: accent, background: lighten(accent, 0.88), padding: '4px 10px', borderRadius: 8 }}>×{item.qty}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Payment + Courier */}
            <div style={{ display: 'grid', gridTemplateColumns: data.courierProvider ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 10 }}>
              {(data.paymentMethod || data.codAmount !== null) && (
                <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                  <p style={s.sec}>Payment</p>
                  {data.paymentMethod && <p style={{ fontSize: 13, color: '#374151', fontWeight: 600, marginBottom: 4 }}>{data.paymentMethod === 'COD' ? 'Cash on Delivery' : data.paymentMethod}</p>}
                  {data.codAmount !== null && <p style={{ fontSize: 18, fontWeight: 800, color: accent }}>৳{data.codAmount.toLocaleString('en-GB')}</p>}
                </div>
              )}
              {data.courierProvider && (
                <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                  <p style={s.sec}>Delivery</p>
                  <p style={{ fontSize: 13, color: '#374151', fontWeight: 600, marginBottom: 4 }}>{data.courierProvider}</p>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Partner assigned</span>
                </div>
              )}
            </div>

            {/* Support */}
            {data.store?.phone && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <p style={s.sec}>Need help?</p>
                <a href={`tel:${data.store.phone}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: accent, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  <Phone size={16} /> {data.store.phone}
                </a>
              </div>
            )}
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', marginTop: 8 }}>Powered by <strong style={{ color: '#9ca3af' }}>Dakio</strong></p>
      </div>
    </div>
  )
}

const s = { sec: { fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 } }
