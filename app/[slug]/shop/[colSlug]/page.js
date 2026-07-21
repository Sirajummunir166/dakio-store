import { getProducts, getCategories, getPublishedSite } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import PublicSite from '../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// /shop/<collection> — one collection template behind every collection
// (Phase 8). Edit the template once in Store Studio, every collection follows.

export async function generateMetadata({ params }) {
  const { slug, colSlug } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const categories = await getCategories(slug)
  const col = (categories || []).find((c) => c.slug === colSlug)
  const brand = siteData.site.theme?.brandName || 'Store'
  return { ...studioMetadata(siteData.site, null), title: col ? `${col.name} — ${brand}` : 'Not Found' }
}

export default async function CollectionRoute({ params }) {
  const { slug, colSlug } = await params

  const siteData = await getPublishedSite(slug)
  if (siteData.notFound || !siteData.site) notFound()
  if (siteData.unavailable) {
    console.error(`[storefront] API unavailable for slug="${slug}" /shop/${colSlug}`)
    return <StoreUnavailable />
  }

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)
  const col = catalog.collections.find((c) => c.slug === colSlug)
  if (!col) notFound()

  return (
    <PublicSite
      storeSlug={slug}
      doc={siteData.site}
      pageId="home"
      basePath={`/${slug}`}
      products={catalog.products}
      collections={catalog.collections}
      system={{ kind: 'col', col }}
    />
  )
}
