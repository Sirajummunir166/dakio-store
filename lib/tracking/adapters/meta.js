// Meta Pixel adapter. Loads fbevents.js once, sets fbq.disablePushState BEFORE
// the first init (otherwise the pixel fires its own PageView on every
// history change, doubling ours), and sends every event with
// trackSingle / trackSingleCustom to each pixel it initialised — the store's
// pixel plus a funnel's optional extra one — always with {eventID}, so the
// server's twin event de-duplicates.

import { metaEventFor } from '../events.js'

export const PIXEL_RE = /^\d{10,20}$/
const SRC = 'https://connect.facebook.net/en_US/fbevents.js'

export function createMetaAdapter({ win = typeof window !== 'undefined' ? window : null, consent = null } = {}) {
  const pixels = []
  let lastPageView = null

  function ensureFbq() {
    if (!win) return false
    // Someone else's base code (a GTM Meta tag) already loads the script.
    if (win.fbq && !win.__dkFbLoaded) win.__dkFbLoaded = true
    if (!win.fbq) {
      // The standard Meta base code, minus the auto-init.
      const n = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
      win.fbq = n
      if (!win._fbq) win._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
    }
    win.fbq.disablePushState = true
    const doc = win.document
    if (doc && !win.__dkFbLoaded) {
      win.__dkFbLoaded = true
      try {
        const t = doc.createElement('script')
        t.async = true
        t.src = SRC
        const parent = doc.head || doc.body || doc.documentElement
        if (parent) parent.appendChild(t)
      } catch { /* the stub still queues; nothing to do */ }
    }
    return true
  }

  const allowed = () => !consent || consent.allows('ad_storage')

  function send(pixelId, m, eventId) {
    try {
      win.fbq(m.custom ? 'trackSingleCustom' : 'trackSingle', pixelId, m.name, m.data, { eventID: eventId })
    } catch { /* pixel is best-effort */ }
  }

  return {
    name: 'meta',
    pixels: () => [...pixels],
    /** Initialise a pixel once. A pixel added after the page view still gets it. */
    addPixel(id) {
      const pid = String(id || '').trim()
      if (!PIXEL_RE.test(pid) || pixels.includes(pid)) return false
      if (!ensureFbq()) return false
      try { win.fbq('init', pid) } catch { return false }
      pixels.push(pid)
      if (lastPageView && allowed()) send(pid, lastPageView.m, lastPageView.eventId)
      return true
    },
    /** One canonical event → Meta, per contract item 5. */
    handle(name, { eventId, ecommerce = null, params = {} } = {}) {
      const m = metaEventFor(name, { ecommerce, params })
      if (!m) return
      if (name === 'page_view') lastPageView = { m, eventId }
      if (!pixels.length || !allowed()) return
      for (const pid of pixels) send(pid, m, eventId)
    },
  }
}
