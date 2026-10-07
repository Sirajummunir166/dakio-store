// The tracking config a storefront layout hands the page, and the one inline
// bootstrap script that reads it. The ids are validated here, on the server,
// before they are ever written into the page (they used to be pasted into an
// inline script unchecked — a stored-XSS path on the shared store origin), and
// the bootstrap re-checks the GTM id before using it. The script itself is a
// constant: no value is ever interpolated into executable code.

export const PIXEL_RE = /^\d{10,20}$/
export const GTM_RE = /^GTM-[A-Z0-9]{4,12}$/
const CURRENCY_RE = /^[A-Z]{3}$/

/**
 * @param {object} store  the public store object (dakio-api /store/:slug)
 * @param {'path'|'domain'} scope  'path' = store.dakio.io/<slug>/…, 'domain' = the host is the store
 */
export function buildTrackingConfig(store, scope = 'domain') {
  if (!store || !store.slug) return null
  const pixel = String(store.metaPixelId || '').trim()
  const gtm = String(store.gtmContainerId || '').trim()
  const cur = String(store.currency || '').trim().toUpperCase()
  return {
    slug: String(store.slug),
    storeId: store.id ? String(store.id) : null,
    name: store.name ? String(store.name).slice(0, 120) : null,
    currency: CURRENCY_RE.test(cur) ? cur : 'BDT',
    metaPixelId: PIXEL_RE.test(pixel) ? pixel : null,
    gtmId: GTM_RE.test(gtm) ? gtm : null,
    scope: scope === 'path' ? 'path' : 'domain',
  }
}

/** JSON for a <script type="application/json">, with '<' escaped so it can't close the tag. */
export function configJson(config) {
  return JSON.stringify(config || {}).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

export const CONFIG_ELEMENT_ID = 'dk-tc'

// Runs while the HTML is parsed, before React: on an excluded page (preview,
// studio-preview, track, a ?token / ?previewToken URL) it marks the page off and
// stops; otherwise it creates the dataLayer, sets consent defaults (granted —
// see consent.js) and loads GTM when the store has a valid container id.
export const BOOTSTRAP_SCRIPT = "(function(){try{var w=window,d=document,el=d.getElementById('dk-tc');if(!el)return;var c=JSON.parse(el.textContent||'{}')||{};var p=w.location.pathname.split('/').filter(Boolean);if(c.scope==='path')p=p.slice(1);var s=p[0]||'';var q=new URLSearchParams(w.location.search);if(s==='preview'||s==='studio-preview'||s==='track'||s==='studio-canvas'||q.has('token')||q.has('previewToken')){w.__dkOff=true;return}w.__dkOff=false;w.dataLayer=w.dataLayer||[];var g=function(){w.dataLayer.push(arguments)};g('consent','default',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});if(typeof c.gtmId==='string'&&/^GTM-[A-Z0-9]{4,12}$/.test(c.gtmId)&&!w.__dkGtm){w.__dkGtm=true;w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var j=d.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(c.gtmId);(d.head||d.documentElement).appendChild(j)}}catch(e){}})();"
