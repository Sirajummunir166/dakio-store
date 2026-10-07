// URL hygiene for anything that leaves the page (dataLayer page_location,
// Meta event_source_url via the order body, landing/referrer attribution).
// Preview tokens must never reach an ad platform, `?q=` is what a shopper
// typed (sometimes a phone number), and /track/<code> is an order's private
// tracking code. utm_* and click ids are kept — they are the point.

const DROP_PARAMS = new Set(['token', 'previewtoken', 'q'])
const EMAIL_ONLY = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_ONLY = /^\+?[\d\s().-]{8,}$/
const BD_MOBILE_DIGITS = /^(?:88)?0?1[3-9]\d{8}$/

// Bengali digits (০–৯) to ASCII, one code unit for one, so indexes line up.
// A shopper on a Bangla keyboard types a phone as ০১৭১২৩৪৫৬৭৮.
export function foldDigits(s) {
  return String(s).replace(/[\u09E6-\u09EF]/g, (d) => String(d.charCodeAt(0) - 0x09E6))
}

// A query value that is itself an email or a Bangladesh mobile number. A long
// numeric campaign id (utm_campaign=1202…) is not a phone and stays.
function looksPersonal(v) {
  const s = foldDigits(String(v || '').trim())
  return EMAIL_ONLY.test(s) || (PHONE_ONLY.test(s) && BD_MOBILE_DIGITS.test(s.replace(/\D/g, '')))
}

export function sanitizeUrl(href, base) {
  if (!href || typeof href !== 'string') return ''
  let u
  try { u = base ? new URL(href, base) : new URL(href) } catch { return '' }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''
  u.username = ''
  u.password = ''
  u.hash = ''
  for (const k of [...u.searchParams.keys()]) {
    if (DROP_PARAMS.has(k.toLowerCase())) { u.searchParams.delete(k); continue }
    if (u.searchParams.getAll(k).some(looksPersonal)) u.searchParams.set(k, 'redacted')
  }
  u.pathname = u.pathname.replace(/\/track\/[^/]+/i, '/track/redacted')
  return u.toString().slice(0, 2048)
}

/**
 * Pages that must load nothing: theme previews, the Studio draft preview,
 * order tracking, the editor canvas, and anything carrying a preview token.
 * `scope` 'path' = the first segment is the store slug.
 */
export function isExcludedLocation({ pathname = '/', search = '' } = {}, scope = 'domain') {
  let seg = String(pathname).split('/').filter(Boolean)
  if (scope === 'path') seg = seg.slice(1)
  const s = seg[0] || ''
  if (s === 'preview' || s === 'studio-preview' || s === 'track' || s === 'studio-canvas') return true
  // The canvas also lives at the site root, outside any store.
  if (String(pathname).split('/').filter(Boolean)[0] === 'studio-canvas') return true
  let q
  try { q = new URLSearchParams(search) } catch { return false }
  return q.has('token') || q.has('previewToken')
}
