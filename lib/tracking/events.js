// Canonical storefront events (GA4 names), their event-id prefixes, and how
// each maps to Meta. One table, so the dataLayer, the pixel and the server
// (which mirrors the prefixes) never drift. DAKIO_TRACKING_PLAN.md, contract 1 + 5.

export const PREFIX = {
  page_view: 'pv',
  view_item_list: 'vil',
  select_item: 'si',
  view_item: 'vi',
  add_to_cart: 'atc',
  remove_from_cart: 'rfc',
  view_cart: 'vc',
  begin_checkout: 'bc',
  add_shipping_info: 'asi',
  add_payment_info: 'api',
  purchase: 'pur',
  search: 'srch',
  login: 'lgn',
  whatsapp_click: 'ct',
  phone_call_click: 'ct',
  email_click: 'ct',
  generate_lead: 'lead',
}

export const EVENT_NAMES = Object.keys(PREFIX)

// Events whose payload rides in GA4's `ecommerce` object.
export const ECOMMERCE_EVENTS = new Set([
  'view_item_list', 'select_item', 'view_item', 'add_to_cart', 'remove_from_cart', 'view_cart',
  'begin_checkout', 'add_shipping_info', 'add_payment_info', 'purchase',
])

// The old top-level value/currency/items — kept for one release so merchant
// GTM triggers built on them keep working.
export const LEGACY_MIRROR = new Set(['add_to_cart', 'begin_checkout', 'purchase'])

export const prefixFor = (name) => PREFIX[name] || 'ev'

const num = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0)

function contentsOf(items) {
  return (Array.isArray(items) ? items : []).map((it) => ({
    id: String(it.item_id),
    quantity: num(it.quantity) || 1,
    item_price: num(it.price),
  }))
}

function productData(ec, extra = {}) {
  const items = (ec && ec.items) || []
  const contents = contentsOf(items)
  const out = {
    content_ids: [...new Set(contents.map((c) => c.id))],
    contents,
    content_type: 'product',
    ...extra,
  }
  if (ec && ec.value != null) out.value = num(ec.value)
  if (ec && ec.currency) out.currency = ec.currency
  return out
}

const numItems = (ec) => ((ec && ec.items) || []).reduce((n, it) => n + (num(it.quantity) || 1), 0)

/**
 * The Meta call for a canonical event, or null when the event is dataLayer-only
 * (view_item_list, select_item, view_cart, remove_from_cart, login).
 * @returns {{ custom: boolean, name: string, data: object } | null}
 */
export function metaEventFor(name, { ecommerce: ec = null, params = {} } = {}) {
  switch (name) {
    case 'page_view': return { custom: false, name: 'PageView', data: {} }
    case 'view_item': {
      const first = ec && ec.items && ec.items[0]
      return { custom: false, name: 'ViewContent', data: productData(ec, first && first.item_name ? { content_name: first.item_name } : {}) }
    }
    case 'add_to_cart': return { custom: false, name: 'AddToCart', data: productData(ec) }
    case 'begin_checkout': return { custom: false, name: 'InitiateCheckout', data: productData(ec, { num_items: numItems(ec) }) }
    case 'add_shipping_info': return { custom: true, name: 'AddShippingInfo', data: productData(ec, { num_items: numItems(ec) }) }
    case 'add_payment_info': return { custom: false, name: 'AddPaymentInfo', data: productData(ec) }
    case 'purchase': return {
      custom: false,
      name: 'Purchase',
      data: productData(ec, { num_items: numItems(ec), ...(ec && ec.transaction_id ? { order_id: ec.transaction_id } : {}) }),
    }
    case 'search': return { custom: false, name: 'Search', data: { search_string: String(params.search_term || '') } }
    case 'whatsapp_click':
    case 'phone_call_click':
    case 'email_click': return { custom: false, name: 'Contact', data: {} }
    case 'generate_lead': return { custom: false, name: 'Lead', data: ec && ec.value != null ? { value: num(ec.value), currency: ec.currency } : {} }
    default: return null
  }
}

/**
 * A contact link (WhatsApp, phone, email) → its canonical event, with the
 * number/address masked. null for any other href.
 */
export function contactEventFor(href) {
  const h = String(href || '').trim()
  if (/^https?:\/\/(?:wa\.me|api\.whatsapp\.com|(?:www\.)?whatsapp\.com\/send)/i.test(h)) {
    return { name: 'whatsapp_click', params: { link_type: 'whatsapp', link_url: h.replace(/\d/g, 'x').split('?')[0] } }
  }
  if (/^tel:/i.test(h)) return { name: 'phone_call_click', params: { link_type: 'phone', link_url: 'tel:[phone]' } }
  if (/^mailto:/i.test(h)) return { name: 'email_click', params: { link_type: 'email', link_url: 'mailto:[email]' } }
  return null
}

/**
 * Which kind of storefront page a path is. `scope` 'path' means the first
 * segment is the store slug (store.dakio.io/<slug>/…); 'domain' means a
 * custom or *.dakio.shop host where the store owns the whole path.
 */
export function pageTypeOf(pathname, scope = 'domain') {
  let seg = String(pathname || '/').split('?')[0].split('/').filter(Boolean)
  if (scope === 'path') seg = seg.slice(1)
  const s = seg[0] || ''
  if (!s) return 'home'
  if (s === 'p' || s === 'products') return 'product'
  if (s === 'shop') return seg[1] ? 'collection' : 'shop'
  if (s === 'collections') return 'collection'
  if (s === 'cart') return 'cart'
  if (s === 'checkout') return 'checkout'
  if (s === 'account') return 'account'
  if (s === 'f') return 'funnel'
  if (s === 'track') return 'track'
  return 'page'
}
