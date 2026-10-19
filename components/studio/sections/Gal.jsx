'use client';
import { useState } from 'react';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { siteText } from '../siteText';
import { itemsOf, subStyle } from './kit';

// Gallery / portfolio (W3). Variants:
//   grid  — a photo grid with captions (bridal looks, finished rooms)
//   ba    — before and after: drag the line across (salon, repair, interior)
//   proj  — project cards: photo, title, a line (area, budget band)
// Photos are image slots keyed by the item's stable key, so removing one
// never moves another's picture.

function BeforeAfter({ slot, assets, preview, tx, c, F, radius }) {
  const [x, setX] = useState(50);
  const lbl = (t, side) => <div style={{ position: 'absolute', top: 10, [side]: 10, padding: '4px 10px', borderRadius: 99, background: 'rgba(10,11,8,0.6)', color: '#fff', fontFamily: F.b, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{t}</div>;
  if (!preview) {
    // Editing: both photos side by side, so each can be uploaded and cropped.
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[['a', tx('gal.before')], ['b', tx('gal.after')]].map(([k, t]) => (
          <div key={k} style={{ position: 'relative', aspectRatio: '4/5', borderRadius: radius, overflow: 'hidden', background: c.card }}>
            <ImageSlot slotId={slot + '-' + k} assets={assets} fit="cover" placeholder={t} preview={false} aspect="4/5" hint="Same angle for both" />
            {lbl(t, 'left')}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: radius, overflow: 'hidden', background: c.card, touchAction: 'pan-y' }}>
      <ImageSlot slotId={slot + '-b'} assets={assets} fit="cover" preview />
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - x}% 0 0)` }}>
        <ImageSlot slotId={slot + '-a'} assets={assets} fit="cover" preview />
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: x + '%', width: 2, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)', pointerEvents: 'none' }} />
      {lbl(tx('gal.before'), 'left')}
      {lbl(tx('gal.after'), 'right')}
      <input type="range" min={0} max={100} value={x} onChange={(e) => setX(Number(e.target.value))} aria-label={tx('gal.before') + ' / ' + tx('gal.after')}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize', margin: 0 }} />
    </div>
  );
}

export default function Gal({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview, assets } = ctx;
  const p = sec.props;
  const tx = siteText(ctx.theme?.lang);
  const items = itemsOf(p);
  const v = sec.v || 'grid';
  const cols = v === 'ba' ? (mob ? 1 : 2) : (mob ? 2 : 3);
  const slot = (it) => 'st-gal-' + sec.id + '-' + it.k;
  const cap = 'font-family:' + F.b + '; font-size:13.5px; font-weight:600; margin-top:10px;';
  const meta = 'font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + '; margin-top:3px;';
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      <div style={sx('margin-top:' + (mob ? 22 : 32) + 'px; display:grid; gap:' + (mob ? 10 : 18) + 'px; grid-template-columns:repeat(' + cols + ', minmax(0,1fr));')}>
        {items.map((it, i) => (
          <div key={it.k} data-gal-item style={{ minWidth: 0 }}>
            {v === 'ba' ? (
              <BeforeAfter slot={slot(it)} assets={assets} preview={preview} tx={tx} c={c} F={F} radius={C.r} />
            ) : (
              <div style={{ position: 'relative', aspectRatio: v === 'proj' ? '4/3' : '1/1', borderRadius: C.r, overflow: 'hidden', background: c.card }}>
                <ImageSlot slotId={slot(it)} assets={assets} fit="cover" placeholder={v === 'proj' ? 'Project photo' : 'Photo'} preview={preview} aspect={v === 'proj' ? '4/3' : '1/1'} hint="Your own work, well lit" />
              </div>
            )}
            {(it.t || !preview) ? <Editable secId={sec.id} k={['items', i, 't']} value={it.t} style={cap} preview={preview} /> : null}
            {v !== 'grid' && (it.m || !preview) ? <Editable secId={sec.id} k={['items', i, 'm']} value={it.m} style={meta} preview={preview} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
