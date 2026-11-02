import { getStoreByDomain, getProducts, getCategories, getPublishedSite, getServices } from '../../lib/api'
import { storeUrls, sitemapXml, canonicalHostOf } from '../../lib/seo'
import { hostOf, isCustomDomain } from '../../lib/hosts'

// /sitemap.xml on a store's own host (custom domain or <slug>.dakio.shop).
// The middleware leaves dotted paths alone, so every host lands here and the
// store is resolved from the Host header. Dakio's own hosts have no sitemap.
//
// One sitemap per store, on its canonical host: the other address redirects
// there, and a store the merchant hid from search engines has none.

// getProducts walks the API's 100-per-page list, so this is the real ceiling
// (SST-32: one request was capped at 100 and older products were left out).
const SITEMAP_PRODUCTS = 5000

export async function GET(req) {
  const host = hostOf(req)
  if (!isCustomDomain(host)) return new Response('Not found', { status: 404 })
  const data = await getStoreByDomain(host)
  if (data?.unavailable) return new Response('Store unavailable', { status: 503, headers: { 'Retry-After': '300' } })
  if (!data?.store) return new Response('Not found', { status: 404 })
  const slug = data.store.slug

  const canonical = canonicalHostOf(data, slug)
  if (canonical !== host) return Response.redirect(`https://${canonical}/sitemap.xml`, 301)

  const [siteData, products, categories, services] = await Promise.all([
    getPublishedSite(slug),
    getProducts(slug, { limit: SITEMAP_PRODUCTS }),
    getCategories(slug),
    getServices(slug),
  ])
  const site = siteData?.site || null
  if (site?.seo?.noindex) return new Response('Not found', { status: 404 })

  const xml = sitemapXml(storeUrls({ origin: `https://${host}`, site, products, categories, services, booking: data.store.business?.booking?.on === true }))
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
