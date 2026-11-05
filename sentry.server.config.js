// Sentry for server rendering (Node runtime). Loaded from instrumentation.js.
import * as Sentry from '@sentry/nextjs'

const rate = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback
}

// Local development used most of the shared monthly error quota: locally,
// errors and error logs stay out of Sentry unless *_SENTRY_DEV_ERRORS=true.
const DROP_LOCAL_ERRORS = process.env.NODE_ENV === 'development' && (process.env.SENTRY_DEV_ERRORS || process.env.NEXT_PUBLIC_SENTRY_DEV_ERRORS) !== 'true'

Sentry.init({
  beforeSend: (event) => (DROP_LOCAL_ERRORS ? null : event),
  beforeSendLog: (log) => (DROP_LOCAL_ERRORS && (log.level === 'error' || log.level === 'warn') ? null : log),
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  sendDefaultPii: false,
  enableLogs: true,
  integrations: [Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] })],
  // 1% of server renders (was 5%); the quota ran out on 2026-10-14.
  tracesSampleRate: rate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.01),
})
