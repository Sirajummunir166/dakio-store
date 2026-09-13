// Which tabs a product page shows, and what each one holds.
//
//   product tabs  — Product.contentTabs [{ key, title?, html }]; key is
//                   'specs' | 'guide' | 'ship' or 'c_<id>' (the merchant's own)
//   template tabs — doc.sys.prod.tabs [{ k, title?, html? }], the store-wide
//                   defaults set in Store Studio for the three standard tabs
//
// Order: Description, the standard tabs, then the product's custom tabs.
// Title: product override → template title → default name.
// Content: product → template default → nothing. On the public page a tab with
// nothing to show is dropped; in the builder it stays with a hint.
import { isEmptyHtml } from '../../lib/theme/sanitizeHtml.js';

export const STANDARD_TABS = [
  { key: 'specs', name: 'Specifications', legacy: 'tabSpecs' },
  { key: 'guide', name: 'Size Guide', legacy: 'tabGuide' },
  { key: 'ship', name: 'Shipping & Returns', legacy: 'tabShip' },
];

// The template's own starter copy for the legacy plain-text tab fields. It was
// never written by the merchant, so it does not count as a store default.
export const LEGACY_PLACEHOLDERS = new Set([
  'Add specifications in the Catalog tab — material, origin, weight, or anything else worth listing.',
  'Add sizing notes here — how this fits, and tips for choosing between sizes.',
  '2–4 days inside Dhaka, 4–7 days nationwide. Cash on delivery everywhere. Easy 7-day exchange if it doesn’t fit — just reach out.',
]);

const has = (html) => !isEmptyHtml(html);

export function resolveProductTabs(bp, pp, { builder = false } = {}) {
  const productTabs = Array.isArray(bp?.tabs) ? bp.tabs.filter((t) => t && t.key) : [];
  const templateTabs = Array.isArray(pp?.tabs) ? pp.tabs.filter((t) => t && t.k) : [];
  const out = [];

  const desc = bp?.desc || '';
  if (has(desc) || builder) out.push({ key: 'desc', title: 'Description', html: has(desc) ? desc : '', source: has(desc) ? 'product' : 'none' });

  for (const def of STANDARD_TABS) {
    const pt = productTabs.find((t) => t.key === def.key);
    const tt = templateTabs.find((t) => t.k === def.key);
    const title = (pt?.title || '').trim() || (tt?.title || '').trim() || def.name;
    let html = '';
    let source = 'none';
    if (pt && has(pt.html)) { html = pt.html; source = 'product'; }
    else if (tt && has(tt.html)) { html = tt.html; source = 'template'; }
    else {
      const legacy = pp?.[def.legacy];
      if (typeof legacy === 'string' && legacy.trim() && !LEGACY_PLACEHOLDERS.has(legacy.trim())) { html = legacy; source = 'template'; }
    }
    if (html || builder) out.push({ key: def.key, title, html, source });
  }

  for (const pt of productTabs) {
    if (!String(pt.key).startsWith('c_') || !has(pt.html)) continue;
    out.push({ key: pt.key, title: (pt.title || '').trim() || 'More', html: pt.html, source: 'product' });
  }
  return out;
}
