// Map public store API shapes → the studio catalog contract the section
// components render (see components/studio/catalog.js). Mirrors
// dakio-api/src/lib/studioCatalog.js so the published page shows exactly what
// the canvas showed. Public products are always PUBLISHED, so arch is false.

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

export function toStudioCatalog(products = [], categories = []) {
  const ranked = products.filter((p) => p.rank != null).length;
  let unrankedNext = ranked;
  return {
    products: products.map((p) => ({
      id: p.id,
      n: p.name,
      pr: Number(p.sellingPrice),
      was: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
      col: p.category?.id || null,
      stock: Number.isFinite(p.totalStock) ? p.totalStock : 99,
      rank: p.rank != null ? p.rank : ++unrankedNext,
      isNew: !!p.isNew,
      arch: false,
      img: (Array.isArray(p.images) && p.images[0]) || p.imageUrl || null,
      slug: p.slug,
    })),
    collections: categories.map((c) => ({ id: c.id, n: c.name, slug: c.slug })),
  };
}
