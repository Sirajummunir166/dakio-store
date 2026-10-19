'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { act } from './kit';

// Call-to-action band (W3): one line and the main button — "Book your bridal
// trial", "Get a free estimate". The button follows the section's link, else
// the business's main action (the header's button).

export default function Band({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, mob, preview } = ctx;
  const p = sec.props;
  return (
    <div style={sx(s.pad)}>
      <div style={sx('display:flex; gap:' + (mob ? 18 : 32) + 'px; align-items:' + (mob ? 'flex-start' : 'center') + '; justify-content:space-between;' + (mob ? 'flex-direction:column;' : ''))}>
        <div style={{ minWidth: 0, maxWidth: 680 }}>
          <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
          {(p.sub || !preview) ? <Editable secId={sec.id} k="sub" value={p.sub} style={'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15.5) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:10px; white-space:pre-wrap;'} multiline preview={preview} /> : null}
        </div>
        <div data-band-btn onClick={act(ctx, p.to)} style={sx(s.btn + 'flex-shrink:0;')}>
          <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
        </div>
      </div>
    </div>
  );
}
