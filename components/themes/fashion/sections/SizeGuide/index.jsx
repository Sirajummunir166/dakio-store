'use client'
import { useFashionTheme } from '../../FashionThemeContext.jsx'
import SizeGuideModal, { SizeGuideTrigger } from './SizeGuideModal.jsx'

/*
 * SizeGuide section — renders a banner/CTA that triggers the size guide modal.
 * The modal itself (SizeGuideModal) is also exported for use directly in the PDP.
 *
 * SizeGuideTrigger is a lightweight button that can be placed anywhere in the theme
 * (e.g. next to the size selector on the PDP) without re-mounting the modal.
 */
export { SizeGuideModal, SizeGuideTrigger }

export default function SizeGuideSection({ settings = {} }) {
  const { sizeGuide } = useFashionTheme()

  const {
    hidden = false,
    heading = 'Not sure about your size?',
    subtitle = 'Use our size guide to find your perfect fit.',
    ctaLabel = 'View Size Guide',
  } = settings

  if (hidden) return null

  return (
    <>
      <section
        className="size-guide-section"
        style={{
          padding: '44px 0',
          background: 'var(--bg-soft)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}
        >
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--dark)' }}>
              {heading}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>{subtitle}</p>
          </div>
          <button
            type="button"
            className="btn btn--outline"
            onClick={sizeGuide?.open}
            aria-label="Open size guide"
            style={{ flexShrink: 0 }}
          >
            {ctaLabel}
          </button>
        </div>
      </section>

      {/* Modal rendered here — only for this section's page; PDP mounts its own */}
      <SizeGuideModal />
    </>
  )
}
