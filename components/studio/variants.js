// Studio sizes ↔ real ProductVariant rows.
//
// The catalog keeps a product's variants as `vars: [{ id, n, stock, pr }]`
// (publicCatalog.js). A size the shopper picks is a variant NAME; these helpers
// turn it into that variant's stock, price and id. Sizes that come from product
// attributes (no variant rows) have no variant: always pickable, product price,
// and no variantId — the order sells the product itself.

const norm = (s) => String(s ?? '').trim().toLowerCase();

export function variantFor(p, size) {
  if (!size || !Array.isArray(p?.vars) || p.vars.length === 0) return null;
  return p.vars.find((v) => norm(v.n) === norm(size)) || null;
}

export function sizeInStock(p, size) {
  const v = variantFor(p, size);
  return v ? v.stock > 0 : true;
}

// The size to preselect: the first one that can actually be bought.
export function firstInStockSize(p, sizes) {
  return sizes.find((z) => sizeInStock(p, z)) || null;
}

// A variant can carry its own price; the order is charged that price.
export function priceFor(p, size) {
  const v = variantFor(p, size);
  return v && v.pr != null ? v.pr : p.pr;
}

// What checkout sends as variantId — the real id, or null for no variant.
export function orderVariantId(p, size) {
  return variantFor(p, size)?.id || null;
}

// Appended to a size chip's style when that size is sold out.
export const soldOutSize = ' opacity:0.4; text-decoration:line-through; cursor:not-allowed;';
