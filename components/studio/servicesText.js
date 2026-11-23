// A service's price and duration in the site's language (services website W1).
// The API's priceText is English; a Bangla site says it in Bangla.

const taka = (n) => '৳' + Number(n).toLocaleString('en-IN');

/** The amount of one price: "৳1,500" · "from ৳800" / "৳800 থেকে" · "৳2,000 to ৳5,000" · "on quote". No dash. */
function amountWords(o, tx) {
  if (!o || o.priceType === 'quote' || o.price == null) return tx('svc.onQuote');
  if (o.priceType === 'from') return tx('svc.from', { price: taka(o.price) });
  if (o.priceType === 'range' && o.priceMax != null) return tx('svc.range', { from: taka(o.price), to: taka(o.priceMax) });
  return taka(o.price);
}

/** One way to pay with its period (services page cut 3): "৳2,990 a month", "৳23,880 a year, paid upfront", with a setup fee. */
export function optionWords(o, tx) {
  const base = amountWords(o, tx);
  const every = (o && o.billEvery) || 'once';
  if (every === 'once') return base;
  const quote = !o || o.priceType === 'quote' || o.price == null;
  let main = every === 'month'
    ? (quote ? tx('svc.quoteMonthly', { price: base }) : o.commitmentMonths ? tx('svc.monthFor', { price: base, n: o.commitmentMonths }) : tx('svc.month', { price: base }))
    : (quote ? tx('svc.quoteYearly', { price: base }) : tx('svc.year', { price: base }));
  if (o.setupFee) main += ' · ' + tx('svc.setup', { price: taka(o.setupFee) });
  return main;
}

/** A service's ways to pay (the API's `options`), or its own one price. */
export function optionsOf(s) {
  const list = s && Array.isArray(s.options) ? s.options : [];
  return list.length ? list : [s];
}

/** Every way to pay, joined with "or": "৳2,990 a month or ৳23,880 a year, paid upfront". */
export function priceWords(s, tx) {
  return optionsOf(s).map((o) => optionWords(o, tx)).join(tx('svc.or'));
}

/** What the client gets (services page cut 3): "12 × posts a month". */
export function includeWords(x, tx) {
  if (!x || !x.what) return '';
  return [x.qty ? x.qty + ' ×' : null, x.what, x.per ? tx('svc.per.' + x.per) : null].filter(Boolean).join(' ');
}

/** "1 h 30 min" / "১ ঘণ্টা ৩০ মিনিট" (digits stay as written elsewhere on the site), or null. */
export function durationWords(min, tx) {
  if (!min) return null;
  if (min >= 1440 && min % 1440 === 0) return tx('svc.days', { n: min / 1440 });
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? tx('svc.hours', { n: h }) : null, m ? tx('svc.mins', { n: m }) : null].filter(Boolean).join(' ');
}

/** Services grouped by category in their order: [{ name|null, items }]. One group when there are no categories. */
export function groupServices(list) {
  const out = [];
  for (const s of list) {
    const k = s.category || null;
    let g = out.find((x) => x.name === k);
    if (!g) { g = { name: k, items: [] }; out.push(g); }
    g.items.push(s);
  }
  return out;
}

/**
 * The services a section shows (Store Studio's "Which services" control):
 *   from 'all'   — every service, in the store's order (the default)
 *   from 'cat'   — one category (`cat`, its name)
 *   from 'picks' — hand-picked ids (`picks`), in the picked order; a service
 *                  that was hidden or deleted since simply drops out
 * `max` (1–24) cuts the list; 0 or nothing shows them all. A section whose
 * choice matches nothing shows nothing, never "all" by surprise.
 */
export function pickServices(all, p) {
  const list = Array.isArray(all) ? all : [];
  const from = p && p.from;
  let out = list;
  if (from === 'cat') {
    const cat = String((p && p.cat) || '').trim().toLowerCase();
    out = cat ? list.filter((s) => String(s.category || '').trim().toLowerCase() === cat) : list;
  } else if (from === 'picks') {
    const ids = Array.isArray(p && p.picks) ? p.picks : [];
    out = ids.map((id) => list.find((s) => s.id === id || s.slug === id)).filter(Boolean);
  }
  const max = Number(p && p.max);
  return Number.isInteger(max) && max > 0 ? out.slice(0, Math.min(max, 24)) : out;
}

/** The service an item or a section is tied to (by id or website address), or null. */
export function serviceOf(all, ref) {
  if (!ref || ref === 'any') return null;
  return (Array.isArray(all) ? all : []).find((s) => s.id === ref || s.slug === ref) || null;
}
