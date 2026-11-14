// Dakio hosts a design once and many stores use it (DAKIO_SERVICE_KINDS_PLAN.md
// section 7.3). A store that tapped "Use this template" has its address served
// by that design's host deployment: this app only looks the address up and
// forwards the request, so the visitor sees the store's own address.
const API = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'
const TTL_MS = 30_000
const cache = new Map() // host -> { at, origin|null }

/** The host deployment's origin for an address, or null when it is not a hosted store. */
export async function hostedOrigin(host) {
  const hit = cache.get(host)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.origin
  let origin = hit?.origin ?? null // keep the last answer if the API is briefly down
  try {
    const r = await fetch(`${API}/public/hosting/site?host=${encodeURIComponent(host)}`, { signal: AbortSignal.timeout(2500) })
    if (r.ok) origin = (await r.json()).origin ?? null
    else if (r.status === 404) origin = null
  } catch { /* keep the last answer */ }
  if (cache.size > 2000) cache.clear()
  cache.set(host, { at: Date.now(), origin })
  return origin
}

/** Dakio's own addresses never need the lookup. `*.localhost` does when HOSTED_LOCAL=1 (tests). */
export function mayBeHosted(host, skip) {
  if (process.env.HOSTED_LOCAL === '1' && host.endsWith('.localhost')) return true
  return !skip
}
