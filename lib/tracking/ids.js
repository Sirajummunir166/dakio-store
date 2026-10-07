// Event ids shared by the browser event and its server twin (Meta dedups on
// the pair). Same shape as @dakio/sdk's newEventId: `${prefix}_${uuid}`. The
// API accepts any id matching EVENT_ID_RE.

export const EVENT_ID_RE = /^[A-Za-z0-9_-]{8,80}$/

export function newEventId(prefix = 'ev') {
  const p = String(prefix || 'ev').replace(/[^A-Za-z0-9]/g, '') || 'ev'
  let r = null
  try {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') r = globalThis.crypto.randomUUID()
  } catch { /* insecure context */ }
  if (!r) r = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  return `${p}_${r}`
}
