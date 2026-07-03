/**
 * lib-cart.js — storefront-compatible cart helpers.
 * Adapted from veluna's lib/cart.js to handle both veluna key format and
 * Dakio cart item structures.
 */

/**
 * Find a cart line for a specific product + size combo.
 * Dakio key format: productId + variantId (no separator) — e.g. "abc123M"
 * Fallback: match by productId + size field (set in normalizeCartItem from variantId).
 */
export function getCartLine(items = [], productId, size) {
  return (
    items.find(
      (item) =>
        item.key === `${productId}${size}` ||
        (String(item.productId) === String(productId) && item.size === size),
    ) ?? null
  )
}
