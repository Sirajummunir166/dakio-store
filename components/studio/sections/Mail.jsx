'use client';
import { useState } from 'react';
import { baseStyles, sx } from '../theme';
import { siteText } from '../siteText';
import Editable from '../Editable';
import { TrustRow } from '../blocks';

export default function Mail({ sec, ctx }) {
  const s = baseStyles(sec, ctx);
  const { c } = s;
  const { P, F, C, mob, padX, preview } = ctx;
  const p = sec.props;

  const inner = 'background:' + c.bg + '; color:' + c.fg + '; text-align:center;';
  let mailOuter, mailInner;
  if (sec.v === 'card') {
    mailOuter = 'padding:' + (mob ? 24 : 40) + 'px max(' + padX + 'px, calc((100% - 1120px)/2)); background:' + P.bg + ';';
    mailInner = inner + 'padding:' + (mob ? 38 : 56) + 'px 28px; border-radius:' + C.r + 'px;' + s.sh;
  } else {
    mailOuter = '';
    mailInner = inner + 'padding:' + (mob ? 46 : 68) + 'px ' + padX + 'px;';
  }
  const mailHead = s.headFont + 'font-size:' + s.hz(mob ? 26 : 36) + 'px; line-height:1.1;';
  const mailSub = 'font-family:' + F.b + '; font-size:' + (mob ? 13.5 : 14.5) + 'px; color:' + c.sub + '; margin-top:12px; max-width:440px; margin-left:auto; margin-right:auto; white-space:pre-wrap;';
  const mailRow = 'margin-top:26px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;';
  const mailInput = 'width:min(320px, 100%); padding:14px 18px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; background:' + c.card + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:14px; outline:none; box-sizing:border-box;';

  // On the live site the box signs people up (W0): ctx.subscribe → POST /store/:slug/subscribe.
  const tx = siteText(ctx.theme?.lang);
  const live = typeof ctx.subscribe === 'function';
  const [v, setV] = useState('');
  const [hp, setHp] = useState('');
  const [state, setState] = useState({ busy: false, done: false, err: null });
  const send = async (ev) => {
    ev.preventDefault();
    if (!v.trim()) return setState({ busy: false, done: false, err: tx('mail.bad') });
    setState({ busy: true, done: false, err: null });
    const r = await ctx.subscribe(v, hp);
    setState(r.ok ? { busy: false, done: true, err: null } : { busy: false, done: false, err: r.status === 400 ? tx('mail.bad') : tx('form.error') });
  };

  return (
    <div style={sx(mailOuter)}>
      <div style={sx(mailInner)}>
        <Editable secId={sec.id} k="head" value={p.head} style={mailHead} preview={preview} />
        <Editable secId={sec.id} k="sub" value={p.sub} style={mailSub} multiline preview={preview} />
        {live ? (
          state.done ? (
            <div data-mail-done style={sx('margin-top:26px; font-family:' + F.b + '; font-size:15px; font-weight:600;')}>{tx('mail.done')}</div>
          ) : (
            <form onSubmit={send} noValidate style={sx(mailRow)}>
              <input value={v} onChange={(e) => setV(e.target.value)} placeholder={tx('mail.placeholder')} aria-label={tx('mail.placeholder')} style={sx(mailInput)} />
              <input name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
              <button type="submit" disabled={state.busy} style={{ ...sx(s.btn), border: 'none', cursor: state.busy ? 'default' : 'pointer', opacity: state.busy ? 0.7 : 1, fontFamily: 'inherit' }}>{state.busy ? tx('form.sending') : p.btn}</button>
              {state.err ? <div role="alert" style={sx('flex-basis:100%; font-family:' + F.b + '; font-size:13px; color:#B03A2E;')}>{state.err}</div> : null}
            </form>
          )
        ) : (
        <div style={sx(mailRow)}>
          <input placeholder={tx('mail.placeholder')} style={sx(mailInput)} onClick={(e) => e.stopPropagation()} />
          <div style={sx(s.btn)}>
            <Editable secId={sec.id} k="btn" value={p.btn} style={''} tag="span" preview={preview} />
          </div>
        </div>
        )}
        {p.trustOn && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TrustRow sec={sec} ctx={ctx} base={s} />
          </div>
        )}
      </div>
    </div>
  );
}
