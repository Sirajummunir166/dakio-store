import { normalizeProduct } from './normalizeProduct.js'

export function normalizeProducts(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeProduct).filter(Boolean)
}
