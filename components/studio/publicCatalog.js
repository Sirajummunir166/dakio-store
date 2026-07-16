// Map public store API shapes → the studio catalog shape the section components
// render ({ n, pr, t, img }). Mirrors dakio-merchant/src/store-studio/data/adapter.js
// (fetchCatalog) so the published page shows exactly what the canvas showed.
// `slug` is carried along (sections ignore it) so links can resolve to product pages.

const fmtPrice = (v) => '৳' + Number(v || 0).toLocaleString('en-IN');

export function toStudioCatalog(products = [], categories = []) {
  return {
    products: products.map((p) => ({
      n: p.name,
      pr: fmtPrice(p.sellingPrice),
      t: '',
      img: (Array.isArray(p.images) && p.images[0]) || p.imageUrl || null,
      slug: p.slug,
    })),
    collections: categories.map((c) => ({ n: c.name, c: '', id: c.id })),
  };
}
