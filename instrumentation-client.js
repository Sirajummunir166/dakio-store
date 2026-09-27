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

Sentry.init({
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
  tracesSampleRate: rate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.05),
  // Checkout / coupon calls continue their trace in dakio-api. That API must
  // allow the sentry-trace + baggage headers on public store routes first.
  tracePropagationTargets: apiOrigin ? [apiOrigin, /^\//] : [/^\//],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
