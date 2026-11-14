'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';
import { priceWords, durationWords, pickServices } from '../servicesText';
import { act, cardLook, colsOf, itemsOf, subStyle } from './kit';

// Courses & batches (W3): a coaching centre's courses — fee, how long, the
// batch times and a note — each with the enrol button.
//
// Layouts: cards, list.
// Where the courses come from (`from`):
//   own (the default) — typed here, with the batch times in the owner's words
//   all / cat / picks — the store's own services (pickServices): the name, the
//     live fee, the length and the description, and the button books that
//     service. A fee changed on the Services page changes the website.
// Look: 2 to 4 columns, and the card as a box, an outline or plain.

export default function Course({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview } = ctx;
  const p = sec.props;
  const tx = siteText(ctx.theme?.lang);
  const live = ['all', 'cat', 'picks'].includes(p.from);
  const services = live ? pickServices((ctx.cat && ctx.cat.services) || [], p) : [];
  const items = live
    ? services.map((sv) => ({ k: sv.id, n: sv.name, fee: priceWords(sv, tx), dur: durationWords(sv.durationMin, tx) || '', time: sv.category || '', note: sv.description || '', sv }))
    : itemsOf(p);
  const list = sec.v === 'list';
  const cols = colsOf(p.cols, Math.min(3, Math.max(1, items.length)), mob);
  const meta = 'font-family:' + F.b + '; font-size:13.5px; color:' + c.sub + '; margin-top:6px; white-space:pre-wrap;';
  const fee = s.headFont + 'font-size:' + s.hz(mob ? 22 : 26) + 'px; margin-top:12px;';
  const small = 'display:inline-flex; align-items:center; padding:10px 18px; border-radius:' + C.btn + '; background:' + s.B.bg + '; color:' + s.B.fg + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap;';
  // Live rows are the service's own words: read here, edited on the Services page.
  const ed = (i, k, style, multi) => (live
    ? (items[i][k] ? <div style={sx(style)}>{items[i][k]}</div> : null)
    : <Editable secId={sec.id} k={['items', i, k]} value={items[i][k]} style={style} multiline={multi} preview={preview} />);
  const click = (it) => (it.sv && preview
    ? (ev) => { ev.stopPropagation(); if (ctx.onServiceAction) ctx.onServiceAction(it.sv); else if (ctx.onService) ctx.onService(it.sv); }
    : act(ctx, p.to));
  return (
    <div style={sx(s.pad)}>
      <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub} style={subStyle(F, c, mob)} multiline preview={preview} />
      {live && !items.length && !ctx.isPublic ? <div data-course-empty style={sx('margin-top:22px; padding:22px; border-radius:' + C.r + 'px; border:1.5px dashed ' + c.line + '; font-family:' + F.b + '; font-size:13.5px; color:' + c.sub + ';')}>{tx('svc.none')}</div> : null}
      <div data-course-from={live ? 'services' : 'own'} style={sx('margin-top:' + (mob ? 22 : 32) + 'px; display:grid; gap:' + (list ? 0 : 16) + 'px; grid-template-columns:' + (list ? '1fr' : 'repeat(' + cols + ', minmax(0,1fr))') + ';')}>
        {items.map((it, i) => (
          <div key={it.k} data-course style={sx(list
            ? 'display:flex; gap:16px; align-items:' + (mob ? 'flex-start' : 'center') + '; padding:18px 0; border-top:1px solid ' + c.line + ';' + (mob ? 'flex-direction:column;' : '')
            : 'display:flex; flex-direction:column;' + cardLook(p.card, { C, c, s }, 'padding:22px;'))}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {ed(i, 'n', s.headFont + 'font-size:' + s.hz(mob ? 18 : 20) + 'px; line-height:1.25;')}
              {list ? null : ed(i, 'fee', fee)}
              {ed(i, 'dur', meta)}
              {ed(i, 'time', meta)}
              {ed(i, 'note', meta + 'margin-top:10px; font-size:13px;', true)}
            </div>
            {list ? ed(i, 'fee', 'font-family:' + F.b + '; font-size:16px; font-weight:700; white-space:nowrap;') : null}
            <div style={{ marginTop: list ? 0 : 18, display: 'flex' }}>
              <div data-course-btn onClick={click(it)} style={sx(small)}>
                <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
