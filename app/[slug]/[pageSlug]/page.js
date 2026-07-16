import { getProducts, getCategories, getPublishedSite } from '../../../lib/api'
import StoreUnavailable from '../../../components/StoreUnavailable'
import PublicSite from '../../../components/studio/PublicSite'
import { toStudioCatalog } from '../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// Store Studio subpages (e.g. /my-store/about). Static siblings (checkout, track,
// products, preview) take routing precedence over this dynamic segment.
// Only tenants with a published studio site have subpages — everyone else 404s here.

function findPage(site, pageSlug) {
  return site.pages.find((p) => p.slug === `/${pageSlug}`)
}

export async function generateMetadata({ params }) {
  const { slug, pageSlug } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const page = findPage(siteData.site, pageSlug)
  if (!page) return { title: 'Not Found' }
  return {
    title: page.seo?.title || `${page.name} — ${siteData.site.theme?.brandName || 'Store'}`,
    description: page.seo?.desc || undefined,
  }
}

export default async function StudioSubPage({ params }) {
  const { slug, pageSlug } = await params

  const siteData = await getPublishedSite(slug)
  if (siteData.notFound) notFound()
  if (siteData.unavailable) {
    console.error(`[storefront] API unavailable for slug="${slug}" page="${pageSlug}"`)
    return <StoreUnavailable />
  }

  const page = findPage(siteData.site, pageSlug)
  if (!page) notFound()

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)

  return (
    <PublicSite
      doc={siteData.site}
      pageId={page.id}
      basePath={`/${slug}`}
      products={catalog.products}
      collections={catalog.collections}
    />
  )
}
