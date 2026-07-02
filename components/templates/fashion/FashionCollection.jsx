'use client'
import { useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import FashionProductCard from './FashionProductCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

function sortList(list, sort) {
  const arr = [...list]
  if (sort === 'price-asc') return arr.sort((a, b) => a.sellingPrice - b.sellingPrice)
  if (sort === 'price-desc') return arr.sort((a, b) => b.sellingPrice - a.sellingPrice)
  return arr
}

export default function FashionCollection({
  products, categories, currency, primary, title, subtitle,
  onView, onQuickAdd, wishHas, onToggleWish, onClear,
}) {
  const [sort, setSort] = useState('newest')
  const [filterOpen, setFilterOpen] = useState(false)
  const [catFilter, setCatFilter] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState('')

  const filtered = useMemo(() => {
    let list = products
    if (catFilter !== 'all') list = list.filter(p => p.category?.id === catFilter || p.category?.name === catFilter)
    if (inStockOnly) list = list.filter(p => (p.totalStock ?? 1) > 0)
    if (maxPrice) list = list.filter(p => p.sellingPrice <= Number(maxPrice))
    return sortList(list, sort)
  }, [products, catFilter, inStockOnly, maxPrice, sort])

  const filterPanel = (
    <div className="ft-col-filters">
      <h3>Filters</h3>
      <label className="ft-col-filter-label">Category</label>
      <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="ft-col-select">
        <option value="all">All categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <label className="ft-col-filter-label">Max price</label>
      <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" className="ft-col-select" />
      <label className="ft-col-check">
        <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
        In stock only
      </label>
    </div>
  )

  return (
    <section id="collection" className="ft-collection">
      <div className="ft-collection-banner">
        <div className="ft-container">
          <h1>{title || 'Collection'}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="ft-container ft-collection-toolbar">
        <button type="button" className="ft-col-filter-btn" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={16} /> Filter
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)} className="ft-col-sort">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="ft-col-count">{filtered.length} products</span>
        {onClear && (
          <button type="button" className="ft-col-clear" onClick={onClear}>Clear</button>
        )}
      </div>

      <div className="ft-container ft-collection-body">
        <aside className="ft-col-sidebar">{filterPanel}</aside>
        <div className="ft-grid-2 ft-product-grid-desktop">
          {filtered.map(p => (
            <FashionProductCard key={p.id} product={p} currency={currency} primary={primary}
              onView={onView} onQuickAdd={onQuickAdd} wishlisted={wishHas(p.id)} onToggleWish={onToggleWish} showMobileActions />
          ))}
        </div>
      </div>

      {filterOpen && (
        <>
          <div className="ft-col-drawer-backdrop" onClick={() => setFilterOpen(false)} />
          <div className="ft-col-drawer">
            <div className="ft-col-drawer-head">
              <strong>Filters</strong>
              <button type="button" onClick={() => setFilterOpen(false)}><X size={20} /></button>
            </div>
            {filterPanel}
            <button type="button" className="ft-btn ft-btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => setFilterOpen(false)}>Show {filtered.length} products</button>
          </div>
        </>
      )}

      <style>{`
        .ft-collection { padding-bottom: 48px; }
        .ft-collection-banner { background: #F7F6F3; padding: 40px 0 32px; border-bottom: 1px solid #E8E6E1; }
        .ft-collection-banner h1 { font-family: Cormorant Garamond, Georgia, serif; font-size: clamp(28px, 6vw, 40px); font-weight: 500; margin: 0 0 8px; }
        .ft-collection-banner p { margin: 0; color: #6B7280; font-size: 14px; }
        .ft-collection-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding-top: 20px; padding-bottom: 20px; }
        .ft-col-filter-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; border: 1px solid #E8E6E1; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
        .ft-col-sort { padding: 10px 12px; border: 1px solid #E8E6E1; font-size: 13px; background: #fff; }
        .ft-col-count { font-size: 13px; color: #9CA3AF; margin-left: auto; }
        .ft-col-clear { background: none; border: none; font-size: 13px; text-decoration: underline; cursor: pointer; color: #6B7280; }
        .ft-collection-body { display: grid; grid-template-columns: 1fr; gap: 24px; }
        .ft-col-sidebar { display: none; }
        .ft-col-filters h3 { font-size: 14px; font-weight: 700; margin: 0 0 16px; }
        .ft-col-filter-label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #374151; }
        .ft-col-select { width: 100%; padding: 10px 12px; border: 1px solid #E8E6E1; margin-bottom: 16px; font-size: 14px; }
        .ft-col-check { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
        .ft-col-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 450; }
        .ft-col-drawer { position: fixed; left: 0; top: 0; bottom: 0; width: min(320px, 88vw); background: #fff; z-index: 451; padding: 20px 16px; overflow-y: auto; }
        .ft-col-drawer-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .ft-col-drawer-head button { background: none; border: none; cursor: pointer; }
        @media (min-width: 900px) {
          .ft-collection-body { grid-template-columns: 220px 1fr; }
          .ft-col-sidebar { display: block; position: sticky; top: 80px; align-self: start; }
          .ft-col-filter-btn { display: none; }
        }
      `}</style>
    </section>
  )
}
