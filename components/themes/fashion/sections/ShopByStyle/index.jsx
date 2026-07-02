'use client'
import { useFashionTheme } from '../../FashionThemeContext.jsx'

// SVG icon set — one per style category
const STYLE_ICONS = {
  casual: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
    </svg>
  ),
  formal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
      <path d="M16 7V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  streetwear: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a7 7 0 0 1 5 2" />
      <path d="M5 7.4C5.8 5.9 7.3 4.8 9 4.3" />
      <path d="M12 21a9 9 0 0 0 0-18" />
    </svg>
  ),
  summer: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  winter: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  office: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12.01" strokeWidth="2" />
    </svg>
  ),
  party: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  sport: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93c4.37 4.37 4.37 11.31 0 15.68M19.07 4.93c-4.37 4.37-4.37 11.31 0 15.68" />
      <path d="M2 12h20" />
    </svg>
  ),
}

const DEFAULT_STYLES = [
  { id: 'casual',     label: 'Casual',     icon: 'casual',     href: null },
  { id: 'formal',     label: 'Formal',     icon: 'formal',     href: null },
  { id: 'streetwear', label: 'Streetwear', icon: 'streetwear', href: null },
  { id: 'summer',     label: 'Summer',     icon: 'summer',     href: null },
  { id: 'winter',     label: 'Winter',     icon: 'winter',     href: null },
  { id: 'office',     label: 'Office',     icon: 'office',     href: null },
  { id: 'party',      label: 'Party',      icon: 'party',      href: null },
]

export default function ShopByStyleSection({ settings = {} }) {
  const { navigate } = useFashionTheme()

  const {
    heading = 'Shop By Style',
    eyebrow = 'Explore',
    styles: rawStyles = null,
    hidden = false,
  } = settings

  if (hidden) return null

  const styles = rawStyles?.length > 0 ? rawStyles : DEFAULT_STYLES
  const visibleStyles = styles.filter((s) => !s.hidden)

  if (visibleStyles.length === 0) return null

  const handleStyleClick = (style) => {
    if (style.href) {
      navigate?.toCollection?.(style.href)
    }
  }

  return (
    <section className="shop-by-style" aria-label={heading}>
      <div className="container">
        <div className="shop-by-style__head">
          {eyebrow && <span className="eyebrow--editorial">{eyebrow}</span>}
          <h2>{heading}</h2>
        </div>

        <div className="shop-by-style__grid">
          {visibleStyles.map((style) => (
            <button
              key={style.id}
              type="button"
              className="style-card"
              onClick={() => handleStyleClick(style)}
              aria-label={`Shop ${style.label} styles`}
            >
              <span className="style-card__icon" aria-hidden="true">
                {STYLE_ICONS[style.icon] ?? STYLE_ICONS.casual}
              </span>
              <span className="style-card__label">{style.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
