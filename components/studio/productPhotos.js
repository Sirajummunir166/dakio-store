// A product's own photos for the Studio product page gallery.
//
// The catalog carries them as `imgs` (publicCatalog.js on the live site,
// dakio-api src/lib/studioCatalog.js in the builder) and `img` is the first.
// When a product has more than one, its photos ARE the gallery; the template's
// shared alt-view slots (st-pdpt-*) are only the fallback for a one-photo
// product. Salt, 2026-11-09: products with several photos showed one photo and
// empty thumbnail frames because only the first photo reached the page.

export const MAX_PHOTOS = 8;

// Product.images as the API sends it (a JSON string, or already an array of
// URLs or { url } objects), in order, without repeats. Product.imageUrl is the
// fallback when there are none, as dakio-api firstImage() reads it.
export function parsePhotoList(images, imageUrl) {
  let list = images;
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = []; }
  }
  const out = [];
  for (const it of Array.isArray(list) ? list : []) {
    const u = typeof it === 'string' ? it : it && typeof it.url === 'string' ? it.url : null;
    if (u && u.trim() && !out.includes(u)) out.push(u);
  }
  if (!out.length && typeof imageUrl === 'string' && imageUrl.trim()) out.push(imageUrl);
  return out;
}

// The gallery for one catalog product: `img` first, then the rest of `imgs`.
export function productPhotos(bp) {
  if (!bp) return [];
  const out = [];
  for (const u of [bp.img, ...(Array.isArray(bp.imgs) ? bp.imgs : [])]) {
    if (typeof u === 'string' && u && !out.includes(u)) out.push(u);
  }
  return out.slice(0, MAX_PHOTOS);
}

// Slot id for photo i. Photo 0 keeps the renderer's main slot (st-prod-<id> on
// the product page, st-pdp-<id> in the Product detail section), so a main photo
// swapped or cropped in Studio stays as it was; the others get their own slot
// so each can be cropped.
export function photoSlotId(mainSlot, pid, i) {
  return i === 0 ? mainSlot : 'st-pimg-' + pid + '-' + i;
}
