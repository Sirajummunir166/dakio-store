'use client'

// Care instruction icons — wash, dry, iron, bleach, dryclean, etc.
const CARE_ICONS = {
  wash: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M6.4 9a7 7 0 0 0-.4 3" />
    </svg>
  ),
  cold_wash: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M9 11l3-3 3 3M9 16l3-3 3 3" />
    </svg>
  ),
  machine_wash: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="17" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.2" />
      <line x1="10" y1="7" x2="10.01" y2="7" strokeWidth="2.2" />
    </svg>
  ),
  hand_wash: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5" />
      <path d="M4 17c0 2 1.5 3 3.5 3S11 20 11 18v-5h2v3c0 2 1.5 3 3.5 3S20 18 20 16v-5" />
    </svg>
  ),
  iron: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 9c0 5.5-4.5 9-10 9H3L2 6l1-1h8a10 10 0 0 1 10 4z" />
      <path d="M12 9h.01M15 9h.01M18 9h.01" strokeWidth="2" />
    </svg>
  ),
  no_iron: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="4" x2="20" y2="20" />
      <path d="M21 9c0 5.5-4.5 9-10 9H3L2 6l1-1h8a10 10 0 0 1 7 3" />
    </svg>
  ),
  air_dry: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18c-4.51 2-5-2-7-2" />
      <path d="M14 18c-2.5 2-5 0-7.5 0" />
      <path d="M12 2a5 5 0 0 1 5 5c0 2.5-1 4.5-3 6l-2 8" />
      <path d="M12 2a5 5 0 0 0-5 5c0 2.5 1 4.5 3 6l2 8" />
    </svg>
  ),
  no_bleach: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 3 5 20h14L14.5 3z" />
      <line x1="4" y1="4" x2="20" y2="20" />
    </svg>
  ),
  dry_clean: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M7 12h10M12 7v10" />
    </svg>
  ),
  no_tumble_dry: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <line x1="4" y1="4" x2="20" y2="20" />
    </svg>
  ),
}

const DEFAULT_CARE = [
  { id: 'machine_wash', icon: 'machine_wash', label: 'Machine Wash', detail: 'Cold, gentle cycle' },
  { id: 'iron',         icon: 'iron',         label: 'Medium Iron',  detail: 'Do not iron prints' },
  { id: 'air_dry',      icon: 'air_dry',      label: 'Air Dry',      detail: 'Flat or hang dry' },
  { id: 'no_bleach',    icon: 'no_bleach',    label: 'No Bleach',    detail: 'Keep colors vibrant' },
]

export default function FabricCareSection({ settings = {} }) {
  const {
    hidden = false,
    eyebrow = 'Care Instructions',
    heading = 'Fabric & Care',
    subtitle = 'Follow these simple care steps to keep your garments looking their best.',
    items: rawItems = null,
    fabricNote = null,
  } = settings

  if (hidden) return null

  const items = rawItems?.length > 0 ? rawItems.filter((i) => !i.hidden) : DEFAULT_CARE

  if (items.length === 0) return null

  return (
    <section className="fabric-care" aria-label={heading}>
      <div className="container">
        <div className="fabric-care__head">
          {eyebrow && <span className="fabric-care__eyebrow">{eyebrow}</span>}
          <h2 className="">{heading}</h2>
          {subtitle && <p className="fabric-care__subtitle">{subtitle}</p>}
        </div>

        <div className="fabric-care__grid">
          {items.map((item) => (
            <div key={item.id} className="care-item">
              <span className="care-item__icon" aria-hidden="true">
                {CARE_ICONS[item.icon] ?? CARE_ICONS.machine_wash}
              </span>
              <span className="care-item__label">{item.label}</span>
              {item.detail && <span className="care-item__detail">{item.detail}</span>}
            </div>
          ))}
        </div>

        {fabricNote && (
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: 'var(--muted)', maxWidth: '560px', marginInline: 'auto', lineHeight: 1.7 }}>
            {fabricNote}
          </p>
        )}
      </div>
    </section>
  )
}
