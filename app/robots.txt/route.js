import { getStoreByDomain, getPublishedSite } from '../../lib/api'
import { robotsTxt, canonicalHostOf } from '../../lib/seo'
import { hostOf, isCustomDomain } from '../../lib/hosts'

// /robots.txt, per host. A store's hosts point crawlers at the sitemap on its
// canonical host (robots may name a sitemap on another host); Dakio's own
// hosts get the private-path rules and no sitemap. Nothing is disallowed
// wholesale — not even for a store hidden from search, whose pages carry
// noindex and must stay crawlable for that tag to be seen.

export async function GET(req) {
  const host = hostOf(req)
  let sitemapUrl = null
  if (isCustomDomain(host)) {
    const data = await getStoreByDomain(host)
    if (data?.store) {
      const siteData = await getPublishedSite(data.store.slug)
      if (!siteData?.site?.seo?.noindex) sitemapUrl = `https://${canonicalHostOf(data, data.store.slug)}/sitemap.xml`
    }
  }
  return new Response(robotsTxt({ sitemapUrl }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  })
}
