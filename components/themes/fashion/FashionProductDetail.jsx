'use client'
import { useEffect, useRef, useState } from 'react'
import { useFashionTheme } from './FashionThemeContext.jsx'
import SalePrice from './components/SalePrice.jsx'
import ProductCard from './components/ProductCard.jsx'
import { IconCart, IconMinus, IconPlus } from './components/Icons.jsx'
import HeaderSection from './sections/HeaderSection.jsx'
import FooterSection from './sections/FooterSection.jsx'
import { SizeGuideTrigger } from './sections/SizeGuide/SizeGuideModal.jsx'
import SizeGuideModal from './sections/SizeGuide/SizeGuideModal.jsx'
import { useRecentlyViewed } from './hooks/useRecentlyViewed.js'
import { CLASSIC_PAGE_CONFIG } from './defaults/pageConfig.js'

const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

function getAvailableSizes(product) {
  if (product.variants?.length > 0) {
    return product.variants.filter((v) => v.stock > 0).map((v) => v.name)
  }
  return PRODUCT_SIZES
}

const DEFAULT_HEADER = CLASSIC_PAGE_CONFIG.sections.find((s) => s.type === 'header')?.settings ?? {}
const DEFAULT_FOOTER = CLASSIC_PAGE_CONFIG.sections.find((s) => s.type === 'footer')?.settings ?? {}

