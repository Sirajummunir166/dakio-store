'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { act, cardLook, oneOf } from './kit';

// Call-to-action band (W3): one line and the main button — "Book your bridal
// trial", "Get a free estimate". The button follows the section's link, else
// the business's main action (the header's button).
// Layouts: row (words left, button right), centre, card (a box on the
// section's colour). A second, quieter button (`btn2On`) goes to its own link
// (`to2`), for WhatsApp or a call beside the main action.

export default function Band({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, mob, preview } = ctx;
  const p = sec.props;
  const { C } = ctx;
  const v = oneOf(sec.v, ['row', 'centre', 'card']);
  const mid = v === 'centre';
  const wrap = 'display:flex; gap:' + (mob ? 18 : 32) + 'px;' + (mid ? 'flex-direction:column; align-items:center; text-align:center;' : 'align-items:' + (mob ? 'flex-start' : 'center') + '; justify-content:space-between;' + (mob ? 'flex-direction:column;' : ''))
    + (v === 'card' ? cardLook('box', { C, c, s }, 'padding:' + (mob ? '24px 20px' : '36px 40px') + ';') : '');
  const go2 = preview ? (ev) => { ev.stopPropagation(); if (p.to2 && ctx.onLink) ctx.onLink(p.to2); } : undefined;
  return (
    <div style={sx(s.pad)}>
      <div data-band-layout={v} style={sx(wrap)}>
        <div style={{ minWidth: 0, maxWidth: 680 }}>
          <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
          {(p.sub || !preview) ? <Editable secId={sec.id} k="sub" value={p.sub} style={'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15.5) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:10px; white-space:pre-wrap;'} multiline preview={preview} /> : null}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0, ...(mid ? { justifyContent: 'center' } : {}) }}>
          <div data-band-btn onClick={act(ctx, p.to)} style={sx(s.btn)}>
            <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
          </div>
          {p.btn2On === true ? (
            <div data-band-btn2 onClick={go2} style={sx(s.btnGhost)}>
              <Editable secId={sec.id} k="btn2" value={p.btn2} style={''} tag="span" preview={preview} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
