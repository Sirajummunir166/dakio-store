'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';

export default function Insta({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview, assets } = ctx;
  const p = sec.props;

  const instaHandle = 'font-family:' + F.b + '; font-size:13.5px; font-weight:800; color:' + s.accCol + '; cursor:pointer; white-space:nowrap;';
  const instaGrid = 'margin-top:26px; display:grid; grid-template-columns:repeat(' + (mob ? 3 : 6) + ',1fr); gap:' + (mob ? 6 : 10) + 'px;';
  const tile = 'aspect-ratio:1/1; border-radius:' + Math.min(C.rs, 10) + 'px; overflow:hidden; position:relative; background:' + c.card + '; cursor:pointer;';

  return (
    <div style={sx(s.pad)}>
      <div style={sx('display:flex; align-items:baseline; justify-content:space-between; gap:16px;')}>
        <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
        <Editable secId={sec.id} k="handle" value={p.handle} style={instaHandle} preview={preview} />
      </div>
      <div style={sx(instaGrid)}>
        {[0, 1, 2, 3, 4, 5].map((gi) => (
          <div key={gi} style={sx(tile)}>
            <ImageSlot slotId={'st-ig-' + gi} assets={assets} placeholder="IG post" fit="cover" preview={preview} />
          </div>
        ))}
      </div>
    </div>
  );
}
