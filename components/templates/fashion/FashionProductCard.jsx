'use client'
import { useState } from 'react'
import { Heart, Package } from 'lucide-react'
import { fmt } from '../../../lib/storefront'
import { resolveMedia } from '../../../lib/mediaUtils'

export default function FashionProductCard({
  product, currency, primary, onView, onQuickAdd, wishlisted, onToggleWish,
  showMobileActions = false,
}) {
  const [hover, setHover] = useState(false)
  const { primary: img1, gallery } = resolveMedia(product)
  const img2 = gallery[1] || product.hoverImage || null
  const oos = product.totalStock !== undefined && product.totalStock <= 0
  const discount = product.mrp && product.mrp > product.sellingPrice
    ? Math.round((1 - product.sellingPrice / product.mrp) * 100) : null

  return (
    <article
      className="ft-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="ft-card-img" onClick={() => onView(product)}>
        {img1
          ? <>
              <img src={img1} alt={product.name} loading="lazy" />
              {img2 && <img src={img2} alt="" className="ft-img-hover" loading="lazy" aria-hidden />}
            </>
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={32} color="#ccc" strokeWidth={1.2} /></div>
        }
        {discount && !oos && <span className="ft-discount">-{discount}%</span>}
        {oos && <span className="ft-discount" style={{ background: '#9CA3AF' }}>Sold Out</span>}
        <button type="button" className="ft-wish" aria-label="Wishlist" onClick={e => { e.stopPropagation(); onToggleWish?.(product.id) }}>
          <Heart size={16} fill={wishlisted ? primary : 'none'} stroke={wishlisted ? primary : '#111'} />
        </button>
        {(hover || showMobileActions) && !oos && (
          <div className="ft-card-actions" onClick={e => e.stopPropagation()}>
            <button type="button" className="ft-card-action-btn" onClick={() => onQuickAdd?.(product)}>Quick Add</button>
            <button type="button" className="ft-card-action-btn" onClick={() => onView(product)}>View</button>
          </div>
        )}
      </div>
      <div onClick={() => onView(product)}>
        <h3 className="ft-card-title">{product.name}</h3>
        <div>
          <span className="ft-price">{fmt(product.sellingPrice, currency)}</span>
          {product.mrp && product.mrp > product.sellingPrice && (
            <span className="ft-compare">{fmt(product.mrp, currency)}</span>
          )}
        </div>
        <span className="ft-cod-pill">COD</span>
      </div>
    </article>
  )
}
