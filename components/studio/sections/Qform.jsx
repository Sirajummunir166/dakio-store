'use client';
// Quick order form (Phase 9) — size + qty + name + phone + address + payment,
// no cart. On the live funnel it places a real order in Dakio Orders (tagged by
// funnel); in the canvas it simulates the thank-you state. When the store's
// fake-order protection asks for the SMS code (202), the form shows a code step
// and only a verified order counts as placed.
import { useState } from 'react';
import Editable from '../Editable';
import { baseStyles, sx, btnColors } from '../theme';
import { fmtPr, liveProds } from '../catalog';
import { sizeList } from './Offer';
import { sizeInStock, firstInStockSize, priceFor, soldOutSize } from '../variants';
import { useCheckoutTracking, isValidBDPhone } from '../../tracking/useCheckoutTracking';
import { itemFromStudio } from '../../../lib/tracking/items';

// payment_type as the order records it (FunnelSite's label)
const PAY_TYPE = { cod: 'COD', bkash: 'bKash', nagad: 'Nagad' };

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
  const [otp, setOtp] = useState(null); // { sessionToken, maskedPhone, expiresAt } on a 202
  const [otpInput, setOtpInput] = useState('');
  const [otpErr, setOtpErr] = useState(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const payK = pay || (pays[0] && pays[0].k);

  // The picked size, else the first one in stock — never a sold-out size.
  const curSize = bp ? ((size && sizeInStock(bp, size) ? size : null) || firstInStockSize(bp, sizes)) : null;
  const unitPr = bp ? priceFor(bp, curSize) : 0;

  // begin_checkout on the first keystroke, add_shipping_info (+ the Incomplete
  // Order) once name + phone + address are in, then add_payment_info → purchase.
  const item = bp ? itemFromStudio(bp, { size: curSize, qty, price: unitPr, collections: cat.collections || [] }) : null;
  const ck = useCheckoutTracking({
    items: item ? [item] : [],
    value: unitPr * qty,
    autoBegin: false,
    contactReady: !!ctx.captureLead && !!bp && !!form.name.trim() && isValidBDPhone(form.phone) && !!form.address.trim(),
    contactKey: [form.name, form.phone, form.address, curSize, qty].join('|'),
    onShipping: (tracking) => ctx.captureLead({ product: bp, qty, size: curSize, ...form, tracking }),
  });
  const field = (k) => (ev) => {
    const v = ev.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (ctx.placeOrder && !ck.checkoutId()) ck.begin();
  };

  if (!bp) return null;

  const submit = async (ev) => {
    ev.stopPropagation();
    if (busy || !preview) return;
    if (!form.name.trim() || !form.phone.trim()) { setErr('Your name and phone number are needed — we call to confirm.'); return; }
    if (sizes.length > 0 && !curSize) { setErr('This product is sold out in every size.'); return; }
    setErr(null);
    if (ctx.placeOrder) {
      setBusy(true);
      const eventId = ck.purchaseId();
      ck.paymentInfo(PAY_TYPE[payK] || payK);
      try {
        const res = await ctx.placeOrder({ product: bp, qty, size: curSize, ...form, pay: payK, eventId, tracking: ck.trackingFor(eventId) });
        if (res.otpRequired) {
          setOtp({ sessionToken: res.sessionToken, maskedPhone: res.maskedPhone, expiresAt: res.expiresAt ? new Date(res.expiresAt) : null });
          setOtpInput(''); setOtpErr(null);
          return;
        }
        ck.purchase(res.data, { value: unitPr * qty, paymentType: PAY_TYPE[payK] || payK });
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

  const verifyOtp = async (ev) => {
    if (ev) ev.stopPropagation();
    if (!otp || otpBusy || otpInput.length !== 6 || !ctx.verifyOrderOtp) return;
    setOtpErr(null); setOtpBusy(true);
    try {
      const r = await ctx.verifyOrderOtp(otp.sessionToken, otpInput, ck.trackingFor(ck.purchaseId()));
      if (!r.ok) {
        if (r.status === 410 || r.status === 429) {
          // Expired or locked — back to the form to place it again
          setOtp(null); setOtpInput(''); setErr(r.error || 'Verification failed. Please try again.');
        } else {
          setOtpErr((r.error || 'Incorrect code.') + (r.attemptsLeft != null ? ' (' + r.attemptsLeft + ' attempts left)' : ''));
        }
        return;
      }
      ck.purchase(r.data, { value: unitPr * qty, paymentType: PAY_TYPE[payK] || payK });
      setOtp(null); setOtpInput('');
      setDone({ num: r.num, tag: r.tag });
    } catch (e2) {
      setOtpErr(String(e2?.message || 'Verification failed. Try again.'));
    } finally {
      setOtpBusy(false);
    }
  };

  const lbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + '; margin-top:18px;';
  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.bg + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:13.5px; outline:none; box-sizing:border-box;';

  return (
    <div style={sx(padNarrow)} data-qform={sec.id}>
      {!done && otp && (
        <div style={sx('margin:0 auto; max-width:420px; padding:' + (mob ? '22px 18px' : '28px 26px') + '; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + '; text-align:center;' + sh)}>
          <div style={sx(headFont + 'font-size:' + hz(mob ? 22 : 26) + 'px; line-height:1.15;')}>Verify your number</div>
          <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:10px; line-height:1.6;')}>
            We sent a 6-digit code to <b style={{ color: c.fg }}>{otp.maskedPhone}</b>. Enter it below to place your order.
          </div>
          <input
            type="tel" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={otpInput}
            onClick={(ev) => ev.stopPropagation()}
            onChange={(ev) => setOtpInput(ev.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(ev) => { if (ev.key === 'Enter') verifyOtp(ev); }}
            style={sx(inp + 'margin-top:18px; font-size:22px; letter-spacing:8px; text-align:center;' + (otpErr ? ' border-color:#B03A2E;' : ''))}
          />
          {otpErr && <div style={sx('margin-top:10px; font-family:' + F.b + '; font-size:12px; color:#B03A2E;')}>{otpErr}</div>}
          <div style={sx('font-family:' + F.b + '; font-size:12px; color:' + c.sub + '; margin-top:10px;')}>
            Code expires in {otp.expiresAt ? Math.max(0, Math.ceil((otp.expiresAt - Date.now()) / 60000)) : 5} min.
          </div>
          <div onClick={verifyOtp} style={sx('margin-top:16px; display:flex; align-items:center; justify-content:center; gap:9px; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:14.5px; cursor:pointer;' + ((otpBusy || otpInput.length !== 6) ? ' opacity:0.5; pointer-events:none;' : ''))}>
            {otpBusy && <div style={{ width: 14, height: 14, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
            {otpBusy ? 'Verifying…' : 'Confirm order'}
          </div>
          <div onClick={(ev) => { ev.stopPropagation(); setOtp(null); setOtpInput(''); setOtpErr(null); }} style={sx('margin-top:12px; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + '; cursor:pointer;')}>
            Back to the form
          </div>
        </div>
      )}
      {!done && !otp && (
        <>
          <Editable secId={sec.id} k="head" value={p.head} style={headFont + 'font-size:' + hz(mob ? 26 : 34) + 'px; line-height:1.1; text-align:center;'} preview={preview} />
          <div style={sx('margin:24px auto 0; max-width:520px; padding:' + (mob ? '22px 18px' : '28px 26px') + '; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';' + sh)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 14, borderBottom: '1px solid ' + c.line }}>
              <div style={{ minWidth: 0 }}>
                <div style={sx('font-family:' + F.b + '; font-size:14px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{bp.n}</div>
                <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; margin-top:2px;')}>{qty} × {fmtPr(unitPr)}{curSize ? ' · ' + curSize : ''}</div>
              </div>
              <div style={sx('font-family:' + F.b + '; font-size:17px; font-weight:800; font-variant-numeric:tabular-nums; flex-shrink:0;')}>{fmtPr(unitPr * qty)}</div>
            </div>
            {sizes.length > 0 && (
              <>
                <div style={sx(lbl)}>SIZE</div>
                <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
                  {sizes.map((z) => (
                    <div key={z} title={sizeInStock(bp, z) ? undefined : 'Sold out'} onClick={preview && sizeInStock(bp, z) ? (ev) => { ev.stopPropagation(); setSize(z); } : undefined} style={sx('min-width:40px; padding:9px 0; text-align:center; border-radius:' + Math.min(C.rs, 10) + 'px; border:1.5px solid ' + (curSize === z ? c.fg : c.line) + '; font-family:' + F.b + '; font-size:12.5px; font-weight:700; cursor:pointer;' + (curSize === z ? ' background:' + c.fg + '; color:' + c.bg + ';' : '') + (sizeInStock(bp, z) ? '' : soldOutSize))}>{z}</div>
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
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.name} onChange={field('name')} placeholder="Rahima Akter" style={sx(inp)} readOnly={!preview} /></div>
            <div style={sx(lbl)}>PHONE — WE CALL TO CONFIRM</div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.phone} onChange={field('phone')} placeholder="01XXX-XXXXXX" style={sx(inp)} readOnly={!preview} /></div>
            <div style={sx(lbl)}>DELIVERY ADDRESS</div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.address} onChange={field('address')} placeholder="House, road, area, city" style={sx(inp)} readOnly={!preview} /></div>
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
