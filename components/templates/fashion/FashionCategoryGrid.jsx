'use client'
import { resolveMedia } from '../../../lib/mediaUtils'

export default function FashionCategoryGrid({ config, categories, products, demoTiles, onSelectCategory }) {
  const sec = config.sections?.categories
  if (!sec?.enabled) return null

  const tiles = (sec.items || []).map(tile => {
    const cat = categories.find(c => c.name.toLowerCase().includes(tile.title.toLowerCase()) || c.id === tile.id)
    const catProduct = cat ? products.find(p => p.category?.id === cat.id) : products[0]
    const img = tile.image || (catProduct ? resolveMedia(catProduct).primary : null) || demoTiles?.[tile.id]
    return { ...tile, image: img, categoryId: cat?.id || tile.id }
  })

  return (
    <section id="categories" className="ft-section">
      <div className="ft-container">
        <h2 className="ft-section-title">{sec.title || 'Shop by Category'}</h2>
        <div className="ft-cat-grid">
          {tiles.map(tile => (
            <div key={tile.id} className="ft-cat-tile" onClick={() => onSelectCategory(tile.categoryId)} role="button" tabIndex={0}>
              {tile.image && <img src={tile.image} alt={tile.title} loading="lazy" />}
              <span className="ft-cat-label">{tile.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
