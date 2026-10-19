'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { itemsOf, subStyle } from './kit';

// Team (W3): the people a client meets — a doctor, the stylists, the
// teachers — with a photo, a role and what they are good at.

export default function Team({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview, assets } = ctx;
  const p = sec.props;
  const items = itemsOf(p);
  const cols = mob ? 2 : Math.min(4, Math.max(2, items.length));
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      <div style={sx('margin-top:' + (mob ? 22 : 32) + 'px; display:grid; gap:' + (mob ? 14 : 22) + 'px; grid-template-columns:repeat(' + cols + ', minmax(0,1fr));')}>
        {items.map((it, i) => (
          <div key={it.k} data-team-member style={{ minWidth: 0 }}>
            <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: C.r, overflow: 'hidden', background: c.card }}>
              <ImageSlot slotId={'st-team-' + sec.id + '-' + it.k} assets={assets} fit="cover" placeholder="Portrait" preview={preview} aspect="4/5" hint="Head and shoulders, plain background" />
            </div>
            <Editable secId={sec.id} k={['items', i, 'n']} value={it.n} style={s.headFont + 'font-size:' + s.hz(mob ? 15 : 17) + 'px; margin-top:12px;'} preview={preview} />
            <Editable secId={sec.id} k={['items', i, 'r']} value={it.r} style={'font-family:' + F.b + '; font-size:12.5px; font-weight:700; letter-spacing:0.4px; color:' + c.sub + '; margin-top:3px;'} preview={preview} />
            {(it.x || !preview) ? <Editable secId={sec.id} k={['items', i, 'x']} value={it.x} style={'font-family:' + F.b + '; font-size:13px; line-height:1.5; color:' + c.sub + '; margin-top:6px; white-space:pre-wrap;'} multiline preview={preview} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
