// The one dataLayer envelope every Dakio storefront event is pushed as
// (DAKIO_TRACKING_PLAN.md):
//
//   { event, event_id, dk:{ v:1, store, store_id, page_type, sent_by, consent },
//     ecommerce?:{ currency, value, items, transaction_id, shipping, coupon, payment_type },
//     ...params }
//
// An ecommerce push is preceded by { ecommerce: null } so GA4 tags in GTM never
// merge items across events. For one release add_to_cart / begin_checkout /
// purchase also carry the old top-level value/currency/items.
//
// Nothing raw that identifies a shopper ever goes in: every string is passed
// through redactPII (emails and phone numbers), whatever the caller sent.

import { ECOMMERCE_EVENTS, LEGACY_MIRROR } from './events.js'
import { foldDigits } from './url.js'

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
// A Bangladesh mobile in any spelling, then any longer run of digits
// (spaces/dashes/dots between them) — 8+ digits reads as a phone, not a price.
const BD_PHONE_RE = /(?:\+?88[\s-]?)?0?1[3-9](?:[\s.-]?\d){8}/g
const LONG_DIGITS_RE = /\+?\d(?:[\s.()-]?\d){7,}/g

// Match on a copy with Bengali digits folded to ASCII (same length), but cut
// the original, so a search like 'দাম ৫০০' keeps its own digits.
function redactAligned([orig, folded], re, token) {
  let o = ''
  let f = ''
  let last = 0
  for (const m of folded.matchAll(re)) {
    o += orig.slice(last, m.index) + token
    f += folded.slice(last, m.index) + token
    last = m.index + m[0].length
  }
  return [o + orig.slice(last), f + folded.slice(last)]
}

// `catalog` text (product names, categories) keeps long digit runs like
// 'Jersey 2008-2009' and only loses what is plainly an email or a BD mobile.
export function redactPII(value, { catalog = false } = {}) {
  if (typeof value !== 'string' || !value) return value
  let pair = [value, foldDigits(value)]
  pair = redactAligned(pair, EMAIL_RE, '[email]')
  pair = redactAligned(pair, BD_PHONE_RE, '[phone]')
  if (!catalog) pair = redactAligned(pair, LONG_DIGITS_RE, '[phone]')
  return pair[0]
}

// Ids, prices and quantities are numbers or opaque ids — only free text is
// scrubbed. Keys that are ids are left alone (an order number or an ad's
// numeric campaign id carries digits we must keep). Page URLs are kept too:
// the dispatcher only ever sets them through url.js sanitizeUrl, which strips
// tokens/?q= and redacts any query value that is itself a phone or email.
const KEEP_KEYS = new Set([
  'event_id', 'item_id', 'item_variant_id', 'transaction_id', 'item_list_id', 'store', 'store_id',
  'page_location', 'page_referrer',
])
// Catalog text is the merchant's, not a shopper's: a product named
// 'Jersey 2008-2009' must not read as a phone number.
const CATALOG_KEYS = new Set([
  'item_name', 'item_variant', 'item_sku', 'item_brand', 'item_list_name',
  'item_category', 'item_category2', 'item_category3', 'item_category4', 'item_category5',
])

export function scrub(value, key) {
  if (value == null) return value
  if (typeof value === 'string') return KEEP_KEYS.has(key) ? value : redactPII(value, { catalog: CATALOG_KEYS.has(key) })
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.map((v) => scrub(v, key))
  if (typeof value === 'object') {
    const out = {}
    for (const k of Object.keys(value)) {
      const v = scrub(value[k], k)
      if (v !== undefined) out[k] = v
    }
    return out
  }
  return undefined
}

/**
 * Build the dataLayer pushes for one event.
 * @returns {object[]} 1 push, or 2 when there is an ecommerce object ({ecommerce:null} first)
 */
export function buildEnvelope({ event, eventId, store = null, storeId = null, pageType = null, sentBy = 'dakio-store', consent = null, ecommerce = null, params = {} }) {
  const env = {
    ...scrub(params || {}),
    event,
    event_id: eventId,
    dk: { v: 1, store, store_id: storeId, page_type: pageType, sent_by: sentBy, consent: consent ? { ...consent } : null },
  }
  const hasEcom = !!ecommerce && ECOMMERCE_EVENTS.has(event)
  if (hasEcom) {
    env.ecommerce = scrub(ecommerce)
    if (LEGACY_MIRROR.has(event)) {
      env.value = env.ecommerce.value
      env.currency = env.ecommerce.currency
      env.items = env.ecommerce.items
      if (event === 'purchase' && env.ecommerce.transaction_id) env.transaction_id = env.ecommerce.transaction_id
    }
  }
  return hasEcom ? [{ ecommerce: null }, env] : [env]
}
