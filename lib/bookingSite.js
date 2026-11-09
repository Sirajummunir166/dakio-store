// The booking page without a website (DAKIO_BOOKING_LINK_PLAN.md, cut 1).
//
// /book and the client's own /b/<code> page render inside the business's
// published Store Studio site. A service business that has not made a site
// yet still takes bookings: this builds a stand-in site document with only
// what the booking needs: the business's name (and logo), a calm palette,
// its phone for the header's WhatsApp and call buttons, and the language
// asked for (?lang=en|bn; Bangla first otherwise). Nothing is saved; the
// owner's real site, when it exists, always wins.

const LANGS = ['bn', 'en']

/** The page's language: ?lang= when it is one we have, else Bangla. */
export function bookingLang(sp) {
  const l = typeof sp?.lang === 'string' ? sp.lang.toLowerCase() : ''
  return LANGS.includes(l) ? l : 'bn'
}

/** A stand-in site document for a business with no published site. */
export function bookingOnlyDoc(store, { lang = 'bn' } = {}) {
  const name = (store?.business?.name || store?.name || 'Booking').toString().slice(0, 80)
  const logo = typeof store?.logoUrl === 'string' && /^https:\/\//.test(store.logoUrl) ? store.logoUrl : null
  const phone = typeof store?.phone === 'string' ? store.phone : null
  return {
    theme: { lang, brandName: name, brandMode: logo ? 'image' : 'text', p: 'sage', f: 'clean', c: 'soft' },
    assets: logo ? { 'st-brand-logo': logo } : {},
    // A hidden Contact section only carries the phone the header's WhatsApp and call buttons read.
    pages: [{ id: 'home', slug: '/', title: name, sections: phone ? [{ id: 'bk-contact', type: 'contact', hidden: true, props: { phone } }] : [] }],
    menus: { header: [], bar: { mode: 'service', wa: true, call: !!phone } },
    sys: {},
    seo: {},
  }
}

/** Is `?embed=1` asked: the page shown inside another site (book.js). */
export const isEmbed = (sp) => sp?.embed === '1' || sp?.embed === 'true'

/**
 * The document a booking page renders: the business's site when it has one,
 * else the stand-in when it takes bookings (or, for a client's own booking
 * page, always: the booking exists). null: there is nothing to show.
 */
export function bookingDocOf(siteData, store, { lang, always = false } = {}) {
  if (siteData?.site) return { doc: siteData.site, standalone: false }
  if (always || store?.business?.booking?.on) return { doc: bookingOnlyDoc(store, { lang }), standalone: true }
  return null
}

/** What a booking page passes on to the next one (the client's booking page): the widget's embed and the language asked for. */
export function carryQuery(sp) {
  const q = new URLSearchParams()
  if (isEmbed(sp)) q.set('embed', '1')
  if (typeof sp?.lang === 'string' && LANGS.includes(sp.lang.toLowerCase())) q.set('lang', sp.lang.toLowerCase())
  const s = q.toString()
  return s ? `?${s}` : ''
}
