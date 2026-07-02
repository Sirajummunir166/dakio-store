'use client'
import { useStorefront } from '../lib/storefront'
import { resolveTheme } from '../lib/theme/resolveTheme'
import VisitorTracker         from './VisitorTracker'
import TrackingScripts        from './TrackingScripts'
import PreviewBanner          from './PreviewBanner'
import MinimalTemplate        from './templates/MinimalTemplate'
import FashionTemplate        from './templates/FashionTemplate'
import TechTemplate           from './templates/TechTemplate'
import OrganicTemplate        from './templates/OrganicTemplate'
import BeautyTemplate         from './templates/BeautyTemplate'
import BoldTemplate           from './templates/BoldTemplate'
import FashionThemeWrapper         from './themes/fashion/FashionThemeWrapper'
import FashionThemeErrorBoundary   from './themes/fashion/FashionThemeErrorBoundary'

// Legacy templates — unchanged. New fashion_v1 is handled via FashionThemeWrapper below.
const TEMPLATES = {
  minimal: MinimalTemplate,
  fashion: FashionTemplate,
  tech:    TechTemplate,
  organic: OrganicTemplate,
  beauty:  BeautyTemplate,
  bold:    BoldTemplate,
}

export default function StorefrontClient({
  store, products, categories, slug,
  previewMode = false,
  previewTheme = null,
}) {
  const sf = useStorefront({ store, products, categories, slug })
  const templateKey = resolveTheme({ store, previewTheme, isPreviewMode: previewMode })

  // ── fashion_v1: Theme Runtime pipeline ───────────────────────────────────
  // Isolated branch. All existing templates below are completely unaffected.
  if (templateKey === 'fashion_v1') {
    return (
      <>
        {!previewMode && <TrackingScripts store={store} />}
        {!previewMode && <VisitorTracker slug={slug} />}
        {previewMode && <PreviewBanner />}
        <FashionThemeErrorBoundary>
          <FashionThemeWrapper
            store={store}
            products={products}
            categories={categories}
            slug={slug}
            previewMode={previewMode}
            sf={sf}
          />
        </FashionThemeErrorBoundary>
      </>
    )
  }

  // ── Legacy templates — no changes below this line ────────────────────────
  const Template = TEMPLATES[templateKey] || MinimalTemplate

  const templateProps = previewMode
    ? {
        ...sf,
        setView: (v) => {
          if (v === 'checkout') {
            sf.setFormErr('Preview mode — checkout is disabled')
            return
          }
          sf.setView(v)
        },
        placeOrder: async () => {
          sf.setFormErr('Preview mode — orders cannot be placed')
        },
      }
    : sf

  return (
    <>
      {!previewMode && <TrackingScripts store={store} />}
      {!previewMode && <VisitorTracker slug={slug} />}
      {previewMode && <PreviewBanner />}
      <Template {...templateProps} />
    </>
  )
}
