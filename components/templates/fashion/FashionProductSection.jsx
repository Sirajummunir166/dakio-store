'use client'
import FashionProductCard from './FashionProductCard'

export default function FashionProductSection({
  id, title, subtitle, products, currency, primary,
  onView, onQuickAdd, wishHas, onToggleWish, sortOptions, sort, onSort,
}) {
  if (!products?.length) return null

  return (
    <section id={id} className="ft-section">
      <div className="ft-container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <h2 className="ft-section-title" style={{ marginBottom: 4 }}>{title}</h2>
            {subtitle && <p className="ft-section-sub" style={{ marginBottom: 0 }}>{subtitle}</p>}
          </div>
          {sortOptions && (
            <select value={sort} onChange={e => onSort?.(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E8E6E1', fontSize: 13, background: '#fff', fontFamily: 'inherit' }}>
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>
        <div className="ft-grid-2 ft-product-grid-desktop">
          {products.map(p => (
            <FashionProductCard
              key={p.id}
              product={p}
              currency={currency}
              primary={primary}
              onView={onView}
              onQuickAdd={onQuickAdd}
              wishlisted={wishHas(p.id)}
              onToggleWish={onToggleWish}
              showMobileActions
            />
          ))}
        </div>
      </div>
      <style>{`@media (min-width: 768px) { .ft-product-grid-desktop { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
    </section>
  )
}
