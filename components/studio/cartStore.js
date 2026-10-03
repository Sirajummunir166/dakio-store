'use client';
// Studio cart (Phase 10) — one bag per store in localStorage. Guest-first:
// no accounts, just { pid, qty, size, addOnOf? } lines resolved against the
// live catalog at render time (prices are never trusted from storage).
// `addOnOf` marks a line added from a product's "Goes well with" block — it is
// its own line, never merged with the same product bought on its own.

const key = (slug) => 'studio-cart:' + slug;
const EVT = 'studio-cart-change';

export function getCart(slug) {
  try {
    const raw = localStorage.getItem(key(slug));
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items.filter((x) => x && x.pid && x.qty > 0) : [];
  } catch { return []; }
}

function save(slug, items) {
  try { localStorage.setItem(key(slug), JSON.stringify(items)); } catch { /* private mode */ }
  try { window.dispatchEvent(new CustomEvent(EVT, { detail: { slug } })); } catch { /* SSR */ }
}

const same = (x, pid, size, addOnOf) => x.pid === pid && (x.size || null) === (size || null) && (x.addOnOf || null) === (addOnOf || null);

export function addToCart(slug, pid, qty = 1, size = null, addOnOf = null) {
  const items = getCart(slug);
  const hit = items.find((x) => same(x, pid, size, addOnOf));
  if (hit) hit.qty += qty;
  else items.push({ pid, qty, size: size || null, ...(addOnOf ? { addOnOf } : {}) });
  save(slug, items);
}

export function setQty(slug, pid, size, qty, addOnOf = null) {
  let items = getCart(slug);
  items = qty <= 0
    ? items.filter((x) => !same(x, pid, size, addOnOf))
    : items.map((x) => (same(x, pid, size, addOnOf) ? { ...x, qty } : x));
  save(slug, items);
}

// Changing a line's size at checkout — moves qty from (pid, oldSize) onto
// (pid, newSize), merging into an existing line for that size if one exists.
export function updateSize(slug, pid, oldSize, newSize, addOnOf = null) {
  if ((oldSize || null) === (newSize || null)) return;
  const items = getCart(slug);
  const hit = items.find((x) => same(x, pid, oldSize, addOnOf));
  if (!hit) return;
  const existing = items.find((x) => same(x, pid, newSize, addOnOf));
  if (existing) {
    existing.qty += hit.qty;
    items.splice(items.indexOf(hit), 1);
  } else {
    hit.size = newSize || null;
  }
  save(slug, items);
}

export function clearCart(slug) { save(slug, []); }

export function cartCount(slug) { return getCart(slug).reduce((n, x) => n + x.qty, 0); }

export function onCartChange(fn) {
  const h = () => fn();
  window.addEventListener(EVT, h);
  window.addEventListener('storage', h);
  return () => { window.removeEventListener(EVT, h); window.removeEventListener('storage', h); };
}
