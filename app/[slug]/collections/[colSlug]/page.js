import { getProducts, getCategories, getPublishedSite } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import PublicSite from '../../../../components/studio/PublicSite'
import { toStudioCatalog, collectionPage } from '../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// Store Studio collection pages (/my-store/collections/sarees): a live grid of
// one collection's products, styled by the tenant's published site. Only exists
// for tenants with a published studio site — collection tiles and "col" links
// resolve here.

export async function generateMetadata({ params }) {
  const { slug, colSlug } = await params
  const [siteData, categories] = await Promise.all([getPublishedSite(slug), getCategories(slug)])
  if (!siteData?.site) return { title: 'Not Found' }
  const col = categories.find((c) => c.slug === colSlug)
  if (!col) return { title: 'Not Found' }
  return {
    title: `${col.name} — ${siteData.site.theme?.brandName || 'Store'}`,
    description: `Shop ${col.name} online.`,
  }
}

export default async function StudioCollectionPage({ params }) {
  const { slug, colSlug } = await params

  const siteData = await getPublishedSite(slug)
  if (siteData.notFound) notFound()
  if (siteData.unavailable) {
    console.error(`[storefront] API unavailable for slug="${slug}" collection="${colSlug}"`)
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
      basePath={`/${slug}`}
      products={catalog.products}
      collections={catalog.collections}
    />
  )
}
