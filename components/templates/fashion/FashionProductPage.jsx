'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronDown, Ruler, MessageCircle, Shield, Truck } from 'lucide-react'
import { fmt } from '../../../lib/storefront'
import { resolveMedia } from '../../../lib/mediaUtils'
import { resolveFashionConfig } from '../../../lib/theme/fashionDefaults'
import { fashionCss } from './tokens'
import { checkoutPath, storeHome, productPath } from '../../../lib/routes'
import FashionProductCard from './FashionProductCard'
import { useRecentlyViewed } from './useRecentlyViewed'
import { useWishlist } from './useWishlist'

const SIZE_GUIDE = [
  { size: 'S',  chest: '36"', waist: '30"', hip: '38"' },
  { size: 'M',  chest: '38"', waist: '32"', hip: '40"' },
  { size: 'L',  chest: '40"', waist: '34"', hip: '42"' },
  { size: 'XL', chest: '42"', waist: '36"', hip: '44"' },
]

export default function FashionProductPage({
  store, product: p, slug, isCustomDomain, relatedProducts = [], allProducts = [],
  mode = 'page', onClose, onAdd,
}) {
  const router = useRouter()
  const config = resolveFashionConfig(store)
  const accent = config.primary
  const pp = config.productPage || {}

  const { primary: primaryImg, gallery: allImgs } = resolveMedia(p)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(primaryImg)
  const [accordion, setAccordion] = useState(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [adding, setAdding] = useState(false)

  useRecentlyViewed(slug, p.id)
  const { toggle, has } = useWishlist(slug)

  const hasVariants = p.variants?.length > 0
  const needsVariant = hasVariants && !selectedVariant
  const activeVariant = hasVariants ? selectedVariant : null
  const displayPrice = activeVariant?.price != null ? activeVariant.price : p.sellingPrice
  const variantStock = activeVariant ? activeVariant.stock : p.totalStock
  const oos = hasVariants ? (!needsVariant && variantStock <= 0) : (p.totalStock <= 0)
  const discount = p.mrp && p.mrp > displayPrice ? Math.round((1 - displayPrice / p.mrp) * 100) : null

  const recentIds = typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem(`dk_recent_${slug}`) || '[]') } catch { return [] } })() : []
  const recentlyViewed = allProducts.filter(x => recentIds.includes(x.id) && x.id !== p.id).slice(0, 4)
  const related = relatedProducts.filter(x => x.id !== p.id).slice(0, 4)

  useEffect(() => { setActiveImg(primaryImg) }, [primaryImg])

  const deliveryText = pp.deliveryText || `Free delivery on orders above ৳2000. Dhaka delivery from ৳${store?.deliveryInsideDhaka ?? 60}. Nationwide from ৳${store?.deliveryOutsideDhaka ?? 120}.`
  const returnText = pp.returnPolicyText || 'Easy returns within 7 days of delivery. Item must be unworn with tags attached.'

  function buildCartItem() {
    const variantId = activeVariant?.id || null
    const key = `${p.id}_${variantId || 'default'}`
    const name = activeVariant ? `${p.name} — ${activeVariant.name}` : p.name
    return {
      key, productId: p.id, variantId, name,
      sku: activeVariant?.sku || p.sku || '',
      unitPrice: displayPrice, qty, imageUrl: primaryImg,
    }
  }

  function addToCartLocal() {
    if (needsVariant || oos) return
    const item = buildCartItem()
    if (onAdd) { onAdd(p, qty, activeVariant); return }
    try {
      const existing = JSON.parse(localStorage.getItem(`dk_cart_${slug}`) || '[]')
      const idx = existing.findIndex(i => i.key === item.key)
      if (idx >= 0) existing[idx].qty += qty
      else existing.push(item)
      localStorage.setItem(`dk_cart_${slug}`, JSON.stringify(existing))
    } catch {}
  }

  function buyNow() {
    if (needsVariant || oos) return
    setAdding(true)
    addToCartLocal()
    router.push(checkoutPath(slug))
  }

  function goProduct(prod) {
    if (prod.slug) router.push(productPath(prod.slug, slug))
  }

  const homeUrl = isCustomDomain ? '/' : `/${slug}`

  const buyBox = (
    <div className="ft-pdp-buybox">
      {p.category?.name && <p className="ft-pdp-cat">{p.category.name}</p>}
      <h1 className="ft-pdp-title">{p.name}</h1>
      <div className="ft-pdp-price-row">
        <span className="ft-pdp-price">{fmt(displayPrice, store?.currency)}</span>
        {p.mrp && p.mrp > displayPrice && <span className="ft-compare">{fmt(p.mrp, store?.currency)}</span>}
        {discount && <span className="ft-pdp-discount">-{discount}%</span>}
      </div>
      <span className="ft-cod-pill">Cash on Delivery available</span>

      {!hasVariants && (
        <p className={`ft-pdp-stock ${oos ? 'oos' : ''}`}>{oos ? 'Out of stock' : 'In stock — ready to ship'}</p>
      )}

      {hasVariants && (
        <div className="ft-pdp-variants">
          <div className="ft-pdp-label-row">
            <span className="ft-pdp-label">Select size</span>
            {pp.showSizeGuide !== false && (
              <button type="button" className="ft-pdp-link" onClick={() => setSizeGuideOpen(true)}>
                <Ruler size={14} /> Size guide
              </button>
            )}
          </div>
          <div className="ft-pdp-variant-grid">
            {p.variants.map(v => (
              <button key={v.id} type="button" disabled={v.stock <= 0}
                className={`ft-pdp-variant ${selectedVariant?.id === v.id ? 'active' : ''} ${v.stock <= 0 ? 'disabled' : ''}`}
                onClick={() => setSelectedVariant(v)}>{v.name}</button>
            ))}
          </div>
        </div>
      )}

      {needsVariant && <p className="ft-pdp-hint">Please select a size to continue</p>}

      {!oos && !needsVariant && (
        <div className="ft-pdp-qty">
          <span className="ft-pdp-label">Quantity</span>
          <div className="ft-pdp-qty-ctrl">
            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty(q => q + 1)}>+</button>
          </div>
        </div>
      )}

      <div className="ft-pdp-actions-desktop">
        {!oos && !needsVariant && (
          <>
            <button type="button" className="ft-btn ft-btn-outline ft-pdp-btn" onClick={addToCartLocal}>Add to Cart</button>
            <button type="button" className="ft-btn ft-btn-primary ft-pdp-btn" onClick={buyNow} disabled={adding}>Buy Now</button>
          </>
        )}
        {pp.showWhatsapp !== false && store?.whatsappNumber && (
          <a className="ft-btn ft-pdp-wa" href={`https://wa.me/880${String(store.whatsappNumber).replace(/^(\+?880|0)/, '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I want to order: ${p.name}`)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} /> Order on WhatsApp
          </a>
        )}
      </div>

      <div className="ft-pdp-trust-mini">
        <span><Truck size={14} /> Fast delivery</span>
        <span><Shield size={14} /> Secure COD</span>
      </div>

      {[
        { id: 'details', label: 'Product details', content: p.description ? <div className="ft-pdp-html" dangerouslySetInnerHTML={{ __html: p.description }} /> : <p className="ft-pdp-muted">Premium quality fashion piece.</p> },
        { id: 'delivery', label: 'Delivery & returns', content: <p className="ft-pdp-muted">{deliveryText} {returnText}</p> },
      ].map(a => (
        <div key={a.id} className="ft-pdp-acc">
          <button type="button" onClick={() => setAccordion(accordion === a.id ? null : a.id)}>
            {a.label}<ChevronDown size={16} style={{ transform: accordion === a.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          {accordion === a.id && <div className="ft-pdp-acc-body">{a.content}</div>}
        </div>
      ))}
    </div>
  )

  return (
    <div className={`ft-root ft-pdp ${mode === 'overlay' ? 'ft-pdp-overlay' : ''}`}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{fashionCss(accent)}{`
        .ft-pdp { background: #fff; min-height: 100vh; padding-bottom: 80px; }
        .ft-pdp-overlay { position: fixed; inset: 0; z-index: 300; overflow-y: auto; }
        .ft-pdp-header { position: sticky; top: 0; z-index: 20; background: rgba(255,255,255,.96); backdrop-filter: blur(8px); border-bottom: 1px solid #E8E6E1; height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
        .ft-pdp-layout { max-width: 1320px; margin: 0 auto; padding: 24px 16px; display: grid; grid-template-columns: 1fr; gap: 32px; }
        .ft-pdp-gallery-main { aspect-ratio: 3/4; background: #F7F6F3; overflow: hidden; }
        .ft-pdp-gallery-main img { width: 100%; height: 100%; object-fit: cover; }
        .ft-pdp-thumbs { display: flex; gap: 8px; margin-top: 10px; overflow-x: auto; }
        .ft-pdp-thumb { width: 72px; height: 96px; flex-shrink: 0; border: 2px solid transparent; overflow: hidden; cursor: pointer; background: #F7F6F3; }
        .ft-pdp-thumb.active { border-color: #111; }
        .ft-pdp-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ft-pdp-buybox { position: relative; }
        .ft-pdp-cat { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #9CA3AF; margin: 0 0 8px; }
        .ft-pdp-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(26px, 5vw, 34px); font-weight: 500; line-height: 1.15; margin: 0 0 12px; }
        .ft-pdp-price-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
        .ft-pdp-price { font-size: 22px; font-weight: 600; }
        .ft-pdp-discount { font-size: 12px; font-weight: 700; color: #B42318; }
        .ft-pdp-stock { font-size: 13px; color: #166534; margin: 12px 0; }.ft-pdp-stock.oos { color: #B42318; }
        .ft-pdp-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .ft-pdp-label { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #6B7280; }
        .ft-pdp-link { background: none; border: none; font-size: 12px; color: #111; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; text-decoration: underline; }
        .ft-pdp-variant-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .ft-pdp-variant { min-width: 44px; height: 44px; padding: 0 14px; border: 1px solid #E8E6E1; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; }
        .ft-pdp-variant.active { border-color: #111; background: #111; color: #fff; }
        .ft-pdp-variant.disabled { opacity: .4; text-decoration: line-through; cursor: not-allowed; }
        .ft-pdp-hint { font-size: 13px; color: #9CA3AF; margin-bottom: 16px; }
        .ft-pdp-qty { margin-bottom: 20px; }
        .ft-pdp-qty-ctrl { display: inline-flex; border: 1px solid #E8E6E1; margin-top: 8px; }
        .ft-pdp-qty-ctrl button { width: 44px; height: 44px; border: none; background: #fff; cursor: pointer; font-size: 18px; }
        .ft-pdp-qty-ctrl span { width: 44px; display: flex; align-items: center; justify-content: center; font-weight: 600; border-left: 1px solid #E8E6E1; border-right: 1px solid #E8E6E1; }
        .ft-pdp-actions-desktop { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .ft-pdp-btn { width: 100%; justify-content: center; }
        .ft-pdp-wa { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; background: #F7F6F3; color: #111; text-decoration: none; font-size: 13px; font-weight: 600; border: 1px solid #E8E6E1; }
        .ft-pdp-trust-mini { display: flex; gap: 20px; font-size: 12px; color: #6B7280; margin-bottom: 24px; }
        .ft-pdp-trust-mini span { display: inline-flex; align-items: center; gap: 6px; }
        .ft-pdp-acc { border-top: 1px solid #E8E6E1; }
        .ft-pdp-acc button { width: 100%; padding: 16px 0; display: flex; justify-content: space-between; align-items: center; background: none; border: none; font-size: 14px; font-weight: 600; cursor: pointer; }
        .ft-pdp-acc-body { padding-bottom: 16px; }
        .ft-pdp-muted { font-size: 14px; color: #6B7280; line-height: 1.7; margin: 0; }
        .ft-pdp-html { font-size: 14px; line-height: 1.7; color: #374151; }
        .ft-pdp-section { padding: 48px 16px; max-width: 1320px; margin: 0 auto; }
        .ft-pdp-mobile-bar { display: flex; gap: 8px; position: fixed; left: 0; right: 0; bottom: 0; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #E8E6E1; z-index: 50; }
        .ft-pdp-mobile-bar .ft-btn { flex: 1; justify-content: center; padding: 14px 12px; }
        .ft-size-modal { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 400; display: flex; align-items: flex-end; }
        .ft-size-sheet { background: #fff; width: 100%; max-height: 70vh; overflow-y: auto; padding: 24px 16px; }
        .ft-size-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ft-size-table th, .ft-size-table td { border: 1px solid #E8E6E1; padding: 10px; text-align: left; }
        @media (min-width: 900px) {
          .ft-pdp-layout { grid-template-columns: 1.1fr 0.9fr; gap: 48px; padding: 40px 24px; }
          .ft-pdp-buybox { position: sticky; top: 80px; align-self: start; }
          .ft-pdp-mobile-bar { display: none; }
          .ft-pdp { padding-bottom: 0; }
        }
        @media (max-width: 899px) {
          .ft-pdp-actions-desktop .ft-btn-primary, .ft-pdp-actions-desktop .ft-btn-outline:first-child { display: none; }
        }
      `}</style>

      <header className="ft-pdp-header">
        {mode === 'overlay'
          ? <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Back</button>
          : <a href={homeUrl} style={{ textDecoration: 'none', color: '#111', fontWeight: 600, fontSize: 14 }}>{store?.name}</a>}
        <button type="button" className="ft-wish" aria-label="Wishlist" onClick={() => toggle(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          ♥ {has(p.id) ? accent : '#111'}
        </button>
        {mode === 'overlay' && <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>}
      </header>

      <div className="ft-pdp-layout">
        <div>
          <div className="ft-pdp-gallery-main">
            {activeImg ? <img src={activeImg} alt={p.name} /> : null}
          </div>
          {allImgs.length > 1 && (
            <div className="ft-pdp-thumbs">
              {allImgs.map(img => (
                <button key={img} type="button" className={`ft-pdp-thumb ${activeImg === img ? 'active' : ''}`} onClick={() => setActiveImg(img)}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        {buyBox}
      </div>

      {related.length > 0 && (
        <section className="ft-pdp-section">
          <h2 className="ft-section-title">You may also like</h2>
          <div className="ft-grid-2 ft-product-grid-desktop">
            {related.map(prod => (
              <FashionProductCard key={prod.id} product={prod} currency={store?.currency} primary={accent}
                onView={goProduct} onQuickAdd={() => onAdd?.(prod, 1)} wishlisted={has(prod.id)} onToggleWish={toggle} showMobileActions />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="ft-pdp-section" style={{ background: '#F7F6F3' }}>
          <h2 className="ft-section-title">Recently viewed</h2>
          <div className="ft-grid-2 ft-product-grid-desktop">
            {recentlyViewed.map(prod => (
              <FashionProductCard key={prod.id} product={prod} currency={store?.currency} primary={accent}
                onView={goProduct} onQuickAdd={() => onAdd?.(prod, 1)} wishlisted={has(prod.id)} onToggleWish={toggle} showMobileActions />
            ))}
          </div>
        </section>
      )}

      {!oos && !needsVariant && (
        <div className="ft-pdp-mobile-bar">
          <button type="button" className="ft-btn ft-btn-outline" onClick={addToCartLocal}>Add to Cart</button>
          <button type="button" className="ft-btn ft-btn-primary" onClick={buyNow}>Buy Now</button>
        </div>
      )}

      {sizeGuideOpen && (
        <div className="ft-size-modal" onClick={() => setSizeGuideOpen(false)}>
          <div className="ft-size-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>Size guide</h3>
            <table className="ft-size-table">
              <thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th></tr></thead>
              <tbody>{SIZE_GUIDE.map(r => <tr key={r.size}><td>{r.size}</td><td>{r.chest}</td><td>{r.waist}</td><td>{r.hip}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
