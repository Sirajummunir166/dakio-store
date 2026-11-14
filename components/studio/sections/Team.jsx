'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { colsOf, itemsOf, oneOf, subStyle } from './kit';

// Team (W3): the people a client meets — a doctor, the stylists, the
// teachers — with a photo, a role and what they are good at.
//
// Layouts: grid (portrait photos), round (round photos, centred words),
// list (a small photo beside the words, one person under another).
// Shows: the role and the line about them, each on or off. Look: 2 to 4
// columns (grid and round).

export default function Team({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview, assets } = ctx;
  const p = sec.props;
  const items = itemsOf(p);
  const v = oneOf(sec.v, ['grid', 'round', 'list']);
  const cols = v === 'list' ? (mob ? 1 : 2) : colsOf(p.cols, Math.min(4, Math.max(2, items.length)), mob, 2);
  const role = p.role !== false;
  const bio = p.bio !== false;
  const slot = (it) => 'st-team-' + sec.id + '-' + it.k;
  const nameStyle = s.headFont + 'font-size:' + s.hz(mob ? 15 : 17) + 'px;';
  const roleStyle = 'font-family:' + F.b + '; font-size:12.5px; font-weight:700; letter-spacing:0.4px; color:' + c.sub + '; margin-top:3px;';
  const bioStyle = 'font-family:' + F.b + '; font-size:13px; line-height:1.5; color:' + c.sub + '; margin-top:6px; white-space:pre-wrap;';
  const words = (it, i, top) => (
    <>
      <Editable secId={sec.id} k={['items', i, 'n']} value={it.n} style={nameStyle + (top ? 'margin-top:' + top + 'px;' : '')} preview={preview} />
      {role ? <Editable secId={sec.id} k={['items', i, 'r']} value={it.r} style={roleStyle} preview={preview} /> : null}
      {bio && (it.x || !preview) ? <Editable secId={sec.id} k={['items', i, 'x']} value={it.x} style={bioStyle} multiline preview={preview} /> : null}
    </>
  );
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      <div data-team-layout={v} style={sx('margin-top:' + (mob ? 22 : 32) + 'px; display:grid; gap:' + (mob ? 14 : 22) + 'px; grid-template-columns:repeat(' + cols + ', minmax(0,1fr));')}>
        {items.map((it, i) => {
          if (v === 'list') {
            return (
              <div key={it.k} data-team-member style={sx('display:flex; gap:16px; align-items:flex-start; min-width:0; padding:16px 0; border-top:1px solid ' + c.line + ';')}>
                <div style={{ position: 'relative', width: mob ? 72 : 88, height: mob ? 72 : 88, borderRadius: Math.min(C.r, 18), overflow: 'hidden', background: c.card, flexShrink: 0 }}>
                  <ImageSlot slotId={slot(it)} assets={assets} fit="cover" placeholder="Photo" preview={preview} aspect="1/1" hint="Head and shoulders" />
                </div>
                <div style={{ minWidth: 0 }}>{words(it, i, 0)}</div>
              </div>
            );
          }
          if (v === 'round') {
            return (
              <div key={it.k} data-team-member style={{ minWidth: 0, textAlign: 'center' }}>
                <div style={{ position: 'relative', aspectRatio: '1/1', width: '72%', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', background: c.card }}>
                  <ImageSlot slotId={slot(it)} assets={assets} fit="cover" placeholder="Photo" preview={preview} aspect="1/1" hint="Head and shoulders, plain background" />
                </div>
                {words(it, i, 14)}
              </div>
            );
          }
          return (
            <div key={it.k} data-team-member style={{ minWidth: 0 }}>
              <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: C.r, overflow: 'hidden', background: c.card }}>
                <ImageSlot slotId={slot(it)} assets={assets} fit="cover" placeholder="Portrait" preview={preview} aspect="4/5" hint="Head and shoulders, plain background" />
              </div>
              {words(it, i, 12)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
