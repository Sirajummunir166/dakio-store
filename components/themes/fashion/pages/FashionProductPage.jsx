'use client'
import { useEffect, useRef, useState } from 'react'
import SalePrice from '../components/SalePrice.jsx'
import ProductGallery from '../components/ProductGallery.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductPurchaseActions from '../components/ProductPurchaseActions.jsx'
import { IconCart, IconCheck, IconMinus, IconPlus } from '../components/Icons.jsx'
import { useCart } from '../compat/useCart.js'
import { useProductStore } from '../compat/useProductStore.js'
import { getCartLine } from '../compat/lib-cart.js'
import { getProductAvailableSizes, isOnSale } from '../compat/lib-products.js'
import { useFashionTheme } from '../FashionThemeContext.jsx'

function formatPrice(amount) {
  const value = Number(amount) || 0
  return `৳${value.toLocaleString('en-IN')}`
}

export default function FashionProductPage({ product }) {
  const { contract } = useFashionTheme()
  const { goHome } = useProductStore()
  const { addItem, items, openCart } = useCart()
  const [size, setSize] = useState('M')
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [stickyVisible, setStickyVisible] = useState(false)
  const purchaseRef = useRef(null)

  // Dakio Platform decides what related products are — theme only renders what it receives
  const related = contract.relatedProducts ?? []
  const availableSizes = getProductAvailableSizes(product)
  const cartLine = getCartLine(items, product.id, size)
  const inCart = Boolean(cartLine)
  const onSale = isOnSale(product)

  useEffect(() => {
    setSize(getProductAvailableSizes(product)[0] ?? 'M')
    setQty(1)
    setActiveTab('description')
    setStickyVisible(false)
  }, [product.id])

  useEffect(() => {
    const node = purchaseRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStickyVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '0px 0px -8px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [product.id])

  const handleStickyAction = () => {
    if (inCart) {
      openCart()
      return
    }
    addItem(product, { size, qty })
  }

  return (
    <div className="product-page">
      <div className="container">
        <nav className="product-page__crumb" aria-label="Breadcrumb">
          <button type="button" onClick={goHome}>Home</button>
          <span>/</span>
          <button type="button" onClick={goHome}>Shop</button>
          <span>/</span>
          <span>{product.category?.name ?? product.category}</span>
        </nav>

        <div className="product-page__hero">
          <ProductGallery product={product} />

          <div className="product-page__info">
            <p className="product-page__category">{product.category?.name ?? product.category}</p>
            <h1 className="product-page__title">{product.name}</h1>

            <p className="product-page__sku">SKU {product.sku}</p>

            {onSale ? (
              <div className="product-page__price-panel">
                <SalePrice product={product} variant="page" />
              </div>
            ) : (
              <SalePrice product={product} variant="page" className="product-page__price" />
            )}

            <p className="product-page__stock">
              {product.availability?.inStock === false
                ? 'Out of stock'
                : product.availability?.isLowStock
                  ? `Only ${product.totalStock} left`
                  : product.totalStock > 0
                    ? 'In stock'
                    : product.stock != null ? product.stock : null}
            </p>

            <div ref={purchaseRef} className="product-page__purchase-zone">
              <div className="product-page__option">
                <span className="product-page__label">Size</span>
                <div className="product-page__size-row">
                  {availableSizes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={size === item ? 'product-page__size active' : 'product-page__size'}
                      onClick={() => setSize(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

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

              <ProductPurchaseActions product={product} size={size} qty={qty} />
            </div>

            <ul className="product-page__trust">
              <li><IconCheck size={14} /> Free delivery over ৳2,500</li>
              <li><IconCheck size={14} /> 7-day easy returns</li>
              <li><IconCheck size={14} /> bKash · Nagad · COD</li>
            </ul>

            <p className="product-page__desc product-page__desc--desktop">{product.description}</p>

            <ul className="product-page__highlights product-page__highlights--desktop">
              {(product.highlights ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="product-page__meta">
              <p><strong>Fabric:</strong> {product.fabric}</p>
              <p><strong>Fit:</strong> {product.fit}</p>
              <p><strong>Care:</strong> {product.care}</p>
            </div>
          </div>
        </div>

        <div className="product-page__tabs">
          <div className="product-page__tab-list" role="tablist">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'size', label: 'Size Guide' },
              { id: 'shipping', label: 'Shipping & Returns' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? 'product-page__tab active' : 'product-page__tab'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="product-page__tab-panel">
            {activeTab === 'description' && (
              <div>
                <p>{product.description}</p>
                <ul>
                  {(product.highlights ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <dl className="product-page__specs">
                {(product.specs ?? []).map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {activeTab === 'size' && (
              <table className="product-page__table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Length</th>
                  </tr>
                </thead>
                <tbody>
                  {(product.sizeGuide ?? []).map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td>
                      <td>{row.chest}</td>
                      <td>{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'shipping' && (
              <ul>
                {(product.shipping ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="product-page__related">
            <h2>You May Also Like</h2>
            <div className="products-grid">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  curated
                  showReviews={false}
                  showQuickView={false}
                  showComparePrice={false}
                  addToCartLabel="Add to cart"
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div
        className={`product-page__sticky-bar ${stickyVisible ? 'is-visible' : ''}`}
        aria-hidden={!stickyVisible}
      >
        <div className="product-page__sticky-inner">
          <div className="product-page__sticky-product">
            <img src={product.image} alt="" className="product-page__sticky-thumb" />
            <div className="product-page__sticky-copy">
              <strong className="product-page__sticky-name">{product.name}</strong>
              <span className="product-page__sticky-variant">
                Size {size}
                {inCart && <em className="product-page__sticky-in-cart"> · In cart</em>}
              </span>
            </div>
          </div>
          <div className="product-page__sticky-actions">
            <div className="product-page__sticky-price">
              <strong>{formatPrice(product.price)}</strong>
            </div>
            <button
              type="button"
              className={`btn btn--purchase product-page__sticky-cta${inCart ? ' is-in-cart' : ''}`}
              onClick={handleStickyAction}
            >
              {inCart ? (
                <>
                  <IconCheck size={16} />
                  View cart{cartLine.qty > 1 ? ` (${cartLine.qty})` : ''}
                </>
              ) : (
                <>
                  <IconCart />
                  Add to cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
