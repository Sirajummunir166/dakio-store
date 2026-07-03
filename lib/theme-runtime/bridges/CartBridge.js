/**
 * Cart Bridge — normalizes cart item field names and provides the storage key.
 *
 * The cart state itself lives in useStorefront (lib/storefront.js) because React
 * hooks cannot live in a plain module. CartBridge provides the field-name contract
 * and helpers that themes use to read/display cart data.
 *
 * Themes receive ThemeContract.cart which includes normalized items + action handles.
 * They never read localStorage directly or call the cart API.
 */

export function CART_STORAGE_KEY(slug) {
  return `dk_cart_${slug}`
}

/**
 * Normalize a raw storefront cart item (from useStorefront) to the ThemeContract shape.
 * Raw item uses `unitPrice` and `imageUrl` (Dakio field names).
 * Normalized item uses `price` and `image` (theme-facing names).
 */
export function normalizeCartItem(raw) {
  if (!raw) return null
  return {
    key: raw.key || '',
    productId: raw.productId || '',
    variantId: raw.variantId || null,
    // size is the human-readable size string (same as variantId when a plain size like "M" is used)
    size: raw.size || raw.variantId || null,
    name: raw.name || '',
    sku: raw.sku || '',
    slug: raw.slug || null,
    image: raw.imageUrl || raw.image || null,
    price: raw.unitPrice ?? raw.price ?? 0,
    qty: raw.qty || 1,
  }
}

export function normalizeCartItems(items) {
  if (!Array.isArray(items)) return []
  return items.map(normalizeCartItem).filter(Boolean)
}

/**
 * Build the cart handle object for ThemeContract.cart.
 * actions: { addToCart, removeFromCart, changeQty, setCartOpen } from useStorefront
 * state:   { cart, cartOpen, cartTotal, cartCount } from useStorefront
 */
export function buildCartBridge({ state, actions, slug }) {
  return {
    slug,
    items: normalizeCartItems(state.cart || []),
    isOpen: state.cartOpen || false,
    total: state.cartTotal || 0,
    count: state.cartCount || 0,
    coupon: state.appliedCoupon ?? null,
    couponDiscount: state.couponDiscount ?? 0,
    open: () => actions.setCartOpen(true),
    close: () => actions.setCartOpen(false),
    addItem: (normalizedProduct, qty, sizeOrVariant) => {
      // addToCart in storefront.js reads product.sellingPrice and product.imageUrl.
      // ThemeContract products use price and image. Translate back before calling the platform.
      const forCart = {
        ...normalizedProduct,
        sellingPrice: normalizedProduct.price,
        imageUrl: normalizedProduct.image,
      }
      const variant =
        typeof sizeOrVariant === 'string'
          ? { id: sizeOrVariant, name: sizeOrVariant, price: null, stock: 10 }
          : sizeOrVariant
      actions.addToCart(forCart, qty, variant)
    },
    removeItem: (key) => actions.removeFromCart(key),
    updateQty: (key, delta) => actions.changeQty(key, delta),
  }
}
