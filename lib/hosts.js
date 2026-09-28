// Which hosts are Dakio's own and which are a store's. Shared by the
// middleware (custom-domain rewrite) and the host-aware robots/sitemap routes,
// which the middleware never rewrites because their paths contain a dot.
export const SKIP_DOMAINS = ['vercel.app', 'dakio.io', 'localhost']

export function isCustomDomain(hostname) {
  return !SKIP_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))
}

/** The request's hostname, without a port. */
export function hostOf(req) {
  return (req.headers.get('host') || '').split(':')[0].toLowerCase()
}

/**
 * The public address of a store reached by its path (/<slug>/...): its own
 * dakio.shop subdomain, which every store answers on.
 */
export const storeOrigin = (slug) => `https://${slug}.dakio.shop`
