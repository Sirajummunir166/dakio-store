'use client';
// Funnel offer (Phase 9) — the one product this funnel sells, auto-filled from
// the live catalog: gallery (shared with the product page), price, sizes, stock.
// The story around it is written with normal sections; the CTA scrolls to the form.
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { baseStyles, sx, btnColors } from '../theme';
import { fmtPr, liveProds } from '../catalog';
import { TrustRow } from '../blocks';

export const sizeList = (p) => String(p?.sizes || '').split(',').map((x) => x.trim()).filter(Boolean);

export default function Offer({ sec, ctx }) {
  const { P, F, C, mob, preview, cat } = ctx;
  const p = sec.props;
  const base = baseStyles(sec, ctx);
  const { c, headFont, accCol, pad, hz, sh } = base;
  const bp = (ctx.fnProduct) || cat.products.find((x) => x.id === ctx.fnPid) || liveProds(cat)[0] || cat.products[0];
  if (!bp) return null;
  const sizes = sizeList(bp);
  const B = btnColors(p.bg, P);
  const savePct = bp.was && bp.was > bp.pr ? Math.round(((bp.was - bp.pr) / bp.was) * 100) : 0;

  const goForm = (ev) => { ev.stopPropagation(); ctx.onOrderForm && ctx.onOrderForm(); };

  return (
    <div style={sx(pad)}>
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.02fr 0.98fr', gap: mob ? 26 : 64, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={sx('aspect-ratio:4/5; border-radius:' + C.r + 'px; overflow:hidden; position:relative; background:' + c.card + ';' + sh)}>
            <ImageSlot slotId={'st-prod-' + bp.id} assets={{ ...(ctx.assets || {}), ['st-prod-' + bp.id]: (ctx.assets || {})['st-prod-' + bp.id] || bp.img }} fit="cover" placeholder="Product photo — shared with your product page" preview={preview} />
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div>
            <Editable secId={sec.id} k="eyebrow" value={p.eyebrow} style={'display:inline-flex; padding:5px 12px; border-radius:99px; background:' + P.accent + '; color:' + P.accentInk + '; font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase;'} preview={preview} tag="span" />
          </div>
          <div style={sx(headFont + 'font-size:' + hz(mob ? 30 : 42) + 'px; line-height:1.06; margin-top:14px; overflow-wrap:break-word;')}>{bp.n}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 22 : 26) + 'px; font-weight:800; font-variant-numeric:tabular-nums;')}>{fmtPr(bp.pr)}</div>
            {bp.was ? (
              <>
                <div style={sx('font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; color:' + c.sub + '; text-decoration:line-through; font-variant-numeric:tabular-nums;')}>{fmtPr(bp.was)}</div>
                {savePct > 0 && <div style={sx('padding:3px 9px; border-radius:99px; background:' + accCol + '; color:' + P.accentInk + '; font-family:' + F.b + '; font-size:10.5px; font-weight:800;')}>SAVE {savePct}%</div>}
              </>
            ) : null}
          </div>
          {bp.stock <= 5 && (
            <div style={sx('margin-top:12px; font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + (bp.stock === 0 ? '#B03A2E' : '#B07A2A') + ';')}>
              {bp.stock === 0 ? 'Sold out — restock in Catalog to sell' : 'Only ' + bp.stock + ' left — the drop sells through fast'}
            </div>
          )}
          <Editable secId={sec.id} k="desc" value={p.desc} style={'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 14.5) + 'px; line-height:1.7; color:' + c.sub + '; margin-top:16px; white-space:pre-wrap;'} multiline preview={preview} />
          {sizes.length > 0 && (
            <>
              <div style={sx('font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + '; margin-top:24px;')}>SIZE</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {sizes.map((z, zi) => (
                  <div key={z} style={sx('min-width:44px; padding:10px 0; text-align:center; border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (zi === 0 ? c.fg : c.line) + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer;' + (zi === 0 ? ' background:' + c.fg + '; color:' + c.bg + ';' : ''))}>{z}</div>
                ))}
              </div>
            </>
          )}
          <div style={{ marginTop: 26, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div onClick={preview ? goForm : undefined} style={sx('display:inline-flex; align-items:center; gap:9px; padding:' + (mob ? '14px 26px' : '16px 32px') + '; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:' + (mob ? 14 : 15) + 'px; cursor:pointer; white-space:nowrap;')}>
              <Editable secId={sec.id} k="cta" value={p.cta} style={''} preview={preview} tag="span" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m6-6l-6 6-6-6" /></svg>
            </div>
          </div>
          <div style={sx('margin-top:14px; display:flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M1 5h13v11H1zM14 9h4l3 3v4h-7zM6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" /></svg>
            <Editable secId={sec.id} k="note" value={p.note} style={''} preview={preview} tag="span" />
          </div>
          <TrustRow sec={sec} ctx={ctx} base={base} />
        </div>
      </div>
    </div>
  );
}
