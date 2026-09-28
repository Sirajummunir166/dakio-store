import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../lib/api'
import { storeUrls, sitemapXml, canonicalHostOf } from '../../lib/seo'
import { hostOf, isCustomDomain } from '../../lib/hosts'

// /sitemap.xml on a store's own host (custom domain or <slug>.dakio.shop).
// The middleware leaves dotted paths alone, so every host lands here and the
// store is resolved from the Host header. Dakio's own hosts have no sitemap.
//
// One sitemap per store, on its canonical host: the other address redirects
// there, and a store the merchant hid from search engines has none.

const SITEMAP_PRODUCTS = 500 // the public list endpoint's ceiling

export async function GET(req) {
  const host = hostOf(req)
  if (!isCustomDomain(host)) return new Response('Not found', { status: 404 })
  const data = await getStoreByDomain(host)
  if (data?.unavailable) return new Response('Store unavailable', { status: 503, headers: { 'Retry-After': '300' } })
  if (!data?.store) return new Response('Not found', { status: 404 })
  const slug = data.store.slug

  const canonical = canonicalHostOf(data, slug)
  if (canonical !== host) return Response.redirect(`https://${canonical}/sitemap.xml`, 301)

  const [siteData, products, categories] = await Promise.all([
    getPublishedSite(slug),
    getProducts(slug, { limit: SITEMAP_PRODUCTS }),
    getCategories(slug),
  ])
  const site = siteData?.site || null
  if (site?.seo?.noindex) return new Response('Not found', { status: 404 })

  const xml = sitemapXml(storeUrls({ origin: `https://${host}`, site, products, categories }))
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
