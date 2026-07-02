'use client'
import { useState, useEffect, useRef } from 'react'
import SalePrice from './SalePrice.jsx'
import { AddedLabel, IconBagAddPlus, IconHeart } from './Icons.jsx'
import { useFashionTheme } from '../FashionThemeContext.jsx'

const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

function getAvailableSizes(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants.filter((v) => v.stock > 0).map((v) => v.name)
  }
  return PRODUCT_SIZES
}

export default function ProductCard({
  product,
  showReviews = false,
  showQuickView = true,
  showComparePrice = true,
  curated = false,
  addToCartLabel = 'Add to cart',
  quickViewLabel = 'Quick view',
}) {
  const { contract, navigate, quickView } = useFashionTheme()
  const [added, setAdded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef(null)

  // SSR race condition fix: image may finish loading before React attaches onLoad handler.
  // Check img.complete on mount and set loaded state immediately if so.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [])

  const onSale = product.comparePrice != null && product.comparePrice > product.price

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const defaultSize = getAvailableSizes(product)[0] ?? 'M'
    contract.cart.addItem(product, 1, defaultSize)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    quickView.open(product)
  }

  const goToProduct = () => navigate.toProduct(product.slug)
  const displayName = curated && product.name.length > 30 ? product.name.slice(0, 28) + '…' : product.name
  const showBadges = !curated
  const showWishlist = !curated
  const showSaleDetails = onSale && (!curated ? showComparePrice : true)

  return (
    <article className={`product-card${curated ? ' product-card--curated' : ''}`}>
      <div className={`product-card__media ${imageLoaded ? 'is-loaded' : 'is-loading'}`}>
        {showBadges && product.badge && (
          <span className="product-card__badge">{product.badge}</span>
        )}
        {showBadges && onSale && (
          <span className="product-card__badge product-card__badge--sale">Price drop</span>
        )}
        {curated && onSale && <span className="product-card__sale-tag">Price drop</span>}
        {curated && !onSale && product.badge && (
          <span className="product-card__badge product-card__badge--curated">{product.badge}</span>
        )}
        {showWishlist && (
          <button type="button" className="product-card__wish" aria-label="Add to wishlist">
            <IconHeart />
          </button>
        )}
        <button
          type="button"
          className="product-card__image-btn"
          onClick={goToProduct}
          aria-label={`View ${product.name}`}
        >
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </button>
        {curated ? (
          <button
            type="button"
            className="product-card__quick-add"
            onClick={handleQuickView}
            aria-label="Choose options"
          >
            <span className="product-card__quick-add-icon" aria-hidden="true">
              <IconBagAddPlus size={16} />
            </span>
            <span className="product-card__quick-add-label">Choose</span>
          </button>
        ) : (
          <div className="product-card__actions">
            <button
              type="button"
              className="btn btn--purchase btn--sm btn--block product-card__add"
              onClick={handleAddToCart}
            >
              {added ? <AddedLabel /> : addToCartLabel}
            </button>
            {showQuickView && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleQuickView}>
                {quickViewLabel}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="product-card__body">
        <button type="button" className="product-card__title-btn" onClick={goToProduct}>
          <h3 className="product-card__title">{displayName}</h3>
        </button>
        <span className="product-card__divider" aria-hidden="true" />
        <SalePrice
          product={product}
          variant="card"
          showDetails={showSaleDetails}
          className={`product-card__price${onSale ? ' product-card__price--sale' : ''}`}
        />
      </div>
    </article>
  )
}
