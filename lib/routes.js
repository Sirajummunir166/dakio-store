// Mirrors middleware.js isCustomDomain — never modify these two in isolation
const FALLBACK_DOMAINS = ['vercel.app', 'dakio.io', 'localhost']

export function isCustomDomain() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return !FALLBACK_DOMAINS.some(d => h === d || h.endsWith(`.${d}`))
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
