'use client'
// Goes well with (DAKIO_PAIRINGS_PLAN.md cut 2) — the basic store's product
// page. The merchant's add-ons for this product (product.pairings, from the
// API's product payload), each added as its own add-on line so the together
// price applies while this product is in the cart (lib/addOnCart.js — the
// same rule the server prices by).
import { useState } from 'react'
import { useFashionTheme } from '../FashionThemeContext.jsx'

const tk = (n) => `৳${(Number(n) || 0).toLocaleString('en-IN')}`

function AddOnCard({ main, a, onAdd }) {
  const inStock = (a.variants || []).filter((v) => v.stock > 0)
  const [variantId, setVariantId] = useState(inStock[0]?.id ?? null)
  const [added, setAdded] = useState(false)
  const variant = (a.variants || []).find((v) => v.id === variantId) || null
  const normal = variant?.price != null ? variant.price : a.price
  const deal = a.togetherPrice != null && a.togetherPrice < normal
  const needsSize = (a.variants || []).length > 0
  const canAdd = !needsSize || Boolean(variant)
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg)', minWidth: 0 }}>
      <div style={{ width: 64, height: 80, flexShrink: 0, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-soft)' }}>
        {a.image ? <img src={a.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
        {a.reason ? <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{a.reason}</div> : null}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{tk(deal ? a.togetherPrice : normal)}</span>
          {deal ? <span style={{ fontSize: 12.5, color: 'var(--muted)', textDecoration: 'line-through' }}>{tk(normal)}</span> : null}
          {deal ? <span style={{ fontSize: 12, color: 'var(--sale)' }}>with this {main.name.length > 22 ? 'item' : main.name}</span> : null}
        </div>
        {needsSize && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {a.variants.map((v) => (
              <button key={v.id} type="button" disabled={v.stock <= 0} onClick={() => { setVariantId(v.id); setAdded(false) }}
                style={{ minWidth: 34, padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: v.stock > 0 ? 'pointer' : 'not-allowed', border: `1.5px solid ${v.id === variantId ? 'var(--accent)' : 'var(--border)'}`, background: v.id === variantId ? 'var(--accent)' : 'transparent', color: v.id === variantId ? '#fff' : 'var(--text)', opacity: v.stock > 0 ? 1 : 0.4, textDecoration: v.stock > 0 ? 'none' : 'line-through' }}>
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <button type="button" disabled={!canAdd} onClick={() => { onAdd(a, variant); setAdded(true) }}
        style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 13, cursor: canAdd ? 'pointer' : 'not-allowed', border: added ? '1.5px solid var(--border)' : '1.5px solid var(--accent)', background: added ? 'transparent' : 'var(--accent)', color: added ? 'var(--text)' : '#fff', fontFamily: 'var(--font-button)' }}>
        {added ? 'Added ✓' : 'Add'}
      </button>
    </div>
  )
}

export default function GoesWellWith({ product }) {
  const { contract } = useFashionTheme()
  const pairs = Array.isArray(product?.pairings) ? product.pairings : []
  if (pairs.length === 0 || !contract?.cart?.addItem) return null
  const onAdd = (a, variant) => {
    // The bridge expects a ThemeContract product (price/image/variants/totalStock).
    contract.cart.addItem(
      { id: a.id, name: a.name, slug: a.slug, price: a.price, image: a.image, variants: a.variants || [], totalStock: a.totalStock },
      1,
      variant || null,
      { of: product.id, together: a.togetherPrice },
    )
  }
  return (
    <section className="product-page__pairs" style={{ marginTop: 40 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(19px, 2.2vw, 24px)', fontWeight: 500, letterSpacing: '-0.02em' }}>Goes well with</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {pairs.map((a) => <AddOnCard key={a.id} main={product} a={a} onAdd={onAdd} />)}
      </div>
    </section>
  )
}
