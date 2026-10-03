// Goes well with (DAKIO_PAIRINGS_PLAN.md cut 2) — add-on lines in the basic
// store's cart (lib/storefront.js, `dk_cart_<slug>`).
//
// That cart stores a `unitPrice` per line and sends it to checkout, where the
// server refuses a line priced more than ৳1 off its own price. So an add-on
// line keeps its `basePrice` and `togetherPrice` and its `unitPrice` is
// recomputed on every change by the server's rule (dakio-api lib/pairings.js
// addOnUnitPrice): the together price only while its main product is in the
// cart, for no more add-ons than main items, and only when it is lower.

export function addOnUnit(cart, line) {
  const base = Number(line.basePrice ?? line.unitPrice)
  if (!line.addOnOf || line.togetherPrice == null) return base
  // Mains are lines bought for themselves; the add-on counts across all its
  // lines for the same main (two sizes cannot beat "no more than the main").
  const mainQty = cart.reduce((n, l) => (!l.addOnOf && l.productId === line.addOnOf ? n + Number(l.qty || 0) : n), 0)
  const addOnQty = cart.reduce((n, l) => (l.addOnOf === line.addOnOf && l.productId === line.productId ? n + Number(l.qty || 0) : n), 0)
  if (mainQty <= 0 || addOnQty > mainQty) return base
  return Number(line.togetherPrice) < base ? Number(line.togetherPrice) : base
}

/** Every add-on line priced by the rule; other lines untouched. */
export function repriceCart(cart) {
  if (!Array.isArray(cart)) return []
  if (!cart.some((l) => l && l.addOnOf)) return cart
  return cart.map((l) => (l && l.addOnOf ? { ...l, unitPrice: addOnUnit(cart, l) } : l))
}
