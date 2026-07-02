/**
 * Normalize a single Dakio product API object into the ThemeContract product shape.
 *
 * Fields are grouped by purpose. Placeholder fields (brand, tags, specifications, etc.)
 * are included now so future API additions slot in without changing the contract shape.
 * Themes that don't use a field simply ignore it — no contract break.
 */
export function normalizeProduct(raw) {
  if (!raw) return null

  const price = Number(raw.sellingPrice) || 0
  const comparePrice = raw.mrp && Number(raw.mrp) > price ? Number(raw.mrp) : null

  const discountAmount = comparePrice ? comparePrice - price : 0
  const discountPercent = comparePrice ? Math.round((discountAmount / comparePrice) * 100) : 0

  const badge = _deriveBadge(raw, price, comparePrice)

  const primaryImage = raw.imageUrl || (Array.isArray(raw.images) ? raw.images[0] : null) || null
  const allImages = Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images
    : primaryImage ? [primaryImage] : []

  return {
    // ── Identity ─────────────────────────────────────────────────────────────
    id: raw.id || '',
    name: raw.name || '',
    slug: raw.slug || '',
    sku: raw.sku || '',

    // ── Media ────────────────────────────────────────────────────────────────
    image: primaryImage,
    images: allImages,
    media: [],                          // future: { type, url, alt, position }[]

    // ── Pricing ──────────────────────────────────────────────────────────────
    price,
    comparePrice,
    discount: {
      amount: discountAmount,
      percent: discountPercent,
    },

    // ── Text ─────────────────────────────────────────────────────────────────
    description: raw.description || null,

    // ── Classification ───────────────────────────────────────────────────────
    category: raw.category ? { id: raw.category.id, name: raw.category.name } : null,
    brand: raw.brand || null,           // future API field
    vendor: raw.vendor || null,         // future API field
    collections: raw.collections || [], // future: string[]
    tags: raw.tags || [],               // future: string[]

    // ── Variants & attributes ────────────────────────────────────────────────
    variants: _normalizeVariants(raw.variants),
    attributes: raw.attributes || {},           // future: { color, material, fit }
    specifications: raw.specifications || [],   // future: { label, value }[]

    // ── Fashion-specific enrichment ──────────────────────────────────────────
    // These come from the API when present; enrichProduct() may fill them as fallback
    // in the fashion theme — the contract never invents data, the theme might.
    fabric: raw.fabric || null,
    care: raw.care || null,
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],

    // ── Availability ─────────────────────────────────────────────────────────
    totalStock: Number(raw.totalStock) || 0,
    status: raw.status || 'PUBLISHED',
    availability: {
      inStock: (Number(raw.totalStock) || 0) > 0,
      totalStock: Number(raw.totalStock) || 0,
      lowStockThreshold: 5,
      isLowStock: _isLowStock(raw.totalStock),
    },

    // ── Engagement ───────────────────────────────────────────────────────────
    badge,
    rating: raw.rating ?? null,         // future: number (0–5)
    reviewCount: raw.reviewCount || 0,  // future: number

    // ── SEO ──────────────────────────────────────────────────────────────────
    seo: {
      title: raw.seoTitle || raw.name || '',
      description: raw.seoDescription || raw.description || null,
      handle: raw.slug || '',
    },
  }
}

function _normalizeVariants(variants) {
  if (!Array.isArray(variants)) return []
  return variants.map(v => ({
    id: v.id || '',
    name: v.name || '',
    price: v.price != null ? Number(v.price) : null,
    stock: Number(v.stock) || 0,
    sku: v.sku || '',
  }))
}

function _deriveBadge(raw, price, comparePrice) {
  if (raw.badge) return raw.badge
  if (comparePrice && comparePrice > price) return 'SALE'
  return null
}

function _isLowStock(totalStock) {
  const n = Number(totalStock) || 0
  return n > 0 && n <= 5
}
