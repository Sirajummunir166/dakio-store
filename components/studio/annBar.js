// The site-wide announcement bar (doc.ann, 2026-11-10).
//
// One bar for the whole website, set once in Store Studio, drawn above the
// header. Its section props carry two extra choices:
//   where: 'all' (every page, the default) or 'home' (the home page only);
//   until: an ISO time after which the bar stops showing on its own.
// Checkout never shows it, so its link cannot pull a buyer out of an order,
// and funnels and the booking embed have no chrome at all.
//
// Sites published before this kept the bar as the first section of Home. Those
// still render in place (a normal section) until the merchant opens Studio,
// which lifts it into doc.ann, and publishes again.

export const ANN_WHERE = ['all', 'home'];

/** True once the bar's end time has passed. `now` null = not known yet (first render). */
export function annEnded(ann, now) {
  const until = ann && ann.props && ann.props.until;
  if (!until || now == null) return false;
  const t = Date.parse(until);
  return Number.isFinite(t) && t <= now;
}

/**
 * The bar this page shows, or null. Hidden bars come back too (the canvas
 * draws them as a "hidden" strip; the public renderer skips them).
 * home: this is the home page; checkout: this is the checkout page.
 */
export function annFor(doc, { home = false, checkout = false, now = null } = {}) {
  const ann = doc && doc.ann;
  if (!ann || typeof ann !== 'object' || ann.type !== 'ann' || !ann.props || checkout) return null;
  if (ann.props.where === 'home' && !home) return null;
  if (annEnded(ann, now)) return null;
  return ann;
}
