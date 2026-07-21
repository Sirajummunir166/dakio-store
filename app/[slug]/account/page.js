import { getProducts, getCategories, getPublishedSite } from '../../../lib/api'
import StoreUnavailable from '../../../components/StoreUnavailable'
import PublicSite from '../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// /account — store system page (Phase 10). Themed by tokens, guarded layout.

export async function generateMetadata({ params }) {
  const { slug } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const brand = siteData.site.theme?.brandName || 'Store'
  return { ...studioMetadata(siteData.site, null), title: 'Your orders — ' + brand, robots: { index: false, follow: false } }
}

export default async function AccountRoute({ params }) {
  const { slug } = await params
  const siteData = await getPublishedSite(slug)
  if (siteData.notFound || !siteData.site) notFound()
  if (siteData.unavailable) return <StoreUnavailable />

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)

  return (
    <PublicSite storeSlug={slug} doc={siteData.site} pageId="home" basePath={'/' + slug} products={catalog.products} collections={catalog.collections} system={{ kind: 'account' }} />
  )
}
