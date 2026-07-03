'use client'
import { useFashionTheme } from '../FashionThemeContext.jsx'

/**
 * useCart — veluna-compatible cart hook backed by Dakio ThemeContract.
 *
 * Veluna sections call useCart() expecting:
 *   items, itemCount, subtotal, isOpen, openCart, closeCart,
 *   addItem(product, {size, qty}), removeItem(id, size), updateQty(id, size, qty),
 *   buyNow(product, {size, qty}), clearCart(), coupon, applyCoupon, removeCoupon
 *
 * ThemeContract.cart uses:
 *   addItem(product, qty, size) — different arg order
 *   removeItem(itemId)
 *   changeQty(itemId, qty)
 *   open(), close(), isOpen, items, count, total
 */
export function useCart() {
  const { contract } = useFashionTheme()
  const c = contract.cart

  return {
    items:     c.items ?? [],
    itemCount: c.count ?? 0,
    subtotal:  c.total ?? 0,
    isOpen:    c.isOpen ?? false,
    openCart:  c.open,
    closeCart: c.close,

    // Veluna: addItem(product, {size, qty})
    // ThemeContract: addItem(product, qty, size)
    addItem: (product, { size, qty }) => c.addItem(product, qty, size),

    // Veluna: buyNow adds then navigates — navigation handled by caller via openCheckout()
    buyNow: (product, { size, qty }) => c.addItem(product, qty, size),

    // Veluna: removeItem(productId, size) — Dakio key = productId + variantId (no separator)
    removeItem: (productId, size) => {
      const items = c.items ?? []
      const item = items.find(
        (i) =>
          i.key === `${productId}${size}` ||
          (String(i.productId) === String(productId) && i.size === size),
      )
      if (item) c.removeItem(item.key ?? item.id)
    },

    // Veluna: updateQty(productId, size, qty)
    updateQty: (productId, size, qty) => {
      const items = c.items ?? []
      const item = items.find(
        (i) =>
          i.key === `${productId}${size}` ||
          (String(i.productId) === String(productId) && i.size === size),
      )
      if (item) c.changeQty(item.key ?? item.id, qty)
    },

    clearCart: () => {},    // no-op — not exposed in ThemeContract
    coupon:       null,
    applyCoupon:  () => {},
    removeCoupon: () => {},
  }
}
