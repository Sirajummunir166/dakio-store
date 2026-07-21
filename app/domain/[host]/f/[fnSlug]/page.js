import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../../../../lib/api'
import StoreUnavailable from '../../../../../components/StoreUnavailable'
import FunnelSite from '../../../../../components/studio/FunnelSite'
import { toStudioCatalog } from '../../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// /f/<funnel-slug> on a custom domain — mirrors app/[slug]/f/[fnSlug].

export async function generateMetadata({ params }) {
  const { host, fnSlug } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Not Found', robots: { index: false, follow: false } }
  const siteData = await getPublishedSite(data.store.slug)
  const fn = siteData?.site?.funnels?.find((f) => f.slug === fnSlug)
  const brand = siteData?.site?.theme?.brandName || 'Store'
  return { title: fn ? `${fn.name} — ${brand}` : 'Not Found', robots: { index: false, follow: false } }
}

export default async function DomainFunnelRoute({ params }) {
  const { host, fnSlug } = await params

  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />
  const slug = storeData.store.slug

  const siteData = await getPublishedSite(slug)
  if (!siteData.site) notFound()
  const fn = (siteData.site.funnels || []).find((f) => f.slug === fnSlug)
  if (!fn) notFound()

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)

  return (
    <FunnelSite doc={siteData.site} fn={fn} storeSlug={slug} products={catalog.products} collections={catalog.collections} />
  )
}
