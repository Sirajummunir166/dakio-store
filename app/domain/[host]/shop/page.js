import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import PublicSite from '../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// /shop on a custom domain — mirrors app/[slug]/shop.

export async function generateMetadata({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Not Found' }
  const siteData = await getPublishedSite(data.store.slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const brand = siteData.site.theme?.brandName || 'Store'
  return { ...studioMetadata(siteData.site, null), title: `Shop — ${brand}` }
}

export default async function DomainShopRoute({ params, searchParams }) {
  const { host } = await params
  const sp = await searchParams
  const q = typeof sp?.q === 'string' && sp.q.trim() ? sp.q.trim().slice(0, 80) : null

  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />
  const slug = storeData.store.slug

  const siteData = await getPublishedSite(slug)
  if (!siteData.site) notFound()

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)

  return (
    <PublicSite doc={siteData.site} pageId="home" basePath="" products={catalog.products} collections={catalog.collections} system={{ kind: 'shop', q }} />
  )
}
