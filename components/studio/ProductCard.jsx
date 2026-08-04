'use client';
// Shared catalog product card — the shop grid, the collection grid, the
// product template's "you may also like" strip, and the Featured Products
// CMS section all render through this one component so a card looks and
// behaves identically everywhere it appears.
//
// Ported from the old Fashion theme's "curated" card (components/themes/
// fashion/components/ProductCard.jsx, curated=true) — same round quick-add
// pill bottom-right of the image that reveals on card hover and expands to
// show its label on its own hover — restyled with theme tokens instead of
// fashion.css. A product with more than one size opens a small size-picker
// popover on click instead of blindly adding the first one.
import { useEffect, useState } from 'react';
import ImageSlot from './ImageSlot';
import { sx } from './theme';
import { fmtPr, prodTag } from './catalog';

// pr: a catalog product, OR a hand-picked slot that decayed — { gone: true }
// (its target product was deleted/hidden) or { empty: true } (nothing picked
// yet). row: true renders as a fixed-width flex item for horizontal-scroll
// layouts (Featured Products' "row" variant) instead of a grid cell.
export default function ProductCard({ pr, ctx, c, showPrice = true, onClick, row = false }) {
  const { P, F, C, mob } = ctx;
  const cardStyle = (row ? 'flex:0 0 ' + (mob ? '62%' : '250px') + '; ' : '') + 'min-width:0;';
  const [sizeOpen, setSizeOpen] = useState(false);

  // Close the size popover on any click outside it. The opening click itself
  // never reaches this — it's stopped from bubbling before this listener runs.
  useEffect(() => {
    if (!sizeOpen) return undefined;
    const h = () => setSizeOpen(false);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [sizeOpen]);

  if (pr.gone || pr.empty) {
    return (
      <div style={sx(cardStyle)}>
        <div style={sx('aspect-ratio:3/4; border-radius:' + C.rs + 'px; position:relative; border:1.5px dashed ' + c.line + '; box-sizing:border-box; opacity:0.7;')} />
        <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 13 : 14) + 'px; font-weight:600; margin-top:11px; opacity:0.55;')}>{pr.empty ? 'No products picked yet' : 'Product unavailable'}</div>
      </div>
    );
  }

  const t = prodTag(pr);
  const go = ctx.preview && onClick ? (e) => { e.stopPropagation(); onClick(pr); } : undefined;
  const buyable = pr.stock > 0 && !pr.arch;
  const sizes = String(pr.sizes || '').split(',').map((s) => s.trim()).filter(Boolean);
  const hasVariants = sizes.length > 1;

  const pickSize = (z) => { setSizeOpen(false); ctx.addToBag(pr, 1, z); };
  const quickAdd = ctx.preview && buyable && ctx.addToBag
    ? (e) => {
        e.preventDefault(); e.stopPropagation();
        if (hasVariants) { setSizeOpen((v) => !v); return; }
        ctx.addToBag(pr, 1, sizes[0] || null);
      }
    : undefined;

  // c.card is a plain #hex for every bg choice except 'ink' (a color-mix()
  // CSS function there) — only append an alpha suffix when it's safe to.
  const quickAddBg = /^#/.test(c.card) ? c.card + 'e0' : c.card;

  return (
    <div className="dk-pcard" onClick={go} style={sx(cardStyle + 'cursor:pointer;')}>
      <style>{`
        .dk-pcard__media { transition: box-shadow .28s ease; }
        .dk-pcard__media img { transition: transform .5s ease; }
        .dk-pcard:hover .dk-pcard__media img { transform: scale(1.04); }
        .dk-pcard__quickadd {
          position: absolute; right: 10px; bottom: 10px; z-index: 3;
          display: inline-flex; align-items: center; width: 34px; height: 34px;
          border-radius: 999px; overflow: hidden; cursor: pointer;
          opacity: 0; pointer-events: none;
          transition: opacity .2s ease, width .26s cubic-bezier(.16,1,.3,1), box-shadow .3s ease;
        }
        .dk-pcard:hover .dk-pcard__quickadd { opacity: 1; pointer-events: auto; }
        .dk-pcard__quickadd.is-open,
        .dk-pcard__quickadd:hover, .dk-pcard__quickadd:focus-visible { width: 118px; box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
        .dk-pcard__quickadd-icon { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; line-height: 0; }
        .dk-pcard__quickadd-label { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0; white-space: nowrap; transition: opacity .18s ease; }
        .dk-pcard__quickadd.is-open .dk-pcard__quickadd-label,
        .dk-pcard__quickadd:hover .dk-pcard__quickadd-label, .dk-pcard__quickadd:focus-visible .dk-pcard__quickadd-label { opacity: 1; }
        @media (hover: none) {
          .dk-pcard__quickadd { width: 118px; opacity: 1; pointer-events: auto; }
          .dk-pcard__quickadd-label { opacity: 1; }
        }
      `}</style>
      <div className="dk-pcard__media" style={sx('aspect-ratio:3/4; border-radius:' + C.rs + 'px; overflow:hidden; position:relative; background:' + c.card + ';' + (ctx.shCard || '') + (pr.stock === 0 ? ' opacity:0.75;' : ''))}>
        <ImageSlot slotId={'st-prod-' + pr.id} assets={{ ...(ctx.assets || {}), ['st-prod-' + pr.id]: (ctx.assets || {})['st-prod-' + pr.id] || pr.img }} fit="cover" placeholder="Product photo" preview={ctx.preview} aspect="3/4" hint="Portrait, ~900×1200px (3:4). Also shown at 4:5 on the product page — keep the product centered with margin." />
        {t && (
          <div style={sx('position:absolute; top:10px; left:10px; z-index:2; padding:4px 9px; border-radius:' + Math.min(C.rs, 8) + 'px; background:' + (pr.stock === 0 ? '#4a4a44' : P.accent) + '; color:' + (pr.stock === 0 ? '#f4f4ef' : P.accentInk) + '; font-family:' + F.b + '; font-size:9.5px; font-weight:800; letter-spacing:0.6px; text-transform:uppercase; pointer-events:none;')}>{t}</div>
        )}
        {quickAdd && (
          <button
            type="button"
            className={'dk-pcard__quickadd' + (sizeOpen ? ' is-open' : '')}
            onClick={quickAdd}
            aria-label={hasVariants ? 'Choose a size for ' + pr.n : 'Add ' + pr.n + ' to cart'}
            style={sx('border:1px solid ' + c.line + '; background:' + quickAddBg + '; backdrop-filter:blur(10px) saturate(1.25); -webkit-backdrop-filter:blur(10px) saturate(1.25); color:' + c.fg + '; box-shadow:0 2px 12px rgba(0,0,0,0.12);')}
          >
            <span className="dk-pcard__quickadd-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l1 14H5L6 7zM9 10V6a3 3 0 016 0v4M15 15h4m-2-2v4" /></svg>
            </span>
            <span className="dk-pcard__quickadd-label" style={sx('font-family:' + F.b + '; font-size:11.5px; font-weight:700;')}>{hasVariants ? 'Select size' : 'Add to bag'}</span>
          </button>
        )}
        {sizeOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={sx('position:absolute; z-index:5; right:10px; bottom:54px; min-width:150px; padding:10px; border-radius:' + Math.min(C.rs, 14) + 'px; background:' + c.card + '; border:1px solid ' + c.line + '; box-shadow:0 14px 34px rgba(15,16,10,0.22);')}
          >
            <div style={sx('font-family:' + F.b + '; font-size:10px; font-weight:800; letter-spacing:1px; color:' + c.sub + '; margin-bottom:8px;')}>SELECT SIZE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sizes.map((z) => (
                <div
                  key={z}
                  onClick={(e) => { e.stopPropagation(); pickSize(z); }}
                  style={sx('min-width:32px; padding:7px 6px; text-align:center; border-radius:' + Math.min(C.rs, 10) + 'px; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:12px; font-weight:700; cursor:pointer;')}
                >
                  {z}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 13 : 14) + 'px; font-weight:600; margin-top:11px;')}>{pr.n}</div>
      {showPrice && (
        <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 12.5 : 13) + 'px; color:' + c.sub + '; margin-top:3px; font-variant-numeric:tabular-nums;')}>
          {fmtPr(pr.pr)}{pr.was ? <span style={{ textDecoration: 'line-through', opacity: 0.6, marginLeft: 8 }}>{fmtPr(pr.was)}</span> : null}
        </div>
      )}
    </div>
  );
}
