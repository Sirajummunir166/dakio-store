const FEATURE_ICON_MAP = {
  'Free Delivery': 'truck',
  'Easy Returns': 'return',
  'Secure Payment': 'shield',
  'Secure Checkout': 'shield',
  '24/7 Support': 'support',
}

function FeatureIconGlyph({ name }) {
  const icons = {
    truck: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7V10z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="18" cy="17" r="2" />
      </svg>
    ),
    return: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4 7h12a4 4 0 0 1 4 4v6H8a4 4 0 0 1-4-4V7z" />
        <path d="M8 11l-4-4M8 11l-4 4" />
      </svg>
    ),
    shield: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    support: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4 10a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1l-2 3H9l-2-3H6a2 2 0 0 1-2-2v-4z" />
      </svg>
    ),
  }
  return icons[name] ?? icons.support
}

export default function FeaturesSection({ settings }) {
  const isQuiet = settings.quiet === true

  return (
    <section className={`features ${isQuiet ? 'features--quiet' : ''}`}>
      <div className="container features__grid">
        {settings.items?.map((item) => (
          <div key={item.title} className="feature">
            {!isQuiet && (
              <span className="feature__icon" aria-hidden="true">
                <FeatureIconGlyph name={FEATURE_ICON_MAP[item.title] ?? 'support'} />
              </span>
            )}
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
