'use client'
import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { useFashionTheme } from '../FashionThemeContext.jsx'
import { useTracking } from '../../../tracking/TrackingRoot'
import { itemFromBasic, listPayload } from '../../../../lib/tracking/items'

function filterProducts(products, tabId, limit) {
  switch (tabId) {
    case 'best':
      return [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, limit)
    case 'rated':
      return [...products].filter((p) => (p.rating ?? 0) >= 4.5).slice(0, limit)
    case 'sale':
      return products
        .filter((p) => p.comparePrice != null && p.comparePrice > p.price)
        .sort((a, b) => {
          const da = 1 - a.price / a.comparePrice
          const db = 1 - b.price / b.comparePrice
          return db - da
        })
        .slice(0, limit)
    case 'new':
      return products.filter((p) => p.badge === 'NEW').slice(0, limit)
    case 'featured':
      return products
        .filter((p) => p.badge || (p.comparePrice != null && p.comparePrice > p.price) || (p.rating ?? 0) >= 4.5)
        .slice(0, limit)
    default:
      return products.slice(0, limit)
  }
}

export default function ProductsSection({ settings }) {
  const { contract } = useFashionTheme()
  const products = contract.products

  const {
    eyebrow,
    title,
    tabs,
    defaultTab,
    limit,
    loadMoreLabel,
    showTabs = true,
    showReviews = false,
    showQuickView = true,
    showComparePrice = true,
    curated = false,
    addToCartLabel = 'Add to cart',
    quickViewLabel = 'Quick View',
  } = settings

  const [activeTab, setActiveTab] = useState(defaultTab)
  const [visibleCount, setVisibleCount] = useState(limit)

  useEffect(() => { setVisibleCount(limit) }, [limit])

  const filtered = useMemo(() => filterProducts(products, activeTab, products.length), [products, activeTab])
  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])
  const hasMore = visibleCount < filtered.length

  // One view_item_list per tab shown (load-more doesn't re-send it).
  const tk = useTracking()
  const list = useMemo(() => ({ id: 'home_' + (activeTab || 'all'), name: title || 'Products' }), [activeTab, title])
  const hasVisible = visibleProducts.length > 0
  useEffect(() => {
    if (!hasVisible || !tk.once(`vil:${window.location.pathname}:${list.id}`)) return
    tk.track('view_item_list', listPayload(list, visibleProducts.map((p, i) => itemFromBasic(p, { index: i, list }))))
  }, [list.id, hasVisible]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={`products-section ${!showTabs ? 'products-section--curated' : ''}`}>
      <div className="container">
        <div className="section-head section-head--center">
          {eyebrow?.trim() && <span className="eyebrow eyebrow--editorial">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>

        {showTabs && tabs?.length > 0 && (
          <div className="tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? 'tab active' : 'tab'}
                onClick={() => { setActiveTab(tab.id); setVisibleCount(limit) }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="products-grid">
          {visibleProducts.length === 0 ? (
            <div className="products-empty"><p>No products in this collection yet.</p></div>
          ) : (
            visibleProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                list={list}
                index={i}
                showReviews={curated || !showTabs ? false : showReviews}
                showQuickView={showQuickView}
                showComparePrice={showComparePrice}
                curated={curated || !showTabs}
                addToCartLabel={addToCartLabel}
                quickViewLabel={quickViewLabel}
              />
            ))
          )}
        </div>

        {hasMore && (
          <div className="section-cta">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setVisibleCount((c) => c + limit)}
            >
              {loadMoreLabel ?? 'View all'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
