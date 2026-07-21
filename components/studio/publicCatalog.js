// Map public store API shapes → the studio catalog contract the section
// components render (see components/studio/catalog.js). Mirrors
// dakio-api/src/lib/studioCatalog.js so the published page shows exactly what
// the canvas showed. Public products are always PUBLISHED, so arch is false.

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
  };
}

// Image delivery honoring the store's speed switches: Cloudinary sources get
// f_auto/q_auto + a width cap when "compress" is on; other hosts pass through.
export function optImg(url, seo) {
  if (!url || typeof url !== 'string') return url;
  if ((seo?.compress ?? true) && url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/f_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
  }
  return url;
}

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
      desc: p.description || '',
      // Variants-lite: size list from attributes [{k:'sizes', v:'S, M, L'}]
      sizes: (() => {
        const attrs = Array.isArray(p.attributes) ? p.attributes : [];
        const a = attrs.find((x) => x && x.k === 'sizes');
        return a && typeof a.v === 'string' ? a.v : '';
      })(),
    })),
    collections: categories.map((c) => ({ id: c.id, n: c.name, slug: c.slug })),
  };
}
