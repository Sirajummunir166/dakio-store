'use client';
import Editable from '../Editable';
import ProductCard from '../ProductCard';
import { baseStyles, sx } from '../theme';
import { pickFeat } from '../catalog';

// Featured products — grid or horizontally scrolling row of live catalog cards.
// The list comes from pickFeat (by-rule or hand-picked); deleted/hidden picks
// render as dashed placeholders in the editor and are filtered on public pages.
export default function Feat({ sec, ctx }) {
  const { F, mob, preview, cat, isPublic } = ctx;
  const p = sec.props;
  const { c, pad, h2 } = baseStyles(sec, ctx);

  let picked = pickFeat(sec, cat);
  if (isPublic) picked = picked.filter((pr) => !pr.gone && !pr.empty);
  const list = picked.length ? picked : (isPublic ? [] : [{ empty: true }]);
  if (isPublic && !list.length) return null;

  const n = Math.max(2, Math.min(8, list.length || 2));
  const viewAll = 'font-family:' + F.b + '; font-size:13px; font-weight:700; color:' + c.sub + '; cursor:pointer; white-space:nowrap; flex-shrink:0;';
  const cols = mob ? 2 : (n <= 4 ? n : 3);
  const row = sec.v === 'row';
  const prodGrid = row
    ? 'margin-top:26px; display:flex; gap:' + (mob ? 14 : 20) + 'px; overflow-x:auto; padding-bottom:10px;'
    : 'margin-top:26px; display:grid; grid-template-columns:repeat(' + cols + ',1fr); gap:' + (mob ? '18px 14px' : '30px 20px') + ';';
  const showPrice = p.prices !== false;

  return (
    <div style={sx(pad)}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20 }}>
        <Editable secId={sec.id} k="head" value={p.head} style={h2} preview={preview} />
        <div style={sx(viewAll)} onClick={preview && ctx.onShop ? (ev) => { ev.stopPropagation(); ctx.onShop(); } : undefined}>View all →</div>
      </div>
      <div style={sx(prodGrid)}>
        {list.map((pr, pi) => (
          <ProductCard
            key={pr.gone || pr.empty ? 'x' + pi : pr.id}
            pr={pr}
            ctx={ctx}
            c={c}
            row={row}
            showPrice={showPrice}
            onClick={(p2) => ctx.onLink && ctx.onLink({ t: 'prod', ref: p2.id })}
          />
        ))}
      </div>
    </div>
  );
}
