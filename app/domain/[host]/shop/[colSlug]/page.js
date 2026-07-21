import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../../../../lib/api'
import StoreUnavailable from '../../../../../components/StoreUnavailable'
import PublicSite from '../../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// /shop/<collection> on a custom domain — mirrors app/[slug]/shop/[colSlug].

export async function generateMetadata({ params }) {
  const { host, colSlug } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Not Found' }
  const siteData = await getPublishedSite(data.store.slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const categories = await getCategories(data.store.slug)
  const col = (categories || []).find((c) => c.slug === colSlug)
  const brand = siteData.site.theme?.brandName || 'Store'
  return { ...studioMetadata(siteData.site, null), title: col ? `${col.name} — ${brand}` : 'Not Found' }
}

export default async function DomainCollectionRoute({ params }) {
  const { host, colSlug } = await params

  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />
  const slug = storeData.store.slug

  const siteData = await getPublishedSite(slug)
  if (!siteData.site) notFound()

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)
  const col = catalog.collections.find((c) => c.slug === colSlug)
  if (!col) notFound()

  return (
    <PublicSite storeSlug={slug} doc={siteData.site} pageId="home" basePath="" products={catalog.products} collections={catalog.collections} system={{ kind: 'col', col }} />
  )
}
