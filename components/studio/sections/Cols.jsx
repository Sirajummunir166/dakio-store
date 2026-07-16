'use client';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { baseStyles, sx } from '../theme';
import { COLDATA } from '../catalog';

// Collection grid — 3up / 4up / 2big tile variants with scrim + name overlay.
// Real collections arrive via the bridge (ctx.collections); demo data is the fallback.
export default function Cols({ sec, ctx }) {
  const { F, C, mob, preview, assets } = ctx;
  const collections = ctx.collections && ctx.collections.length ? ctx.collections : COLDATA;
  const p = sec.props;
  const { c, pad, h2 } = baseStyles(sec, ctx);

  const count = sec.v === '4up' ? 4 : sec.v === '2big' ? 2 : 3;
  const gcols = mob ? 2 : count;
  const colGrid = 'margin-top:26px; display:grid; grid-template-columns:repeat(' + (sec.v === '2big' ? (mob ? 1 : 2) : gcols) + ',1fr); gap:' + (mob ? 12 : 18) + 'px;';

  const tile = 'position:relative; aspect-ratio:' + (sec.v === '2big' ? '16/10' : '4/5') + '; border-radius:' + C.rs + 'px; overflow:hidden; cursor:pointer; background:' + c.card + ';';
  const tName = 'font-family:' + F.h + '; font-weight:' + Math.max(F.hw, 500) + '; font-size:' + (sec.v === '4up' ? 18 : 22) + 'px; color:#FFFFFF; letter-spacing:' + F.ls + ';';

  return (
    <div style={sx(pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={h2} preview={preview} />
      <div style={sx(colGrid)}>
        {collections.slice(0, count).map((t, ti) => (
          <div key={ti} style={sx(tile)}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ImageSlot slotId={'st-col-' + ti} assets={assets} fit="cover" placeholder="Collection image" preview={preview} />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,11,8,0.62), transparent 55%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 16, bottom: 14, pointerEvents: 'none' }}>
              <div style={sx(tName)}>{t.n}</div>
              <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 11.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{t.c}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
