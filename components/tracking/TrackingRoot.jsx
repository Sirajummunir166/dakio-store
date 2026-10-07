'use client'
import { createContext, useContext, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createDispatcher } from '../../lib/tracking/dispatcher'
import { createMetaAdapter } from '../../lib/tracking/adapters/meta'
import { captureAttribution } from '../../lib/tracking/attribution'
import { buildTracking, browserTrackingEnv } from '../../lib/tracking/context'
import { contactEventFor } from '../../lib/tracking/events'
import { isExcludedLocation } from '../../lib/tracking/url'
import { newEventId } from '../../lib/tracking/ids'

// The storefront's tracking provider, mounted by app/[slug]/layout.js and
// app/domain/[host]/layout.js (TrackingBootstrap has already created the
// dataLayer and loaded GTM). On mount: attribution → dispatcher.init (page
// view first, then anything queued) → Meta pixel → contact-click listener →
// visitor ping. Each soft navigation gets one page_view. Excluded pages
// (preview, studio-preview, track, token URLs) send nothing.
//
// useTracking() is a no-op outside this provider — the Studio editor canvas
// renders the same sections and must stay silent.

const API = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'

const noop = () => {}
const NOOP = Object.freeze({
  enabled: false,
  slug: null,
  currency: 'BDT',
  track: noop,
  once: () => false,
  newEventId,
  checkoutEventId: () => null,
  buildTracking: () => undefined,
  addPixel: noop,
})

const TrackingContext = createContext(null)

export function useTracking() {
  return useContext(TrackingContext) || NOOP
}

function visitorSessionId() {
  try {
    let id = sessionStorage.getItem('_dvid')
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('_dvid', id)
    }
    return id
  } catch { return null }
}

function pingVisitor(slug, sessionId) {
  if (!sessionId) return
  fetch(`${API}/visitors/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, sessionId, page: window.location.pathname }),
  }).catch(() => {})
}

function createTracker(config) {
  const dispatcher = createDispatcher({
    slug: config.slug,
    storeId: config.storeId,
    scope: config.scope,
    excluded: (loc) => isExcludedLocation(loc, config.scope),
  })
  const meta = createMetaAdapter({ consent: dispatcher.consent })
  dispatcher.addAdapter(meta)
  const extraPixels = new Set()
  let started = false

  const api = {
    enabled: true,
    slug: config.slug,
    currency: config.currency || 'BDT',
    track: (name, payload, opts) => dispatcher.track(name, payload, opts),
    once: (key, opts) => dispatcher.once(key, opts),
    newEventId,
    checkoutEventId: (fp) => dispatcher.checkoutEventId(fp),
    buildTracking: (eventId, extra) => buildTracking(eventId, extra, browserTrackingEnv(config.slug)),
    // A funnel's own pixel, on top of the store's (which always fires).
    addPixel: (id) => {
      const pid = String(id || '').replace(/\D/g, '')
      if (!/^\d{10,20}$/.test(pid)) return
      if (started && !dispatcher.off) meta.addPixel(pid)
      else extraPixels.add(pid)
    },
  }

  function start() {
    if (started) return
    started = true
    const excluded = (typeof window !== 'undefined' && window.__dkOff === true)
      || isExcludedLocation({ pathname: window.location.pathname, search: window.location.search }, config.scope)
    if (excluded) { dispatcher.disable(); return }
    try {
      captureAttribution(config.slug, {
        href: window.location.href,
        search: window.location.search,
        referrer: document.referrer,
        storage: window.localStorage,
        session: window.sessionStorage,
      })
    } catch { /* storage blocked — attribution is best-effort */ }
    if (config.metaPixelId) meta.addPixel(config.metaPixelId)
    for (const pid of extraPixels) meta.addPixel(pid)
    dispatcher.init()
  }

  return { api, dispatcher, start }
}

export default function TrackingRoot({ config, children }) {
  const ref = useRef(null)
  if (!ref.current && config) ref.current = createTracker(config)
  const tracker = ref.current
  const pathname = usePathname()

  // Start once per document; the listeners and the ping are re-armed on a
  // Strict Mode remount, the dispatcher is not.
  useEffect(() => {
    if (!tracker) return undefined
    tracker.start()
    if (tracker.dispatcher.off) return undefined

    // WhatsApp / phone / email links anywhere on the page (Studio's own
    // window.open links report through useTracking in PublicSite).
    const onClick = (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null
      if (!a) return
      const ev = contactEventFor(a.getAttribute('href'))
      if (ev) tracker.api.track(ev.name, ev.params)
    }
    document.addEventListener('click', onClick, true)

    // Live-visitor ping (was VisitorTracker): the page it reports is the one
    // the shopper is on now, not the one they landed on.
    const sessionId = visitorSessionId()
    const ping = () => { if (!tracker.dispatcher.off) pingVisitor(config.slug, sessionId) }
    ping()
    const interval = setInterval(ping, 30_000)
    return () => {
      document.removeEventListener('click', onClick, true)
      clearInterval(interval)
    }
  }, [tracker, config?.slug])

  // One page_view per path. usePathname is only the trigger — on a custom
  // domain it reads the rewritten /domain/<host>/… path; the browser's own
  // path is what gets reported.
  const firstPath = useRef(true)
  useEffect(() => {
    if (!tracker || tracker.dispatcher.off) return
    const loc = { pathname: window.location.pathname, search: window.location.search }
    if (isExcludedLocation(loc, config.scope)) return
    tracker.dispatcher.ensurePageView(loc.pathname)
    // The mount effect already pinged for the landing page.
    if (firstPath.current) { firstPath.current = false; return }
    pingVisitor(config.slug, visitorSessionId())
  }, [tracker, pathname, config?.scope, config?.slug])

  return <TrackingContext.Provider value={tracker ? tracker.api : null}>{children}</TrackingContext.Provider>
}
