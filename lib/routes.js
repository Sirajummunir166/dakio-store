// Mirrors middleware.js isFirstPartyHost — never modify these two in isolation
const SKIP_SUFFIXES = ['vercel.app', 'dakio.io']
const BARE_LOCAL_HOSTS = ['localhost', '127.0.0.1']

export function isCustomDomain() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return !(BARE_LOCAL_HOSTS.includes(h) || SKIP_SUFFIXES.some(d => h === d || h.endsWith(`.${d}`)))
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
