import { getStoreByDomain, getProducts, getCategories, getPublishedSite, getServices } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import PublicSite from '../../../../components/studio/PublicSite'
import JsonLd from '../../../../components/JsonLd'
import { toStudioCatalog, studioMetadata } from '../../../../components/studio/publicCatalog'
import { siteText } from '../../../../components/studio/siteText'
import { notFound } from 'next/navigation'
import { canonicalHostOf, canonicalMeta, faqJsonLd } from '../../../../lib/seo'

// Store Studio subpages on a custom domain (e.g. mystore.com/about).
// Static siblings (checkout, track, products, preview) take routing precedence.
// /services (services website W1): the owner's own page wins; else the live Services list.

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
  if (!page && pageSlug === 'services') {
    const brand = siteData.site.theme?.brandName || 'Store'
    return { ...studioMetadata(siteData.site, null), title: `${siteText(siteData.site.theme?.lang)('meta.services')} — ${brand}`, ...canonicalMeta(canonicalHostOf(data, data.store.slug), '/services') }
  }
  if (!page) return { title: 'Not Found' }
  return { ...studioMetadata(siteData.site, page), ...canonicalMeta(canonicalHostOf(data, data.store.slug), page.slug) }
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
  const [products, categories, services] = await Promise.all([getProducts(slug), getCategories(slug), getServices(slug)])
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
        basePath=""
        products={catalog.products}
        collections={catalog.collections} extra={catalog.extra}
        services={services} business={storeData.store.business || null}
        system={servicesPage ? { kind: 'services' } : null}
      />
    </>
  )
}
