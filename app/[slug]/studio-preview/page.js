import { getProducts, getCategories } from '../../../lib/api'
import PublicSite from '../../../components/studio/PublicSite'
import PreviewComments from '../../../components/studio/PreviewComments'
import { toStudioCatalog } from '../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// Shared draft-preview link (token-gated, never indexed): always renders the
// LATEST draft — even unpublished — so the team can review before publishing.
// Viewers can pin comments to sections while the merchant's toggle is on.

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'

export const metadata = { robots: { index: false, follow: false }, title: 'Draft preview' }

export default async function StudioPreviewPage({ params, searchParams }) {
  const { slug } = await params
  const { token } = await searchParams
  if (!token) notFound()

  const res = await fetch(`${BASE}/store/${slug}/site-draft?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk',sans-serif", gap: 8, padding: 30, textAlign: 'center' }}>
        <div style={{ fontSize: 19, fontWeight: 800 }}>This preview link has expired</div>
        <div style={{ fontSize: 13.5, color: '#6b7060' }}>Ask the store owner to send a fresh one from Share &amp; team.</div>
      </div>
    )
  }
  const { site, commentsOpen } = await res.json()

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '9px 14px', background: '#1A1D12', color: '#f4f6ec', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12.5, fontWeight: 700 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: '#C6F035' }} />
        Draft preview — shows the latest edits, even before publish
      </div>
      <PublicSite
        doc={site}
        pageId="home"
        basePath={`/${slug}`}
        products={catalog.products}
        collections={catalog.collections}
      />
      {commentsOpen && <PreviewComments slug={slug} token={token} apiBase={BASE} />}
    </div>
  )
}