// SVG trust badge icons
function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IconReturn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l4-4-4-4" />
      <path d="M7 5H21v7a4 4 0 0 1-4 4H3" />
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}
function IconHeart({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

export default function FashionProductDetail() {
  const { contract, navigate, sizeGuide } = useFashionTheme()

  const product  = contract.products[0]
  const related  = contract.products.slice(1, 5)
  const store    = contract.store

  // Recently viewed — track current product, get prior ones
  const { recentlyViewed, track } = useRecentlyViewed(product?.id)
  useEffect(() => { if (product) track(product) }, [product?.id])

  // Gallery
  const images   = product?.images?.length > 0 ? product.images : product?.image ? [product.image] : []
  const [activeImg, setActiveImg] = useState(images[0] ?? null)
  useEffect(() => { setActiveImg(images[0] ?? null) }, [product?.id])

  // Size/variant
  const availableSizes     = product ? getAvailableSizes(product) : []
  const hasVariants        = product?.variants?.length > 0
  const [selectedSize, setSelectedSize]       = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  useEffect(() => {
    if (!product) return
    const sizes = getAvailableSizes(product)
    setSelectedSize(sizes[0] ?? null)
    setSelectedVariant(product.variants?.[0] ?? null)
  }, [product?.id])

  // Quantity
  const [qty, setQty] = useState(1)

  // Add-to-cart feedback
  const [added, setAdded] = useState(false)

  // Wishlist placeholder (UI only, no persistence)
  const [wishlisted, setWishlisted] = useState(false)

  // Accordion
  const [accordion, setAccordion] = useState(null)

  // Sticky CTA — show after purchase zone scrolls out of view
  const purchaseZoneRef = useRef(null)
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const el = purchaseZoneRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!product) {
    return (
      <div className="product-page product-page--missing">
        <div className="container">
          <h1>Product not found</h1>
          <p>This product may have been removed or the link is incorrect.</p>
          <button type="button" className="btn btn--outline" onClick={navigate.toHome}>
            Back to store
          </button>
        </div>
      </div>
    )
  }

  const displayPrice = selectedVariant?.price ?? product.price
  const inStock      = product.availability?.inStock ?? true
  const oos          = !inStock

  const handleAddToCart = () => {
    if (oos) return
    contract.cart.addItem(product, qty, selectedVariant ?? selectedSize)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2500)
  }

  const handleBuyNow = () => {
    if (oos) return
    contract.cart.addItem(product, qty, selectedVariant ?? selectedSize)
    navigate.toCheckout()
  }

  const handleSizeSelect = (sizeName) => {
    setSelectedSize(sizeName)
    if (hasVariants) {
      setSelectedVariant(product.variants.find((v) => v.name === sizeName) ?? null)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(window.location.href).catch(() => {})
    }
  }

  const accordions = [
    {
      id: 'description',
      label: 'Description',
      content: product.description
        ? <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)' }}>{product.description}</p>
        : null,
    },
    {
      id: 'fabric',
      label: 'Fabric & Care',
      content: (
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
          <li>Premium quality fabric</li>
          <li>Machine wash cold, gentle cycle</li>
          <li>Iron on medium heat — do not iron prints</li>
          <li>Air dry recommended</li>
          <li>Do not bleach</li>
        </ul>
      ),
    },
  ].filter((a) => a.content !== null)

  const headerSettings = { ...DEFAULT_HEADER, brandName: store.name, brandMark: store.name?.[0] ?? '◆' }
  const footerSettings = { ...DEFAULT_FOOTER, brandName: store.name, brandMark: store.name?.[0] ?? '◆', copyright: `© ${new Date().getFullYear()} ${store.name}` }

  return (
    <>
      <HeaderSection settings={headerSettings} />

      <main className="product-page">
        <div className="container">

          {/* Breadcrumb */}
          <nav className="product-page__crumb" aria-label="Breadcrumb">
            <button type="button" onClick={navigate.toHome}>Home</button>
            <span aria-hidden="true">›</span>
            {product.category?.name && (
              <>
                <span>{product.category.name}</span>
                <span aria-hidden="true">›</span>
              </>
            )}
            <span style={{ color: 'var(--dark)' }}>{product.name}</span>
          </nav>

          {/* Hero grid */}
          <div className="product-page__hero">

            {/* Gallery */}
            <div className={`product-page__gallery ${images.length > 1 ? 'product-page__gallery--multi' : ''}`}>
              {images.length > 1 && (
                <div className="product-page__thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`product-page__thumb ${activeImg === img ? 'active' : ''}`}
                      onClick={() => setActiveImg(img)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
              )}

              <div className="product-page__main-image">
                {product.badge && <span className="product-page__badge">{product.badge}</span>}
                {product.comparePrice > product.price && (
                  <span className="product-page__sale-tag">
                    {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                  </span>
                )}
                {activeImg
                  ? <img src={activeImg} alt={product.name} />
                  : <div style={{ width: '100%', aspectRatio: '3/4', background: 'var(--bg-soft)' }} />
                }
                {images.length > 1 && (
                  <span className="product-page__image-count">{images.indexOf(activeImg) + 1} / {images.length}</span>
                )}
              </div>
            </div>

            {/* Purchase zone */}
            <div className="product-page__purchase-zone" ref={purchaseZoneRef}>
              {product.category?.name && <p className="product-page__category">{product.category.name}</p>}
              <h1 className="product-page__title">{product.name}</h1>
              {product.sku && <p className="product-page__sku">SKU: {product.sku}</p>}

              <div className="product-page__price-panel">
                <SalePrice product={{ ...product, price: displayPrice }} variant="page" showDetails={true} className="product-page__price" />
              </div>

              {/* Stock indicator */}
              {product.availability?.isLowStock && inStock && (
                <p className="product-page__stock">Only {product.availability.totalStock} left — order soon</p>
              )}
              {oos && <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '14px', margin: '0 0 16px' }}>Out of stock</p>}

              {/* Trust badges */}
              <div className="pdp-trust">
                <span className="pdp-trust__badge"><IconShield /> Secure payment</span>
                <span className="pdp-trust__badge"><IconReturn /> 7-day returns</span>
                <span className="pdp-trust__badge"><IconTruck /> Fast delivery</span>
              </div>

              {/* Size selector */}
              {availableSizes.length > 0 && (
                <div className="product-page__option">
                  <span className="product-page__label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      Size {selectedSize && <span style={{ fontWeight: 400, color: 'var(--muted)' }}>— {selectedSize}</span>}
                    </span>
                    <SizeGuideTrigger />
                  </span>
                  <div className="product-page__size-row">
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`product-page__size ${selectedSize === s ? 'active' : ''}`}
                        onClick={() => handleSizeSelect(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {!oos && (
                <div className="product-page__option">
                  <span className="product-page__label">Quantity</span>
                  <div className="product-page__qty">
                    <button type="button" aria-label="Decrease" onClick={() => setQty((n) => Math.max(1, n - 1))}>
                      <IconMinus size={14} />
                    </button>
                    <span>{qty}</span>
                    <button type="button" aria-label="Increase" onClick={() => setQty((n) => n + 1)}>
                      <IconPlus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Primary actions */}
              <div className="product-purchase" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className={`btn btn--purchase product-purchase__cart ${added ? 'is-in-cart' : ''}`}
                  onClick={handleAddToCart}
                  disabled={oos}
                >
                  <IconCart />
                  {added ? 'Added to cart ✓' : oos ? 'Out of stock' : 'Add to cart'}
                </button>
                {!oos && (
                  <button type="button" className="btn btn--dark product-purchase__buy" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                )}
              </div>

              {/* Secondary actions — wishlist + share */}
              <div className="pdp-actions-row">
                <button
                  type="button"
                  className={`pdp-action-btn ${wishlisted ? 'is-active' : ''}`}
                  onClick={() => setWishlisted((w) => !w)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={wishlisted}
                >
                  <IconHeart filled={wishlisted} />
                  {wishlisted ? 'Saved' : 'Save'}
                </button>
                <button
                  type="button"
                  className="pdp-action-btn"
                  onClick={handleShare}
                  aria-label="Share product"
                >
                  <IconShare />
                  Share
                </button>
              </div>

              {/* Delivery estimation */}
              <div className="pdp-delivery">
                <div className="pdp-delivery__row">
                  <span className="pdp-delivery__icon"><IconTruck /></span>
                  <span><span className="pdp-delivery__label">Dhaka</span> — delivered in 1–2 days</span>
                  <span className="pdp-delivery__detail">৳{store.deliveryInsideDhaka ?? 60}</span>
                </div>
                <div className="pdp-delivery__row">
                  <span className="pdp-delivery__icon"><IconTruck /></span>
                  <span><span className="pdp-delivery__label">Outside Dhaka</span> — 2–4 days</span>
                  <span className="pdp-delivery__detail">৳{store.deliveryOutsideDhaka ?? 120}</span>
                </div>
              </div>

              {/* Return policy card */}
              <div className="pdp-return">
                <span className="pdp-return__icon"><IconReturn /></span>
                <div className="pdp-return__text">
                  <strong>Easy 7-Day Returns</strong>
                  <span>Unworn, tags attached. Contact us within 7 days of delivery.</span>
                </div>
              </div>

              {/* Payment methods */}
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '16px 0 0' }}>
                bKash · Nagad · Cash on Delivery{store.phone ? ` · ${store.phone}` : ''}
              </p>

              {/* Accordions */}
              <div className="product-page__meta" style={{ marginTop: '28px' }}>
                {accordions.map((a) => (
                  <div key={a.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => setAccordion(accordion === a.id ? null : a.id)}
                      style={{
                        width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--dark)', textAlign: 'left',
                      }}
                    >
                      {a.label}
                      <span style={{ transform: accordion === a.id ? 'rotate(90deg)' : 'none', transition: '0.2s', color: 'var(--muted)' }}>›</span>
                    </button>
                    {accordion === a.id && <div style={{ paddingBottom: '16px' }}>{a.content}</div>}
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)' }} />
              </div>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <section className="products-section products-section--curated" style={{ paddingTop: 0 }}>
              <div className="section-head section-head--center" style={{ marginBottom: '28px' }}>
                <h2>You may also like</h2>
              </div>
              <div className="products-grid">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} curated={true} showQuickView={true} />
                ))}
              </div>
            </section>
          )}

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <section className="recently-viewed">
              <div className="recently-viewed__head">
                <h2>Recently Viewed</h2>
              </div>
              <div className="recently-viewed__grid">
                {recentlyViewed.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} curated={false} showQuickView={false} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <FooterSection settings={footerSettings} />

      {/* Size Guide Modal — standalone for PDP */}
      <SizeGuideModal />

      {/* Sticky mobile CTA */}
      <div className={`pdp-sticky-cta ${showStickyCta ? 'is-visible' : ''}`} aria-hidden={!showStickyCta}>
        <div className="pdp-sticky-cta__product">
          {product.image && <img className="pdp-sticky-cta__img" src={product.image} alt="" />}
          <div>
            <div className="pdp-sticky-cta__name">{product.name}</div>
            <div className="pdp-sticky-cta__price">৳{displayPrice?.toLocaleString('en-BD')}</div>
          </div>
        </div>
        <div className="pdp-sticky-cta__actions">
          <button
            type="button"
            className={`btn btn--purchase ${added ? 'is-in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={oos}
          >
            {added ? '✓ Added' : 'Add to cart'}
          </button>
        </div>
      </div>
    </>
  )
}
