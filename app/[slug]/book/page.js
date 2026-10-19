import { getStoreBySlug, getProducts, getCategories, getPublishedSite, getServices } from '../../../lib/api'
import StoreUnavailable from '../../../components/StoreUnavailable'
import PublicSite from '../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../components/studio/publicCatalog'
import { siteText } from '../../../components/studio/siteText'
import { notFound } from 'next/navigation'
import { canonicalHostOf, canonicalMeta } from '../../../lib/seo'

// /book — the booking page (DAKIO_SERVICES_WEBSITE_PLAN.md W2): the link a
// business shares to take bookings. ?service=<address> starts on one service.

export async function generateMetadata({ params }) {
  const { slug } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const brand = siteData.site.theme?.brandName || 'Store'
  const title = `${siteText(siteData.site.theme?.lang)('meta.book')} — ${brand}`
  return { ...studioMetadata(siteData.site, null), title, ...canonicalMeta(canonicalHostOf(siteData, slug), '/book') }
}

export default async function BookRoute({ params, searchParams }) {
  const { slug } = await params
  const sp = (await searchParams) || {}
  const svcParam = typeof sp.service === 'string' ? sp.service.slice(0, 80) : null
  const storeData = await getStoreBySlug(slug)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />
  const siteData = await getPublishedSite(slug)
  if (siteData.unavailable) return <StoreUnavailable />
  if (siteData.notFound || !siteData.site) notFound()
  const [services, products, categories] = await Promise.all([getServices(slug), getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)
  return (
    <PublicSite
      storeSlug={slug}
      doc={siteData.site}
      pageId="home"
      basePath={`/${slug}`}
      products={catalog.products}
      collections={catalog.collections} extra={catalog.extra}
      services={services} business={storeData.store.business || null}
      system={{ kind: 'book', service: svcParam }}
    />
  )
}
