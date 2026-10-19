// A service's price and duration in the site's language (services website W1).
// The API's priceText is English; a Bangla site says it in Bangla.

const taka = (n) => '৳' + Number(n).toLocaleString('en-IN');

/** "৳1,500" · "from ৳800" / "৳800 থেকে" · "৳2,000–৳5,000" · "on quote" / "আলোচনা সাপেক্ষে". */
export function priceWords(s, tx) {
  if (!s || s.priceType === 'quote' || s.price == null) return tx('svc.onQuote');
  if (s.priceType === 'from') return tx('svc.from', { price: taka(s.price) });
  if (s.priceType === 'range' && s.priceMax != null) return taka(s.price) + '–' + taka(s.priceMax);
  return taka(s.price);
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
