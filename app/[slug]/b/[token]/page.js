import { getStoreBySlug, getProducts, getCategories, getPublishedSite, getServices, getBookingStatus } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import PublicSite from '../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../components/studio/publicCatalog'
import { siteText } from '../../../../components/studio/siteText'
import { notFound } from 'next/navigation'

// /b/<token> — the client's booking (DAKIO_SERVICES_WEBSITE_PLAN.md W2): its
// status, time and how to reach the business. Private: never indexed or cached.

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug, token } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const brand = siteData.site.theme?.brandName || 'Store'
  const title = `${siteText(siteData.site.theme?.lang)('meta.booking')} — ${brand}`
  return { ...studioMetadata(siteData.site, null), title, robots: { index: false, follow: false } }
}

export default async function BookingStatusRoute({ params }) {
  const { slug, token } = await params
  const storeData = await getStoreBySlug(slug)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />
  const siteData = await getPublishedSite(slug)
  if (siteData.unavailable) return <StoreUnavailable />
  if (siteData.notFound || !siteData.site) notFound()
  const lang = siteData.site.theme?.lang === 'en' ? 'en' : 'bn'
  const [r, services, products, categories] = await Promise.all([getBookingStatus(slug, token, lang), getServices(slug), getProducts(slug), getCategories(slug)])
  if (r.unavailable) return <StoreUnavailable />
  const phone = r.store?.phone ? String(r.store.phone).replace(/\D/g, '') : ''
  const phoneDigits = phone ? (phone.startsWith('0') ? '88' + phone : phone) : null
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
      system={{ kind: 'booking', booking: r.booking || null, store: r.store || { name: storeData.store.name }, phoneDigits, pay: r.pay || null, calendar: r.calendar || null }}
    />
  )
}
