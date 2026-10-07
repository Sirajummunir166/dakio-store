// Consent state for the tracking core. Granted by default — consent is not
// required for Bangladeshi traffic (owner decision 2026-10-07) — but every
// adapter asks before it sends, so a banner can be added later without
// touching event code. Keys follow Google Consent Mode v2.

export const CONSENT_DEFAULTS = Object.freeze({
  ad_storage: 'granted',
  analytics_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
})

export function createConsent(initial = {}) {
  let state = { ...CONSENT_DEFAULTS, ...pick(initial) }
  const listeners = new Set()
  return {
    get: () => ({ ...state }),
    allows: (key) => state[key] === 'granted',
    update(patch = {}) {
      state = { ...state, ...pick(patch) }
      for (const fn of listeners) { try { fn({ ...state }) } catch { /* a listener never breaks consent */ } }
      return { ...state }
    },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  }
}

function pick(obj) {
  const out = {}
  for (const k of Object.keys(CONSENT_DEFAULTS)) {
    if (obj && (obj[k] === 'granted' || obj[k] === 'denied')) out[k] = obj[k]
  }
  return out
}
