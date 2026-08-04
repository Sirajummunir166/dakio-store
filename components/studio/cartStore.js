'use client';
// Studio cart (Phase 10) — one bag per store in localStorage. Guest-first:
// no accounts, just { pid, qty, size } lines resolved against the live catalog
// at render time (prices are never trusted from storage).

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

export function addToCart(slug, pid, qty = 1, size = null) {
  const items = getCart(slug);
  const hit = items.find((x) => x.pid === pid && (x.size || null) === (size || null));
  if (hit) hit.qty += qty;
  else items.push({ pid, qty, size: size || null });
  save(slug, items);
}

export function setQty(slug, pid, size, qty) {
  let items = getCart(slug);
  items = qty <= 0
    ? items.filter((x) => !(x.pid === pid && (x.size || null) === (size || null)))
    : items.map((x) => (x.pid === pid && (x.size || null) === (size || null) ? { ...x, qty } : x));
  save(slug, items);
}

// Changing a line's size at checkout — moves qty from (pid, oldSize) onto
// (pid, newSize), merging into an existing line for that size if one exists.
export function updateSize(slug, pid, oldSize, newSize) {
  if ((oldSize || null) === (newSize || null)) return;
  const items = getCart(slug);
  const hit = items.find((x) => x.pid === pid && (x.size || null) === (oldSize || null));
  if (!hit) return;
  const existing = items.find((x) => x.pid === pid && (x.size || null) === (newSize || null));
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
