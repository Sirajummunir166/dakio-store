// Goes well with (DAKIO_PAIRINGS_PLAN.md cut 2) — the Studio store's add-ons.
//
// A catalog product may carry `pairs: [{ id, together, reason, p }]` — the
// merchant's add-ons for it, each with its own studio product `p` (so an
// add-on outside the loaded catalog still renders and prices). An add-on put
// in the bag from that block is a line with `addOnOf: <main product id>`.
//
// THE PRICE RULE IS THE SERVER'S (dakio-api lib/pairings.js addOnUnitPrice,
// applied in storefrontPricing.priceItems): the together price applies only
// while the main product is in the same bag, the add-on quantity is not more
// than the main's, and it is lower than what the add-on costs anyway.
// Anything else is the add-on's normal price — so the bag never shows a
// number the order will not charge.

/** A product by id: the loaded catalog first, then the add-ons the pairings carried. */
export function catProduct(cat, id) {
  if (!cat || !id) return null;
  return (cat.products || []).find((x) => x.id === id) || (cat.extra || []).find((x) => x.id === id) || null;
}

/** The add-ons of a product that can be bought right now. */
export function livePairs(product) {
  return ((product && product.pairs) || []).filter((a) => a && a.p && !a.p.arch && (a.p.stock == null || a.p.stock > 0));
}

/** The server's rule, for one bag line whose `p.pr` is already its option's price. */
export function addOnUnit(bag, line, cat) {
  const unit = line.p.pr;
  if (!line.addOnOf) return unit;
  const mainQty = bag.reduce((n, l) => (l !== line && !l.addOnOf && l.pid === line.addOnOf ? n + l.qty : n), 0);
  const main = catProduct(cat, line.addOnOf);
  const pair = ((main && main.pairs) || []).find((a) => a.id === line.pid);
  if (!pair || pair.together == null || mainQty <= 0 || line.qty > mainQty) return unit;
  return pair.together < unit ? pair.together : unit;
}

/** Re-price a resolved bag's add-on lines (lines are `{ pid, qty, size, addOnOf, p }`). */
export function priceAddOns(bag, cat) {
  return bag.map((l) => {
    if (!l.addOnOf) return l;
    const unit = addOnUnit(bag, l, cat);
    return unit === l.p.pr ? l : { ...l, p: { ...l.p, was: l.p.pr, pr: unit, together: true } };
  });
}

/**
 * One suggestion for the cart: the first main line with an in-stock add-on not
 * already in the bag. `{ main, pair }` or null.
 */
export function bagSuggestion(bag, cat) {
  const inBag = new Set(bag.map((l) => l.pid));
  for (const l of bag) {
    if (l.addOnOf) continue;
    const main = catProduct(cat, l.pid);
    const pair = livePairs(main).find((a) => !inBag.has(a.id));
    if (pair) return { main, pair };
  }
  return null;
}

/** The pairs mapping from the public product list (mirrors dakio-api studioCatalog.studioPairs). */
export function toStudioPairs(list) {
  return (Array.isArray(list) ? list : []).map((a) => {
    const vars = (a.variants || []).filter((v) => v && v.name).map((v) => ({ id: v.id, n: v.name, stock: Number(v.stock) || 0, pr: v.price != null ? Number(v.price) : null }));
    return {
      id: a.id,
      together: a.togetherPrice != null ? Number(a.togetherPrice) : null,
      reason: a.reason || '',
      p: {
        id: a.id, n: a.name, slug: a.slug, img: a.imageUrl || null, pr: Number(a.price), was: null, arch: false,
        stock: vars.length ? vars.reduce((n, v) => n + v.stock, 0) : 99,
        vars, sizes: vars.map((v) => v.n).join(', '), hasVariants: vars.length > 0,
      },
    };
  });
}
