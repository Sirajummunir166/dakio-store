// Store images at the size each spot needs (owner, 2026-11-11: "optimize
// images in the store"). Photos uploaded through Dakio live on Cloudinary,
// which makes any size and format on the fly from the URL, so a product card
// on a phone asks for a ~540px WebP/AVIF instead of the 1600px original.
//
//   f_auto  → AVIF / WebP / JPEG, whatever the shopper's browser takes best
//   q_auto  → the smallest file that still looks right
//   c_limit → never larger than the original (no blurry upscale)
//   w_N     → the width asked for
//
// Pexels and Unsplash photos (stock pictures, the demo stores) are sized the
// same way through their own URL options. Photos on other hosts (an imported
// Shopify catalogue, a supplier's CDN, data: URLs in the builder) pass through
// unchanged. The store's "Compress
// images" switch (Store Studio › Search & Google › speed, seo.compress) turns
// all of this off.

/** Widths offered to the browser in srcset; it picks by screen and `sizes`. */
export const SRC_WIDTHS = [360, 540, 720, 960, 1280, 1600];

export function isCloudinaryImage(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com/') && url.includes('/image/upload/');
}

/** The URL with a delivery transform, unless it already carries one. */
export function cldAt(url, w) {
  if (!isCloudinaryImage(url)) return url;
  const [head, tail] = url.split('/image/upload/');
  if (/^(f_|q_|c_|w_|h_)/.test(tail)) return url; // someone already chose a transform
  return `${head}/image/upload/f_auto,q_auto,c_limit,w_${Math.round(w)}/${tail}`;
}

/* Pexels / Unsplash: their CDNs resize and compress from query options. */
function stockAt(url, w) {
  let u;
  try { u = new URL(url); } catch { return url; }
  if (u.hostname === 'images.pexels.com') {
    u.searchParams.set('auto', 'compress');
    u.searchParams.set('cs', 'tinysrgb');
    u.searchParams.delete('h');
    u.searchParams.delete('dpr');
    u.searchParams.set('w', String(Math.round(w)));
    return u.toString();
  }
  if (u.hostname === 'images.unsplash.com') {
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'max');
    if (!u.searchParams.has('q')) u.searchParams.set('q', '75');
    u.searchParams.delete('h');
    u.searchParams.set('w', String(Math.round(w)));
    return u.toString();
  }
  return url;
}
const isStock = (url) => typeof url === 'string' && /^https:\/\/images\.(pexels|unsplash)\.com\//.test(url);

/** Any photo we can size: Cloudinary, Pexels or Unsplash. */
export function sizedAt(url, w) {
  if (isCloudinaryImage(url)) return cldAt(url, w);
  if (isStock(url)) return stockAt(url, w);
  return url;
}

const compressOn = (seo) => (seo?.compress ?? true) !== false;

/** One optimized URL (src). */
export function optImg(url, seo, w = 1200) {
  if (!url || typeof url !== 'string' || !compressOn(seo)) return url;
  return sizedAt(url, w);
}

/** A srcset of every SRC_WIDTHS size, or undefined when the photo can't be sized. */
export function optSrcSet(url, seo, widths = SRC_WIDTHS) {
  if (!compressOn(seo) || !url || typeof url !== 'string') return undefined;
  if (sizedAt(url, 1) === url) return undefined; // another host, or carries its own transform
  return widths.map((w) => `${sizedAt(url, w)} ${w}w`).join(', ');
}
