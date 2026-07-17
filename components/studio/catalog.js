// Studio catalog contract + demo fallback (Shahrqee) — ported from the design
// source (Phase 5 snapshot). Live catalog data replaces DEMO_CATALOG over the
// bridge (editor) or via publicCatalog.js (published pages).
//
// Shape (keep in sync with dakio-api/src/lib/studioCatalog.js and
// dakio-merchant/src/store-studio/constants.js):
//   products:    { id, n, pr, was, col, stock, rank, isNew, arch, img?, slug? }
//   collections: { id, n, slug? }

export const DEMO_CATALOG = {
  products: [
    { id: 'pr1', n: 'Jamdani Wrap Saree', pr: 6800, was: 8200, col: 'sarees', stock: 12, rank: 1, isNew: false },
    { id: 'pr2', n: 'Muslin Kurti — Ivory', pr: 2400, was: null, col: 'kameez', stock: 24, rank: 4, isNew: false },
    { id: 'pr3', n: 'Silk Kameez Set', pr: 4950, was: null, col: 'kameez', stock: 8, rank: 6, isNew: true },
    { id: 'pr4', n: 'Block-print Scarf', pr: 1150, was: null, col: 'acc', stock: 30, rank: 3, isNew: false },
    { id: 'pr5', n: 'Katan Dupatta', pr: 1800, was: null, col: 'acc', stock: 14, rank: 7, isNew: true },
    { id: 'pr6', n: 'Linen Panjabi', pr: 2900, was: null, col: 'mens', stock: 10, rank: 5, isNew: false },
    { id: 'pr7', n: 'Brass Jhumka Earrings', pr: 950, was: null, col: 'acc', stock: 3, rank: 2, isNew: false },
    { id: 'pr8', n: 'Kantha-stitch Tote', pr: 1350, was: null, col: 'acc', stock: 0, rank: 8, isNew: false },
    { id: 'pr9', n: 'Half-silk Saree — Teal', pr: 5400, was: 6200, col: 'sarees', stock: 6, rank: 9, isNew: true },
    { id: 'pr10', n: 'Muslin Panjabi — White', pr: 3200, was: null, col: 'mens', stock: 18, rank: 10, isNew: false },
  ],
  collections: [
    { id: 'sarees', n: 'Sarees' },
    { id: 'kameez', n: 'Kameez & Kurtis' },
    { id: 'acc', n: 'Accessories' },
    { id: 'mens', n: 'Menswear' },
  ],
};

export const fmtPr = (n) => '৳' + Number(n || 0).toLocaleString('en-IN');

// Honest badge for a product card, in priority order (design contract)
export function prodTag(p) {
  if (p.stock === 0) return 'Sold out';
  if (p.was) return 'Sale';
  if (p.isNew) return 'New';
  if (p.rank === 1) return 'Bestseller';
  if (p.stock <= 3) return 'Low stock';
  return '';
}

export const colOf = (cat, id) => cat.collections.find((c) => c.id === id);
export const colCount = (cat, id) => cat.products.filter((p) => p.col === id && !p.arch).length;
export const liveProds = (cat) => cat.products.filter((p) => !p.arch);

// Resolve a feat section's product list from the live catalog.
// Hand-picked entries keep their slot: a deleted/hidden pick renders as a
// { gone: true } placeholder in the editor (the public page filters them out).
export function pickFeat(sec, cat) {
  const p = sec.props;
  if ((p.src || 'rule') === 'manual') {
    return (p.picks || []).map((id) => {
      const x = cat.products.find((q) => q.id === id);
      return !x || x.arch ? { gone: true } : x;
    });
  }
  let list = liveProds(cat);
  const r = p.rule || 'best';
  if (r === 'best') list = list.slice().sort((a, b) => a.rank - b.rank);
  else if (r === 'new') list = list.slice().sort((a, b) => ((b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)) || (a.rank - b.rank));
  else if (r === 'sale') list = list.filter((x) => x.was);
  else if (r === 'col') list = list.filter((x) => x.col === (p.col || (cat.collections[0] && cat.collections[0].id)));
  return list.slice(0, Math.max(2, Math.min(8, p.count || 4)));
}

export const SEC_NAMES = {
  ann: 'Announcement bar', hero: 'Hero', feat: 'Featured products', cols: 'Collection grid',
  story: 'Image + text', promo: 'Promo banner', quotes: 'Testimonials', faq: 'FAQ',
  mail: 'Newsletter', video: 'Video', insta: 'Instagram feed', contact: 'Contact',
  text: 'Rich text', pdp: 'Product detail', footer: 'Footer',
};
