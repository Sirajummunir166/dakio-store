// The `tracking` object sent with an order or a lead (contract item 2), so the
// server's Meta event carries the same event_id and the shopper's ad
// identifiers. Pure: the caller gathers the env from window/document.
//
//   { v:1, event_id, checkout_event_id?, ids?:{fbp,fbc}, click?:{fbclid:{v,at},…},
//     utm?:{source,…}, page_url?, landing_url?, referrer? }

import { EVENT_ID_RE } from './ids.js'
import { sanitizeUrl } from './url.js'
import { readAttribution, sessionLanding } from './attribution.js'
import { readAdIds } from './cookies.js'

const cap = (s, n) => (typeof s === 'string' && s ? s.slice(0, n) : undefined)

/**
 * @param {string} eventId
 * @param {object} extra       { checkout_event_id? }
 * @param {object} env         { attribution:{first,last}, ids:{fbp,fbc}, href, landing, referrer }
 */
export function buildTracking(eventId, extra = {}, env = {}) {
  if (!EVENT_ID_RE.test(String(eventId || ''))) return undefined
  const out = { v: 1, event_id: eventId }
  if (extra && EVENT_ID_RE.test(String(extra.checkout_event_id || ''))) out.checkout_event_id = extra.checkout_event_id

  const ids = {}
  if (env.ids && env.ids.fbp) ids.fbp = cap(env.ids.fbp, 512)
  if (env.ids && env.ids.fbc) ids.fbc = cap(env.ids.fbc, 512)
  if (Object.keys(ids).length) out.ids = ids

  const last = env.attribution && env.attribution.last
  if (last) {
    const click = {}
    for (const [k, c] of Object.entries(last.click || {})) {
      if (c && c.v) click[k] = { v: cap(String(c.v), 512), at: Number(c.at) || undefined }
    }
    if (Object.keys(click).length) out.click = click
    const utm = {}
    for (const [k, v] of Object.entries(last.utm || {})) if (v) utm[k] = cap(String(v), 200)
    if (Object.keys(utm).length) out.utm = utm
  }

  const page = sanitizeUrl(env.href || '')
  if (page) out.page_url = page
  const landing = sanitizeUrl(env.landing || (last && last.landing_url) || '')
  if (landing) out.landing_url = landing
  const ref = sanitizeUrl(env.referrer || (last && last.referrer) || '')
  if (ref) out.referrer = ref
  return out
}

/** Gather the env from the live page. Browser only; every read is guarded. */
export function browserTrackingEnv(slug) {
  if (typeof window === 'undefined') return {}
  let storage = null, session = null
  try { storage = window.localStorage } catch { storage = null }
  try { session = window.sessionStorage } catch { session = null }
  const attribution = readAttribution(slug, { storage })
  let cookie = ''
  try { cookie = document.cookie } catch { cookie = '' }
  const fbclid = attribution.last && attribution.last.click && attribution.last.click.fbclid ? attribution.last.click.fbclid.v : null
  return {
    attribution,
    ids: readAdIds({ cookie, hostname: window.location.hostname, fbclid }),
    href: window.location.href,
    landing: sessionLanding(slug, session),
    referrer: '',
  }
}
