const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'

// Returns one of three shapes:
//   { store: {...} }       — success
//   { notFound: true }     — API returned 404 (slug/domain does not exist)
//   { unavailable: true }  — API returned 5xx or network failure (transient)
// Callers must check `.notFound` vs `.unavailable` vs `.store` separately.
// Merging all failures into null was the root cause of the 2026-07-01 P0 incident
// where a 500 was silently treated as "store not found" and shown as a false 404.

export async function getStoreBySlug(slug, { previewToken } = {}) {
  const q = previewToken ? `?previewToken=${encodeURIComponent(previewToken)}` : ''
  try {
    const res = await fetch(`${BASE}/store/${slug}${q}`, { cache: 'no-store' })
    if (res.status === 404) return { notFound: true }
    if (!res.ok) return { unavailable: true }
    return res.json()
  } catch {
    return { unavailable: true }
  }
}

export async function getStoreByDomain(domain) {
  try {
    const res = await fetch(`${BASE}/store/by-domain/${domain}`, { cache: 'no-store' })
    if (res.status === 404) return { notFound: true }
    if (!res.ok) return { unavailable: true }
    return res.json()
  } catch {
    return { unavailable: true }
  }
}

export async function getProducts(slug, params = {}) {
  const q = new URLSearchParams({ limit: 48, status: 'PUBLISHED', ...params }).toString()
  const res = await fetch(`${BASE}/store/${slug}/products?${q}`, { next: { revalidate: 30 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.products || []
}

export async function getProductBySlug(tenantSlug, productSlug) {
  const res = await fetch(`${BASE}/store/${tenantSlug}/products/${productSlug}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

// Published Store Studio site document. Same three-shape contract as the store
// fetchers above: { site } | { notFound } | { unavailable }. notFound simply means
// the tenant never published a studio site → caller falls back to the legacy theme.
// Cached with a tag so publish can purge it instantly; 300s revalidate is the fallback.
export async function getPublishedSite(slug) {
  try {
    const res = await fetch(`${BASE}/store/${slug}/site`, {
      next: { revalidate: 300, tags: [`studio-site:${slug}`] },
    })
    if (res.status === 404) return { notFound: true }
    if (!res.ok) return { unavailable: true }
    return res.json()
  } catch {
    return { unavailable: true }
  }
}

export async function getCategories(slug) {
  const res = await fetch(`${BASE}/store/${slug}/categories`, { next: { revalidate: 30 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.categories || []
}
