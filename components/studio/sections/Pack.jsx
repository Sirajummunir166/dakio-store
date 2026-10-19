'use client';
import { baseStyles, blockStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';
import { act, itemsOf, linesOf, subStyle } from './kit';

// Packages (W3): two to four price tiers with what each includes (one line
// per item) — Bridal / Holud / Reception, Basic / Full / Premium. A package
// marked `hi` stands out as the most chosen. The button follows the
// section's link, else the business's main action.

const Tick = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}><path d="M5 12l5 5L20 7" /></svg>;

export default function Pack({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const b = blockStyles(sec, ctx, s);
  const { c } = s;
  const { P, F, C, mob, preview } = ctx;
  const p = sec.props;
  const tx = siteText(ctx.theme?.lang);
  const items = itemsOf(p);
  const cols = mob ? 1 : Math.min(4, Math.max(1, items.length));
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      <div style={sx('margin-top:' + (mob ? 22 : 32) + 'px; display:grid; gap:16px; align-items:stretch; grid-template-columns:repeat(' + cols + ', minmax(0,1fr));')}>
        {items.map((it, i) => {
          const hi = it.hi === true;
          return (
            <div key={it.k} data-package style={sx('position:relative; display:flex; flex-direction:column; padding:' + (mob ? '22px 20px' : '28px 24px') + '; border-radius:' + C.r + 'px; background:' + c.card + '; border:' + (hi ? '2px solid ' + P.accent : '1px solid ' + c.line) + ';' + s.sh)}>
              {hi ? <div style={sx(b.badge + 'position:absolute; top:-12px; left:20px;')}>{tx('pack.popular')}</div> : null}
              <Editable secId={sec.id} k={['items', i, 'n']} value={it.n} style={'font-family:' + F.b + '; font-size:13px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:' + c.sub + ';'} preview={preview} />
              <Editable secId={sec.id} k={['items', i, 'price']} value={it.price} style={s.headFont + 'font-size:' + s.hz(mob ? 26 : 32) + 'px; margin-top:10px;'} preview={preview} />
              {preview ? (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                  {linesOf(it.inc).map((line, li) => (
                    <div key={li} style={{ display: 'flex', gap: 9, fontFamily: F.b, fontSize: 14, lineHeight: 1.45 }}><Tick />{line}</div>
                  ))}
                </div>
              ) : (
                <Editable secId={sec.id} k={['items', i, 'inc']} value={it.inc} multiline preview={false} style={'font-family:' + F.b + '; font-size:14px; line-height:1.75; margin-top:16px; white-space:pre-wrap; flex:1;'} />
              )}
              <div style={{ marginTop: 20, display: 'flex' }}>
                <div onClick={act(ctx, p.to)} style={sx(hi ? s.btn : s.btnGhost)}>
                  <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
