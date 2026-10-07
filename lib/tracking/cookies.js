// First-party ad cookies the pixels set (_fbp, _fbc, _ga, _ttp).
//
// Dakio's own hosts are shared between merchants: every *.dakio.shop store
// gets its pixel cookies on .dakio.shop, and path stores on store.dakio.io
// share one origin. There a `_fbc` may come from another merchant's ad click,
// so it is used only when its fbclid is the one WE captured for this store;
// otherwise the server builds fbc from our own captured fbclid.

export const FBP_RE = /^fb\.\d\.\d+\.[A-Za-z0-9_.-]+$/

export function readCookie(name, cookieStr = '') {
  for (const part of String(cookieStr || '').split(';')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    if (part.slice(0, i).trim() === name) {
      try { return decodeURIComponent(part.slice(i + 1).trim()) } catch { return part.slice(i + 1).trim() }
    }
  }
  return null
}

export function isSharedHost(hostname = '') {
  const h = String(hostname).toLowerCase()
  return h === 'dakio.shop' || h.endsWith('.dakio.shop')
    || h === 'dakio.io' || h.endsWith('.dakio.io')
    || h.endsWith('.vercel.app') || h === 'localhost' || h === '127.0.0.1'
}

// fb.<subdomainIndex>.<creationMs>.<fbclid> — the fbclid itself may contain dots.
export function fbclidOfFbc(fbc) {
  const m = /^fb\.\d\.\d+\.(.+)$/.exec(String(fbc || ''))
  return m ? m[1] : null
}

/**
 * @param {object} o
 * @param {string} o.cookie      document.cookie
 * @param {string} o.hostname    location.hostname
 * @param {string|null} o.fbclid this store's captured fbclid (attribution), if any
 */
export function readAdIds({ cookie = '', hostname = '', fbclid = null } = {}) {
  const ids = {}
  const fbp = readCookie('_fbp', cookie)
  if (fbp && FBP_RE.test(fbp) && fbp.length <= 512) ids.fbp = fbp
  const fbc = readCookie('_fbc', cookie)
  if (fbc && FBP_RE.test(fbc) && fbc.length <= 512) {
    if (!isSharedHost(hostname) || (fbclid && fbclidOfFbc(fbc) === fbclid)) ids.fbc = fbc
  }
  const ga = readCookie('_ga', cookie)
  if (ga && ga.length <= 200) ids.ga = ga
  const ttp = readCookie('_ttp', cookie)
  if (ttp && ttp.length <= 200) ids.ttp = ttp
  return ids
}
