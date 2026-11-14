'use client';
import { baseStyles, blockStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';
import { priceWords, serviceOf } from '../servicesText';
import { act, itemsOf, linesOf, oneOf, subStyle } from './kit';

// Packages (W3): two to four price tiers with what each includes (one line
// per item) — Bridal / Holud / Reception, Basic / Full / Premium. A package
// marked `hi` stands out as the most chosen.
//
// Layouts: cards (side by side), rows (one under another, the price on the
// right — reads well on a phone and for long lists of what is included).
// A package can be tied to one of the store's services (`svc`, its id): its
// price is then the service's live price and its button books that service.
// Untied, the price is the words typed here and the button follows the
// section's link, else the business's main action.
// Look: the most chosen package as an outline (`line`) or filled (`fill`).

const Tick = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}><path d="M5 12l5 5L20 7" /></svg>;

export default function Pack({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const b = blockStyles(sec, ctx, s);
  const { c } = s;
  const { P, F, C, mob, preview } = ctx;
  const p = sec.props;
  const tx = siteText(ctx.theme?.lang);
  const items = itemsOf(p);
  const services = (ctx.cat && ctx.cat.services) || [];
  const v = oneOf(sec.v, ['cards', 'rows']);
  const fill = p.hiLook === 'fill';
  const cols = mob ? 1 : Math.min(4, Math.max(1, items.length));
  const click = (sv) => (sv && preview
    ? (ev) => { ev.stopPropagation(); if (ctx.onServiceAction) ctx.onServiceAction(sv); else if (ctx.onService) ctx.onService(sv); }
    : act(ctx, p.to));
  const price = (it, i, sv, style) => (sv
    ? <div data-pack-live style={sx(style)}>{priceWords(sv, tx)}</div>
    : <Editable secId={sec.id} k={['items', i, 'price']} value={it.price} style={style} preview={preview} />);
  const included = (it, i, grow) => (preview ? (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9, ...(grow ? { flex: 1 } : {}) }}>
      {linesOf(it.inc).map((line, li) => (
        <div key={li} style={{ display: 'flex', gap: 9, fontFamily: F.b, fontSize: 14, lineHeight: 1.45 }}>{p.ticks === false ? null : <Tick />}{line}</div>
      ))}
    </div>
  ) : (
    <Editable secId={sec.id} k={['items', i, 'inc']} value={it.inc} multiline preview={false} style={'font-family:' + F.b + '; font-size:14px; line-height:1.75; margin-top:16px; white-space:pre-wrap;' + (grow ? ' flex:1;' : '')} />
  ));
  const nameStyle = (hi) => 'font-family:' + F.b + '; font-size:13px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:' + (hi && fill ? P.accentInk : c.sub) + ';';
  const frame = (hi) => (hi && fill
    ? 'background:' + P.accent + '; color:' + P.accentInk + '; border:2px solid ' + P.accent + ';'
    : 'background:' + c.card + '; border:' + (hi ? '2px solid ' + P.accent : '1px solid ' + c.line) + ';');
  const button = (hi, sv) => (
    <div data-pack-btn onClick={click(sv)} style={sx(hi && !fill ? s.btn : hi ? s.btn + 'background:' + P.accentInk + '; color:' + P.accent + ';' : s.btnGhost)}>
      <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
    </div>
  );
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      <div data-pack-layout={v} style={sx('margin-top:' + (mob ? 22 : 32) + 'px; display:grid; gap:16px; align-items:stretch; grid-template-columns:' + (v === 'rows' ? '1fr' : 'repeat(' + cols + ', minmax(0,1fr))') + ';')}>
        {items.map((it, i) => {
          const hi = it.hi === true;
          const sv = serviceOf(services, it.svc);
          if (v === 'rows') {
            return (
              <div key={it.k} data-package style={sx('position:relative; display:flex; gap:' + (mob ? 14 : 28) + 'px; align-items:' + (mob ? 'stretch' : 'center') + '; padding:' + (mob ? '22px 20px' : '24px 28px') + '; border-radius:' + C.r + 'px;' + frame(hi) + s.sh + (mob ? 'flex-direction:column;' : ''))}>
                {hi ? <div style={sx(b.badge + 'position:absolute; top:-12px; left:20px;')}>{tx('pack.popular')}</div> : null}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Editable secId={sec.id} k={['items', i, 'n']} value={it.n} style={nameStyle(hi)} preview={preview} />
                  {included(it, i, false)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: mob ? 'flex-start' : 'flex-end', gap: 14, flexShrink: 0 }}>
                  {price(it, i, sv, s.headFont + 'font-size:' + s.hz(mob ? 24 : 28) + 'px;' + (hi && fill ? 'color:' + P.accentInk + ';' : ''))}
                  {button(hi, sv)}
                </div>
              </div>
            );
          }
          return (
            <div key={it.k} data-package style={sx('position:relative; display:flex; flex-direction:column; padding:' + (mob ? '22px 20px' : '28px 24px') + '; border-radius:' + C.r + 'px;' + frame(hi) + s.sh)}>
              {hi ? <div style={sx(b.badge + 'position:absolute; top:-12px; left:20px;')}>{tx('pack.popular')}</div> : null}
              <Editable secId={sec.id} k={['items', i, 'n']} value={it.n} style={nameStyle(hi)} preview={preview} />
              {price(it, i, sv, s.headFont + 'font-size:' + s.hz(mob ? 26 : 32) + 'px; margin-top:10px;' + (hi && fill ? 'color:' + P.accentInk + ';' : ''))}
              {included(it, i, true)}
              <div style={{ marginTop: 20, display: 'flex' }}>{button(hi, sv)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
