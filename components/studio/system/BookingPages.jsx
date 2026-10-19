'use client';
// The booking system pages (DAKIO_SERVICES_WEBSITE_PLAN.md W2):
//   /book        the booking page — the link a business shares ("book here")
//   /enquire     the enquiry form as a page
//   /b/<token>   the client's booking: its status, the time, how to reach the business
// Rendered inside the store's own site (header, footer, theme).
import Book from '../sections/Book';
import Enq from '../sections/Enq';
import { baseStyles, sx } from '../theme';
import { siteText } from '../siteText';
import { dayWords, timeWords } from '../booking/bookingText';
import { headerWords } from '../SiteHeaderParts';

export function BookPage({ ctx, service = null }) {
  const props = { bg: 'base', sp: 'normal', svc: service || 'any' };
  return <Book sec={{ id: 'sys-book', type: 'book', props }} ctx={ctx} />;
}

export function EnquirePage({ ctx, service = null }) {
  return <Enq sec={{ id: 'sys-enquire', type: 'enq', props: { bg: 'base', sp: 'normal' } }} ctx={ctx} initialService={service} />;
}

const TONE = { requested: '#B7791F', confirmed: '#2F855A', cancelled: '#B03A2E', done: '#2F855A', no_show: '#6B6B6B' };

export function BookingStatusPage({ ctx, booking, store, phoneDigits = null, pay = null, calendar = null }) {
  const sec = { id: 'sys-booking', type: 'book', props: { bg: 'base', sp: 'normal' } };
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob } = ctx;
  const lang = ctx.theme?.lang;
  const tx = siteText(lang);
  if (!booking) return <div style={sx(s.padNarrow + 'font-family:' + F.b + '; color:' + c.sub + ';')}>{tx('bstatus.gone')}</div>;
  const st = TONE[booking.status] ? booking.status : 'requested';
  const storeName = (store && store.name) || '';
  const row = (k, v) => (v ? (
    <div style={sx('display:flex; justify-content:space-between; gap:12px; padding:14px 0; border-top:1px solid ' + c.line + '; font-family:' + F.b + '; font-size:14.5px;')}>
      <span style={{ color: c.sub }}>{k}</span><span style={{ fontWeight: 700, textAlign: 'right' }}>{v}</span>
    </div>
  ) : null);
  const when = [dayWords(booking.date, lang), timeWords(booking.time, lang)].filter(Boolean).join(', ');
  const btn2 = 'display:inline-flex; align-items:center; padding:' + (mob ? '11px 18px' : '12px 22px') + '; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; color:' + c.fg + '; font-family:' + F.b + '; font-weight:600; font-size:14px; text-decoration:none;';
  return (
    <div data-booking-status={st} style={sx(s.padNarrow)}>
      <div style={sx('padding:' + (mob ? '22px 18px' : '30px 30px') + '; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';')}>
        <div style={sx('display:inline-flex; align-items:center; gap:8px; font-family:' + F.b + '; font-size:12px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:' + TONE[st] + ';')}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: TONE[st], display: 'inline-block' }} />{tx('bstatus.' + st + '.t')}
        </div>
        <h1 style={sx(s.h2 + 'margin:12px 0 0;')}>{booking.title}</h1>
        <div style={sx('font-family:' + F.b + '; font-size:14.5px; line-height:1.6; color:' + c.sub + '; margin-top:10px;')}>{tx('bstatus.' + st + '.s', { store: storeName })}</div>
        <div style={{ marginTop: 18 }}>
          {row(tx('bstatus.when'), when)}
          {row(tx('bstatus.who'), booking.name)}
        </div>
        <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {phoneDigits ? <a href={`tel:+${phoneDigits}`} style={sx(s.btn + 'text-decoration:none;')}>{headerWords(lang).call}</a> : null}
          {phoneDigits ? <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener" style={sx(btn2)}>{tx('form.whatsapp')}</a> : null}
          {st === 'cancelled' || st === 'done' || st === 'no_show' ? <a href={ctx.bookHref ? ctx.bookHref() : '#'} style={sx(btn2)}>{tx('bstatus.again')}</a> : null}
        </div>
        {calendar ? (
          // Add to my calendar (DAKIO_ONE_PLACE_PLAN.md C3): Google's link, and an .ics file for iPhone and the rest.
          <div data-booking-calendar style={sx('margin-top:18px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; font-family:' + F.b + ';')}>
            <span style={sx('font-size:13px; color:' + c.sub + '; margin-right:2px;')}>{tx('bstatus.addCal')}</span>
            <a href={calendar.google} target="_blank" rel="noopener" style={sx(btn2 + 'padding:9px 16px; font-size:13.5px;')}>Google</a>
            <a href={calendar.ics} style={sx(btn2 + 'padding:9px 16px; font-size:13.5px;')}>{tx('bstatus.addCalOther')}</a>
          </div>
        ) : null}
        {pay ? (
          // The store's own payment instructions (owner pick: no payment at booking yet).
          <div data-booking-pay style={sx('margin-top:22px; padding:16px 18px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px dashed ' + c.line + '; font-family:' + F.b + ';')}>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>{tx('bstatus.pay')}</div>
            <div style={sx('font-size:13px; color:' + c.sub + '; margin-top:4px;')}>{tx('bstatus.paySub')}</div>
            {pay.bkash ? row(tx('bstatus.bkash', { kind: tx('bstatus.kind.' + pay.bkashKind) }), pay.bkash) : null}
            {pay.nagad ? row(tx('bstatus.nagad', { kind: tx('bstatus.kind.' + pay.nagadKind) }), pay.nagad) : null}
            {pay.bank ? <div style={sx('padding-top:12px; border-top:1px solid ' + c.line + '; margin-top:12px; font-size:13.5px; white-space:pre-wrap;')}><span style={{ color: c.sub }}>{tx('bstatus.bank')}: </span>{pay.bank}</div> : null}
            {pay.note ? <div style={sx('font-size:13px; color:' + c.sub + '; margin-top:10px; white-space:pre-wrap;')}>{pay.note}</div> : null}
          </div>
        ) : null}
        <div style={sx('font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + '; margin-top:18px;')}>{tx('bstatus.keep')}</div>
      </div>
    </div>
  );
}
