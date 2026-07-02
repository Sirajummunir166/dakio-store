'use client'
import { useFashionTheme } from '../FashionThemeContext.jsx'
import { sanitizeThemeUrl } from '../../../../lib/theme/sanitizeThemeUrl.js'

export default function CategoriesSection({ settings }) {
  const { contract } = useFashionTheme()

  const eyebrow = settings.eyebrow?.trim()
  const isEditorial = settings.editorial === true
  const showCounts = settings.showItemCounts === true

  // If settings has items with images → use those; otherwise fall back to contract.categories
  const rawItems = settings.items ?? []
  const items = (
    rawItems.length > 0 && rawItems.some((item) => item.image)
      ? rawItems
      : contract.categories.map((cat) => ({
          name: cat.name,
          image: cat.image,
          count: cat.count,
          href: null,
        }))
  ).map((item) => ({ ...item, href: sanitizeThemeUrl(item.href) }))

  return (
    <section className={`categories ${isEditorial ? 'categories--editorial' : ''}`}>
      <div className="container">
        <div className={`section-head ${isEditorial ? 'section-head--editorial' : ''}`}>
          <div>
            {eyebrow && <span className="eyebrow eyebrow--editorial">{eyebrow}</span>}
            <h2>{settings.title}</h2>
          </div>
          {settings.linkLabel && (
            <a href={sanitizeThemeUrl(settings.linkHref) ?? '#'} className="link-more">{settings.linkLabel}</a>
          )}
        </div>
        {items.length === 0 && (
          <p className="categories__empty">No categories yet — add products to see them here.</p>
        )}
        <div className="categories__grid">
          {items.map((cat) => (
            <button
              key={cat.name}
              type="button"
              className={`category-card ${isEditorial ? 'category-card--editorial' : ''}`}
              onClick={cat.href ? () => { window.location.href = cat.href } : undefined}
              aria-label={cat.href ? undefined : cat.name}
            >
              <div className="category-card__media">
                {cat.image
                  ? <img src={cat.image} alt={cat.name} loading="lazy" />
                  : <div style={{ width: '100%', aspectRatio: '1/1', background: '#f3f3f3' }} />
                }
              </div>
              {isEditorial ? (
                <h3 className="category-card__label">{cat.name}</h3>
              ) : (
                <div className="category-card__overlay">
                  <h3>{cat.name}</h3>
                  {showCounts && cat.count != null && <span>{cat.count} items</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
