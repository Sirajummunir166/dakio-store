'use client';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { baseStyles, sx } from '../theme';
import { PRODUCTS } from '../catalog';

// Featured products — grid or horizontally scrolling row of demo catalog cards.
export default function Feat({ sec, ctx }) {
  const { P, F, C, mob, preview, assets } = ctx;
  const p = sec.props;
  const { c, pad, h2 } = baseStyles(sec, ctx);

  const n = Math.max(2, Math.min(8, p.count || 4));
  const viewAll = 'font-family:' + F.b + '; font-size:13px; font-weight:700; color:' + c.sub + '; cursor:pointer; white-space:nowrap; flex-shrink:0;';
  const cols = mob ? 2 : (n <= 4 ? n : 3);
  const prodGrid = sec.v === 'row'
    ? 'margin-top:26px; display:flex; gap:' + (mob ? 14 : 20) + 'px; overflow-x:auto; padding-bottom:10px;'
    : 'margin-top:26px; display:grid; grid-template-columns:repeat(' + cols + ',1fr); gap:' + (mob ? '18px 14px' : '30px 20px') + ';';

  const card = (sec.v === 'row' ? 'flex:0 0 ' + (mob ? '62%' : '250px') + ';' : '') + 'min-width:0; cursor:pointer;';
  const imgWrap = 'aspect-ratio:3/4; border-radius:' + C.rs + 'px; overflow:hidden; position:relative; background:' + c.card + ';';
  const tagStyle = 'position:absolute; top:10px; left:10px; z-index:2; padding:4px 9px; border-radius:' + Math.min(C.rs, 8) + 'px; background:' + P.accent + '; color:' + P.accentInk + '; font-family:' + F.b + '; font-size:9.5px; font-weight:800; letter-spacing:0.6px; text-transform:uppercase; pointer-events:none;';
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
        {PRODUCTS.slice(0, n).map((pr, pi) => (
          <div key={pi} style={sx(card)}>
            <div style={sx(imgWrap)}>
              <ImageSlot slotId={'st-prod-' + pi} assets={assets} fit="cover" placeholder="Product photo" preview={preview} />
              {!!pr.t && <div style={sx(tagStyle)}>{pr.t}</div>}
            </div>
            <div style={sx(nameStyle)}>{pr.n}</div>
            {showPrice && <div style={sx(priceStyle)}>{pr.pr}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
