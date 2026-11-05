// Sentry in the shopper's browser. Next loads this file before the app hydrates.
import * as Sentry from '@sentry/nextjs'

const apiOrigin = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api').origin } catch { return null }
})()
const rate = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback
}

// Which merchant's store this is: the custom domain, or the /[slug] on dakio.io.
const PLATFORM_HOSTS = ['vercel.app', 'dakio.io', 'localhost']
const storeTag = (() => {
  if (typeof window === 'undefined') return undefined
  const host = window.location.hostname
  if (!PLATFORM_HOSTS.some(h => host === h || host.endsWith('.' + h))) return host
  return window.location.pathname.split('/')[1] || undefined
})()

// Local development used most of the shared monthly error quota: locally,
// errors and error logs stay out of Sentry unless *_SENTRY_DEV_ERRORS=true.
const DROP_LOCAL_ERRORS = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SENTRY_DEV_ERRORS !== 'true'

Sentry.init({
  beforeSend: (event) => (DROP_LOCAL_ERRORS ? null : event),
  beforeSendLog: (log) => (DROP_LOCAL_ERRORS && (log.level === 'error' || log.level === 'warn') ? null : log),
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  sendDefaultPii: false,
  enableLogs: true,
  initialScope: { tags: { store: storeTag } },
  integrations: [
    // Replays only around an error; checkout fields (phone, address) stay masked.
    Sentry.replayIntegration({ maskAllText: true, maskAllInputs: true, blockAllMedia: false }),
    Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
  ],
  // Shopper traffic is far larger than merchant traffic — trace less of it.
  tracesSampleRate: rate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.01),
  // Not our code: browser extensions and in-app browser bridges inject scripts
  // into the shopper's page (848 "M_ID" errors in 5 minutes from one extension
  // on 2026-10-09). Old tabs after a deploy fail to load chunks; not a bug.
  denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari(-web)?-extension:/, /\/executors\//],
  ignoreErrors: [
    'Java object is gone',
    "Cannot read properties of undefined (reading 'M_ID')",
    'ChunkLoadError',
    'Loading chunk',
    'Failed to fetch dynamically imported module',
  ],
  // Checkout / coupon calls continue their trace in dakio-api. That API must
  // allow the sentry-trace + baggage headers on public store routes first.
  tracePropagationTargets: apiOrigin ? [apiOrigin, /^\//] : [/^\//],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
