'use client';
import { useState } from 'react';
import { baseStyles, sx } from '../theme';
import Editable from '../Editable';
import { siteText } from '../siteText';

// On the live site the form sends (W0): ctx.submitEnquiry → POST /store/:slug/enquiries,
// a contact in the store's Contacts and a line on its timeline. In the editor it stays a picture.

export default function Contact({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { P, F, C, mob, preview } = ctx;
  const p = sec.props;
  const split = sec.v !== 'center';

  const contactGrid = 'display:grid; grid-template-columns:' + ((mob || sec.v === 'center') ? '1fr' : '1.15fr 0.85fr') + '; gap:' + (mob ? 30 : 64) + 'px; align-items:start;' + (sec.v === 'center' ? ' max-width:560px; margin:0 auto;' : '');
  const contactSub = 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:12px; max-width:420px; white-space:pre-wrap;';
  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.card + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:13.5px; outline:none; box-sizing:border-box;';
  const cFake = inp + 'height:96px; color:' + c.sub + '; opacity:0.75; cursor:text;';
  const contactCard = 'padding:26px 24px; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';';
  const cLbl = 'font-family:' + F.b + '; font-size:10px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + ';';
  const cLbl2 = cLbl + 'margin-top:18px;';
  const cVal = 'font-family:' + F.b + '; font-size:14.5px; font-weight:600; margin-top:6px; white-space:pre-wrap;';
  const waChip = 'margin-top:22px; display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:' + C.btn + '; background:' + P.accent + '; color:' + P.accentInk + '; font-family:' + F.b + '; font-size:12.5px; font-weight:700; cursor:pointer;';

  const tx = siteText(ctx.theme?.lang);
  const live = typeof ctx.submitEnquiry === 'function';
  const [f, setF] = useState({ name: '', phone: '', message: '', website: '' });
  const [state, setState] = useState({ busy: false, done: false, err: null });
  const send = async (ev) => {
    ev.preventDefault();
    if (!f.name.trim()) return setState({ busy: false, done: false, err: tx('form.needName') });
    if (!f.phone.trim()) return setState({ busy: false, done: false, err: tx('form.needReach') });
    setState({ busy: true, done: false, err: null });
    const r = await ctx.submitEnquiry({ name: f.name, phone: f.phone, message: f.message, website: f.website });
    if (r.ok) setState({ busy: false, done: true, err: null });
    else setState({ busy: false, done: false, err: r.field === 'phone' ? tx('form.badPhone') : r.field === 'name' ? tx('form.needName') : (r.error || tx('form.error')) });
  };
  const onWa = live && ctx.onLink ? () => ctx.onLink({ t: 'wa', ref: 'chat' }) : undefined;

  return (
    <div style={sx(s.pad)}>
      <div style={sx(contactGrid)}>
        <div style={{ minWidth: 0 }}>
          <Editable secId={sec.id} k="head" value={p.head} style={s.h2} preview={preview} />
          <Editable secId={sec.id} k="sub" value={p.sub} style={contactSub} multiline preview={preview} />
          {live ? (
            state.done ? (
              <div data-contact-sent style={sx('margin-top:26px; max-width:440px; padding:16px 18px; border-radius:' + Math.min(C.rs, 14) + 'px; background:' + c.card + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:14.5px; line-height:1.5;')}>{tx('form.sent')}</div>
            ) : (
              <form onSubmit={send} noValidate style={sx('margin-top:26px; display:flex; flex-direction:column; gap:10px; max-width:440px;')}>
                <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={tx('form.name')} autoComplete="name" style={sx(inp)} />
                <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder={tx('form.phone')} type="tel" inputMode="tel" autoComplete="tel" style={sx(inp)} />
                <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder={tx('form.message')} rows={4} style={sx(inp + 'resize:vertical;')} />
                {/* People never see this; a bot that fills it is thanked and forgotten. */}
                <input name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
                {state.err ? <div role="alert" style={sx('font-family:' + F.b + '; font-size:13px; color:#B03A2E;')}>{state.err}</div> : null}
                <div style={{ marginTop: 4, display: 'flex' }}>
                  <button type="submit" disabled={state.busy} style={{ ...sx(s.btn), border: 'none', cursor: state.busy ? 'default' : 'pointer', opacity: state.busy ? 0.7 : 1, fontFamily: 'inherit' }}>
                    {state.busy ? tx('form.sending') : (p.btn || 'Send')}
                  </button>
                </div>
              </form>
            )
          ) : (
          <div style={sx('margin-top:26px; display:flex; flex-direction:column; gap:10px; max-width:440px;')}>
            <input placeholder={tx('form.name')} style={sx(inp)} onClick={(e) => e.stopPropagation()} />
            <input placeholder={tx('form.phone')} style={sx(inp)} onClick={(e) => e.stopPropagation()} />
            <div style={sx(cFake)}>{tx('form.message')}</div>
            <div style={{ marginTop: 4, display: 'flex' }}>
              <div style={sx(s.btn)}>
                <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
              </div>
            </div>
          </div>
          )}
        </div>
        {split && (
          <div style={sx(contactCard)}>
            <div style={sx(cLbl)}>{tx('form.visit')}</div>
            <Editable secId={sec.id} k="addr" value={p.addr} style={cVal} multiline preview={preview} />
            <div style={sx(cLbl2)}>{tx('form.callWa')}</div>
            <Editable secId={sec.id} k="phone" value={p.phone} style={cVal} preview={preview} />
            <div style={sx(cLbl2)}>{tx('form.hours')}</div>
            <Editable secId={sec.id} k="hours" value={p.hours} style={cVal} preview={preview} />
            <div style={sx(waChip)} onClick={onWa} role={onWa ? 'link' : undefined}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 01-4 4H8l-5 3V6a4 4 0 014-4h10a4 4 0 014 4v9z" /></svg>
              {tx('form.whatsapp')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
