// The tracking core: one dispatcher per storefront page tree (TrackingRoot).
//
// - Events tracked before init (child effects run before the provider's) are
//   queued; init sends the page view FIRST, then the queue.
// - Every non-page_view event first makes sure the current path has had its
//   page_view, so page_view always precedes view_item — even on a soft
//   navigation, where the new page's effects run before the provider's.
// - once(key) guards survive Strict Mode remounts (memory) and, for checkout
//   and purchase keys, reloads and other tabs (sessionStorage / localStorage
//   under dk:{slug}:…).
// - Pushes go to window.dataLayer as the canonical envelope (schema.js), then
//   to each adapter (Meta). Nothing raw that identifies a shopper is pushed.

import { buildEnvelope } from './schema.js'
import { newEventId } from './ids.js'
import { prefixFor, pageTypeOf } from './events.js'
import { sanitizeUrl } from './url.js'
import { createConsent } from './consent.js'

const MAX_QUEUE = 100

export function createDispatcher({
  win = typeof window !== 'undefined' ? window : null,
  slug = '',
  storeId = null,
  scope = 'domain',
  sentBy = 'dakio-store',
  consent = createConsent(),
  now = () => Date.now(),
  // (location) => true on a page that must send nothing (url.js isExcludedLocation).
  // Asked on every event, so a soft navigation onto /track is silent at once —
  // even for the new page's own effects, which run before the provider's.
  excluded = null,
} = {}) {
  let ready = false
  let off = false
  let lastPage = null
  let firstPage = true
  const queue = []
  const adapters = []
  const mem = new Set()
  let memBc = null

  const k = (key) => `dk:${slug}:${key}`
  const store = (kind) => {
    if (!win) return null
    try { return kind === 'local' ? win.localStorage : kind === 'session' ? win.sessionStorage : null } catch { return null }
  }
  const curPath = () => { try { return win.location.pathname } catch { return '/' } }
  const blocked = () => {
    if (off) return true
    if (!excluded || !win) return false
    try { return !!excluded(win.location) } catch { return false }
  }

  function dispatch(name, payload, eventId) {
    const { ecommerce = null, ...params } = payload || {}
    const pushes = buildEnvelope({
      event: name, eventId, store: slug, storeId, sentBy,
      pageType: pageTypeOf(curPath(), scope),
      consent: consent.get(),
      ecommerce, params,
    })
    if (win) {
      const dl = (win.dataLayer = win.dataLayer || [])
      for (const p of pushes) { try { dl.push(p) } catch { /* a broken GTM never breaks the shop */ } }
    }
    const env = pushes[pushes.length - 1]
    const { event: _e, event_id: _i, dk: _dk, ecommerce: ec, ...cleanParams } = env
    for (const a of adapters) {
      try { a.handle(name, { eventId, ecommerce: ec || null, params: cleanParams }) } catch { /* adapter isolation */ }
    }
  }

  function ensurePageView(pathname = curPath()) {
    if (!ready || blocked()) return null
    if (pathname === lastPage) return null
    lastPage = pathname
    const params = { page_location: '', page_title: '' }
    try { params.page_location = sanitizeUrl(win.location.href) } catch { /* no window */ }
    try { params.page_title = String(win.document.title || '').slice(0, 300) } catch { /* no document */ }
    if (firstPage) {
      firstPage = false
      try { const r = sanitizeUrl(win.document.referrer || ''); if (r) params.page_referrer = r } catch { /* none */ }
    }
    const id = newEventId(prefixFor('page_view'))
    dispatch('page_view', params, id)
    return id
  }

  function track(name, payload = {}, opts = {}) {
    const eventId = opts.eventId || newEventId(prefixFor(name))
    if (blocked()) return eventId
    if (!ready) {
      if (queue.length < MAX_QUEUE) queue.push([name, payload, eventId])
      return eventId
    }
    if (name === 'page_view') { ensurePageView(); return eventId }
    ensurePageView()
    dispatch(name, payload, eventId)
    return eventId
  }

  return {
    consent,
    get ready() { return ready },
    get off() { return off },
    addAdapter(a) { if (a && !adapters.includes(a)) adapters.push(a) },
    init() {
      if (off || ready) return
      ready = true
      ensurePageView()
      const q = queue.splice(0)
      for (const [name, payload, eventId] of q) track(name, payload, { eventId })
    },
    /** Loaded on an excluded page (preview, track, token URL): nothing is sent, ever. */
    disable() { off = true; queue.length = 0 },
    ensurePageView,
    track,
    /**
     * true the first time `key` is seen. storage: 'session' | 'local' also
     * remembers it across reloads (session) or tabs (local).
     */
    once(key, { storage = null } = {}) {
      const full = k(key)
      if (mem.has(full)) return false
      const st = store(storage)
      if (st) {
        try { if (st.getItem(full)) { mem.add(full); return false } } catch { /* blocked storage */ }
        try { st.setItem(full, String(now())) } catch { /* quota / private mode */ }
      }
      mem.add(full)
      return true
    },
    /**
     * The begin_checkout id for this cart: reused while the cart's fingerprint
     * is unchanged this session, new when the cart changes.
     */
    checkoutEventId(fingerprint) {
      if (memBc && memBc.fp === fingerprint) return memBc.id
      const st = store('session')
      try {
        const cur = st ? JSON.parse(st.getItem(k('bc')) || 'null') : null
        if (cur && cur.fp === fingerprint && cur.id) { memBc = cur; return cur.id }
      } catch { /* corrupt entry → a new id */ }
      memBc = { fp: fingerprint, id: newEventId(prefixFor('begin_checkout')) }
      try { if (st) st.setItem(k('bc'), JSON.stringify(memBc)) } catch { /* private mode */ }
      return memBc.id
    },
  }
}
