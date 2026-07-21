'use client';
// Quick order form (Phase 9) — size + qty + name + phone + address + payment,
// no cart. On the live funnel it places a real order in Dakio Orders (tagged by
// funnel); in the canvas it simulates the thank-you state.
import { useState } from 'react';
import Editable from '../Editable';
import { baseStyles, sx, btnColors } from '../theme';
import { fmtPr, liveProds } from '../catalog';
import { sizeList } from './Offer';

const PAY_METHODS = [
  { k: 'cod', n: 'Cash on delivery', d: 'Pay when it arrives — nothing now' },
  { k: 'bkash', n: 'bKash', d: 'Pay from your bKash app after our confirmation call' },
  { k: 'nagad', n: 'Nagad', d: 'Pay from your Nagad app after our confirmation call' },
];

export default function Qform({ sec, ctx }) {
  const { P, F, C, mob, preview, cat } = ctx;
  const p = sec.props;
  const base = baseStyles(sec, ctx);
  const { c, headFont, hz, sh, padNarrow } = base;
  const B = btnColors(p.bg, P);
  const bp = (ctx.fnProduct) || cat.products.find((x) => x.id === ctx.fnPid) || liveProds(cat)[0] || cat.products[0];
  const sizes = bp ? sizeList(bp) : [];
  const pays = PAY_METHODS.filter((m) => (p.pays || {})[m.k] !== false);

  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [pay, setPay] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { num, tag }
  const [err, setErr] = useState(null);
  const payK = pay || (pays[0] && pays[0].k);

  if (!bp) return null;

  const submit = async (ev) => {
    ev.stopPropagation();
    if (busy || !preview) return;
    if (!form.name.trim() || !form.phone.trim()) { setErr('Your name and phone number are needed — we call to confirm.'); return; }
    setErr(null);
    if (ctx.placeOrder) {
      setBusy(true);
      try {
        const res = await ctx.placeOrder({ product: bp, qty, size: size || sizes[0] || null, ...form, pay: payK });
        setDone({ num: res.num, tag: res.tag });
      } catch (e2) {
        setErr(String(e2?.message || 'Couldn’t place the order — check your connection and try again.'));
      } finally {
        setBusy(false);
      }
    } else {
      // Canvas preview — simulate the thank-you state honestly
      setDone({ num: '#SHQ-1042 (preview)', tag: 'On your live funnel this lands in Dakio Orders, tagged by funnel.' });
    }
  };

  const lbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + '; margin-top:18px;';
  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.bg + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:13.5px; outline:none; box-sizing:border-box;';

  return (
    <div style={sx(padNarrow)} data-qform={sec.id}>
      {!done && (
        <>
          <Editable secId={sec.id} k="head" value={p.head} style={headFont + 'font-size:' + hz(mob ? 26 : 34) + 'px; line-height:1.1; text-align:center;'} preview={preview} />
          <div style={sx('margin:24px auto 0; max-width:520px; padding:' + (mob ? '22px 18px' : '28px 26px') + '; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';' + sh)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 14, borderBottom: '1px solid ' + c.line }}>
              <div style={{ minWidth: 0 }}>
                <div style={sx('font-family:' + F.b + '; font-size:14px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{bp.n}</div>
                <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; margin-top:2px;')}>{qty} × {fmtPr(bp.pr)}{size ? ' · ' + size : ''}</div>
              </div>
              <div style={sx('font-family:' + F.b + '; font-size:17px; font-weight:800; font-variant-numeric:tabular-nums; flex-shrink:0;')}>{fmtPr(bp.pr * qty)}</div>
            </div>
            {sizes.length > 0 && (
              <>
                <div style={sx(lbl)}>SIZE</div>
                <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
                  {sizes.map((z) => (
                    <div key={z} onClick={preview ? (ev) => { ev.stopPropagation(); setSize(z); } : undefined} style={sx('min-width:40px; padding:9px 0; text-align:center; border-radius:' + Math.min(C.rs, 10) + 'px; border:1.5px solid ' + ((size || sizes[0]) === z ? c.fg : c.line) + '; font-family:' + F.b + '; font-size:12.5px; font-weight:700; cursor:pointer;' + ((size || sizes[0]) === z ? ' background:' + c.fg + '; color:' + c.bg + ';' : ''))}>{z}</div>
                  ))}
                </div>
              </>
            )}
            <div style={sx(lbl)}>QUANTITY</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <div onClick={preview ? (ev) => { ev.stopPropagation(); setQty((q) => Math.max(1, q - 1)); } : undefined} style={sx('width:34px; height:34px; border-radius:10px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800;')}>−</div>
              <div style={{ minWidth: 26, textAlign: 'center', fontWeight: 800, fontSize: 15 }}>{qty}</div>
              <div onClick={preview ? (ev) => { ev.stopPropagation(); setQty((q) => Math.min(bp.stock || 99, q + 1)); } : undefined} style={sx('width:34px; height:34px; border-radius:10px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800;')}>+</div>
            </div>
            <div style={sx(lbl)}>YOUR NAME</div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.name} onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))} placeholder="Rahima Akter" style={sx(inp)} readOnly={!preview} /></div>
            <div style={sx(lbl)}>PHONE — WE CALL TO CONFIRM</div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.phone} onChange={(ev) => setForm((f) => ({ ...f, phone: ev.target.value }))} placeholder="01XXX-XXXXXX" style={sx(inp)} readOnly={!preview} /></div>
            <div style={sx(lbl)}>DELIVERY ADDRESS</div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.address} onChange={(ev) => setForm((f) => ({ ...f, address: ev.target.value }))} placeholder="House, road, area, city" style={sx(inp)} readOnly={!preview} /></div>
            <div style={sx(lbl)}>PAYMENT</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pays.map((m) => {
                const act = payK === m.k;
                return (
                  <div key={m.k} onClick={preview ? (ev) => { ev.stopPropagation(); setPay(m.k); } : undefined} style={sx('display:flex; align-items:center; gap:11px; padding:11px 13px; border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (act ? c.fg : c.line) + '; cursor:pointer;')}>
                    <div style={sx('width:17px; height:17px; border-radius:99px; border:1.5px solid ' + (act ? c.fg : c.line) + '; display:flex; align-items:center; justify-content:center; flex-shrink:0;')}>
                      {act && <div style={sx('width:9px; height:9px; border-radius:99px; background:' + c.fg + ';')} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={sx('font-family:' + F.b + '; font-size:13px; font-weight:700;')}>{m.n}</div>
                      <div style={sx('font-family:' + F.b + '; font-size:11px; color:' + c.sub + '; margin-top:1px;')}>{m.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {err && <div style={sx('margin-top:12px; padding:10px 12px; border-radius:10px; background:rgba(176,58,46,0.1); color:#B03A2E; font-family:' + F.b + '; font-size:12px; line-height:1.5;')}>{err}</div>}
            <div onClick={submit} style={sx('margin-top:18px; display:flex; align-items:center; justify-content:center; gap:9px; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:14.5px; cursor:pointer;' + (busy ? ' opacity:0.6; pointer-events:none;' : ''))}>
              {busy && <div style={{ width: 14, height: 14, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
              <Editable secId={sec.id} k="btn" value={p.btn} style={''} preview={preview} tag="span" />
            </div>
            <div style={sx('margin-top:12px; display:flex; align-items:center; justify-content:center; gap:8px; font-family:' + F.b + '; font-size:12px; color:' + c.sub + ';')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.5 2.8.7a2 2 0 011.8 2z" /></svg>
              <Editable secId={sec.id} k="note" value={p.note} style={''} preview={preview} tag="span" />
            </div>
          </div>
        </>
      )}
      {done && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={sx('margin:0 auto; width:64px; height:64px; border-radius:99px; background:' + P.accent + '; color:' + P.accentInk + '; display:flex; align-items:center; justify-content:center; animation:checkPop .4s ease both;')}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div style={sx(headFont + 'font-size:' + hz(mob ? 26 : 34) + 'px; line-height:1.1; margin-top:18px;')}>Order placed!</div>
          <div style={sx('font-family:' + F.b + '; font-size:15px; font-weight:800; margin-top:10px; font-variant-numeric:tabular-nums;')}>{done.num}</div>
          <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:8px; line-height:1.6;')}>{done.tag}</div>
          <div onClick={(ev) => { ev.stopPropagation(); setDone(null); setQty(1); }} style={sx('margin-top:22px; display:inline-flex; padding:11px 22px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-size:13px; font-weight:700; cursor:pointer;')}>
            Place another order
          </div>
        </div>
      )}
    </div>
  );
}
