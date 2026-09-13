'use client';
import { useEffect, useState } from 'react';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { fmtPr } from '../catalog';
import { sizeList } from '../system/SystemPages';
import { sizeInStock, firstInStockSize, priceFor, soldOutSize } from '../variants';

// Product detail — bound to ONE real catalog product (props.pid). Name, price
// and compare-at render from the catalog; editing them on the canvas edits the
// actual product (Editable secId "__cat:{pid}" routes to a catalog write in the
// chrome). Sold-out / low-stock / hidden states show honest inline hints.
export default function Pdp({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c, B } = s;
  const { F, C, mob, preview, assets, cat, isPublic } = ctx;
  const p = sec.props;

  const bp = cat.products.find((x) => x.id === p.pid) || cat.products[0];
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState({});
  const [activeThumb, setActiveThumb] = useState(null);
  useEffect(() => { setActiveThumb(null); }, [bp && bp.id]);
  if (!bp) return null; // empty catalog — nothing honest to render

  const soldOrHidden = bp.stock === 0 || bp.arch;
  const stockOn = !isPublic && (!!bp.arch || bp.stock <= 3);
  const stockTxt = bp.arch
    ? 'Hidden from your store — unhide it in Catalog'
    : (bp.stock === 0 ? 'Sold out — restock in Catalog to sell' : 'Only ' + bp.stock + ' left in stock');
  const pubStockOn = isPublic && bp.stock > 0 && bp.stock <= 3;

  const pdpGrid = 'display:grid; grid-template-columns:' + (mob ? '1fr' : '1.02fr 0.98fr') + '; gap:' + (mob ? 26 : 64) + 'px; align-items:start;';
  const pdpMain = 'aspect-ratio:4/5; border-radius:' + C.r + 'px; overflow:hidden; position:relative; background:' + c.card + ';';
  const pdpThumb = (on) => 'aspect-ratio:1/1; border-radius:' + C.rs + 'px; overflow:hidden; position:relative; background:' + c.card + '; cursor:pointer;' + (on ? ' outline:2px solid ' + c.fg + '; outline-offset:-2px;' : '');
  const pdpName = s.headFont + 'font-size:' + (mob ? 30 : 40) + 'px; line-height:1.08; min-width:0; overflow-wrap:break-word;';
  const pdpPrice = 'font-family:' + F.b + '; font-size:' + (mob ? 20 : 23) + 'px; font-weight:800; font-variant-numeric:tabular-nums;';
  const pdpWas = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; color:' + c.sub + '; text-decoration:line-through; font-variant-numeric:tabular-nums;';
  const pdpStock = 'margin-top:12px; font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + (soldOrHidden ? '#B03A2E' : '#B07A2A') + ';';
  const pdpDesc = 'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 14.5) + 'px; line-height:1.7; color:' + c.sub + '; margin-top:16px; white-space:pre-wrap;';
  const pdpLbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + '; margin-top:24px;';
  const sizes = sizeList(bp);
  // Never preselect (or keep) a sold-out size — it would fail at checkout.
  const curSize = (sel && sizeInStock(bp, sel) ? sel : null) || firstInStockSize(bp, sizes);
  const sizeStyle = (on) => 'min-width:44px; padding:10px 0; text-align:center; border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (on ? c.fg : c.line) + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer;' + (on ? ' background:' + c.fg + '; color:' + c.bg + ';' : '');
  const qtyBox = 'display:flex; align-items:center; gap:14px; padding:0 16px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:14px; user-select:none; cursor:pointer;';
  const pdpBtn = 'flex:1; display:flex; align-items:center; justify-content:center; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:14.5px; cursor:pointer; white-space:nowrap;' + (soldOrHidden ? ' opacity:0.45;' : '');
  const pdpNote = 'margin-top:14px; display:flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';';
  const pdpRows = 'margin-top:26px; border-top:1px solid ' + c.line + ';';
  const pdpRow = 'padding:15px 2px; border-bottom:1px solid ' + c.line + '; display:flex; align-items:center; justify-content:space-between; font-family:' + F.b + '; font-size:13.5px; font-weight:700; cursor:pointer;';
  const pdpRowBody = 'padding:0 2px 16px; font-family:' + F.b + '; font-size:13px; line-height:1.65; color:' + c.sub + '; white-space:pre-wrap;';
  const chevStyle = (on) => 'display:flex; color:' + c.sub + '; transition:transform .2s ease; transform:rotate(' + (on ? 180 : 0) + 'deg); flex-shrink:0;';

  const catId = '__cat:' + bp.id;
  const mainSlot = 'st-pdp-' + bp.id;
  const thumbSlots = [0, 1, 2].map((ti) => 'st-pdpt-' + ti);
  const shownSlot = activeThumb !== null ? thumbSlots[activeThumb] : mainSlot;
  const thumbsLeft = p.thumbPos === 'left' && !mob;

  const chev = (on) => (
    <div style={sx(chevStyle(on))}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
    </div>
  );

  const buy = preview && ctx.addToBag && !soldOrHidden && (sizes.length === 0 || curSize)
    ? (e) => { e.stopPropagation(); ctx.addToBag(bp, 1, curSize); }
    : preview && ctx.onCart && !soldOrHidden
      ? (e) => { e.stopPropagation(); ctx.onCart(); }
      : undefined;

  return (
    <div style={sx(s.pad)}>
      <div style={sx(pdpGrid)}>
        <div style={{ minWidth: 0 }}>
          {(() => {
            const mainImg = (
              <div style={sx(pdpMain + (thumbsLeft ? ' flex:1; min-width:0;' : ''))}>
                {activeThumb === null && !assets[mainSlot] && bp.img
                  ? <img src={ctx.optImg ? ctx.optImg(bp.img) : bp.img} alt={bp.n} loading={ctx.lazyImgs ? 'lazy' : undefined} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ImageSlot slotId={shownSlot} assets={assets} placeholder={activeThumb === null ? 'Main product photo' : 'Alt view'} fit="cover" preview={preview} aspect={activeThumb === null ? '4/5' : '1/1'} hint={activeThumb === null ? 'Portrait, ~1200×1500px (4:5). Center the product with margin on all sides.' : 'Square, ~800×800px alt view.'} />}
              </div>
            );
            // In preview/public, an empty alt-view slot has nothing for a customer to
            // click "upload" on — only show tiles that actually have a photo. In the
            // builder's edit mode, keep all 3 visible so the merchant can add one.
            const thumbTi = [0, 1, 2].filter((ti) => !preview || !!assets['st-pdpt-' + ti]);
            const thumbs = thumbTi.length > 0 && (
              <div style={{ display: 'flex', flexDirection: thumbsLeft ? 'column' : 'row', gap: 10, ...(thumbsLeft ? { width: 76, flexShrink: 0 } : { marginTop: 10 }) }}>
                {thumbTi.map((ti) => (
                  <div key={ti} onClick={preview ? (e) => { e.stopPropagation(); setActiveThumb(ti); } : undefined} style={sx((thumbsLeft ? '' : 'flex:1; ') + pdpThumb(activeThumb === ti))}>
                    <ImageSlot slotId={'st-pdpt-' + ti} assets={assets} placeholder="Alt view" fit="cover" preview={preview} aspect="1/1" hint="Square, ~800×800px." />
                  </div>
                ))}
              </div>
            );
            return thumbsLeft
              ? <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>{thumbs}{mainImg}</div>
              : <>{mainImg}{thumbs}</>;
          })()}
        </div>
        <div style={{ minWidth: 0 }}>
          <Editable secId={catId} k="n" value={bp.n} style={pdpName} preview={preview} />
          <div style={sx('display:flex; align-items:baseline; gap:12px; margin-top:12px;')}>
            <Editable secId={catId} k="pr" value={fmtPr(isPublic ? priceFor(bp, curSize) : bp.pr)} style={pdpPrice} preview={preview} />
            <Editable secId={catId} k="was" value={bp.was ? fmtPr(bp.was) : ''} style={pdpWas} preview={preview} />
          </div>
          {(stockOn || pubStockOn) && <div style={sx(pdpStock)}>{isPublic ? 'Only ' + bp.stock + ' left in stock' : stockTxt}</div>}
          <Editable secId={sec.id} k="desc" value={p.desc} style={pdpDesc} multiline preview={preview} />
          {sizes.length > 0 && (
            <>
              <div style={sx(pdpLbl)}>SIZE</div>
              <div style={sx('display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;')}>
                {sizes.map((z) => (
                  <div key={z} title={sizeInStock(bp, z) ? undefined : 'Sold out'} onClick={preview && sizeInStock(bp, z) ? (e) => { e.stopPropagation(); setSel(z); } : undefined} style={sx(sizeStyle(z === curSize) + (sizeInStock(bp, z) ? '' : soldOutSize))}>{z}</div>
                ))}
              </div>
            </>
          )}
          <div style={sx('display:flex; gap:10px; margin-top:24px; align-items:stretch;')}>
            <div style={sx(qtyBox)}><span>−</span><span style={{ fontWeight: 800 }}>1</span><span>+</span></div>
            <div onClick={buy} style={sx(pdpBtn)}>
              <Editable secId={sec.id} k="btn" value={isPublic && bp.stock === 0 ? 'Sold out' : p.btn} style={''} tag="span" preview={preview} />
            </div>
          </div>
          <div style={sx(pdpNote)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M1 5h13v11H1zM14 9h4l3 3v4h-7zM6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" /></svg>
            <Editable secId={sec.id} k="note" value={p.note} style={''} tag="span" preview={preview} />
          </div>
          <div style={sx(pdpRows)}>
            <div onClick={(e) => { e.stopPropagation(); setOpen((o) => ({ ...o, care: !o.care })); }} style={sx(pdpRow)}>Fabric &amp; care{chev(!!open.care)}</div>
            {open.care && <Editable secId={sec.id} k="care" value={p.care || 'Add fabric & care notes — wash, iron, fabric blend.'} style={pdpRowBody} multiline preview={preview} />}
            <div onClick={(e) => { e.stopPropagation(); setOpen((o) => ({ ...o, delivery: !o.delivery })); }} style={sx(pdpRow)}>Delivery &amp; returns{chev(!!open.delivery)}</div>
            {open.delivery && <Editable secId={sec.id} k="delivery" value={p.delivery || 'Add delivery & returns copy — timelines, exchange policy.'} style={pdpRowBody} multiline preview={preview} />}
          </div>
        </div>
      </div>
    </div>
  );
}
