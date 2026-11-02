import { getProducts, getProductsByIds, getCategories, getPublishedSite, getStoreBySlug } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import FunnelSite from '../../../../components/studio/FunnelSite'
import { toStudioCatalog } from '../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// /f/<funnel-slug> — chrome-free ad landing page (Phase 9). Hidden from menus
// and search engines; an ad click becomes a cash-on-delivery order.

export async function generateMetadata({ params }) {
  const { slug, fnSlug } = await params
  const siteData = await getPublishedSite(slug)
  const fn = siteData?.site?.funnels?.find((f) => f.slug === fnSlug)
  const brand = siteData?.site?.theme?.brandName || 'Store'
  return {
    title: fn ? `${fn.name} — ${brand}` : 'Not Found',
    robots: { index: false, follow: false },
  }
}

export default async function FunnelRoute({ params }) {
  const { slug, fnSlug } = await params

  const siteData = await getPublishedSite(slug)
  if (siteData.notFound || !siteData.site) notFound()
  if (siteData.unavailable) {
    console.error(`[storefront] API unavailable for slug="${slug}" /f/${fnSlug}`)
    return <StoreUnavailable />
  }

  const fn = (siteData.site.funnels || []).find((f) => f.slug === fnSlug)
  if (!fn) notFound()

  const [products, categories, storeData] = await Promise.all([getProducts(slug), getCategories(slug), getStoreBySlug(slug)])
  // The funnel's product by its own read when the list does not hold it — a
  // funnel never falls back to another product (SST-29).
  if (fn.pid && !products.some((p) => p.id === fn.pid)) products.push(...(await getProductsByIds(slug, [fn.pid])))
  const catalog = toStudioCatalog(products, categories)

  return (
    <FunnelSite doc={siteData.site} fn={fn} storeSlug={slug} store={storeData?.store || null} products={catalog.products} collections={catalog.collections} />
  )
}
