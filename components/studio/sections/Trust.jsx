'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { cardLook, itemsOf, oneOf } from './kit';

// Trust & numbers (W3): years in business, clients served, results (GPA 5s,
// IELTS 7+), and a line for certifications. Layouts: line (a rule beside
// each number), cards (each in a box), centre (big, centred).

export default function Trust({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, mob, preview } = ctx;
  const p = sec.props;
  const items = itemsOf(p);
  const { C } = ctx;
  const v = oneOf(sec.v, ['line', 'cards', 'centre']);
  const cols = mob ? 2 : Math.min(4, Math.max(1, items.length));
  const cell = v === 'cards' ? cardLook('box', { C, c, s }, 'padding:' + (mob ? '16px 14px' : '22px 24px') + ';') : v === 'centre' ? 'text-align:center;' : 'border-left:2px solid ' + s.accCol + '; padding-left:' + (mob ? 12 : 16) + 'px;';
  return (
    <div style={sx(s.pad)}>
      {(p.head || !preview) ? <Editable secId={sec.id} k="head" value={p.head} style={s.h2 + 'margin-bottom:' + (mob ? 22 : 32) + 'px;' + (v === 'centre' ? 'text-align:center;' : '')} preview={preview} /> : null}
      <div data-trust-layout={v} style={sx('display:grid; gap:' + (mob ? 22 : 28) + 'px; grid-template-columns:repeat(' + cols + ', minmax(0,1fr));')}>
        {items.map((it, i) => (
          <div key={it.k} data-trust style={sx('min-width:0;' + cell)}>
            <Editable secId={sec.id} k={['items', i, 'v']} value={it.v} style={s.headFont + 'font-size:' + s.hz(mob ? 30 : 42) + 'px; line-height:1.05; font-variant-numeric:tabular-nums;'} preview={preview} />
            <Editable secId={sec.id} k={['items', i, 'l']} value={it.l} style={'font-family:' + F.b + '; font-size:13.5px; line-height:1.45; color:' + c.sub + '; margin-top:8px;'} preview={preview} />
          </div>
        ))}
      </div>
      {(p.certs || !preview) ? <Editable secId={sec.id} k="certs" value={p.certs} style={'font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:' + (mob ? 22 : 30) + 'px; white-space:pre-wrap;' + (v === 'centre' ? 'text-align:center;' : '')} multiline preview={preview} /> : null}
    </div>
  );
}
