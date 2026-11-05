// Sentry for server rendering (Node runtime). Loaded from instrumentation.js.
import * as Sentry from '@sentry/nextjs'

const rate = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  sendDefaultPii: false,
  enableLogs: true,
  integrations: [Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] })],
  // 1% of server renders (was 5%); the quota ran out on 2026-10-14.
  tracesSampleRate: rate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.01),
})
