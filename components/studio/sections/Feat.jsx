'use client';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { baseStyles, sx } from '../theme';
import { pickFeat, prodTag, fmtPr } from '../catalog';

// Featured products — grid or horizontally scrolling row of live catalog cards.
// The list comes from pickFeat (by-rule or hand-picked); deleted/hidden picks
// render as dashed placeholders in the editor and are filtered on public pages.
export default function Feat({ sec, ctx }) {
  const { P, F, C, mob, preview, assets, cat, isPublic } = ctx;
  const p = sec.props;
  const { c, pad, h2 } = baseStyles(sec, ctx);

  let picked = pickFeat(sec, cat);
  if (isPublic) picked = picked.filter((pr) => !pr.gone && !pr.empty);
  const list = picked.length ? picked : (isPublic ? [] : [{ empty: true }]);
  if (isPublic && !list.length) return null;

  const n = Math.max(2, Math.min(8, list.length || 2));
  const viewAll = 'font-family:' + F.b + '; font-size:13px; font-weight:700; color:' + c.sub + '; cursor:pointer; white-space:nowrap; flex-shrink:0;';
  const cols = mob ? 2 : (n <= 4 ? n : 3);
  const prodGrid = sec.v === 'row'
    ? 'margin-top:26px; display:flex; gap:' + (mob ? 14 : 20) + 'px; overflow-x:auto; padding-bottom:10px;'
    : 'margin-top:26px; display:grid; grid-template-columns:repeat(' + cols + ',1fr); gap:' + (mob ? '18px 14px' : '30px 20px') + ';';

  const baseCard = (sec.v === 'row' ? 'flex:0 0 ' + (mob ? '62%' : '250px') + ';' : '') + 'min-width:0; cursor:pointer;';
  const nameStyle = 'font-family:' + F.b + '; font-size:' + (mob ? 13 : 14) + 'px; font-weight:600; margin-top:11px;';
  const priceStyle = 'font-family:' + F.b + '; font-size:' + (mob ? 12.5 : 13) + 'px; color:' + c.sub + '; margin-top:3px; font-variant-numeric:tabular-nums;';
  const showPrice = p.prices !== false;

  return (
    <div style={sx(pad)}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20 }}>
        <Editable secId={sec.id} k="head" value={p.head} style={h2} preview={preview} />
        <div style={sx(viewAll)}>View all →</div>
      </div>
      <div style={sx(prodGrid)}>
        {list.map((pr, pi) => {
          if (pr.gone || pr.empty) {
            // Graceful decay: the slot stays visible so the merchant can fix it
            return (
              <div key={'x' + pi} style={sx(baseCard)}>
                <div style={sx('aspect-ratio:3/4; border-radius:' + C.rs + 'px; position:relative; border:1.5px dashed ' + c.line + '; box-sizing:border-box; opacity:0.7;')} />
                <div style={sx(nameStyle + ' opacity:0.55;')}>{pr.empty ? 'No products picked yet' : 'Product unavailable'}</div>
              </div>
            );
          }
          const tag = prodTag(pr);
          const sold = pr.stock === 0;
          const imgWrap = 'aspect-ratio:3/4; border-radius:' + C.rs + 'px; overflow:hidden; position:relative; background:' + c.card + ';' + (sold ? ' opacity:0.75;' : '');
          const tagStyle = 'position:absolute; top:10px; left:10px; z-index:2; padding:4px 9px; border-radius:' + Math.min(C.rs, 8) + 'px; background:' + (sold ? '#4a4a44' : P.accent) + '; color:' + (sold ? '#f4f4ef' : P.accentInk) + '; font-family:' + F.b + '; font-size:9.5px; font-weight:800; letter-spacing:0.6px; text-transform:uppercase; pointer-events:none;';
          return (
            <div
              key={pr.id}
              style={sx(baseCard)}
              onClick={preview && ctx.onLink ? (ev) => { ev.stopPropagation(); ctx.onLink({ t: 'prod', ref: pr.id }); } : undefined}
            >
              <div style={sx(imgWrap)}>
                {pr.img
                  ? <img src={ctx.optImg ? ctx.optImg(pr.img) : pr.img} alt={pr.n} loading={ctx.lazyImgs ? 'lazy' : undefined} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ImageSlot slotId={'st-prod-' + pr.id} assets={assets} fit="cover" placeholder="Product photo" preview={preview} />}
                {!!tag && <div style={sx(tagStyle)}>{tag}</div>}
              </div>
              <div style={sx(nameStyle)}>{pr.n}</div>
              {showPrice && (
                <div style={sx(priceStyle)}>
                  {fmtPr(pr.pr)}
                  {pr.was ? <span style={{ textDecoration: 'line-through', opacity: 0.55, marginLeft: 7 }}>{fmtPr(pr.was)}</span> : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
