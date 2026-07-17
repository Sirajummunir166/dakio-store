import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import PublicSite from '../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// Store Studio subpages on a custom domain (e.g. mystore.com/about).
// Static siblings (checkout, track, products, preview) take routing precedence.

function findPage(site, pageSlug) {
  return site.pages.find((p) => p.slug === `/${pageSlug}`)
}

export async function generateMetadata({ params }) {
  const { host, pageSlug } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Not Found' }
  const siteData = await getPublishedSite(data.store.slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const page = findPage(siteData.site, pageSlug)
  if (!page) return { title: 'Not Found' }
  return studioMetadata(siteData.site, page)
}

export default async function DomainStudioSubPage({ params }) {
  const { host, pageSlug } = await params

  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) {
    console.error(`[storefront] API unavailable for domain="${host}" page="${pageSlug}"`)
    return <StoreUnavailable />
  }

  const slug = storeData.store.slug
  const siteData = await getPublishedSite(slug)
  if (siteData.notFound) notFound()
  if (siteData.unavailable) return <StoreUnavailable />

  const page = findPage(siteData.site, pageSlug)
  if (!page) notFound()

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)

  return (
    <PublicSite
      doc={siteData.site}
      pageId={page.id}
      basePath=""
      products={catalog.products}
      collections={catalog.collections}
    />
  )
}
