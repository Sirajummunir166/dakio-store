// GA4-shaped items from every product shape the storefront renders:
//   - Studio catalog products ({ id, n, sku, pr, col, vars }, publicCatalog.js)
//   - basic normalized products ({ id, name, sku, price, category, variants }) and
//     raw API products ({ sellingPrice, … })
//   - basic cart lines ({ productId, variantId, name, sku, unitPrice, qty })
//   - the order API's response lines ({ productId, variantId, sku, name, qty, unitPrice })
// item_id is always the product id — the id Meta's content_ids carry too.

import { variantFor, priceFor } from '../../components/studio/variants.js'

const num = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0)

function listFields(list, index) {
  const out = {}
  if (Number.isInteger(index)) out.index = index
  if (list && list.id) out.item_list_id = String(list.id)
  if (list && list.name) out.item_list_name = String(list.name)
  return out
}

function clean(item) {
  for (const k of Object.keys(item)) if (item[k] == null || item[k] === '') delete item[k]
  return item
}

/** Studio catalog product (+ picked size) → GA4 item. */
export function itemFromStudio(p, { size = null, qty = 1, price = null, index, list = null, collections = [] } = {}) {
  if (!p || !p.id) return null
  const v = variantFor(p, size)
  const col = p.col && Array.isArray(collections) ? collections.find((c) => c.id === p.col) : null
  return clean({
    item_id: String(p.id),
    item_name: p.n || '',
    item_variant: size || null,
    item_variant_id: v ? v.id : null,
    item_sku: p.sku || null,
    item_category: col ? col.n : null,
    price: num(price != null ? price : priceFor(p, size)),
    quantity: Math.max(1, num(qty) || 1),
    ...listFields(list, index),
  })
}

/** Basic normalized (or raw API) product (+ variant) → GA4 item. */
export function itemFromBasic(p, { variant = null, qty = 1, price = null, index, list = null } = {}) {
  if (!p || !p.id) return null
  const base = p.price != null ? p.price : p.sellingPrice
  return clean({
    item_id: String(p.id),
    item_name: p.name || '',
    item_variant: variant ? variant.name : null,
    item_variant_id: variant ? variant.id : null,
    item_sku: (variant && variant.sku) || p.sku || null,
    item_category: p.category && typeof p.category === 'object' ? p.category.name : (p.category || null),
    price: num(price != null ? price : (variant && variant.price != null ? variant.price : base)),
    quantity: Math.max(1, num(qty) || 1),
    ...listFields(list, index),
  })
}

/** Basic cart line (lib/storefront.js) → GA4 item. `qty` overrides the line's (a delta). */
export function itemFromCartLine(l, { qty = null, index } = {}) {
  if (!l || !l.productId) return null
  return clean({
    item_id: String(l.productId),
    item_name: l.name || '',
    item_variant_id: l.variantId || null,
    item_sku: l.sku || null,
    price: num(l.unitPrice != null ? l.unitPrice : l.price),
    quantity: Math.max(1, num(qty != null ? qty : l.qty) || 1),
    ...listFields(null, index),
  })
}

/** One line of the order API's success response → GA4 item. */
export function itemFromOrderLine(l, index) {
  if (!l || !l.productId) return null
  return clean({
    item_id: String(l.productId),
    item_name: l.name || '',
    item_variant_id: l.variantId || null,
    item_sku: l.sku || null,
    price: num(l.unitPrice),
    quantity: Math.max(1, num(l.qty) || 1),
    ...listFields(null, index),
  })
}

export const compact = (items) => (Array.isArray(items) ? items.filter(Boolean) : [])

export const itemsValue = (items) => compact(items).reduce((n, it) => n + num(it.price) * (num(it.quantity) || 1), 0)

// Stable id of "this cart": product, variant and quantity of every line, sorted.
// begin_checkout fires once per fingerprint per session.
export function cartFingerprint(items) {
  return compact(items)
    .map((it) => `${it.item_id}:${it.item_variant_id || it.item_variant || ''}:${it.quantity}`)
    .sort()
    .join('|')
}

/**
 * The purchase ecommerce object, from the order API's 201 body (contract 3).
 * An older API answers only { orderNumber, orderId } — then the caller's own
 * cart and value stand in.
 */
export function purchaseFromResponse(data, { items = [], value = null, currency = 'BDT', paymentType = null } = {}) {
  const d = data || {}
  const lines = Array.isArray(d.items) && d.items.length ? compact(d.items.map(itemFromOrderLine)) : compact(items)
  const val = d.value != null ? num(d.value)
    : (d.subtotal != null ? num(d.subtotal) - num(d.discount) : (value != null ? num(value) : itemsValue(lines)))
  const ec = {
    transaction_id: String(d.orderNumber || d.orderId || ''),
    currency: d.currency || currency,
    value: val,
    items: lines,
  }
  if (d.shipping != null) ec.shipping = num(d.shipping)
  if (d.coupon) ec.coupon = String(d.coupon)
  if (paymentType) ec.payment_type = paymentType
  return ec
}

/** view_item_list / select_item payload for one product list. */
export function listPayload(list, items) {
  return {
    ecommerce: {
      ...(list && list.id ? { item_list_id: String(list.id) } : {}),
      ...(list && list.name ? { item_list_name: String(list.name) } : {}),
      items: compact(items),
    },
  }
}
