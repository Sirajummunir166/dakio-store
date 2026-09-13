'use client';
// Store system pages (Phase 8) — /shop, the collection template and the product
// template. Data-bound to the live catalog and template-driven: the merchant
// edits the template once (doc.sys), every collection & product follows.
// Rendered by the studio canvas (edit + preview) and the public storefront.
import { useEffect, useMemo, useRef, useState } from 'react';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import ProductCard from '../ProductCard';
import { co, btnColors, sx, SPM } from '../theme';
import { fmtPr, colCount, liveProds, shortDesc } from '../catalog';
import { getCart, onCartChange } from '../cartStore';
import { FREE_DLV_OVER } from './CommercePages';
import { sizeInStock, firstInStockSize, priceFor, soldOutSize } from '../variants';
import RichContent, { RichContentStyles } from '../RichContent';
import { resolveProductTabs } from '../productTabs';

export const SYS_DEFAULTS = {
  shop: { head: 'Shop all', cols: 4, hd: { v: 'left', bg: 'base', count: true }, gr: { bg: 'base', sp: 'normal', fCol: true, fPr: true, fSz: true, fStock: true, sort: true } },
  col: { v: 'left', sub: 'Woven slow, delivered fast — every piece from the live catalog.', bg: 'base', sp: 'normal', cols: 3, gr: { bg: 'base', sp: 'normal', filters: false } },
  prod: {
    btn: 'Add to bag', note: 'Free delivery over ' + fmtPr(FREE_DLV_OVER) + ' · Cash on delivery', alsoOn: true, alsoHead: 'You may also like',
    pd: { v: 'left', bg: 'base', stock: true, sizes: true, note: true },
    tabSpecs: 'Add specifications in the Catalog tab — material, origin, weight, or anything else worth listing.',
    tabGuide: 'Add sizing notes here — how this fits, and tips for choosing between sizes.',
    tabShip: '2–4 days inside Dhaka, 4–7 days nationwide. Cash on delivery everywhere. Easy 7-day exchange if it doesn’t fit — just reach out.',
    also: { src: 'rule', rule: 'best', count: 4, picks: [], prices: true, bg: 'base' },
  },
};

// spY() — the same density-scaled vertical padding every normal section uses
// (theme.js baseStyles), applied here so template sections' SPACING control
// (Cozy/Normal/Roomy) has a real, consistent effect.
function spY(spKey, ctx) {
  return Math.round((SPM[spKey] || SPM.normal)[ctx.mob ? 'm' : 'd'] * (ctx.denM || 1));
}

export const sysProps = (sys, k) => ({ ...SYS_DEFAULTS[k], ...((sys || {})[k] || {}) });

// The tab list is resolved per product — see ../productTabs.js.

export const sizeList = (p) => String(p?.sizes || '').split(',').map((x) => x.trim()).filter(Boolean);

const PRICE_BUCKETS = [
  { k: 'u1', n: 'Under ৳1,000', lo: 0, hi: 1000 },
  { k: 'u3', n: '৳1,000 – 3,000', lo: 1000, hi: 3000 },
  { k: 'u6', n: '৳3,000 – 6,000', lo: 3000, hi: 6000 },
  { k: 'o6', n: 'Over ৳6,000', lo: 6000, hi: Infinity },
];
const SORTS = [
  { k: 'feat', n: 'Featured' },
  { k: 'plo', n: 'Price: low to high' },
  { k: 'phi', n: 'Price: high to low' },
  { k: 'new', n: 'Newest first' },
];

