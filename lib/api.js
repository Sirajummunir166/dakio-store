const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'

export async function getStoreBySlug(slug) {
  const res = await fetch(`${BASE}/store/${slug}`, { next: { revalidate: 60 } })
  if (!res.ok) return null
  return res.json()
}

export async function getStoreByDomain(domain) {
  const res = await fetch(`${BASE}/store/by-domain/${domain}`, { next: { revalidate: 60 } })
  if (!res.ok) return null
  return res.json()
}

export async function getProducts(slug, params = {}) {
  const q = new URLSearchParams({ limit: 48, status: 'PUBLISHED', ...params }).toString()
  const res = await fetch(`${BASE}/store/${slug}/products?${q}`, { next: { revalidate: 30 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.products || []
}

export async function getCategories(slug) {
  const res = await fetch(`${BASE}/store/${slug}/categories`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.categories || []
}
