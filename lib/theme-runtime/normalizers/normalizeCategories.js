export function normalizeCategory(raw) {
  if (!raw) return null
  return {
    id: raw.id || '',
    name: raw.name || '',
    slug: raw.slug || raw.id || '',
    image: raw.image || null,
    count: raw.count != null ? Number(raw.count) : null,
    description: raw.description || null,
  }
}

export function normalizeCategories(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeCategory).filter(Boolean)
}
