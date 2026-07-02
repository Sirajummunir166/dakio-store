'use client'
import { useEffect, useState } from 'react'
import { IconArrowRight, IconClose, IconMinus, IconPlus } from './Icons.jsx'
import SalePrice from './SalePrice.jsx'
import { useFashionTheme } from '../FashionThemeContext.jsx'

const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

function getAvailableSizes(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants.filter((v) => v.stock > 0).map((v) => v.name)
  }
  return PRODUCT_SIZES
}

export default function ProductQuickView() {
  const { contract, navigate, quickView } = useFashionTheme()
  const product = quickView.product
  const [size, setSize] = useState('M')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!product) return
    setSize(getAvailableSizes(product)[0] ?? 'M')
    setQty(1)
    setAdded(false)
  }, [product?.id])

  useEffect(() => {
    if (!product) return
    const onKey = (e) => { if (e.key === 'Escape') quickView.close() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [product])

  if (!product) return null

  const availableSizes = getAvailableSizes(product)

  const handleAddToCart = () => {
    contract.cart.addItem(product, qty, size)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  const viewFull = () => {
    quickView.close()
    navigate.toProduct(product.slug)
  }

  return (
    <div className="qv" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`}>
      <button type="button" className="qv__backdrop" aria-label="Close" onClick={quickView.close} />
      <div className="qv__panel">
        <button type="button" className="qv__close" aria-label="Close" onClick={quickView.close}>
          <IconClose size={20} />
        </button>

        <div className="qv__grid">
          <div className="qv__media">
            {product.badge && <span className="qv__badge">{product.badge}</span>}
            <img src={product.image} alt={product.name} />
          </div>

          <div className="qv__body">
            <p className="qv__eyebrow">Quick View</p>
            <h2 className="qv__title">{product.name}</h2>

            <SalePrice product={product} variant="quick" className="qv__price" />

            {product.description && <p className="qv__desc">{product.description}</p>}

            <div className="qv__sizes">
              <span className="qv__label">Size</span>
              <div className="qv__size-row">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={size === s ? 'qv__size active' : 'qv__size'}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="qv__option">
              <span className="qv__label">Quantity</span>
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

            <button
              type="button"
              className="btn btn--accent btn--block"
              onClick={handleAddToCart}
              disabled={!product.availability?.inStock}
            >
              {added ? 'Added to cart ✓' : (product.availability?.inStock ? 'Add to cart' : 'Out of stock')}
            </button>
            <button type="button" className="btn btn--outline qv__continue" onClick={quickView.close}>
              Continue Shopping
            </button>
            <button type="button" className="btn btn--ghost qv__details-link" onClick={viewFull}>
              <span className="link-with-icon">
                View Full Details
                <IconArrowRight size={16} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
