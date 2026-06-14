/**
 * Shared media resolver for storefront product images.
 *
 * Precedence:
 *   1. Valid primary imageUrl
 *   2. First valid URL from images[] (skipping duplicates)
 *   3. null / empty gallery → caller renders placeholder
 *
 * "Valid" means ALL of the following:
 *   - non-null, non-undefined, non-empty string
 *   - NOT a data: URI (base64 / inline content)
 *   - NOT a blob: URL (non-transferable browser object)
 *   - Starts with http:// or https://
 *   - Not a known static placeholder path
 *
 * Deduplication is performed on the normalized URL (trimmed lowercase).
 * Original casing is preserved in the output.
 */

const PLACEHOLDER_PATTERNS = [
  '/placeholder',
  '/no-image',
  '/noimage',
  '/default-image',
  '/blank-image',
  'placeholder.com',
  'via.placeholder',
  'placehold.it',
  'dummyimage.com',
]

function isValid(url) {
  if (typeof url !== 'string') return false
  const t = url.trim()
  if (t.length === 0)            return false
  if (t.startsWith('data:'))     return false
  if (t.startsWith('blob:'))     return false
  if (!/^https?:\/\//i.test(t)) return false
  const lower = t.toLowerCase()
  for (const pat of PLACEHOLDER_PATTERNS) {
    if (lower.includes(pat)) return false
  }
  return true
}

/**
 * @param {object|null} product  — any object with optional imageUrl and images[]
 * @returns {{ primary: string|null, gallery: string[] }}
 */
export function resolveMedia(product) {
  if (!product) return { primary: null, gallery: [] }

  const raw = [
    product.imageUrl,
    ...(Array.isArray(product.images) ? product.images : []),
  ]

  const seen    = new Set()  // keyed on trimmed lowercase for dedup
  const gallery = []
  for (const url of raw) {
    if (!isValid(url)) continue
    const key = url.trim().toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    gallery.push(url.trim())
  }

  return { primary: gallery[0] || null, gallery }
}
