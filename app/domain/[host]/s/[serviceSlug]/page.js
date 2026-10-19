import { getStoreByDomain, getProducts, getCategories, getPublishedSite, getServices, getService } from '../../../../../lib/api'
import StoreUnavailable from '../../../../../components/StoreUnavailable'
import PublicSite from '../../../../../components/studio/PublicSite'
import JsonLd from '../../../../../components/JsonLd'
import { toStudioCatalog, studioMetadata } from '../../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'
import { canonicalHostOf, canonicalMeta, serviceJsonLd } from '../../../../../lib/seo'

// /s/<service> — one service's page (DAKIO_SERVICES_WEBSITE_PLAN.md W1):
// its price, time, picture, description and the main button, inside the
// store's site (header, footer, theme). Hidden or removed services 404.

export async function generateMetadata({ params }) {
  const { host, serviceSlug } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Not Found' }
  const slug = data.store.slug
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const r = await getService(slug, serviceSlug)
  if (!r?.service) return { title: 'Not Found' }
  const brand = siteData.site.theme?.brandName || 'Store'
  const sv = r.service
  const desc = sv.description ? String(sv.description).slice(0, 160) : `${sv.name} — ${sv.priceText}`
  return { ...studioMetadata(siteData.site, null), title: `${sv.name} — ${brand}`, description: desc, ...(sv.imageUrl ? { openGraph: { title: sv.name, description: desc, images: [sv.imageUrl] } } : {}), ...canonicalMeta(canonicalHostOf(data, slug), `/s/${sv.slug}`) }
}

export default async function ServiceRoute({ params }) {
  const { host, serviceSlug } = await params
  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />
  const slug = storeData.store.slug
  const siteData = await getPublishedSite(slug)
  if (siteData.unavailable) return <StoreUnavailable />
  if (siteData.notFound || !siteData.site) notFound()
  const [r, services, products, categories] = await Promise.all([getService(slug, serviceSlug), getServices(slug), getProducts(slug), getCategories(slug)])
  if (r.notFound) notFound()
  if (r.unavailable) return <StoreUnavailable />
  const catalog = toStudioCatalog(products, categories)
  const canonHost = canonicalHostOf(storeData, slug)
  return (
    <>
      <JsonLd data={serviceJsonLd(r.service, { url: canonHost ? `https://${canonHost}/s/${r.service.slug}` : undefined, storeName: storeData.store.name })} />
      <PublicSite
        storeSlug={slug}
        doc={siteData.site}
        pageId="home"
        basePath={""}
        products={catalog.products}
        collections={catalog.collections} extra={catalog.extra}
        services={services} business={storeData.store.business || null}
        system={{ kind: 'service', service: r.service }}
      />
    </>
  )
}
