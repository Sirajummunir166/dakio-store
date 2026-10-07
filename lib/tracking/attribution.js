// Ad-click and campaign attribution, captured from the landing URL and kept
// for 90 days in this store's own localStorage key (dk:{slug}:attr — path
// stores share one origin, so the slug is part of the key). Click-id values
// keep their case (Meta and Google reject a lower-cased id). Last touch per
// click type wins; the very first touch is kept alongside.
//
//   { first: Touch|null, last: Touch|null }
//   Touch = { at, click: { fbclid?: {v, at}, gclid?: … }, utm: {source?, …}, landing_url, referrer }

import { sanitizeUrl } from './url.js'

export const TTL_MS = 90 * 24 * 60 * 60 * 1000

// URL param → our click type
export const CLICK_PARAMS = {
  fbclid: 'fbclid',
  gclid: 'gclid',
  gbraid: 'gbraid',
  wbraid: 'wbraid',
  ttclid: 'ttclid',
  msclkid: 'msclkid',
  ScCid: 'sc_click_id',
  li_fat_id: 'li_fat_id',
  epik: 'epik',
}
export const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content']

export const attrKey = (slug) => `dk:${slug}:attr`
export const landingKey = (slug) => `dk:${slug}:landing`

function safeGet(storage, key) {
  try { return storage ? storage.getItem(key) : null } catch { return null }
}
function safeSet(storage, key, val) {
  try { if (storage) storage.setItem(key, val) } catch { /* private mode / quota */ }
}

/** Click ids + utm_* present in a query string. Values are capped, case kept. */
export function parseTouch(search, now) {
  let q
  try { q = new URLSearchParams(search || '') } catch { return null }
  const click = {}
  for (const [param, type] of Object.entries(CLICK_PARAMS)) {
    const v = q.get(param)
    if (v && v.trim()) click[type] = { v: v.trim().slice(0, 512), at: now }
  }
  const utm = {}
  for (const k of UTM_KEYS) {
    const v = q.get('utm_' + k)
    if (v && v.trim()) utm[k] = v.trim().slice(0, 200)
  }
  if (!Object.keys(click).length && !Object.keys(utm).length) return null
  return { click, utm }
}

function fresh(touch, now) {
  if (!touch || typeof touch !== 'object' || !(now - (touch.at || 0) < TTL_MS)) return null
  const click = {}
  for (const [k, c] of Object.entries(touch.click || {})) {
    if (c && typeof c.v === 'string' && now - (c.at || 0) < TTL_MS) click[k] = c
  }
  return { ...touch, click, utm: touch.utm || {} }
}

export function readAttribution(slug, { storage, now = Date.now() } = {}) {
  let raw = null
  try { raw = JSON.parse(safeGet(storage, attrKey(slug)) || 'null') } catch { raw = null }
  return { first: fresh(raw && raw.first, now), last: fresh(raw && raw.last, now) }
}

/**
 * Record this page view's touch, if its URL carries one. Safe to call on every
 * page: a URL with no click id / utm changes nothing.
 * @returns the stored { first, last }
 */
export function captureAttribution(slug, { href = '', search = '', referrer = '', storage, session, now = Date.now() } = {}) {
  const landing = sanitizeUrl(href)
  // First page of this tab's visit — the landing_url sent with orders.
  if (landing && !safeGet(session, landingKey(slug))) safeSet(session, landingKey(slug), landing)

  const cur = readAttribution(slug, { storage, now })
  const t = parseTouch(search, now)
  if (!t) return cur

  let ref = ''
  try {
    const r = referrer ? new URL(referrer) : null
    const h = href ? new URL(href) : null
    if (r && (!h || r.host !== h.host)) ref = sanitizeUrl(referrer)
  } catch { ref = '' }

  const prev = cur.last
  const last = {
    at: now,
    // Per type: a new fbclid replaces the old one; a gclid seen last week stays.
    click: { ...(prev ? prev.click : {}), ...t.click },
    // A new campaign replaces the whole utm set (mixing two campaigns' fields lies).
    utm: Object.keys(t.utm).length ? t.utm : (prev ? prev.utm : {}),
    landing_url: landing,
    referrer: ref,
  }
  const first = cur.first || { ...last }
  safeSet(storage, attrKey(slug), JSON.stringify({ first, last }))
  return { first, last }
}

export function sessionLanding(slug, session) {
  return safeGet(session, landingKey(slug)) || ''
}
