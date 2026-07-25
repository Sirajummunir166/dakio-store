// Mirrors middleware.js isFirstPartyHost — never modify these two in isolation
const SKIP_SUFFIXES = ['vercel.app', 'dakio.io']
const BARE_LOCAL_HOSTS = ['localhost', '127.0.0.1']

export function isCustomDomain() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return !(BARE_LOCAL_HOSTS.includes(h) || SKIP_SUFFIXES.some(d => h === d || h.endsWith(`.${d}`)))
}

// Single source of truth for the canonical URL of a store reached via the
// domain tree, used by app/domain/[host]/page.js's generateMetadata so search
// engines converge on one URL instead of indexing the preview tier, the path
// URL, and a custom domain as three separate pages. `host` is the Host header
// the domain tree was reached on: a wildcard preview subdomain canonicalizes
// back to the path-based URL; any other host reaching this tree is by
// definition the tenant's own verified custom domain, so it IS canonical.
export function getCanonicalUrl({ host, slug }) {
  if (host && host.endsWith('.dakio.shop')) return `https://store.dakio.io/${slug}`
  if (host) return `https://${host}`
  return `https://store.dakio.io/${slug}`
}

export function storeHome(tenantSlug) {
  return isCustomDomain() ? '/' : `/${tenantSlug}`
}

export function productPath(productSlug, tenantSlug) {
  return isCustomDomain() ? `/products/${productSlug}` : `/${tenantSlug}/products/${productSlug}`
}

export function checkoutPath(tenantSlug) {
  return isCustomDomain() ? '/checkout' : `/${tenantSlug}/checkout`
}

export function trackPath(tenantSlug) {
  return isCustomDomain() ? '/track' : `/${tenantSlug}/track`
}
