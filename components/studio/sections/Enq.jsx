'use client';
import { useState } from 'react';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';
import { pickServices } from '../servicesText';
import { cardLook, linesOf, oneOf } from './kit';

// The Enquiry section (DAKIO_SERVICES_WEBSITE_PLAN.md W2): "what do you need?"
// with the service it is about. It sends through ctx.submitEnquiry (POST
// /store/:slug/enquiries) — a contact, a timeline line and, for a services
// store, a deal titled and valued by the service. In the editor it is a picture.
// `initialService` (an id or a website address) starts it on one service.
//
// Layouts: std (a narrow form), split (words and a few reassuring points on
// the left, the form on the right), card (the form in a box, centred).
// Which services the list offers: all, one category or hand-picked
// (pickServices); `ask` off hides the list and the form is about `svc` or
// nothing in particular.

export default function Enq({ sec, ctx, initialService = null }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { F, C, mob, preview } = ctx;
  const p = sec.props;
  const tx = siteText(ctx.theme?.lang);
  const every = (ctx.cat && ctx.cat.services) || [];
  const services = p.from === 'cat' || p.from === 'picks' ? pickServices(every, p) : every;
  const v = oneOf(sec.v, ['std', 'split', 'card']);
  const ask = p.ask !== false;
  const points = linesOf(p.points);
  const live = typeof ctx.submitEnquiry === 'function';
  const start = initialService || (p.svc && p.svc !== 'any' ? p.svc : null);
  const first = start ? every.find((x) => x.id === start || x.slug === start) : null;
  const [f, setF] = useState({ name: '', phone: '', message: '', serviceId: first ? first.id : '', website: '' });
  const [state, setState] = useState({ busy: false, done: false, err: null });

  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.card + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:14px; outline:none; box-sizing:border-box;';
  const sub = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:10px; max-width:560px; white-space:pre-wrap;';
  const lbl = 'font-family:' + F.b + '; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; color:' + c.sub + '; margin-top:6px;';

  const send = async (ev) => {
    ev.preventDefault();
    if (!live) return;
    if (!f.name.trim()) return setState({ busy: false, done: false, err: tx('form.needName') });
    if (!f.phone.trim()) return setState({ busy: false, done: false, err: tx('form.needReach') });
    setState({ busy: true, done: false, err: null });
    const r = await ctx.submitEnquiry({ name: f.name, phone: f.phone, message: f.message, serviceId: f.serviceId || undefined, website: f.website, form: 'enquiry' });
    if (r.ok) setState({ busy: false, done: true, err: null });
    else setState({ busy: false, done: false, err: r.field === 'phone' ? tx('form.badPhone') : r.field === 'name' ? tx('form.needName') : (r.error || tx('form.error')) });
  };
  const stop = (e) => e.stopPropagation();

  const form = (
    <>
        {state.done ? (
          <div data-enquiry-sent style={sx('margin-top:26px; padding:16px 18px; border-radius:' + Math.min(C.rs, 14) + 'px; background:' + c.card + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:14.5px; line-height:1.5;')}>{tx('form.sent')}</div>
        ) : (
          <form data-enquiry onSubmit={send} noValidate style={sx('margin-top:26px; display:flex; flex-direction:column; gap:10px;')}>
            {ask && services.length ? (
              <>
                <div style={sx(lbl)}>{tx('enq.service')}</div>
                <select value={f.serviceId} onChange={(e) => setF({ ...f, serviceId: e.target.value })} onClick={stop} style={sx(inp + 'appearance:auto;')}>
                  <option value="">{tx('enq.anyService')}</option>
                  {services.map((sv) => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
                </select>
              </>
            ) : null}
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onClick={stop} placeholder={tx('form.name')} autoComplete="name" style={sx(inp)} />
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} onClick={stop} placeholder={tx('form.phone')} type="tel" inputMode="tel" autoComplete="tel" style={sx(inp)} />
            <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} onClick={stop} placeholder={tx('form.message')} rows={4} style={sx(inp + 'resize:vertical;')} />
            {/* People never see this; a bot that fills it is thanked and forgotten. */}
            <input name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
            {state.err ? <div role="alert" style={sx('font-family:' + F.b + '; font-size:13px; color:#B03A2E;')}>{state.err}</div> : null}
            <div style={{ marginTop: 4, display: 'flex' }}>
              <button type="submit" disabled={state.busy || !live} onClick={stop} style={{ ...sx(s.btn), border: 'none', cursor: state.busy ? 'default' : 'pointer', opacity: state.busy ? 0.7 : 1, fontFamily: 'inherit' }}>
                {state.busy ? tx('form.sending') : (p.btn || tx('enq.send'))}
              </button>
            </div>
          </form>
        )}
    </>
  );
  const tick = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}><path d="M5 12l5 5L20 7" /></svg>;
  const words = (
    <>
      <Editable secId={sec.id} k="head" value={p.head ?? tx('enq.title')} style={s.h2} preview={preview} />
      <Editable secId={sec.id} k="sub" value={p.sub ?? tx('enq.sub')} style={sub} multiline preview={preview} />
    </>
  );
  if (v === 'split' && !mob) {
    return (
      <div style={sx(s.pad)}>
        <div data-enq-layout="split" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 56, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            {words}
            {preview ? (
              points.length ? <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>{points.map((x, i) => <div key={i} style={{ display: 'flex', gap: 10, fontFamily: F.b, fontSize: 14.5, lineHeight: 1.5 }}>{tick}{x}</div>)}</div> : null
            ) : (
              <Editable secId={sec.id} k="points" value={p.points} multiline preview={false} style={'margin-top:22px; font-family:' + F.b + '; font-size:14px; line-height:1.8; white-space:pre-wrap; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px dashed ' + c.line + ';'} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>{form}</div>
        </div>
      </div>
    );
  }
  if (v === 'card') {
    return (
      <div style={sx(s.pad)}>
        <div data-enq-layout="card" style={sx('max-width:620px; margin:0 auto;' + cardLook('box', { C, c, s }, 'padding:' + (mob ? '22px 18px' : '36px 40px') + ';'))}>
          {words}
          {form}
        </div>
      </div>
    );
  }
  return (
    <div style={sx(s.pad)}>
      <div data-enq-layout="std" style={{ maxWidth: 560 }}>
        {words}
        {form}
      </div>
    </div>
  );
}
