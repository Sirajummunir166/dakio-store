'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { act, itemsOf, subStyle } from './kit';

// Courses & batches (W3): a coaching centre's courses — fee, how long, the
// batch times and a note — each with the enrol button (the section's link,
// else the business's main action). Variants: cards, list.

export default function Course({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview } = ctx;
  const p = sec.props;
  const items = itemsOf(p);
  const list = sec.v === 'list';
  const cols = mob ? 1 : Math.min(3, Math.max(1, items.length));
  const meta = 'font-family:' + F.b + '; font-size:13.5px; color:' + c.sub + '; margin-top:6px; white-space:pre-wrap;';
  const fee = s.headFont + 'font-size:' + s.hz(mob ? 22 : 26) + 'px; margin-top:12px;';
  const small = 'display:inline-flex; align-items:center; padding:10px 18px; border-radius:' + C.btn + '; background:' + s.B.bg + '; color:' + s.B.fg + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap;';
  const ed = (i, k, style, multi) => <Editable secId={sec.id} k={['items', i, k]} value={items[i][k]} style={style} multiline={multi} preview={preview} />;
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      <div style={sx('margin-top:' + (mob ? 22 : 32) + 'px; display:grid; gap:' + (list ? 0 : 16) + 'px; grid-template-columns:' + (list ? '1fr' : 'repeat(' + cols + ', minmax(0,1fr))') + ';')}>
        {items.map((it, i) => (
          <div key={it.k} data-course style={sx(list
            ? 'display:flex; gap:16px; align-items:' + (mob ? 'flex-start' : 'center') + '; padding:18px 0; border-top:1px solid ' + c.line + ';' + (mob ? 'flex-direction:column;' : '')
            : 'display:flex; flex-direction:column; padding:22px; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';' + s.sh)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {ed(i, 'n', s.headFont + 'font-size:' + s.hz(mob ? 18 : 20) + 'px; line-height:1.25;')}
              {list ? null : ed(i, 'fee', fee)}
              {ed(i, 'dur', meta)}
              {ed(i, 'time', meta)}
              {ed(i, 'note', meta + 'margin-top:10px; font-size:13px;', true)}
            </div>
            {list ? ed(i, 'fee', 'font-family:' + F.b + '; font-size:16px; font-weight:700; white-space:nowrap;') : null}
            <div style={{ marginTop: list ? 0 : 18, display: 'flex' }}>
              <div onClick={act(ctx, p.to)} style={sx(small)}>
                <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