// Template pill + selection wrapper — canvas edit mode only
function Part({ id, label, edit, children, style }) {
  const sel = edit && edit.sel === id;
  return (
    <div
      onClick={edit ? (e) => { e.stopPropagation(); edit.onSel(id); } : undefined}
      style={{
        position: 'relative',
        ...(edit ? { cursor: 'pointer' } : {}),
        ...(sel ? { outline: '3px solid #C6F035', outlineOffset: -3, boxShadow: '0 0 0 1px rgba(26,29,18,0.35) inset', zIndex: 2 } : {}),
        ...(style || {}),
      }}
      className={edit && !sel ? 'st-sec' : undefined}
    >
      {sel && (
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 22, padding: '4px 10px', borderRadius: 99, background: '#1A1D12', color: '#C6F035', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: '0.6px' }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

// Shared filterable product grid — the heart of /shop and the collection template
const GR_SPP = { compact: { d: 44, m: 28 }, normal: { d: 64, m: 40 }, roomy: { d: 94, m: 56 } };

function FilterGrid({ ctx, sys, products, lockedCol, q, edit, partPrefix, label }) {
  const { P, F, C, mob, padX, cat } = ctx;
  const c = co('base', P);
  // Shop and collection grids are template-independent — each reads/writes
  // its own scope (sys.shop.gr vs sys.col.gr) rather than sharing shop's.
  const scope = partPrefix === 'col' ? 'col' : 'shop';
  const sp = sysProps(sys, scope);
  const grDefaults = scope === 'col'
    ? { bg: 'base', sp: 'normal', filters: false }
    : { bg: 'base', sp: 'normal', fCol: true, fPr: true, fSz: true, fStock: true, sort: true };
  const gr = { ...grDefaults, ...(sp.gr || {}) };
  const cG = co(gr.bg || 'base', P);
  const padY = Math.round((GR_SPP[gr.sp] || GR_SPP.normal)[mob ? 'm' : 'd'] * (ctx.denM || 1));
  const [fCol, setFCol] = useState(null);
  const [fPr, setFPr] = useState(null);
  const [fSz, setFSz] = useState(null);
  const [fStock, setFStock] = useState(false);
  const [sort, setSort] = useState('feat');
  const [sortOpen, setSortOpen] = useState(false);
  const interactive = ctx.preview; // preview + public; edit mode selects instead

  const allSizes = useMemo(() => {
    const s = new Set();
    products.forEach((p) => sizeList(p).forEach((z) => s.add(z)));
    return [...s].slice(0, 8);
  }, [products]);

  let list = products.filter((p) => !p.arch);
  if (lockedCol) list = list.filter((p) => p.col === lockedCol);
  if (fCol) list = list.filter((p) => p.col === fCol);
  if (q) list = list.filter((p) => p.n.toLowerCase().includes(String(q).toLowerCase()));
  if (fPr) { const b = PRICE_BUCKETS.find((x) => x.k === fPr); if (b) list = list.filter((p) => p.pr >= b.lo && p.pr < b.hi); }
  if (fSz) list = list.filter((p) => sizeList(p).includes(fSz));
  if (fStock) list = list.filter((p) => p.stock > 0);
  if (sort === 'plo') list = [...list].sort((a, b) => a.pr - b.pr);
  else if (sort === 'phi') list = [...list].sort((a, b) => b.pr - a.pr);
  else if (sort === 'new') list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  else list = [...list].sort((a, b) => (a.rank || 999) - (b.rank || 999));

  const anyFilter = fCol || fPr || fSz || fStock;
  const clearAll = () => { setFCol(null); setFPr(null); setFSz(null); setFStock(false); };

  const fCap = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.2px; color:' + c.sub + ';';
  const fRow = (act) => 'display:flex; align-items:center; gap:8px; padding:7px 4px; font-family:' + F.b + '; font-size:13px; cursor:pointer; color:' + (act ? c.fg : c.sub) + ';' + (act ? ' font-weight:700;' : '');
  const szChip = (act) => 'min-width:38px; padding:8px 0; text-align:center; border-radius:' + Math.min(C.rs, 10) + 'px; border:1.5px solid ' + (act ? c.fg : c.line) + '; font-family:' + F.b + '; font-size:12.5px; font-weight:700; cursor:pointer;' + (act ? ' background:' + c.fg + '; color:' + c.bg + ';' : '');
  const clearSt = 'margin-top:14px; font-family:' + F.b + '; font-size:12.5px; font-weight:700; text-decoration:underline; text-underline-offset:3px; cursor:pointer; color:' + c.fg + ';';
  const gridCols = mob ? 2 : (sp.cols || (scope === 'col' ? 3 : 4));

  // Collection grid bundles price/size/stock behind one "Quick filters"
  // toggle (no per-collection picker — the page is already locked to one).
  const showCol = scope === 'shop' && gr.fCol !== false && !lockedCol;
  const showPr = scope === 'col' ? gr.filters !== false : gr.fPr !== false;
  const showSz = (scope === 'col' ? gr.filters !== false : gr.fSz !== false) && allSizes.length > 0;
  const showStock = scope === 'col' ? gr.filters !== false : gr.fStock !== false;
  const showSort = scope === 'col' ? true : gr.sort !== false;
  const showSidebar = showCol || showPr || showSz || showStock;

  return (
    <Part id={partPrefix + '-grid'} label={label} edit={edit}>
      <div style={sx('padding:' + Math.round(padY * 0.55) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)) ' + padY + 'px; background:' + cG.bg + '; color:' + cG.fg + ';')}>
        {showSort && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                onClick={interactive ? (e) => { e.stopPropagation(); setSortOpen((v) => !v); } : undefined}
                style={sx('display:flex; align-items:center; gap:7px; padding:9px 14px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:12.5px; font-weight:700; cursor:pointer; background:' + c.card + ';')}
              >
                {SORTS.find((s) => s.k === sort).n}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </div>
              {sortOpen && (
                <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 42, zIndex: 30, width: 200, borderRadius: 14, background: c.card, border: '1px solid ' + c.line, boxShadow: '0 18px 50px rgba(20,22,14,0.25)', padding: 6 }}>
                  {SORTS.map((s) => (
                    <div key={s.k} onClick={() => { setSort(s.k); setSortOpen(false); }} style={sx('padding:9px 11px; border-radius:9px; font-family:' + F.b + '; font-size:12.5px; cursor:pointer;' + (sort === s.k ? ' font-weight:800;' : ''))}>{s.n}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div style={{ display: mob ? 'block' : 'grid', gridTemplateColumns: showSidebar ? '190px 1fr' : '1fr', gap: 34 }}>
          {!mob && showSidebar && (
            <div style={{ minWidth: 0 }}>
              {showCol && (
                <>
                  <div style={sx(fCap)}>COLLECTION</div>
                  <div style={{ margin: '8px 0 20px' }}>
                    {cat.collections.map((c2) => (
                      <div key={c2.id} onClick={interactive ? () => setFCol(fCol === c2.id ? null : c2.id) : undefined} style={sx(fRow(fCol === c2.id))}>
                        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c2.n}</span>
                        <span style={{ fontSize: 11, opacity: 0.7 }}>{colCount(cat, c2.id)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {showPr && (
                <>
                  <div style={sx(fCap)}>PRICE</div>
                  <div style={{ margin: '8px 0 20px' }}>
                    {PRICE_BUCKETS.map((b) => (
                      <div key={b.k} onClick={interactive ? () => setFPr(fPr === b.k ? null : b.k) : undefined} style={sx(fRow(fPr === b.k))}>{b.n}</div>
                    ))}
                  </div>
                </>
              )}
              {showSz && (
                <>
                  <div style={sx(fCap)}>SIZE</div>
                  <div style={{ margin: '8px 0 20px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {allSizes.map((z) => (
                      <div key={z} onClick={interactive ? () => setFSz(fSz === z ? null : z) : undefined} style={sx(szChip(fSz === z))}>{z}</div>
                    ))}
                  </div>
                </>
              )}
              {showStock && (
                <div onClick={interactive ? () => setFStock((v) => !v) : undefined} style={sx(fRow(fStock))}>
                  <div style={sx('width:17px; height:17px; border-radius:5px; border:1.5px solid ' + (fStock ? c.fg : c.line) + '; display:flex; align-items:center; justify-content:center;' + (fStock ? ' background:' + c.fg + '; color:' + c.bg + ';' : ''))}>{fStock ? '✓' : ''}</div>
                  In stock only
                </div>
              )}
              {anyFilter && interactive && <div onClick={clearAll} style={sx(clearSt)}>Clear all filters</div>}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            {list.length === 0 && (
              <div style={sx('padding:60px 20px; text-align:center; font-family:' + F.b + '; font-size:14px; color:' + c.sub + ';')}>
                Nothing matches those filters.
                {interactive && <div onClick={clearAll} style={sx(clearSt + ' display:inline-block; margin-left:12px;')}>Clear all filters</div>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + gridCols + ',1fr)', gap: mob ? '18px 14px' : '30px 20px' }}>
              {list.map((pr) => <ProductCard key={pr.id} pr={pr} ctx={ctx} c={c} onClick={ctx.onProduct} />)}
            </div>
          </div>
        </div>
      </div>
    </Part>
  );
}

// ── /shop ────────────────────────────────────────────────────────────────────
export function ShopPage({ ctx, sys, q, edit }) {
  const { P, F, mob, padX, cat } = ctx;
  const c = co('base', P);
  const sp = sysProps(sys, 'shop');
  const hd = { v: 'left', bg: 'base', count: true, ...(sp.hd || {}) };
  const cH = co(hd.bg || 'base', P);
  const live = liveProds(cat);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const centered = hd.v === 'center';

  return (
    <>
      <Part id="shop-head" label="SHOP HEADER — TEMPLATE" edit={edit}>
        <div style={sx('padding:' + (mob ? 30 : 44) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)) ' + (mob ? 18 : 26) + 'px; background:' + cH.bg + '; color:' + cH.fg + ';' + (centered ? ' text-align:center; display:flex; flex-direction:column; align-items:center;' : ''))}>
          <Editable secId="__sys:shop" k="head" value={sp.head} style={headFont + 'font-size:' + (mob ? 30 : 44) + 'px; line-height:1.06;'} preview={ctx.preview} />
          {hd.count !== false && (
            <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + cH.sub + '; margin-top:8px;')}>{live.length} {live.length === 1 ? 'piece' : 'pieces'}</div>
          )}
          {q ? (
            <div style={{ marginTop: 12 }}>
              <div style={sx('display:inline-flex; align-items:center; padding:8px 14px; border-radius:99px; background:' + c.card + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:12.5px; font-weight:700;')}>
                Results for “{q}”
                {ctx.preview && ctx.onClearQ && <span onClick={(e) => { e.stopPropagation(); ctx.onClearQ(); }} style={{ cursor: 'pointer', fontWeight: 800, marginLeft: 9 }}>✕</span>}
              </div>
            </div>
          ) : null}
        </div>
      </Part>
      <FilterGrid ctx={ctx} products={cat.products} q={q} edit={edit} partPrefix="shop" label="GRID & FILTERS — TEMPLATE" cols={sp.cols} bg="base" spKey="normal" />
    </>
  );
}

// ── Collection template (/shop/<collection>) ────────────────────────────────
export function CollectionPage({ ctx, sys, col, edit }) {
  const { P, F, C, mob, padX, cat } = ctx;
  const cp = sysProps(sys, 'col');
  const c = co(cp.bg || 'tint', P);
  const cnt = colCount(cat, col.id);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const crumb = 'font-family:' + F.b + '; font-size:11.5px; font-weight:800; letter-spacing:1.6px; text-transform:uppercase; color:' + c.sub + '; cursor:pointer;';
  const banner = cp.v === 'banner';
  const centered = cp.v === 'center';
  const cHero = co(cp.bg || 'base', P);
  const heroPadY = Math.round((GR_SPP[cp.sp] || GR_SPP.normal)[mob ? 'm' : 'd'] * (ctx.denM || 1));

  return (
    <>
      <Part id="col-hero" label="COLLECTION HERO — TEMPLATE" edit={edit}>
        {!banner ? (
          <div style={sx('padding:' + Math.round(heroPadY * 0.55) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)) ' + heroPadY + 'px; background:' + cHero.bg + '; color:' + cHero.fg + ';' + (centered ? ' text-align:center; display:flex; flex-direction:column; align-items:center;' : ''))}>
            <div onClick={ctx.preview && ctx.onShop ? (e) => { e.stopPropagation(); ctx.onShop(); } : undefined} style={sx(crumb)}>Shop <span style={{ opacity: 0.5 }}>/</span> {col.n}</div>
            <div style={sx(headFont + 'font-size:' + (mob ? 30 : 44) + 'px; line-height:1.06; margin-top:10px;')}>{col.n}</div>
            <Editable secId="__sys:col" k="sub" value={cp.sub} style={'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 15) + 'px; color:' + cHero.sub + '; margin-top:10px; max-width:520px;'} multiline preview={ctx.preview} />
            <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + cHero.sub + '; margin-top:10px;')}>{cnt} {cnt === 1 ? 'piece' : 'pieces'}</div>
          </div>
        ) : (
          <div style={sx('position:relative; height:' + (mob ? 260 : 340) + 'px; overflow:hidden; background:' + c.card + ';')}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ImageSlot slotId={'st-col-' + col.id} assets={ctx.assets || {}} fit="cover" placeholder="Collection banner — shared with your collection tiles" preview={ctx.preview} hint={'Wide landscape, at least 1800px wide, ~' + (mob ? '260' : '340') + 'px tall. Keep the subject centered — very wide or narrow screens crop the sides.'} />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,11,8,0.68), rgba(10,11,8,0.08) 60%)', pointerEvents: 'none' }} />
            <div style={sx('position:absolute; left:' + padX + 'px; right:' + padX + 'px; bottom:' + (mob ? 24 : 34) + 'px; z-index:2;')}>
              <div onClick={ctx.preview && ctx.onShop ? (e) => { e.stopPropagation(); ctx.onShop(); } : undefined} style={sx(crumb + 'color:rgba(255,255,255,0.8);')}>Shop <span style={{ opacity: 0.55 }}>/</span> {col.n}</div>
              <div style={sx(headFont + 'font-size:' + (mob ? 30 : 44) + 'px; line-height:1.06; margin-top:8px; color:#FFFFFF;')}>{col.n}</div>
              <Editable secId="__sys:col" k="sub" value={cp.sub} style={'font-family:' + F.b + '; font-size:' + (mob ? 13 : 14.5) + 'px; color:rgba(255,255,255,0.85); margin-top:8px; max-width:520px;'} multiline preview={ctx.preview} />
              <div style={sx('font-family:' + F.b + '; font-size:12.5px; color:rgba(255,255,255,0.75); margin-top:8px;')}>{cnt} {cnt === 1 ? 'piece' : 'pieces'}</div>
            </div>
          </div>
        )}
      </Part>
      <FilterGrid ctx={ctx} products={cat.products} lockedCol={col.id} edit={edit} partPrefix="col" label="COLLECTION GRID — TEMPLATE" cols={cp.gridCols} bg={cp.gridBg} spKey={cp.gridSp} />
    </>
  );
}

// Resolve the "You may also like" list from the also-config — rule-based
// (relative to the product being viewed) or hand-picked.
function pickAlso(also, bp, cat) {
  if ((also.src || 'rule') === 'manual') {
    return (also.picks || [])
      .map((id) => cat.products.find((q) => q.id === id))
      .filter((x) => x && !x.arch && x.id !== bp.id);
  }
  let list = liveProds(cat).filter((p) => p.id !== bp.id);
  const r = also.rule || 'best';
  if (r === 'best') list = list.slice().sort((a, b) => (a.rank || 999) - (b.rank || 999));
  else if (r === 'new') list = list.slice().sort((a, b) => ((b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)) || ((a.rank || 999) - (b.rank || 999)));
  else if (r === 'sale') list = list.filter((x) => x.was);
  else if (r === 'samecol') list = list.filter((x) => x.col === bp.col);
  return list.slice(0, Math.max(2, Math.min(8, also.count || 4)));
}

// ── Product template (/p/<slug>) ────────────────────────────────────────────
export function ProductPage({ ctx, sys, product, edit }) {
  const { P, F, C, mob, padX, cat } = ctx;
  const c = co('base', P);
  const B = btnColors('base', P);
  const pp = sysProps(sys, 'prod');
  const bp = product || liveProds(cat)[0] || cat.products[0];
  const [activeThumb, setActiveThumb] = useState(null);
  const [qty, setQtyN] = useState(1);
  const [selSize, setSelSize] = useState(null);
  const [stickyOn, setStickyOn] = useState(false);
  const [activeTab, setActiveTab] = useState('desc');
  const [, setBagTick] = useState(0);
  const purchaseRef = useRef(null);
  const sizes = sizeList(bp);
  useEffect(() => { setActiveThumb(null); setQtyN(1); setSelSize(bp ? firstInStockSize(bp, sizeList(bp)) : null); setStickyOn(false); }, [bp && bp.id]);
  // Sticky add-to-cart bar: shows once the size/qty/buy controls scroll out of view.
  useEffect(() => {
    const node = purchaseRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setStickyOn(!entry.isIntersecting), { threshold: 0, rootMargin: '0px 0px -8px 0px' });
    io.observe(node);
    return () => io.disconnect();
  }, [bp && bp.id]);
  // Re-render when the bag changes (e.g. this item added elsewhere) so the
  // buy button / sticky bar can reflect "already in cart".
  useEffect(() => {
    if (!ctx.storeSlug) return undefined;
    return onCartChange(() => setBagTick((t) => t + 1));
  }, [ctx.storeSlug]);
  if (!bp) return null;
  const pd = { v: 'left', bg: 'base', stock: true, sizes: true, note: true, thumbs: true, thumbPos: 'bottom', ...(pp.pd || {}) };
  const cPd = co(pd.bg || 'base', P);
  const rightGallery = pd.v === 'right';
  const also = { src: 'rule', rule: 'best', count: 4, picks: [], prices: true, bg: 'base', ...(pp.also || {}) };
  const cAlso = co(also.bg || 'base', P);
  // Never preselect (or keep) a sold-out size — it would fail at checkout.
  const curSize = (selSize && sizeInStock(bp, selSize) ? selSize : null) || firstInStockSize(bp, sizes);
  const cartLine = ctx.storeSlug ? getCart(ctx.storeSlug).find((x) => x.pid === bp.id && (x.size || null) === (curSize || null)) : null;
  const col2 = cat.collections.find((x) => x.id === bp.col);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const alsoList = pickAlso(also, bp, cat);
  // Tabs under the description — product content, store defaults, custom tabs.
  // Public page: only tabs with something to show. Builder: all, with hints.
  const tabs = resolveProductTabs(bp, pp, { builder: !ctx.preview });
  const shownTab = tabs.some((t) => t.key === activeTab) ? activeTab : (tabs[0] && tabs[0].key);
  const shown = tabs.find((t) => t.key === shownTab);
  const lbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + cPd.sub + '; margin-top:24px;';
  const buyable = bp.stock > 0 && !bp.arch && (sizes.length === 0 || !!curSize);
  const doBuy = () => {
    if (cartLine) { ctx.onCart ? ctx.onCart() : null; return; }
    if (ctx.addToBag) ctx.addToBag(bp, qty, curSize);
    else if (ctx.onCart) ctx.onCart();
  };

  const mainSlotId = 'st-prod-' + bp.id;
  const thumbSlotIds = [0, 1, 2].map((i) => 'st-pdpt-' + i);
  const shownSlotId = activeThumb !== null ? thumbSlotIds[activeThumb] : mainSlotId;
  const shownAssets = activeThumb !== null
    ? (ctx.assets || {})
    : { ...(ctx.assets || {}), [mainSlotId]: (ctx.assets || {})[mainSlotId] || bp.img };

  const thumbsLeft = pd.thumbPos === 'left' && !mob;

  // Preview/public: only show alt-view tiles that actually have a photo — an
  // empty "upload here" placeholder isn't something a customer can act on.
  const thumbIs = [0, 1, 2].filter((i) => !ctx.preview || !!(ctx.assets || {})['st-pdpt-' + i]);
  const thumbsEl = pd.thumbs !== false && thumbIs.length > 0 && (
    <div style={{ display: 'flex', flexDirection: thumbsLeft ? 'column' : 'row', gap: 8, ...(thumbsLeft ? { width: 76, flexShrink: 0 } : { marginTop: 10 }) }}>
      {thumbIs.map((i) => (
        <div
          key={i}
          onClick={ctx.preview ? (e) => { e.stopPropagation(); setActiveThumb(i); } : undefined}
          style={sx((thumbsLeft ? '' : 'flex:1; ') + 'aspect-ratio:1/1; border-radius:' + Math.min(C.rs, 10) + 'px; overflow:hidden; position:relative; background:' + cPd.card + ';' + (ctx.preview ? ' cursor:pointer;' : '') + (activeThumb === i ? ' outline:2px solid ' + cPd.fg + '; outline-offset:-2px;' : ''))}
        >
          <ImageSlot slotId={'st-pdpt-' + i} assets={ctx.assets || {}} fit="cover" placeholder="Alt view" preview={ctx.preview} aspect="1/1" hint="Square, ~800×800px." />
        </div>
      ))}
    </div>
  );

  const mainEl = (
    <div style={sx('aspect-ratio:4/5; border-radius:' + C.r + 'px; overflow:hidden; position:relative; background:' + cPd.card + ';' + (ctx.shCard || '') + (thumbsLeft ? ' flex:1; min-width:0;' : ''))}>
      <ImageSlot slotId={shownSlotId} assets={shownAssets} fit="cover" placeholder={activeThumb !== null ? 'Alt view' : 'Main product photo'} preview={ctx.preview} aspect={activeThumb !== null ? '1/1' : '4/5'} hint={activeThumb !== null ? 'Square, ~800×800px alt view.' : 'Portrait, ~1200×1500px (4:5). Also shown at 3:4 in your Shop grid — keep the product centered with margin.'} />
    </div>
  );

  const galleryBlock = (
    <div key="gallery" style={{ minWidth: 0 }}>
      {thumbsLeft ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {thumbsEl}
          {mainEl}
        </div>
      ) : (
        <>
          {mainEl}
          {thumbsEl}
        </>
      )}
    </div>
  );

  const detailsBlock = (
    <div key="details" style={{ minWidth: 0 }}>
      <RichContentStyles />
      <Editable secId={'__cat:' + bp.id} k="n" value={bp.n} style={headFont + 'font-size:' + (mob ? 30 : 40) + 'px; line-height:1.08; min-width:0; overflow-wrap:break-word;'} preview={ctx.preview} />
      {bp.sku && (
        <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:' + cPd.sub + '; margin-top:6px;')}>SKU {bp.sku}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12 }}>
        <Editable secId={'__cat:' + bp.id} k="pr" value={fmtPr(ctx.isPublic ? priceFor(bp, curSize) : bp.pr)} style={'font-family:' + F.b + '; font-size:' + (mob ? 20 : 23) + 'px; font-weight:800; font-variant-numeric:tabular-nums;'} preview={ctx.preview} tag="span" />
        {bp.was ? <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; color:' + cPd.sub + '; text-decoration:line-through; font-variant-numeric:tabular-nums;')}>{fmtPr(bp.was)}</div> : null}
      </div>
      {pd.stock !== false && (bp.arch || bp.stock <= 3) && (
        <div style={sx('margin-top:12px; font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + ((bp.arch || bp.stock === 0) ? '#B03A2E' : '#B07A2A') + ';')}>
          {bp.arch ? 'Hidden from your store — unhide it in Catalog' : bp.stock === 0 ? 'Sold out — restock in Catalog to sell' : 'Only ' + bp.stock + ' left in stock'}
        </div>
      )}
      {/* Teaser beside the price: the rich short description, else the first
          words of the description. The hint shows only in the builder. */}
      {bp.shortDesc || shortDesc(bp.desc)
        ? <div style={sx('font-size:' + (mob ? 13.5 : 14.5) + 'px; margin-top:16px;')}>
            <RichContent html={bp.shortDesc || shortDesc(bp.desc)} ctx={ctx} c={cPd} compact />
          </div>
        : !ctx.preview && <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 14.5) + 'px; line-height:1.7; color:' + cPd.sub + '; margin-top:16px; opacity:0.6;')}>Add a description in the product editor — fabric, fit, care.</div>}
      {pd.sizes !== false && sizes.length > 0 && (
        <>
          <div style={sx(lbl)}>SIZE</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {sizes.map((z) => (
              <div key={z} title={sizeInStock(bp, z) ? undefined : 'Sold out'} onClick={ctx.preview && sizeInStock(bp, z) ? (e) => { e.stopPropagation(); setSelSize(z); } : undefined} style={sx('min-width:44px; padding:10px 0; text-align:center; border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (z === curSize ? cPd.fg : cPd.line) + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer;' + (z === curSize ? ' background:' + cPd.fg + '; color:' + cPd.bg + ';' : '') + (sizeInStock(bp, z) ? '' : soldOutSize))}>{z}</div>
            ))}
          </div>
        </>
      )}
      <div ref={purchaseRef} style={{ display: 'flex', gap: 10, marginTop: 24, alignItems: 'stretch' }}>
        <div style={sx('display:flex; align-items:center; gap:14px; padding:0 16px; border-radius:' + C.btn + '; border:1.5px solid ' + cPd.line + '; font-family:' + F.b + '; font-size:14px; user-select:none;')}>
          <span onClick={ctx.preview ? (e) => { e.stopPropagation(); setQtyN((n) => Math.max(1, n - 1)); } : undefined} style={{ cursor: 'pointer' }}>−</span>
          <span style={{ fontWeight: 800 }}>{qty}</span>
          <span onClick={ctx.preview ? (e) => { e.stopPropagation(); setQtyN((n) => n + 1); } : undefined} style={{ cursor: 'pointer' }}>+</span>
        </div>
        <div
          onClick={ctx.preview && buyable ? (ev) => { ev.stopPropagation(); doBuy(); } : ctx.preview && ctx.onCart && bp.stock > 0 ? (ev) => { ev.stopPropagation(); ctx.onCart(); } : undefined}
          style={sx('flex:1; display:flex; align-items:center; justify-content:center; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:14.5px; cursor:pointer; white-space:nowrap;' + ((bp.stock === 0 || bp.arch) ? ' opacity:0.45;' : ''))}
        >
          {cartLine
            ? <span>View cart{cartLine.qty > 1 ? ' (' + cartLine.qty + ')' : ''}</span>
            : <Editable secId="__sys:prod" k="btn" value={pp.btn} style={''} preview={ctx.preview} tag="span" />}
        </div>
      </div>
      {pd.note !== false && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: 14 }}>
          <div style={sx('display:flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12.5px; color:' + cPd.sub + ';')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5" /></svg>
            <Editable secId="__sys:prod" k="note" value={pp.note} style={''} preview={ctx.preview} tag="span" />
          </div>
          <div style={sx('display:flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12.5px; color:' + cPd.sub + ';')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5" /></svg>
            7-day easy returns
          </div>
          <div style={sx('display:flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12.5px; color:' + cPd.sub + ';')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5" /></svg>
            bKash · Nagad · COD
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Part id="prod-main" label="PRODUCT DETAIL — TEMPLATE" edit={edit}>
        <div style={sx('padding:' + (mob ? 26 : 44) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)) ' + (mob ? 40 : 64) + 'px; background:' + cPd.bg + '; color:' + cPd.fg + ';')}>
          <div style={sx('font-family:' + F.b + '; font-size:12px; color:' + cPd.sub + '; margin-bottom:' + (mob ? 16 : 24) + 'px; display:flex; gap:7px; flex-wrap:wrap;')}>
            <span onClick={ctx.preview && ctx.onShop ? (e) => { e.stopPropagation(); ctx.onShop(); } : undefined} style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>Shop</span>
            <span style={{ opacity: 0.5 }}>/</span>
            {col2 && (
              <>
                <span onClick={ctx.preview && ctx.onCollection ? (e) => { e.stopPropagation(); ctx.onCollection(col2); } : undefined} style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>{col2.n}</span>
                <span style={{ opacity: 0.5 }}>/</span>
              </>
            )}
            <span>{bp.n}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : (rightGallery ? '0.98fr 1.02fr' : '1.02fr 0.98fr'), gap: mob ? 26 : 64, alignItems: 'start' }}>
            {!mob && rightGallery ? [detailsBlock, galleryBlock] : [galleryBlock, detailsBlock]}
          </div>
          {tabs.length > 0 && (
          <div style={sx('margin-top:' + (mob ? 34 : 50) + 'px; border-top:1px solid ' + cPd.line + ';')}>
            <div style={{ display: 'flex', gap: mob ? 14 : 28, flexWrap: 'wrap', marginTop: mob ? 18 : 24 }}>
              {tabs.map((t) => (
                <div
                  key={t.key}
                  onClick={(e) => { e.stopPropagation(); setActiveTab(t.key); }}
                  style={sx('padding-bottom:10px; font-family:' + F.b + '; font-size:' + (mob ? 12.5 : 13.5) + 'px; font-weight:700; cursor:pointer; white-space:nowrap;' + (shownTab === t.key ? ' color:' + cPd.fg + '; border-bottom:2px solid ' + cPd.fg + ';' : ' color:' + cPd.sub + '; border-bottom:2px solid transparent;') + (t.source === 'none' ? ' opacity:0.5;' : ''))}
                >
                  {t.title}
                </div>
              ))}
            </div>
            <div style={sx('max-width:760px; margin-top:' + (mob ? 18 : 24) + 'px; padding-bottom:' + (mob ? 30 : 44) + 'px; font-size:' + (mob ? 13 : 13.5) + 'px;')}>
              {shown && shown.source !== 'none'
                ? <RichContent html={shown.html} ctx={ctx} c={cPd} />
                : shown && (
                  <div style={sx('font-family:' + F.b + '; line-height:1.75; color:' + cPd.sub + '; opacity:0.6;')}>
                    {shown.key === 'desc'
                      ? 'Empty on this product — write the description in the product editor.'
                      : 'Empty on this product — add it in the product editor, or set a store default in this template (Product detail → Product tabs).'}
                  </div>
                )}
            </div>
          </div>
          )}
        </div>
      </Part>
      {!pp.alsoOn && edit && (
        <div
          onClick={(e) => { e.stopPropagation(); edit.onSysProp && edit.onSysProp('prod', 'alsoOn', true); }}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, borderTop: '1.5px dashed rgba(128,128,128,0.3)', borderBottom: '1.5px dashed rgba(128,128,128,0.3)', opacity: 0.55, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'Hanken Grotesk',sans-serif" }}
        >
          You may also like is hidden — click to show
        </div>
      )}
      {pp.alsoOn && alsoList.length > 0 && (
        <Part id="prod-also" label="YOU MAY ALSO LIKE — TEMPLATE" edit={edit}>
          <div style={sx('padding:' + (mob ? 36 : 56) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)); background:' + cAlso.bg + '; color:' + cAlso.fg + '; border-top:1px solid ' + cAlso.line + ';')}>
            <Editable secId="__sys:prod" k="alsoHead" value={pp.alsoHead} style={headFont + 'font-size:' + (mob ? 22 : 28) + 'px; line-height:1.12;'} preview={ctx.preview} />
            <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(' + (mob ? 2 : 4) + ',1fr)', gap: mob ? '18px 14px' : '30px 20px' }}>
              {alsoList.map((pr) => <ProductCard key={pr.id} pr={pr} ctx={ctx} c={cAlso} showPrice={also.prices !== false} onClick={ctx.onProduct} />)}
            </div>
          </div>
        </Part>
      )}
      {ctx.preview && (
        <div
          style={sx('position:fixed; left:0; right:0; bottom:0; z-index:60; transform:translateY(' + (stickyOn ? '0' : '110%') + '); transition:transform .28s cubic-bezier(.16,1,.3,1); background:' + cPd.card + '; border-top:1px solid ' + cPd.line + '; box-shadow:0 -12px 30px rgba(15,16,10,0.14);')}
          aria-hidden={!stickyOn}
        >
          <div style={sx('display:flex; align-items:center; gap:14px; padding:' + (mob ? '10px 16px' : '12px max(' + padX + 'px, calc((100% - 1120px)/2))') + ';')}>
            {!mob && (
              <div style={sx('width:44px; height:54px; flex-shrink:0; border-radius:' + Math.min(C.rs, 10) + 'px; overflow:hidden; position:relative; background:' + cPd.bg + ';')}>
                <ImageSlot slotId={mainSlotId} assets={{ ...(ctx.assets || {}), [mainSlotId]: (ctx.assets || {})[mainSlotId] || bp.img }} fit="cover" placeholder="" preview />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={sx('font-family:' + F.b + '; font-size:13.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{bp.n}</div>
              <div style={sx('font-family:' + F.b + '; font-size:12px; color:' + cPd.sub + '; margin-top:2px;')}>
                {fmtPr(bp.pr)}{curSize ? ' · ' + curSize : ''}{cartLine ? ' · In cart' : ''}
              </div>
            </div>
            <div
              onClick={buyable ? (ev) => { ev.stopPropagation(); doBuy(); } : undefined}
              style={sx('flex-shrink:0; display:flex; align-items:center; gap:8px; padding:' + (mob ? '11px 18px' : '13px 24px') + '; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:13.5px; cursor:pointer; white-space:nowrap;' + (!buyable ? ' opacity:0.45;' : ''))}
            >
              {cartLine ? 'View cart' + (cartLine.qty > 1 ? ' (' + cartLine.qty + ')' : '') : pp.btn}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
