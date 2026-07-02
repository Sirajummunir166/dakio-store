'use client'
import { useFashionTheme } from '../../FashionThemeContext.jsx'

const DEFAULT_ITEMS = [
  {
    id: 'lb-1',
    title: 'Summer Collection',
    subtitle: '32 pieces',
    eyebrow: 'New Arrival',
    image: null,
    href: null,
  },
  {
    id: 'lb-2',
    title: 'Evening Wear',
    subtitle: 'For every occasion',
    eyebrow: 'Curated',
    image: null,
    href: null,
  },
  {
    id: 'lb-3',
    title: 'Street Style',
    subtitle: 'Bold & modern',
    eyebrow: 'Trending',
    image: null,
    href: null,
  },
]

function LookbookCard({ item, index, large, navigate }) {
  const { image, title, subtitle, eyebrow, href } = item

  const handleClick = () => {
    if (href) navigate?.toCollection?.(href)
  }

  return (
    <button
      type="button"
      className="lookbook-card"
      onClick={handleClick}
      aria-label={`View ${title} lookbook`}
      style={{ width: '100%', cursor: href ? 'pointer' : 'default' }}
    >
      <div className="lookbook-card__media">
        {image
          ? <img src={image} alt={title} loading={index === 0 ? 'eager' : 'lazy'} />
          : (
            <div
              style={{
                width: '100%',
                aspectRatio: large ? '2/3' : '3/4',
                background: `hsl(${220 + index * 30}, 8%, ${88 - index * 4}%)`,
                display: 'flex',
                alignItems: 'flex-end',
              }}
            />
          )
        }
        <div className="lookbook-card__overlay" />
        <div className="lookbook-card__body">
          {eyebrow && <span className="lookbook-card__eyebrow">{eyebrow}</span>}
          <h3 className="lookbook-card__title">{title}</h3>
          {subtitle && <p className="lookbook-card__subtitle">{subtitle}</p>}
          <span className="lookbook-card__cta">
            Shop collection
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  )
}

export default function LookbookSection({ settings = {} }) {
  const { contract, navigate } = useFashionTheme()

  const {
    heading = 'The Lookbook',
    eyebrow = 'Editorial',
    viewAllLabel = 'View all',
    viewAllHref = null,
    items: rawItems = null,
    layout = 'asymmetric',
    hidden = false,
  } = settings

  if (hidden) return null

  // Use merchant-configured items, or fall back to defaults seeded with product images
  const items = rawItems?.length > 0
    ? rawItems
    : DEFAULT_ITEMS.map((item, i) => ({
        ...item,
        image: contract.products[i]?.image ?? null,
      }))

  const visibleItems = items.filter((it) => !it.hidden)

  if (visibleItems.length === 0) return null

  const gridClass = layout === 'grid-2'
    ? 'lookbook__grid lookbook__grid--2'
    : layout === 'grid-4'
    ? 'lookbook__grid lookbook__grid--4'
    : 'lookbook__grid'

  return (
    <section className="lookbook" aria-label={heading}>
      <div className="container">
        <div className="lookbook__head">
          <div>
            {eyebrow && <span className="eyebrow--editorial">{eyebrow}</span>}
            <h2>{heading}</h2>
          </div>
          {viewAllHref && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate?.toCollection?.(viewAllHref)}
              style={{ flexShrink: 0 }}
            >
              {viewAllLabel}
            </button>
          )}
        </div>

        <div className={gridClass}>
          {visibleItems.map((item, i) => (
            <LookbookCard
              key={item.id ?? i}
              item={item}
              index={i}
              large={i === 0 && layout === 'asymmetric'}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
