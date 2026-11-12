import { getStoreByDomain, getProducts, getCategories, getPublishedSite, getServices, getBookingStatus } from '../../../../../lib/api'
import { bookingDocOf, bookingLang, isEmbed, carryQuery } from '../../../../../lib/bookingSite'
import StoreUnavailable from '../../../../../components/StoreUnavailable'
import PublicSite from '../../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../../components/studio/publicCatalog'
import { siteText } from '../../../../../components/studio/siteText'
import { notFound } from 'next/navigation'

// /b/<token> — the client's booking (DAKIO_SERVICES_WEBSITE_PLAN.md W2): its
// status, time and how to reach the business. Private: never indexed or cached.

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { host, token } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Not Found' }
  const slug = data.store.slug
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Booking', robots: { index: false, follow: false } }
  const brand = siteData.site.theme?.brandName || 'Store'
  const title = `${siteText(siteData.site.theme?.lang)('meta.booking')} — ${brand}`
  return { ...studioMetadata(siteData.site, null), title, robots: { index: false, follow: false } }
}

export default async function BookingStatusRoute({ params, searchParams }) {
  const sp = (await searchParams) || {}
  const { host, token } = await params
  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />
  const slug = storeData.store.slug
  const siteData = await getPublishedSite(slug)
  if (siteData.unavailable) return <StoreUnavailable />
  // A client's booking opens with or without a website (DAKIO_BOOKING_LINK_PLAN.md).
  const shown = bookingDocOf(siteData, storeData.store, { lang: bookingLang(sp), always: true })
  if (!shown) notFound()
  const lang = shown.doc.theme?.lang === 'en' ? 'en' : 'bn'
  const [r, services, products, categories] = await Promise.all([getBookingStatus(slug, token, lang), getServices(slug), getProducts(slug), getCategories(slug)])
  if (r.unavailable) return <StoreUnavailable />
  const phone = r.store?.phone ? String(r.store.phone).replace(/\D/g, '') : ''
  const phoneDigits = phone ? (phone.startsWith('0') ? '88' + phone : phone) : null
  const catalog = toStudioCatalog(products, categories)
  return (
    <PublicSite
      storeSlug={slug}
      doc={shown.doc}
      standalone={shown.standalone} embed={isEmbed(sp)} carry={carryQuery(sp)}
      pageId="home"
      basePath={""}
      products={catalog.products}
      collections={catalog.collections} extra={catalog.extra}
      services={services} business={storeData.store.business || null}
      system={{ kind: 'booking', token, booking: r.booking || null, store: r.store || { name: storeData.store.name }, phoneDigits, pay: r.pay || null, calendar: r.calendar || null }}
    />
  )
}
