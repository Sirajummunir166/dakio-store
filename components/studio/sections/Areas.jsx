'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { act, linesOf, oneOf, subStyle } from './kit';

// Areas we serve (W3): where an on-site business goes — Dhanmondi, Gulshan,
// Mirpur… one per line or with commas — and "Not in your area? Ask us", whose
// button follows the section's link, else the business's main action.
// Layouts: chips, cols (a plain list in columns, for a long list). The pin
// before each area is on or off.

export default function Areas({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview } = ctx;
  const p = sec.props;
  const areas = linesOf(p.list, { commas: true });
  const v = oneOf(sec.v, ['chips', 'cols']);
  const pin = p.pin !== false;
  const Pin = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
  const chip = 'display:inline-flex; align-items:center; gap:7px; padding:9px 15px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; background:' + c.card + '; font-family:' + F.b + '; font-size:14px; font-weight:600;';
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      {preview ? (v === 'cols' ? (
        <div data-areas="cols" style={{ marginTop: mob ? 20 : 28, columnCount: mob ? 2 : 4, columnGap: 28 }}>
          {areas.map((a) => (
            <div key={a} style={sx('display:flex; align-items:center; gap:8px; padding:7px 0; break-inside:avoid; font-family:' + F.b + '; font-size:14.5px;')}>{pin ? <Pin /> : null}{a}</div>
          ))}
        </div>
      ) : (
        <div data-areas="chips" style={{ marginTop: mob ? 20 : 28, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {areas.map((a) => (
            <span key={a} style={sx(chip)}>{pin ? <Pin /> : null}{a}</span>
          ))}
        </div>
      )) : (
        <Editable secId={sec.id} k="list" value={p.list} multiline preview={false} style={'margin-top:22px; font-family:' + F.b + '; font-size:14px; line-height:1.8; white-space:pre-wrap; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px dashed ' + c.line + ';'} />
      )}
      <div style={sx('margin-top:' + (mob ? 22 : 30) + 'px; display:flex; align-items:center; gap:14px; flex-wrap:wrap;')}>
        <Editable secId={sec.id} k="note" value={p.note} style={'font-family:' + F.b + '; font-size:14.5px; color:' + c.sub + ';'} preview={preview} />
        <div onClick={act(ctx, p.to)} style={sx(s.btn)}>
          <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
        </div>
      </div>
    </div>
  );
}
