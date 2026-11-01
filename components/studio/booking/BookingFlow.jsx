'use client';
import { useEffect, useRef, useState } from 'react';
import { sx } from '../theme';
import { siteText } from '../siteText';
import { priceWords, durationWords } from '../servicesText';
import { dayWords, timeWords, dhakaToday, nextDate } from './bookingText';

// Booking on the store's own site (DAKIO_SERVICES_WEBSITE_PLAN.md W2): pick a
// service, a day and a free time, then a name and a mobile number. The free
// times come from the same slot rules Nova books with (GET /store/:slug/slots);
// the booking lands as *requested* unless the store confirms at once, and the
// client is sent to /b/<token> to see it.
//
// Live: ctx.getSlots(service, date) and ctx.book(body) talk to the API and
// ctx.onBooked(token) opens the status page. In the editor (no ctx.getSlots)
// it is a picture with sample times, so the owner sees the shape.

const SAMPLE_TIMES = ['10:00', '11:00', '12:00', '15:00', '16:30', '18:00'];

export default function BookingFlow({ ctx, c, s, initialService = null }) {
  const { F, C, mob } = ctx;
  const lang = ctx.theme?.lang;
  const tx = siteText(lang);
  const services = (ctx.cat && ctx.cat.services) || [];
  const live = typeof ctx.getSlots === 'function' && typeof ctx.book === 'function';
  const startSvc = initialService ? services.find((x) => x.slug === initialService || x.id === initialService) || null : (services.length === 1 ? services[0] : null);

  const [svc, setSvc] = useState(startSvc);
  const [slots, setSlots] = useState(null); // { asked, askedFree, days: [{ date, times }] }
  const [loading, setLoading] = useState(false);
  // The store's summary already says when it does not book online: no need to ask for times first.
  const [off, setOff] = useState(live && ctx.business ? !(ctx.business.booking && ctx.business.booking.on) : false);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [f, setF] = useState({ name: '', phone: '', note: '', website: '' });
  const [state, setState] = useState({ busy: false, err: null, done: false });
  const { today, tomorrow } = dhakaToday();

  // ctx is a new object every render: read it through a ref so loading runs once per service.
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const load = async (sv, date = null, append = false) => {
    if (!live || !sv) return;
    setLoading(true);
    const r = await ctxRef.current.getSlots(sv.slug || sv.id, date);
    setLoading(false);
    if (r.code === 'booking_off') { setOff(true); return; }
    if (!r.ok) { setState((st) => ({ ...st, err: tx('form.error') })); return; }
    setSlots((prev) => {
      if (!append || !prev) return r.data;
      const seen = new Set(prev.days.map((d) => d.date));
      return { ...r.data, days: [...prev.days, ...r.data.days.filter((d) => !seen.has(d.date))] };
    });
    if (!append) { setDay(r.data.days[0]?.date || null); setTime(null); }
  };

  const svcKey = svc ? svc.id : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (svc) load(svc); }, [svcKey]);

  const sample = { days: [today, tomorrow, nextDate(tomorrow)].map((d) => ({ date: d, times: SAMPLE_TIMES })) };
  const shown = live ? slots : sample;
  const dayRow = shown?.days.find((d) => d.date === day) || (live ? null : shown.days[0]);

  const send = async (ev) => {
    ev.preventDefault();
    if (!live) return;
    if (!svc) return setState({ busy: false, err: tx('book.pickService') });
    if (!day || !time) return setState({ busy: false, err: tx('book.pickTime') });
    if (!f.name.trim()) return setState({ busy: false, err: tx('form.needName') });
    if (!f.phone.trim()) return setState({ busy: false, err: tx('form.needReach') });
    setState({ busy: true, err: null });
    const r = await ctx.book({ service: svc.slug || svc.id, date: day, time, name: f.name, phone: f.phone, note: f.note, website: f.website });
    if (r.ok) {
      if (r.token && ctx.onBooked) { ctx.onBooked(r.token); return; }
      setState({ busy: false, err: null, done: true });
      return;
    }
    // A time that is taken, gone or outside the hours: say why in the site's language, show the free times again.
    if (['taken', 'past', 'closed'].includes(r.code)) { setState({ busy: false, err: tx('book.' + r.code) }); setTime(null); load(svc, day); return; }
    if (r.code === 'too_many') { setState({ busy: false, err: tx('book.tooMany') }); return; }
    if (r.code === 'booking_off') { setOff(true); setState({ busy: false, err: null }); return; }
    setState({ busy: false, err: r.field === 'phone' ? tx('form.badPhone') : r.field === 'name' ? tx('form.needName') : (r.error || tx('form.error')) });
  };

  const label = 'font-family:' + F.b + '; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; color:' + c.sub + '; margin:0 0 10px;';
  const box = 'padding:' + (mob ? '18px 16px' : '22px 24px') + '; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';';
  const chip = (on) => 'display:inline-flex; flex-direction:column; align-items:center; justify-content:center; min-width:' + (mob ? 74 : 86) + 'px; padding:10px 12px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + (on ? c.fg : c.line) + '; background:' + (on ? c.fg : 'transparent') + '; color:' + (on ? c.bg : c.fg) + '; font-family:' + F.b + '; font-size:13.5px; font-weight:700; cursor:pointer; white-space:nowrap; font-variant-numeric:tabular-nums;';
  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.bg + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:14px; outline:none; box-sizing:border-box;';
  const muted = 'font-family:' + F.b + '; font-size:13.5px; line-height:1.55; color:' + c.sub + ';';
  const stop = (fn) => (e) => { e.stopPropagation(); if (fn) fn(); };

  if (off) {
    return <div data-booking-off style={sx(box + muted)}>{tx('book.off')}</div>;
  }
  if (state.done) {
    return <div data-booking-sent style={sx(box + 'font-family:' + F.b + '; font-size:15px; line-height:1.5;')}>{tx('bstatus.requested.t')}</div>;
  }
  if (!services.length) {
    return <div style={sx(box + muted)}>{tx('svc.empty')}</div>;
  }

  return (
    <form data-booking onSubmit={send} noValidate style={sx('display:flex; flex-direction:column; gap:14px; max-width:640px;')}>
      {/* 1 — the service */}
      <div style={sx(box)}>
        <div style={sx(label)}>{tx('book.service')}</div>
        {svc ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={sx(s.headFont + 'font-size:17px; line-height:1.3;')}>{svc.name}</div>
              <div style={sx(muted + 'margin-top:3px;')}>{[priceWords(svc, tx), durationWords(svc.durationMin, tx)].filter(Boolean).join(' · ')}</div>
            </div>
            {services.length > 1 ? <button type="button" onClick={stop(() => { setSvc(null); setSlots(null); setDay(null); setTime(null); })} style={sx('background:none; border:none; padding:6px 0; color:' + c.fg + '; font-family:' + F.b + '; font-size:13px; font-weight:700; text-decoration:underline; cursor:pointer;')}>{tx('book.change')}</button> : null}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {services.map((sv, i) => (
              <div key={sv.id} data-book-service={sv.slug} onClick={stop(() => setSvc(sv))} role="button" tabIndex={0}
                style={sx('display:flex; justify-content:space-between; gap:12px; padding:13px 0; cursor:pointer; font-family:' + F.b + ';' + (i ? ' border-top:1px solid ' + c.line + ';' : ''))}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{sv.name}</span>
                <span style={sx(muted + 'white-space:nowrap;')}>{priceWords(sv, tx)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2 — the day and the time */}
      {svc || !live ? (
        <div style={sx(box)}>
          <div style={sx(label)}>{tx('book.day')}</div>
          {live && loading && !slots ? <div style={sx(muted)}>{tx('book.loading')}</div> : null}
          {live && slots && slots.asked && !slots.askedFree ? <div style={sx(muted + 'margin-bottom:10px;')}>{tx('book.full')}</div> : null}
          {shown && shown.days.length ? (
            <>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {shown.days.map((d) => (
                  <div key={d.date} data-book-day={d.date} onClick={stop(() => { setDay(d.date); setTime(null); })} style={sx(chip((dayRow && dayRow.date) === d.date))}>
                    {dayWords(d.date, lang, { today, tomorrow })}
                  </div>
                ))}
                {live ? (
                  <div onClick={stop(() => load(svc, nextDate(shown.days[shown.days.length - 1].date), true))} style={sx(chip(false) + 'font-weight:600; color:' + c.sub + ';')}>
                    {loading ? '…' : tx('book.later') + ' →'}
                  </div>
                ) : null}
              </div>
              <div style={sx(label + 'margin-top:18px;')}>{tx('book.time')}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(dayRow ? dayRow.times : []).map((t) => (
                  <div key={t} data-book-time={t} onClick={stop(() => setTime(t))} style={sx(chip(time === t))}>{timeWords(t, lang)}</div>
                ))}
              </div>
            </>
          ) : (live && slots ? <div style={sx(muted)}>{tx('book.none')}</div> : null)}
          {!live ? <div style={sx(muted + 'margin-top:12px; font-size:12px;')}>{tx('book.preview')}</div> : null}
        </div>
      ) : null}

      {/* 3 — who */}
      {(svc && time) || !live ? (
        <div style={sx(box + 'display:flex; flex-direction:column; gap:10px;')}>
          <div style={sx(label + 'margin:0;')}>{tx('book.you')}</div>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onClick={(e) => e.stopPropagation()} placeholder={tx('form.name')} autoComplete="name" style={sx(inp)} />
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} onClick={(e) => e.stopPropagation()} placeholder={tx('form.phone')} type="tel" inputMode="tel" autoComplete="tel" style={sx(inp)} />
          <textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} onClick={(e) => e.stopPropagation()} placeholder={tx('book.note')} rows={2} style={sx(inp + 'resize:vertical;')} />
          {/* People never see this; a bot that fills it is thanked and forgotten. */}
          <input name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
          {state.err ? <div role="alert" style={sx('font-family:' + F.b + '; font-size:13px; color:#B03A2E;')}>{state.err}</div> : null}
          <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <button type="submit" disabled={state.busy} onClick={(e) => e.stopPropagation()} style={{ ...sx(s.btn), border: 'none', cursor: state.busy ? 'default' : 'pointer', opacity: state.busy ? 0.7 : 1, fontFamily: 'inherit' }}>
              {state.busy ? tx('book.sending') : (ctx.business?.booking?.autoConfirm ? tx('book.submitNow') : tx('book.submit'))}
            </button>
            <div style={sx(muted + 'font-size:12.5px;')}>{tx('book.confirmNote')}</div>
          </div>
        </div>
      ) : null}
      {state.err && !(svc && time) ? <div role="alert" style={sx('font-family:' + F.b + '; font-size:13px; color:#B03A2E;')}>{state.err}</div> : null}
    </form>
  );
}
