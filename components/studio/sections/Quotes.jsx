'use client';
import { useState } from 'react';
import Editable from '../Editable';
import { baseStyles, sx } from '../theme';

// Testimonials — cards grid or single spotlight quote with prev/next carousel.
export default function Quotes({ sec, ctx }) {
  const { F, C, mob, preview } = ctx;
  const p = sec.props;
  const { c, headFont, accCol, pad, h2Center } = baseStyles(sec, ctx);

  const items = p.items || [];
  const spot = sec.v === 'spot';
  const [idx, setIdx] = useState(0);

  const qGrid = 'margin-top:30px; display:grid; grid-template-columns:' + (mob ? '1fr' : '1fr 1fr 1fr') + '; gap:14px;';
  const card = 'padding:24px 22px; background:' + c.card + '; border:1px solid ' + c.line + '; border-radius:' + C.r + 'px; display:flex; flex-direction:column; gap:12px;';
  const stars = 'color:' + accCol + '; font-size:12px; letter-spacing:3px;';
  const txt = 'font-family:' + F.b + '; font-size:13.5px; line-height:1.65; flex:1; white-space:pre-wrap;';
  const who = 'font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + c.sub + ';';

  const len = Math.max(1, items.length);
  const qi = idx % len;
  const cur = items[qi] || { t: '', w: '' };
  const spotTxt = headFont + 'font-size:' + (mob ? 21 : 30) + 'px; line-height:1.38; margin-top:26px;';
  const spotWho = 'font-family:' + F.b + '; font-size:13px; font-weight:700; color:' + c.sub + '; margin-top:18px;';
  const qArrow = 'width:38px; height:38px; border-radius:99px; border:1.5px solid ' + c.line + '; color:' + c.fg + '; display:flex; align-items:center; justify-content:center; cursor:pointer;';
  const qCount = 'font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + '; display:flex; align-items:center; min-width:40px; justify-content:center; font-variant-numeric:tabular-nums;';

  const step = (d) => (e) => { e.stopPropagation(); setIdx((qi + d + len) % len); };

  return (
    <div style={sx(pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={h2Center} preview={preview} />
      {!spot && (
        <div style={sx(qGrid)}>
          {items.map((q, i) => (
            <div key={i} style={sx(card)}>
              <div style={sx(stars)}>★★★★★</div>
              <Editable secId={sec.id} k={['items', i, 't']} value={q.t} style={txt} multiline preview={preview} />
              <Editable secId={sec.id} k={['items', i, 'w']} value={q.w} style={who} preview={preview} />
            </div>
          ))}
        </div>
      )}
      {spot && (
        <div style={{ maxWidth: 660, margin: '0 auto', textAlign: 'center' }}>
          <div style={sx(spotTxt)}>“{cur.t}”</div>
          <div style={sx(spotWho)}>{cur.w}</div>
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 8 }}>
            <div onClick={step(-1)} style={sx(qArrow)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6l-6 6 6 6" /></svg>
            </div>
            <div style={sx(qCount)}>{(qi + 1) + ' / ' + len}</div>
            <div onClick={step(1)} style={sx(qArrow)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
