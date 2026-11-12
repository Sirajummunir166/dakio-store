// Map public store API shapes → the studio catalog contract the section
// components render (see components/studio/catalog.js). Mirrors
// dakio-api/src/lib/studioCatalog.js so the published page shows exactly what
// the canvas showed. Public products are always PUBLISHED, so arch is false.

import { toStudioPairs } from './addOns.js';
import { parsePhotoList, MAX_PHOTOS } from './productPhotos.js';

// SEO hierarchy for published studio pages: a page's own title/desc wins,
// otherwise the store default (doc.seo) fills in. Favicon + social image are
// store-wide uploads; a page can override just its own social image.
export function studioMetadata(site, page) {
  const seo = site.seo || {};
  const assets = site.assets || {};
  const brand = site.theme?.brandName || 'Store';
  const title = (page?.seo?.title || '').trim() || (seo.title || '').trim() || brand;
  const description = (page?.seo?.desc || '').trim() || (seo.desc || '').trim() || undefined;
  const favicon = assets['st-seo-favicon'];
  const og = (page && assets['st-og-' + page.id]) || assets['st-seo-og'];
  return {
    title,
    description,
    ...(favicon ? { icons: { icon: favicon, shortcut: favicon } } : {}),
    openGraph: { title, description, ...(og ? { images: [og] } : {}) },
    // Search & Google (Store Studio): the merchant's "hide from search engines"
    // switch, and their Search Console HTML-tag token.
    ...(seo.noindex ? { robots: { index: false, follow: true } } : {}),
    ...(typeof seo.gsc === 'string' && seo.gsc ? { verification: { google: seo.gsc } } : {}),
  };
}

// Image delivery honoring the store's speed switches: imageDelivery.js
// (f_auto/q_auto/c_limit + a width for Cloudinary photos; other hosts pass
// through). `w` caps the width (gallery thumbnails ask for less).
export { optImg } from './imageDelivery.js';

// Synthetic page for /collections/{slug} — a live product grid bound to one
// collection by id, rendered through the same PublicSite pipeline as real pages.
export function collectionPage(col, catalog) {
  const cnt = catalog.products.filter((p) => p.col === col.id).length;
  return {
    id: '__col',
    name: col.n,
    slug: `/collections/${col.slug}`,
    seo: { title: col.n, desc: `Shop ${col.n} — ${cnt} ${cnt === 1 ? 'piece' : 'pieces'}, delivered across Bangladesh.` },
    sections: [{
      id: '__colgrid', type: 'feat', v: 'grid',
      props: { head: col.n, count: 8, src: 'rule', rule: 'col', col: col.id, prices: true, bg: 'base', sp: 'roomy' },
    }],
  };
}

// `list`: a route that lists the whole catalogue (home, shop, collection,
// custom page, draft preview) ships it to the browser; the product page's own
// text (description, short description, tabs) stays out — /p/<slug> has it.
export function toStudioCatalog(products = [], categories = [], { list = false } = {}) {
  const ranked = products.filter((p) => p.rank != null).length;
  let unrankedNext = ranked;
  const mapped = products.map((p) => {
    // Product.images arrives as the raw DB value, a JSON string, so it is
    // parsed (productPhotos.js); the first photo matches the builder's.
    const photos = parsePhotoList(p.images, p.imageUrl);
    return {
      id: p.id,
      n: p.name,
      sku: p.sku || '',
      pr: Number(p.sellingPrice),
      was: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
      col: p.category?.id || null,
      stock: Number.isFinite(p.totalStock) ? p.totalStock : 99,
      rank: p.rank != null ? p.rank : ++unrankedNext,
      isNew: !!p.isNew,
      arch: false,
      img: photos[0] || null,
      slug: p.slug,
      ...(list ? null : {
        // Every photo, for the product page gallery. Lists only need the first.
        imgs: photos.slice(0, MAX_PHOTOS),
        desc: p.description || '',
        shortDesc: p.shortDescription || '',
        // Product-page tabs (specs / size guide / shipping / custom), rich HTML
        // from the merchant's product editor — see productTabs.js.
        tabs: Array.isArray(p.contentTabs) ? p.contentTabs : [],
      }),
      // Real variant rows, so a picked size maps to its stock, price and id
      // (components/studio/variants.js) instead of living only in a note.
      vars: Array.isArray(p.variants)
        ? p.variants.filter((v) => v && v.name).map((v) => ({
            id: v.id,
            n: v.name,
            stock: Number(v.stock) || 0,
            pr: v.price != null ? Number(v.price) : null,
          }))
        : [],
      // Size list — prefer real ProductVariant rows (bulk/dropship-imported
      // products: each variant's name IS the size, e.g. "L"/"M"/"S") over the
      // manual variants-lite attributes hack, since real merchant catalogs
      // are populated that way, not by typing a comma-string into Studio's
      // Catalog tab. Falls back to attributes in either convention Dakio's
      // product-attribute data actually uses:
      //   Studio-authored:      [{k:'sizes', v:'S, M, L'}]
      //   bulk/dropship import: [{name:'Size', values:['S','M','L']}]
      // The API passes Product.attributes through as its raw DB value — a
      // JSON *string*, not a parsed array — so it must be parsed here too
      // (mirrors dakio-api/src/lib/studioCatalog.js's productSizes()).
      sizes: (() => {
        if (Array.isArray(p.variants) && p.variants.length > 0) {
          return p.variants.map((v) => v.name).filter(Boolean).join(', ');
        }
        let attrs = p.attributes;
        if (typeof attrs === 'string') { try { attrs = JSON.parse(attrs); } catch { attrs = []; } }
        if (!Array.isArray(attrs)) attrs = [];
        const kv = attrs.find((x) => x && x.k === 'sizes');
        if (kv && typeof kv.v === 'string') return kv.v;
        const named = attrs.find((x) => x && typeof x.name === 'string' && x.name.toLowerCase() === 'size');
        if (named && Array.isArray(named.values)) return named.values.join(', ');
        return '';
      })(),
      // Goes well with: the merchant's add-ons, each carrying its own product
      // so it renders and prices even outside this page of the catalog.
      pairs: toStudioPairs(p.pairings),
    };
  });
  // Add-ons not among the listed products, so the bag can still resolve them
  // (useBag looks here after `products`) without showing them in any grid.
  const listed = new Set(mapped.map((p) => p.id));
  const extra = [];
  for (const p of mapped) {
    for (const a of p.pairs) {
      if (!listed.has(a.id)) { listed.add(a.id); extra.push(a.p); }
    }
  }
  return {
    products: mapped,
    extra,
    collections: categories.map((c) => ({ id: c.id, n: c.name, slug: c.slug })),
  };
}
