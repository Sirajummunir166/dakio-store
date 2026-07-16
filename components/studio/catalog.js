// Phase-1 demo catalog (Shahrqee) + section display names — ported from the design source.
// Phase 2 replaces PRODUCTS/COLDATA with live catalog data sent over the bridge.

export const PRODUCTS = [
  { n: 'Jamdani Wrap Saree', pr: '৳6,800', t: 'Bestseller' },
  { n: 'Muslin Kurti — Ivory', pr: '৳2,400', t: '' },
  { n: 'Silk Kameez Set', pr: '৳4,950', t: 'New' },
  { n: 'Block-print Scarf', pr: '৳1,150', t: '' },
  { n: 'Katan Dupatta', pr: '৳1,800', t: 'New' },
  { n: 'Linen Panjabi', pr: '৳2,900', t: '' },
  { n: 'Brass Jhumka Earrings', pr: '৳950', t: 'Low stock' },
  { n: 'Kantha-stitch Tote', pr: '৳1,350', t: '' },
];

export const COLDATA = [
  { n: 'Sarees', c: '42 pieces' },
  { n: 'Kameez & Kurtis', c: '38 pieces' },
  { n: 'Accessories', c: '24 pieces' },
  { n: 'Menswear', c: '16 pieces' },
];

export const SEC_NAMES = {
  ann: 'Announcement bar', hero: 'Hero', feat: 'Featured products', cols: 'Collection grid',
  story: 'Image + text', promo: 'Promo banner', quotes: 'Testimonials', faq: 'FAQ',
  mail: 'Newsletter', video: 'Video', insta: 'Instagram feed', contact: 'Contact',
  text: 'Rich text', pdp: 'Product detail', footer: 'Footer',
};
