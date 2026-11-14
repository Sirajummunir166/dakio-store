'use client';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';
import BookingFlow from '../booking/BookingFlow';
import { pickServices, serviceOf } from '../servicesText';
import { cardLook, oneOf } from './kit';

// The Booking section (DAKIO_SERVICES_WEBSITE_PLAN.md W2): booking inline on
// any page — the same flow as the /book page.
//
// Layouts: std (words, then the booking under them), split (words on the
// left, the booking on the right), card (the booking in a box, centred).
// Which services: all, one category or hand-picked (pickServices) — a page
// about bridal work books only bridal services. `props.svc` starts it on one
// service (its id), else the client picks. `note` is a small line under the
// words (what to bring, the advance).

export default function Book({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview } = ctx;
  const p = sec.props;
  const tx = siteText(ctx.theme?.lang);
  const v = oneOf(sec.v, ['std', 'split', 'card']);
  const every = (ctx.cat && ctx.cat.services) || [];
  const limited = p.from === 'cat' || p.from === 'picks';
  const list = limited ? pickServices(every, p) : every;
  const start = serviceOf(list, p.svc);
  const sub = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:10px; max-width:560px; white-space:pre-wrap;';
  const note = 'font-family:' + F.b + '; font-size:13px; line-height:1.55; color:' + c.sub + '; margin-top:14px; max-width:520px; white-space:pre-wrap;';
  const words = (
    <div style={{ minWidth: 0, ...(v === 'card' && !mob ? { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' } : {}) }}>
      <Editable secId={sec.id} k="head" value={p.head ?? tx('book.title')} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub ?? tx('book.sub')} style={sub} multiline preview={preview} />
      {(p.note || !preview) && p.noteOn !== false ? <Editable secId={sec.id} k="note" value={p.note} style={note} multiline preview={preview} /> : null}
    </div>
  );
  const flow = <BookingFlow ctx={ctx} c={c} s={s} initialService={start ? start.id : null} only={limited ? list : null} />;
  if (v === 'split' && !mob) {
    return (
      <div style={sx(s.pad)}>
        <div data-book-layout="split" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 56, alignItems: 'start' }}>
          {words}
          <div style={{ minWidth: 0 }}>{flow}</div>
        </div>
      </div>
    );
  }
  if (v === 'card') {
    return (
      <div style={sx(s.pad)}>
        <div data-book-layout="card" style={sx('max-width:720px; margin:0 auto;' + cardLook('box', { C, c, s }, 'padding:' + (mob ? '22px 18px' : '36px 40px') + ';'))}>
          {words}
          <div style={{ marginTop: mob ? 20 : 26, display: 'flex', justifyContent: 'center' }}><div style={{ width: '100%', maxWidth: 640 }}>{flow}</div></div>
        </div>
      </div>
    );
  }
  return (
    <div style={sx(s.pad)}>
      {words}
      <div data-book-layout={v} style={{ marginTop: mob ? 22 : 30 }}>{flow}</div>
    </div>
  );
}
