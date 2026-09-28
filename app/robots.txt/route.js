import { robotsTxt } from '../../lib/seo'
import { hostOf, isCustomDomain } from '../../lib/hosts'

// /robots.txt, per host. A store's own host points crawlers at its sitemap;
// Dakio's hosts (the path-based /<slug> storefront) get the same private-path
// rules and no sitemap — each store's canonical address is its own host.

export function GET(req) {
  const host = hostOf(req)
  const body = robotsTxt({ sitemapUrl: isCustomDomain(host) ? `https://${host}/sitemap.xml` : null })
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=86400' },
  })
}
