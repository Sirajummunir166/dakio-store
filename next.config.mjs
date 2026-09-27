import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev server only trusts localhost/127.0.0.1 by default (CSRF hardening,
  // Next 15.3+) — a request Host of anything else gets its HMR websocket
  // upgrade rejected (visible as a repeating "ERR_INVALID_HTTP_RESPONSE" in
  // the browser console), which leaves the page rendered but un-hydrated —
  // every click silently does nothing. Add any custom hostname used for
  // local dev here. Production is unaffected (no dev server, no HMR).
  allowedDevOrigins: ['dakio.local'],
};

// Source maps upload to Sentry at build time when SENTRY_AUTH_TOKEN is set
// (Vercel env), and are not served to browsers.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
});
