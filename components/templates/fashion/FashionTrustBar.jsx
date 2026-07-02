'use client'
import { useState, useEffect } from 'react'
import { Truck, RefreshCw, Shield, Banknote } from 'lucide-react'

export default function FashionTrustBar({ config, store }) {
  if (config.sections?.trust?.enabled === false) return null

  const inside = store?.deliveryInsideDhaka
  const items = [
    { icon: Banknote, title: 'Cash on Delivery', sub: 'Pay when you receive' },
    { icon: Truck,    title: 'Fast Delivery',    sub: inside ? `Dhaka from ৳${inside}` : 'Nationwide shipping' },
    { icon: RefreshCw, title: 'Easy Returns',  sub: 'Hassle-free exchange policy' },
    { icon: Shield,   title: 'Secure Order',     sub: 'Trusted by thousands' },
  ]

  return (
    <section className="ft-section" style={{ paddingTop: 24, paddingBottom: 24, borderTop: `1px solid #E8E6E1`, borderBottom: `1px solid #E8E6E1` }}>
      <div className="ft-container">
        <div className="ft-trust">
          {items.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="ft-trust-item">
              <Icon size={18} strokeWidth={1.5} />
              <div>
                <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{title}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FashionFlashSale({ config }) {
  const flash = config.sections?.flashSale
  const [left, setLeft] = useState('')

  useEffect(() => {
    if (!flash?.enabled || !flash.endsAt) return
    const tick = () => {
      const diff = new Date(flash.endsAt).getTime() - Date.now()
      if (diff <= 0) { setLeft('Ended'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setLeft(`${h}h ${m}m ${s}s`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [flash?.enabled, flash?.endsAt])

  if (!flash?.enabled) return null

  return (
    <section id="flashSale" className="ft-section" style={{ background: '#111', color: '#fff' }}>
      <div className="ft-container" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>Limited Offer</p>
        <h2 className="ft-section-title" style={{ color: '#fff' }}>{flash.title}</h2>
        <p style={{ opacity: 0.7, marginBottom: 16 }}>{flash.subtitle}</p>
        {flash.endsAt && left && <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }}>{left}</div>}
      </div>
    </section>
  )
}
