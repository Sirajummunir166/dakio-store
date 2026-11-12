'use client';
import { useRef, useState } from 'react';
import { sx } from '../theme';
import { siteText } from '../siteText';
import { dayWords, timeWords, dhakaToday, nextDate } from './bookingText';

// The client changes their own booking from its page (/b/<token>): another
// time, or cancel it. The API decides what is still allowed (`booking.change`):
// until the store's minimum notice before the booking, after which the page
// says to call. A move offers only free times (GET /slots with `except`, so the
// booking's own time does not block half an hour later) and the server checks
// the pick again. After a change the page loads again with the new state.
//
// Live: ctx.getSlots(service, date, exceptToken) and ctx.changeBooking(token, action, body).
// Without them (the editor) nothing shows.

export default function BookingChange({ ctx, c, s, booking, token }) {
  const { F, C, mob } = ctx;
  const lang = ctx.theme?.lang;
  const tx = siteText(lang);
  const live = typeof ctx.changeBooking === 'function' && typeof ctx.getSlots === 'function' && !!token;
  const can = (booking && booking.change) || {};
  const [mode, setMode] = useState(null); // null | 'cancel' | 'move'
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [state, setState] = useState({ busy: false, err: null });
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const { today, tomorrow } = dhakaToday();

  if (!live || !booking || !['requested', 'confirmed'].includes(booking.status)) return null;

  const muted = 'font-family:' + F.b + '; font-size:13.5px; line-height:1.55; color:' + c.sub + ';';
  const btn2 = 'display:inline-flex; align-items:center; padding:' + (mob ? '10px 16px' : '10px 18px') + '; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; background:transparent; color:' + c.fg + '; font-family:' + F.b + '; font-weight:600; font-size:13.5px; cursor:pointer;';
  const chip = (on) => 'display:inline-flex; align-items:center; justify-content:center; min-width:' + (mob ? 74 : 86) + 'px; padding:10px 12px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + (on ? c.fg : c.line) + '; background:' + (on ? c.fg : 'transparent') + '; color:' + (on ? c.bg : c.fg) + '; font-family:' + F.b + '; font-size:13.5px; font-weight:700; cursor:pointer; white-space:nowrap; font-variant-numeric:tabular-nums;';
  const label = 'font-family:' + F.b + '; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; color:' + c.sub + '; margin:0 0 10px;';
  const panel = 'margin-top:14px; padding:16px 18px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + ';';
  const err = state.err ? <div role="alert" style={sx('font-family:' + F.b + '; font-size:13px; color:#B03A2E; margin-top:12px;')}>{state.err}</div> : null;

  // Too close to the time (or nothing left to change): say so, once, plainly.
  if (!can.cancel && !can.move) {
    return can.why === 'late' ? <div data-booking-change="late" style={sx(muted + 'margin-top:18px;')}>{tx('bstatus.late')}</div> : null;
  }

  const load = async (date = null, append = false) => {
    setLoading(true);
    const r = await ctxRef.current.getSlots(booking.service, date, token);
    setLoading(false);
    if (!r.ok) { setState({ busy: false, err: tx('form.error') }); return; }
    setSlots((prev) => {
      if (!append || !prev) return r.data;
      const seen = new Set(prev.days.map((d) => d.date));
      return { ...r.data, days: [...prev.days, ...r.data.days.filter((d) => !seen.has(d.date))] };
    });
    if (!append) { setDay(r.data.days[0]?.date || null); setTime(null); }
  };

  const open = (m) => {
    setState({ busy: false, err: null });
    setMode(m);
    // Start on the day it is booked for: most people want "a bit later the same day".
    if (m === 'move') { setSlots(null); load(booking.date); }
  };

  const failed = (r) => {
    const known = ['late', 'closed', 'taken', 'same', 'past'].includes(r.code);
    setState({ busy: false, err: known ? tx(r.code === 'taken' || r.code === 'same' ? 'book.taken' : r.code === 'late' ? 'bstatus.late' : 'bstatus.closed') : tx('form.error') });
    if (r.code === 'taken') { setTime(null); load(day); }
  };

  const cancel = async () => {
    setState({ busy: true, err: null });
    const r = await ctx.changeBooking(token, 'cancel');
    if (r.ok) { window.location.reload(); return; }
    failed(r);
  };

  const move = async () => {
    if (!day || !time) return setState({ busy: false, err: tx('book.pickTime') });
    setState({ busy: true, err: null });
    const r = await ctx.changeBooking(token, 'move', { date: day, time });
    if (r.ok) { window.location.reload(); return; }
    failed(r);
  };

  const dayRow = slots?.days.find((d) => d.date === day) || null;

  return (
    <div data-booking-change={mode || 'idle'} style={{ marginTop: 18 }}>
      {mode === null ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {can.move ? <button type="button" data-change-move onClick={() => open('move')} style={sx(btn2)}>{tx('bstatus.change')}</button> : null}
          {can.cancel ? <button type="button" data-change-cancel onClick={() => open('cancel')} style={sx(btn2 + 'color:#B03A2E;')}>{tx('bstatus.cancel')}</button> : null}
        </div>
      ) : null}

      {mode === 'cancel' ? (
        <div style={sx(panel)}>
          <div style={sx('font-family:' + F.b + '; font-size:15px; font-weight:700;')}>{tx('bstatus.cancelAsk')}</div>
          <div style={sx(muted + 'margin-top:4px;')}>{tx('bstatus.cancelSub')}</div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" data-change-cancel-yes disabled={state.busy} onClick={cancel} style={sx(btn2 + 'background:#B03A2E; border-color:#B03A2E; color:#fff;' + (state.busy ? ' opacity:0.7; cursor:default;' : ''))}>{state.busy ? tx('bstatus.cancelling') : tx('bstatus.cancelYes')}</button>
            <button type="button" disabled={state.busy} onClick={() => setMode(null)} style={sx(btn2)}>{tx('bstatus.keepIt')}</button>
          </div>
          {err}
        </div>
      ) : null}

      {mode === 'move' ? (
        <div style={sx(panel)}>
          <div style={sx(label)}>{tx('bstatus.pickNew')}</div>
          {loading && !slots ? <div style={sx(muted)}>{tx('book.loading')}</div> : null}
          {slots && slots.days.length ? (
            <>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {slots.days.map((d) => (
                  <div key={d.date} data-move-day={d.date} role="button" tabIndex={0} onClick={() => { setDay(d.date); setTime(null); }} style={sx(chip(day === d.date))}>
                    {dayWords(d.date, lang, { today, tomorrow })}
                  </div>
                ))}
                <div role="button" tabIndex={0} onClick={() => load(nextDate(slots.days[slots.days.length - 1].date), true)} style={sx(chip(false) + 'font-weight:600; color:' + c.sub + ';')}>
                  {loading ? '…' : tx('book.later') + ' →'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                {(dayRow ? dayRow.times : []).map((t) => (
                  <div key={t} data-move-time={t} role="button" tabIndex={0} onClick={() => setTime(t)} style={sx(chip(time === t))}>{timeWords(t, lang)}</div>
                ))}
              </div>
            </>
          ) : (slots ? <div style={sx(muted)}>{tx('book.none')}</div> : null)}
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" data-change-move-yes disabled={state.busy || !time} onClick={move} style={{ ...sx(s.btn), border: 'none', cursor: state.busy || !time ? 'default' : 'pointer', opacity: state.busy || !time ? 0.55 : 1, fontFamily: 'inherit' }}>{state.busy ? tx('bstatus.moving') : tx('bstatus.moveTo')}</button>
            <button type="button" disabled={state.busy} onClick={() => setMode(null)} style={sx(btn2)}>{tx('bstatus.back')}</button>
          </div>
          {err}
        </div>
      ) : null}
    </div>
  );
}
