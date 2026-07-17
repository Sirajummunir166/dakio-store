import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../../../../lib/api'
import StoreUnavailable from '../../../../../components/StoreUnavailable'
import PublicSite from '../../../../../components/studio/PublicSite'
import { toStudioCatalog, collectionPage } from '../../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// Custom-domain twin of app/[slug]/collections/[colSlug] — resolves the tenant
// slug from the hostname, then renders the same live collection grid.

export async function generateMetadata({ params }) {
  const { host, colSlug } = await params
  const data = await getStoreByDomain(host)
  const slug = data?.store?.slug
  if (!slug) return { title: 'Not Found' }
  const [siteData, categories] = await Promise.all([getPublishedSite(slug), getCategories(slug)])
  if (!siteData?.site) return { title: 'Not Found' }
  const col = categories.find((c) => c.slug === colSlug)
  if (!col) return { title: 'Not Found' }
  return {
    title: `${col.name} — ${siteData.site.theme?.brandName || 'Store'}`,
    description: `Shop ${col.name} online.`,
  }
}

export default async function DomainCollectionPage({ params }) {
  const { host, colSlug } = await params
  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />

  const slug = storeData.store.slug
  const siteData = await getPublishedSite(slug)
  if (siteData.notFound) notFound()
  if (siteData.unavailable) {
    console.error(`[storefront] API unavailable for host="${host}" collection="${colSlug}"`)
    return <StoreUnavailable />
  }

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)
  const col = catalog.collections.find((c) => c.slug === colSlug)
  if (!col) notFound()

  const page = collectionPage(col, catalog)
  const doc = { ...siteData.site, pages: [...siteData.site.pages, page] }

  return (
    <PublicSite
      doc={doc}
      pageId={page.id}
      basePath=""
      products={catalog.products}
      collections={catalog.collections}
    />
  )
}
