import { getStoreBySlug, getProducts, getCategories, getPublishedSite, getServices } from '../../../lib/api'
import StoreUnavailable from '../../../components/StoreUnavailable'
import PublicSite from '../../../components/studio/PublicSite'
import JsonLd from '../../../components/JsonLd'
import { toStudioCatalog, studioMetadata } from '../../../components/studio/publicCatalog'
import { siteText } from '../../../components/studio/siteText'
import { notFound } from 'next/navigation'
import { canonicalHostOf, canonicalMeta, faqJsonLd } from '../../../lib/seo'

// Store Studio subpages (e.g. /my-store/about). Static siblings (checkout, track,
// products, preview) take routing precedence over this dynamic segment.
// Only tenants with a published studio site have subpages — everyone else 404s here.
// /services (services website W1): the owner's own page at that address wins;
// without one, a store that has services gets the live Services list.

function findPage(site, pageSlug) {
  return site.pages.find((p) => p.slug === `/${pageSlug}`)
}

export async function generateMetadata({ params }) {
  const { slug, pageSlug } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const page = findPage(siteData.site, pageSlug)
  if (!page && pageSlug === 'services') {
    const brand = siteData.site.theme?.brandName || 'Store'
    return { ...studioMetadata(siteData.site, null), title: `${siteText(siteData.site.theme?.lang)('meta.services')} — ${brand}`, ...canonicalMeta(canonicalHostOf(siteData, slug), '/services') }
  }
  if (!page) return { title: 'Not Found' }
  return { ...studioMetadata(siteData.site, page), ...canonicalMeta(canonicalHostOf(siteData, slug), page.slug) }
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
  const [storeData, products, categories, services] = await Promise.all([getStoreBySlug(slug), getProducts(slug), getCategories(slug), getServices(slug)])
  const servicesPage = !page && pageSlug === 'services' && services.length > 0
  if (!page && !servicesPage) notFound()
  const catalog = toStudioCatalog(products, categories)

  return (
    <>
      {page ? <JsonLd data={faqJsonLd(page)} /> : null}
      <PublicSite
        storeSlug={slug}
        doc={siteData.site}
        pageId={page ? page.id : 'home'}
        basePath={`/${slug}`}
        products={catalog.products}
        collections={catalog.collections} extra={catalog.extra}
        services={services} business={storeData?.store?.business || null}
        system={servicesPage ? { kind: 'services' } : null}
      />
    </>
  )
}
