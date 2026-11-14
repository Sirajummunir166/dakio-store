'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { cardLook, itemsOf, oneOf, subStyle } from './kit';

// How it works (W3): three to five numbered steps — visit → design → quote →
// build → handover. Layouts: row (side by side), list (one under another),
// cards (each step in a box). The mark before a step: its number, a dot, or none.

export default function How({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { P, F, mob, preview } = ctx;
  const p = sec.props;
  const items = itemsOf(p);
  const { C } = ctx;
  const v = oneOf(sec.v, ['row', 'list', 'cards']);
  const row = v !== 'list' && !mob;
  const mark = oneOf(p.mark, ['num', 'dot', 'none']);
  const num = 'display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:99px; background:' + P.accent + '; color:' + P.accentInk + '; font-family:' + F.b + '; font-size:15px; font-weight:800; flex-shrink:0;';
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      <div data-how-layout={v} style={sx('margin-top:' + (mob ? 24 : 36) + 'px; display:grid; gap:' + (row ? 24 : 18) + 'px; grid-template-columns:' + (row ? 'repeat(' + Math.max(1, items.length) + ', minmax(0,1fr))' : '1fr') + ';')}>
        {items.map((it, i) => (
          <div key={it.k} data-step style={sx('display:flex; gap:14px;' + (row ? 'flex-direction:column;' : 'align-items:flex-start;') + (v === 'cards' ? cardLook('box', { C, c, s }, 'padding:' + (mob ? 18 : 22) + 'px;') : ''))}>
            {mark === 'none' ? null : mark === 'dot' ? <div style={sx('width:12px; height:12px; border-radius:99px; background:' + P.accent + '; flex-shrink:0; margin-top:' + (row ? 0 : 9) + 'px;')} /> : <div style={sx(num)}>{i + 1}</div>}
            <div style={{ minWidth: 0 }}>
              <Editable secId={sec.id} k={['items', i, 't']} value={it.t} style={s.headFont + 'font-size:' + s.hz(mob ? 17 : 19) + 'px; line-height:1.25;' + (row ? '' : 'margin-top:7px;')} preview={preview} />
              <Editable secId={sec.id} k={['items', i, 'd']} value={it.d} style={'font-family:' + F.b + '; font-size:14px; line-height:1.6; color:' + c.sub + '; margin-top:6px; white-space:pre-wrap;'} multiline preview={preview} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
