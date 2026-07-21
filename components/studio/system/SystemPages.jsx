'use client';
// Store system pages (Phase 8) — /shop, the collection template and the product
// template. Data-bound to the live catalog and template-driven: the merchant
// edits the template once (doc.sys), every collection & product follows.
// Rendered by the studio canvas (edit + preview) and the public storefront.
import { useMemo, useState } from 'react';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { co, btnColors, sx } from '../theme';
import { fmtPr, prodTag, colCount, liveProds } from '../catalog';

export const SYS_DEFAULTS = {
  shop: { head: 'Shop all', cols: 4 },
  col: { v: 'plain', sub: 'Woven slow, delivered fast — every piece from the live catalog.' },
  prod: { btn: 'Add to bag', note: 'Free delivery in Dhaka · Cash on delivery', alsoOn: true, alsoHead: 'You may also like' },
};

export const sysProps = (sys, k) => ({ ...SYS_DEFAULTS[k], ...((sys || {})[k] || {}) });

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

function ProductCard({ pr, ctx, c, seo }) {
  const { P, F, C, mob } = ctx;
  const t = prodTag(pr);
  const go = ctx.preview && ctx.onProduct ? (e) => { e.stopPropagation(); ctx.onProduct(pr); } : undefined;
  return (
    <div onClick={go} style={{ minWidth: 0, cursor: 'pointer' }}>
      <div style={sx('aspect-ratio:3/4; border-radius:' + C.rs + 'px; overflow:hidden; position:relative; background:' + c.card + ';' + (ctx.shCard || '') + (pr.stock === 0 ? ' opacity:0.75;' : ''))}>
        <ImageSlot slotId={'st-prod-' + pr.id} assets={{ ...(ctx.assets || {}), ['st-prod-' + pr.id]: (ctx.assets || {})['st-prod-' + pr.id] || pr.img }} fit="cover" placeholder="Product photo" preview={ctx.preview} />
        {t && (
          <div style={sx('position:absolute; top:10px; left:10px; z-index:2; padding:4px 9px; border-radius:' + Math.min(C.rs, 8) + 'px; background:' + (pr.stock === 0 ? '#4a4a44' : P.accent) + '; color:' + (pr.stock === 0 ? '#f4f4ef' : P.accentInk) + '; font-family:' + F.b + '; font-size:9.5px; font-weight:800; letter-spacing:0.6px; text-transform:uppercase; pointer-events:none;')}>{t}</div>
        )}
      </div>
      <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 13 : 14) + 'px; font-weight:600; margin-top:11px;')}>{pr.n}</div>
      <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 12.5 : 13) + 'px; color:' + c.sub + '; margin-top:3px; font-variant-numeric:tabular-nums;')}>
        {fmtPr(pr.pr)}{pr.was ? <span style={{ textDecoration: 'line-through', opacity: 0.6, marginLeft: 8 }}>{fmtPr(pr.was)}</span> : null}
      </div>
    </div>
  );
}

