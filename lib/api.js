import { sellable, sellableList } from './sellable.js'
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

// `params.limit` is the most products wanted in total, read page by page
// (the API serves at most 100 per page and says hasMore). Without one: the
// newest 48, one call — enough for the legacy theme (its sections show a few)
// and for pages that read what else they need by id or slug (product page,
// funnel, bag lines). The studio routes that list the catalogue — home, custom
// pages, shop, collections, the draft preview — ask for CATALOG_MAX: one fetch
// of 48 left a 110-product store's shop at 48 and older collections empty
// (Store Studio audit SST-28, decision 13; RV-SST-04).
export const CATALOG_MAX = 1000
const DEFAULT_LIMIT = 48
const PAGE = 100

export async function getProducts(slug, params = {}) {
  const { limit, ...rest } = params
  const want = Math.max(1, Math.min(Number(limit) || DEFAULT_LIMIT, 5000))
  const out = []
  let offset = 0
  while (out.length < want) {
    const q = new URLSearchParams({ status: 'PUBLISHED', ...rest, limit: String(Math.min(PAGE, want - out.length)), offset: String(offset) }).toString()
    // Tagged so builder catalog edits can purge instantly (see app/api/revalidate)
    const res = await fetch(`${BASE}/store/${slug}/products?${q}`, { next: { revalidate: 30, tags: [`store-products:${slug}`] } })
    if (!res.ok) break
    const data = await res.json()
    const page = data.products || []
    out.push(...page)
    // An API without paging answers no hasMore: one page, as before.
    if (!data.hasMore || !page.length) break
    offset = Number.isFinite(data.nextOffset) ? data.nextOffset : offset + page.length
  }
  return sellableList(out.slice(0, want))
}

// Specific products by id, in the list's shape — a funnel's product or a bag
// line wherever it sits in the catalogue (SST-29, SST-30). Never fails the page.
export async function getProductsByIds(slug, ids) {
  const list = [...new Set((ids || []).filter(Boolean))].slice(0, 100)
  if (!list.length) return []
  try {
    const res = await fetch(`${BASE}/store/${slug}/products?ids=${encodeURIComponent(list.join(','))}&limit=100`, { next: { revalidate: 30, tags: [`store-products:${slug}`] } })
    if (!res.ok) return []
    return sellableList((await res.json()).products || [])
  } catch {
    return []
  }
}

export async function getProductBySlug(tenantSlug, productSlug) {
  const res = await fetch(`${BASE}/store/${tenantSlug}/products/${productSlug}`, { cache: 'no-store' })
  if (!res.ok) return null
  return sellable(await res.json())
}

// Reviews the merchant approved (review after delivery). Never fails the page.
export async function getProductReviews(tenantSlug, productSlug) {
  try {
    const res = await fetch(`${BASE}/store/${tenantSlug}/products/${encodeURIComponent(productSlug)}/reviews`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return (await res.json()).reviews || []
  } catch {
    return []
  }
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
    if (res.status === 404) {
      // A store with no published website: its launch page, and until when it
      // keeps the old pages (lib/launch.js). A missing store has neither.
      const body = await res.json().catch(() => null)
      return body && body.launch
        ? { notFound: true, launch: body.launch, legacyUntil: body.legacyUntil || null, canonicalHost: body.canonicalHost || null }
        : { notFound: true }
    }
    if (!res.ok) return { unavailable: true }
    return res.json()
  } catch {
    return { unavailable: true }
  }
}

export async function getCategories(slug) {
  const res = await fetch(`${BASE}/store/${slug}/categories`, { next: { revalidate: 30, tags: [`store-categories:${slug}`] } })
  if (!res.ok) return []
  const data = await res.json()
  return data.categories || []
}

// Services on the website (services website W1). A store that sells no
// services answers an empty list. Same three shapes as above for one service.
export async function getServices(slug) {
  try {
    const res = await fetch(`${BASE}/store/${slug}/services`, { next: { revalidate: 120, tags: [`store-services:${slug}`] } })
    if (!res.ok) return []
    return (await res.json()).services || []
  } catch {
    return []
  }
}

export async function getService(slug, serviceSlug) {
  try {
    const res = await fetch(`${BASE}/store/${slug}/services/${encodeURIComponent(serviceSlug)}`, { next: { revalidate: 120, tags: [`store-services:${slug}`] } })
    if (res.status === 404) return { notFound: true }
    if (!res.ok) return { unavailable: true }
    return res.json()
  } catch {
    return { unavailable: true }
  }
}

// The client's booking (services website W2) — always fresh: its status changes
// when the business confirms, moves or cancels it. Same three shapes.
export async function getBookingStatus(slug, token, lang = 'bn') {
  try {
    const res = await fetch(`${BASE}/store/${slug}/bookings/${encodeURIComponent(token)}?lang=${lang === 'en' ? 'en' : 'bn'}`, { cache: 'no-store' })
    if (res.status === 404) return { notFound: true }
    if (!res.ok) return { unavailable: true }
    return res.json()
  } catch {
    return { unavailable: true }
  }
}
