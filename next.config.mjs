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

export default nextConfig;