// Shared filterable product grid — the heart of /shop and the collection template
function FilterGrid({ ctx, sys, products, lockedCol, q, edit, partPrefix, label }) {
  const { P, F, C, mob, padX, cat } = ctx;
  const c = co('base', P);
  const sp = sysProps(sys, 'shop');
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
  const gridCols = mob ? 2 : (sp.cols || 4);

  return (
    <Part id={partPrefix + '-grid'} label={label} edit={edit}>
      <div style={sx('padding:26px max(' + padX + 'px, calc((100% - 1120px)/2)) 70px; background:' + c.bg + '; color:' + c.fg + ';')}>
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
        <div style={{ display: mob ? 'block' : 'grid', gridTemplateColumns: '190px 1fr', gap: 34 }}>
          {!mob && (
            <div style={{ minWidth: 0 }}>
              {!lockedCol && (
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
              <div style={sx(fCap)}>PRICE</div>
              <div style={{ margin: '8px 0 20px' }}>
                {PRICE_BUCKETS.map((b) => (
                  <div key={b.k} onClick={interactive ? () => setFPr(fPr === b.k ? null : b.k) : undefined} style={sx(fRow(fPr === b.k))}>{b.n}</div>
                ))}
              </div>
              {allSizes.length > 0 && (
                <>
                  <div style={sx(fCap)}>SIZE</div>
                  <div style={{ margin: '8px 0 20px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {allSizes.map((z) => (
                      <div key={z} onClick={interactive ? () => setFSz(fSz === z ? null : z) : undefined} style={sx(szChip(fSz === z))}>{z}</div>
                    ))}
                  </div>
                </>
              )}
              <div onClick={interactive ? () => setFStock((v) => !v) : undefined} style={sx(fRow(fStock))}>
                <div style={sx('width:17px; height:17px; border-radius:5px; border:1.5px solid ' + (fStock ? c.fg : c.line) + '; display:flex; align-items:center; justify-content:center;' + (fStock ? ' background:' + c.fg + '; color:' + c.bg + ';' : ''))}>{fStock ? '✓' : ''}</div>
                In stock only
              </div>
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
              {list.map((pr) => <ProductCard key={pr.id} pr={pr} ctx={ctx} c={c} />)}
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
  const live = liveProds(cat);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';

  return (
    <>
      <Part id="shop-head" label="SHOP HEADER — TEMPLATE" edit={edit}>
        <div style={sx('padding:' + (mob ? 40 : 64) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)) 8px; background:' + c.bg + '; color:' + c.fg + ';')}>
          <Editable secId="__sys:shop" k="head" value={sp.head} style={headFont + 'font-size:' + (mob ? 30 : 44) + 'px; line-height:1.06;'} preview={ctx.preview} />
          <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:10px;')}>{live.length} {live.length === 1 ? 'piece' : 'pieces'}</div>
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
      <FilterGrid ctx={ctx} sys={sys} products={cat.products} q={q} edit={edit} partPrefix="shop" label="GRID & FILTERS — TEMPLATE" />
    </>
  );
}

// ── Collection template (/shop/<collection>) ────────────────────────────────
export function CollectionPage({ ctx, sys, col, edit }) {
  const { P, F, C, mob, padX, cat } = ctx;
  const c = co('base', P);
  const cp = sysProps(sys, 'col');
  const cnt = colCount(cat, col.id);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const crumb = 'font-family:' + F.b + '; font-size:11.5px; font-weight:800; letter-spacing:1.6px; text-transform:uppercase; color:' + c.sub + '; cursor:pointer;';
  const banner = cp.v === 'banner';

  return (
    <>
      <Part id="col-hero" label="COLLECTION HERO — TEMPLATE" edit={edit}>
        {!banner ? (
          <div style={sx('padding:' + (mob ? 40 : 64) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)) 8px; background:' + c.bg + '; color:' + c.fg + ';')}>
            <div onClick={ctx.preview && ctx.onShop ? (e) => { e.stopPropagation(); ctx.onShop(); } : undefined} style={sx(crumb)}>Shop <span style={{ opacity: 0.5 }}>/</span> {col.n}</div>
            <div style={sx(headFont + 'font-size:' + (mob ? 30 : 44) + 'px; line-height:1.06; margin-top:10px;')}>{col.n}</div>
            <Editable secId="__sys:col" k="sub" value={cp.sub} style={'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 15) + 'px; color:' + c.sub + '; margin-top:10px; max-width:520px;'} multiline preview={ctx.preview} />
            <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:10px;')}>{cnt} {cnt === 1 ? 'piece' : 'pieces'}</div>
          </div>
        ) : (
          <div style={sx('position:relative; height:' + (mob ? 260 : 340) + 'px; overflow:hidden; background:' + c.card + ';')}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ImageSlot slotId={'st-col-' + col.id} assets={ctx.assets || {}} fit="cover" placeholder="Collection banner — shared with your collection tiles" preview={ctx.preview} />
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
      <FilterGrid ctx={ctx} sys={sys} products={cat.products} lockedCol={col.id} edit={edit} partPrefix="col" label="COLLECTION GRID — TEMPLATE" />
    </>
  );
}

// ── Product template (/p/<slug>) ────────────────────────────────────────────
export function ProductPage({ ctx, sys, product, edit }) {
  const { P, F, C, mob, padX, cat } = ctx;
  const c = co('base', P);
  const B = btnColors('base', P);
  const pp = sysProps(sys, 'prod');
  const bp = product || liveProds(cat)[0] || cat.products[0];
  if (!bp) return null;
  const sizes = sizeList(bp);
  const col2 = cat.collections.find((x) => x.id === bp.col);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const also = liveProds(cat).filter((p) => p.id !== bp.id && p.stock > 0).sort((a, b) => (a.rank || 999) - (b.rank || 999)).slice(0, mob ? 2 : 4);
  const lbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + '; margin-top:24px;';

  return (
    <>
      <Part id="prod-main" label="PRODUCT DETAIL — TEMPLATE" edit={edit}>
        <div style={sx('padding:' + (mob ? 26 : 44) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)) ' + (mob ? 40 : 64) + 'px; background:' + c.bg + '; color:' + c.fg + ';')}>
          <div style={sx('font-family:' + F.b + '; font-size:12px; color:' + c.sub + '; margin-bottom:' + (mob ? 16 : 24) + 'px; display:flex; gap:7px; flex-wrap:wrap;')}>
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
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.02fr 0.98fr', gap: mob ? 26 : 64, alignItems: 'start' }}>
            <div style={{ minWidth: 0 }}>
              <div style={sx('aspect-ratio:4/5; border-radius:' + C.r + 'px; overflow:hidden; position:relative; background:' + c.card + ';' + (ctx.shCard || ''))}>
                <ImageSlot slotId={'st-prod-' + bp.id} assets={{ ...(ctx.assets || {}), ['st-prod-' + bp.id]: (ctx.assets || {})['st-prod-' + bp.id] || bp.img }} fit="cover" placeholder="Main product photo" preview={ctx.preview} />
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <Editable secId={'__cat:' + bp.id} k="n" value={bp.n} style={headFont + 'font-size:' + (mob ? 30 : 40) + 'px; line-height:1.08; min-width:0; overflow-wrap:break-word;'} preview={ctx.preview} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12 }}>
                <Editable secId={'__cat:' + bp.id} k="pr" value={fmtPr(bp.pr)} style={'font-family:' + F.b + '; font-size:' + (mob ? 20 : 23) + 'px; font-weight:800; font-variant-numeric:tabular-nums;'} preview={ctx.preview} tag="span" />
                {bp.was ? <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; color:' + c.sub + '; text-decoration:line-through; font-variant-numeric:tabular-nums;')}>{fmtPr(bp.was)}</div> : null}
              </div>
              {(bp.arch || bp.stock <= 3) && (
                <div style={sx('margin-top:12px; font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + ((bp.arch || bp.stock === 0) ? '#B03A2E' : '#B07A2A') + ';')}>
                  {bp.arch ? 'Hidden from your store — unhide it in Catalog' : bp.stock === 0 ? 'Sold out — restock in Catalog to sell' : 'Only ' + bp.stock + ' left in stock'}
                </div>
              )}
              <Editable secId={'__cat:' + bp.id} k="desc" value={bp.desc || 'Add a description in the Catalog tab — fabric, fit, care.'} style={'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 14.5) + 'px; line-height:1.7; color:' + c.sub + '; margin-top:16px; white-space:pre-wrap;'} multiline preview={ctx.preview} />
              {sizes.length > 0 && (
                <>
                  <div style={sx(lbl)}>SIZE</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {sizes.map((z, zi) => (
                      <div key={z} style={sx('min-width:44px; padding:10px 0; text-align:center; border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (zi === 0 ? c.fg : c.line) + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer;' + (zi === 0 ? ' background:' + c.fg + '; color:' + c.bg + ';' : ''))}>{z}</div>
                    ))}
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 24, alignItems: 'stretch' }}>
                <div style={sx('display:flex; align-items:center; gap:14px; padding:0 16px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:14px; user-select:none; cursor:pointer;')}>
                  <span>−</span><span style={{ fontWeight: 800 }}>1</span><span>+</span>
                </div>
                <div
                  onClick={ctx.preview && ctx.addToBag && bp.stock > 0 && !bp.arch ? (ev) => { ev.stopPropagation(); ctx.addToBag(bp, 1, sizes[0] || null); } : ctx.preview && ctx.onCart && bp.stock > 0 ? (ev) => { ev.stopPropagation(); ctx.onCart(); } : undefined}
                  style={sx('flex:1; display:flex; align-items:center; justify-content:center; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:14.5px; cursor:pointer; white-space:nowrap;' + ((bp.stock === 0 || bp.arch) ? ' opacity:0.45;' : ''))}
                >
                  <Editable secId="__sys:prod" k="btn" value={pp.btn} style={''} preview={ctx.preview} tag="span" />
                </div>
              </div>
              <div style={sx('margin-top:14px; display:flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M1 5h13v11H1zM14 9h4l3 3v4h-7zM6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" /></svg>
                <Editable secId="__sys:prod" k="note" value={pp.note} style={''} preview={ctx.preview} tag="span" />
              </div>
            </div>
          </div>
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
      {pp.alsoOn && also.length > 0 && (
        <Part id="prod-also" label="YOU MAY ALSO LIKE — TEMPLATE" edit={edit}>
          <div style={sx('padding:' + (mob ? 36 : 56) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)); background:' + c.bg + '; color:' + c.fg + '; border-top:1px solid ' + c.line + ';')}>
            <Editable secId="__sys:prod" k="alsoHead" value={pp.alsoHead} style={headFont + 'font-size:' + (mob ? 22 : 28) + 'px; line-height:1.12;'} preview={ctx.preview} />
            <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(' + (mob ? 2 : 4) + ',1fr)', gap: mob ? '18px 14px' : '30px 20px' }}>
              {also.map((pr) => <ProductCard key={pr.id} pr={pr} ctx={ctx} c={c} />)}
            </div>
          </div>
        </Part>
      )}
    </>
  );
}
