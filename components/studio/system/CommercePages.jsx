'use client';
// Cart, checkout & account system pages (Phase 10) — the buying path, guarded.
// /cart and /checkout are themed by tokens; checkout is a FIXED layout
// (deliberately not a canvas) — the only knobs live in the inspector.
// /account is the Bangladesh pattern: order lookup by phone + OTP, no passwords.
import { useEffect, useMemo, useState } from 'react';
import Editable from '../Editable';
import ImageSlot from '../ImageSlot';
import { co, btnColors, sx } from '../theme';
import { fmtPr, liveProds } from '../catalog';
import { getCart, setQty, clearCart } from '../cartStore';

export const SYS10_DEFAULTS = {
  cart: { head: 'Your bag', note: 'Free delivery in Dhaka over ৳2,000 · Cash on delivery everywhere' },
  checkout: { pays: { cod: true, bkash: true, nagad: true }, payOrder: ['cod', 'bkash', 'nagad'], trust: true, note: 'We call to confirm before shipping — pay nothing until it arrives.' },
  account: { head: 'Your orders', sub: 'Enter the phone number you order with — we’ll text a code, no password needed.' },
};
export const sys10 = (sys, k) => ({ ...SYS10_DEFAULTS[k], ...((sys || {})[k] || {}) });

const PAY_LBL = {
  cod: { n: 'Cash on delivery', d: 'Pay when it arrives — nothing now' },
  bkash: { n: 'bKash', d: 'Pay from your bKash app after the confirmation call' },
  nagad: { n: 'Nagad', d: 'Pay from your Nagad app after the confirmation call' },
};

const FREE_DLV_OVER = 2000;
const DLV_CHARGE = 80;

// Resolve stored cart lines against the live catalog (canvas gets a demo bag).
// localStorage is read only after mount so SSR and first client render match.
function useBag(ctx) {
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (!ctx.storeSlug) return;
    const h = () => setTick((t) => t + 1);
    window.addEventListener('studio-cart-change', h);
    return () => window.removeEventListener('studio-cart-change', h);
  }, [ctx.storeSlug]);
  return useMemo(() => {
    const lines = ctx.storeSlug ? (mounted ? getCart(ctx.storeSlug) : []) : (ctx.demoBag || []);
    return lines
      .map((l) => ({ ...l, p: ctx.cat.products.find((x) => x.id === l.pid) }))
      .filter((l) => l.p && !l.p.arch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.storeSlug, ctx.cat, tick, mounted, ctx.demoBag]);
}

const bagTotals = (bag) => {
  const sub = bag.reduce((n, l) => n + l.p.pr * l.qty, 0);
  const dlv = sub >= FREE_DLV_OVER ? 0 : DLV_CHARGE;
  return { sub, dlv, total: sub + dlv };
};

// ── /cart ────────────────────────────────────────────────────────────────────
export function CartPage({ ctx, sys, edit }) {
  const { P, F, C, mob } = ctx;
  const c = co('base', P);
  const cp = sys10(sys, 'cart');
  const bag = useBag(ctx);
  const { sub, dlv } = bagTotals(bag);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const B = btnColors('base', P);
  const change = (l, d) => { if (ctx.storeSlug) setQty(ctx.storeSlug, l.pid, l.size, l.qty + d); };
  const remove = (l) => { if (ctx.storeSlug) setQty(ctx.storeSlug, l.pid, l.size, 0); };

  return (
    <div style={sx('padding:' + (mob ? 36 : 60) + 'px ' + (mob ? 20 : 48) + 'px 80px; max-width:660px; margin:0 auto; box-sizing:border-box; color:' + c.fg + ';')}>
      <Editable secId="__sys:cart" k="head" value={cp.head} style={headFont + 'font-size:' + (mob ? 28 : 38) + 'px; line-height:1.08;'} preview={ctx.preview} />
      <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:8px;')}>{bag.length === 0 ? 'Nothing in it yet' : bag.reduce((n, l) => n + l.qty, 0) + ' ' + (bag.reduce((n, l) => n + l.qty, 0) === 1 ? 'item' : 'items')}</div>
      {bag.length === 0 ? (
        <div style={sx('margin-top:34px; padding:46px 24px; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + '; text-align:center; font-family:' + F.b + '; font-size:14px; color:' + c.sub + ';')}>
          Your bag is empty.
          <div style={{ marginTop: 18 }}>
            <div onClick={ctx.preview && ctx.onShop ? (ev) => { ev.stopPropagation(); ctx.onShop(); } : undefined} style={sx('display:inline-flex; padding:12px 24px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:13.5px; cursor:pointer;')}>Browse the shop</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 22 }}>
            {bag.map((l, i) => (
              <div key={l.pid + ':' + (l.size || '')} style={sx('display:grid; grid-template-columns:64px 1fr auto; gap:14px; align-items:center; padding:14px 0;' + (i ? ' border-top:1px solid ' + c.line + ';' : ''))}>
                <div onClick={ctx.preview && ctx.onProduct ? () => ctx.onProduct(l.p) : undefined} style={sx('width:64px; height:80px; border-radius:' + Math.min(C.rs, 12) + 'px; overflow:hidden; position:relative; background:' + c.card + '; cursor:pointer;')}>
                  <ImageSlot slotId={'st-prod-' + l.p.id} assets={{ ...(ctx.assets || {}), ['st-prod-' + l.p.id]: (ctx.assets || {})['st-prod-' + l.p.id] || l.p.img }} fit="cover" placeholder="" preview />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div onClick={ctx.preview && ctx.onProduct ? () => ctx.onProduct(l.p) : undefined} style={sx('font-family:' + F.b + '; font-size:14px; font-weight:700; cursor:pointer;')}>{l.p.n}</div>
                  <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; margin-top:2px;')}>{fmtPr(l.p.pr)}{l.size ? ' · ' + l.size : ''}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <div onClick={() => change(l, -1)} style={sx('width:26px; height:26px; border-radius:8px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800; font-size:13px;')}>−</div>
                    <div style={{ minWidth: 20, textAlign: 'center', fontWeight: 800, fontSize: 13 }}>{l.qty}</div>
                    <div onClick={() => change(l, 1)} style={sx('width:26px; height:26px; border-radius:8px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800; font-size:13px;')}>+</div>
                    <div onClick={() => remove(l)} style={sx('font-family:' + F.b + '; font-size:11.5px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer; margin-left:6px;')}>Remove</div>
                  </div>
                </div>
                <div style={sx('font-family:' + F.b + '; font-size:14px; font-weight:800; font-variant-numeric:tabular-nums;')}>{fmtPr(l.p.pr * l.qty)}</div>
              </div>
            ))}
          </div>
          <div style={sx('margin-top:8px; padding-top:16px; border-top:1px solid ' + c.line + '; display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:14px; font-weight:700;')}>
            <span>Subtotal</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPr(sub)}</span>
          </div>
          <div style={sx('margin-top:8px; display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';')}>
            <span>Delivery</span><span>{dlv === 0 ? 'Free — over ' + fmtPr(FREE_DLV_OVER) : fmtPr(dlv) + ' · free over ' + fmtPr(FREE_DLV_OVER)}</span>
          </div>
          <div onClick={ctx.preview && ctx.onCheckout ? (ev) => { ev.stopPropagation(); ctx.onCheckout(); } : undefined} style={sx('margin-top:22px; display:flex; align-items:center; justify-content:center; gap:9px; padding:16px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:14.5px; cursor:pointer;')}>
            Continue to checkout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
          </div>
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <span onClick={ctx.preview && ctx.onShop ? () => ctx.onShop() : undefined} style={sx('font-family:' + F.b + '; font-size:12.5px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>or keep shopping</span>
          </div>
          <div style={sx('margin-top:20px; display:flex; align-items:center; justify-content:center; gap:8px; font-family:' + F.b + '; font-size:12px; color:' + c.sub + ';')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M1 5h13v11H1zM14 9h4l3 3v4h-7zM6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" /></svg>
            <Editable secId="__sys:cart" k="note" value={cp.note} style={''} preview={ctx.preview} tag="span" />
          </div>
        </>
      )}
    </div>
  );
}

// ── /checkout ────────────────────────────────────────────────────────────────
export function CheckoutPage({ ctx, sys, edit }) {
  const { P, F, C, mob } = ctx;
  const c = co('base', P);
  const cs = sys10(sys, 'checkout');
  const bag = useBag(ctx);
  const { sub, dlv, total } = bagTotals(bag);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const B = btnColors('base', P);
  const pays = (cs.payOrder || ['cod', 'bkash', 'nagad']).filter((k) => (cs.pays || {})[k] !== false);
  const [pay, setPay] = useState(null);
  const payK = pay && pays.includes(pay) ? pay : pays[0];
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(null);

  const lbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + '; margin-top:18px;';
  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.card + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:13.5px; outline:none; box-sizing:border-box;';

  const submit = async (ev) => {
    ev.stopPropagation();
    if (busy || !ctx.preview) return;
    if (!form.name.trim() || !form.phone.trim()) { setErr('Your name and phone number are needed — we call to confirm.'); return; }
    setErr(null);
    if (!ctx.placeCartOrder) {
      setDone({ num: '#SHQ-1042 (preview)', msg: 'On your live store this lands in Dakio Orders and clears the bag.' });
      return;
    }
    setBusy(true);
    try {
      const res = await ctx.placeCartOrder({ bag, ...form, pay: payK });
      setDone(res);
      if (ctx.storeSlug) clearCart(ctx.storeSlug);
    } catch (e2) {
      setErr(String(e2?.message || 'Couldn’t place the order — try again.'));
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div style={sx('padding:' + (mob ? 60 : 90) + 'px 24px; text-align:center; color:' + c.fg + ';')}>
        <div style={sx('margin:0 auto; width:64px; height:64px; border-radius:99px; background:' + P.accent + '; color:' + P.accentInk + '; display:flex; align-items:center; justify-content:center; animation:checkPop .4s ease both;')}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <div style={sx(headFont + 'font-size:' + (mob ? 28 : 36) + 'px; margin-top:18px;')}>Order placed!</div>
        <div style={sx('font-family:' + F.b + '; font-size:16px; font-weight:800; margin-top:10px; font-variant-numeric:tabular-nums;')}>{done.num}</div>
        <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:8px; line-height:1.6; max-width:420px; margin-left:auto; margin-right:auto;')}>{done.msg}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <div onClick={ctx.onAccount ? () => ctx.onAccount() : undefined} style={sx('padding:12px 22px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:13px; cursor:pointer;')}>Track it in your account</div>
          <div onClick={ctx.onShop ? () => ctx.onShop() : undefined} style={sx('padding:12px 22px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-weight:700; font-size:13px; cursor:pointer;')}>Keep shopping</div>
        </div>
      </div>
    );
  }

  return (
    <div style={sx('padding:' + (mob ? 36 : 60) + 'px ' + (mob ? 20 : 48) + 'px 80px; max-width:940px; margin:0 auto; box-sizing:border-box; color:' + c.fg + ';')}>
      {bag.length === 0 ? (
        <div style={sx('padding:46px 24px; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + '; text-align:center; font-family:' + F.b + '; font-size:14px; color:' + c.sub + ';')}>
          Your bag is empty — nothing to check out.
          <div style={{ marginTop: 18 }}>
            <div onClick={ctx.preview && ctx.onShop ? () => ctx.onShop() : undefined} style={sx('display:inline-flex; padding:12px 24px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:13.5px; cursor:pointer;')}>Browse the shop</div>
          </div>
        </div>
      ) : (
        <>
          <div onClick={ctx.preview && ctx.onCart ? () => ctx.onCart() : undefined} style={sx('display:inline-flex; align-items:center; gap:7px; font-family:' + F.b + '; font-size:12.5px; font-weight:700; color:' + c.sub + '; cursor:pointer;')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6 6l-6-6 6-6" /></svg>Back to bag
          </div>
          <div style={sx(headFont + 'font-size:' + (mob ? 28 : 38) + 'px; line-height:1.08; margin-top:10px;')}>Checkout</div>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.1fr 0.9fr', gap: mob ? 26 : 44, marginTop: 22, alignItems: 'start' }}>
            <div style={{ minWidth: 0 }}>
              <div style={sx(lbl)}>YOUR NAME</div>
              <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.name} onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))} placeholder="Rahima Akter" style={sx(inp)} readOnly={!ctx.preview} /></div>
              <div style={sx(lbl)}>PHONE — WE CALL TO CONFIRM</div>
              <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.phone} onChange={(ev) => setForm((f) => ({ ...f, phone: ev.target.value }))} placeholder="01XXX-XXXXXX" style={sx(inp)} readOnly={!ctx.preview} /></div>
              <div style={sx(lbl)}>DELIVERY ADDRESS</div>
              <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.address} onChange={(ev) => setForm((f) => ({ ...f, address: ev.target.value }))} placeholder="House, road, area, city" style={sx(inp)} readOnly={!ctx.preview} /></div>
              <div style={sx(lbl)}>PAYMENT</div>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pays.map((k) => {
                  const act = payK === k;
                  return (
                    <div key={k} onClick={ctx.preview ? (ev) => { ev.stopPropagation(); setPay(k); } : undefined} style={sx('display:flex; align-items:center; gap:11px; padding:12px 14px; border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (act ? c.fg : c.line) + '; background:' + c.card + '; cursor:pointer;')}>
                      <div style={sx('width:17px; height:17px; border-radius:99px; border:1.5px solid ' + (act ? c.fg : c.line) + '; display:flex; align-items:center; justify-content:center; flex-shrink:0;')}>
                        {act && <div style={sx('width:9px; height:9px; border-radius:99px; background:' + c.fg + ';')} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={sx('font-family:' + F.b + '; font-size:13px; font-weight:700;')}>{PAY_LBL[k].n}</div>
                        <div style={sx('font-family:' + F.b + '; font-size:11px; color:' + c.sub + '; margin-top:1px;')}>{PAY_LBL[k].d}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {cs.trust !== false && (
                <div style={sx('margin-top:18px; display:flex; flex-wrap:wrap; gap:10px 22px; align-items:center;')}>
                  {['SSL secure', 'Verified merchant', '7-day easy exchange'].map((t) => (
                    <div key={t} style={sx('display:flex; align-items:center; gap:7px; font-family:' + F.b + '; font-size:12px; font-weight:600; color:' + c.sub + ';')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5" /></svg>{t}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={sx('padding:20px 20px 18px; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';' + (ctx.shCard || ''))}>
              <div style={sx('font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + ';')}>ORDER SUMMARY</div>
              <div style={{ marginTop: 10 }}>
                {bag.map((l) => (
                  <div key={l.pid + (l.size || '')} style={sx('display:flex; justify-content:space-between; gap:10px; padding:5px 0; font-family:' + F.b + '; font-size:12.5px;')}>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.qty} × {l.p.n}</span>
                    <span style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{fmtPr(l.p.pr * l.qty)}</span>
                  </div>
                ))}
              </div>
              <div style={sx('margin-top:10px; padding-top:10px; border-top:1px solid ' + c.line + '; display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';')}>
                <span>Subtotal</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPr(sub)}</span>
              </div>
              <div style={sx('margin-top:6px; display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';')}>
                <span>Delivery</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{dlv === 0 ? 'Free' : fmtPr(dlv)}</span>
              </div>
              <div style={sx('margin-top:10px; padding-top:10px; border-top:1px solid ' + c.line + '; display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:15px; font-weight:800;')}>
                <span>Total</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPr(total)}</span>
              </div>
              {err && <div style={sx('margin-top:12px; padding:10px 12px; border-radius:10px; background:rgba(176,58,46,0.1); color:#B03A2E; font-family:' + F.b + '; font-size:12px; line-height:1.5;')}>{err}</div>}
              <div onClick={submit} style={sx('margin-top:14px; display:flex; align-items:center; justify-content:center; gap:9px; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:14px; cursor:pointer;' + (busy ? ' opacity:0.6; pointer-events:none;' : ''))}>
                {busy && <div style={{ width: 14, height: 14, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
                {'Place order — ' + fmtPr(total)}
              </div>
              <div style={sx('margin-top:12px; display:flex; align-items:center; justify-content:center; gap:8px; font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; text-align:center;')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.5 2.8.7a2 2 0 011.8 2z" /></svg>
                <Editable secId="__sys:checkout" k="note" value={cs.note} style={''} preview={ctx.preview} tag="span" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── /account — order lookup by phone + OTP ──────────────────────────────────
const STATUS_COL = {
  PENDING: '#B07A2A', CONFIRMED: '#3E7A45', PROCESSING: '#3E7A45', SHIPPED: '#1F6E63',
  DELIVERED: '#3E7A45', CANCELLED: '#B03A2E', RETURNED: '#B03A2E',
};
const STATUS_LBL = { PENDING: 'Confirming', CONFIRMED: 'Confirmed', PROCESSING: 'Packing', SHIPPED: 'On the way', DELIVERED: 'Delivered', CANCELLED: 'Cancelled', RETURNED: 'Returned' };

export function AccountPage({ ctx, sys, edit }) {
  const { P, F, C, mob } = ctx;
  const c = co('base', P);
  const ap = sys10(sys, 'account');
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const B = btnColors('base', P);
  const [step, setStep] = useState('phone'); // phone → otp → orders
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [devCode, setDevCode] = useState(null);

  const lbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + ';';
  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.bg + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:13.5px; outline:none; box-sizing:border-box;';

  const sendCode = async (ev) => {
    ev && ev.stopPropagation();
    if (busy || !ctx.preview) return;
    setErr(null);
    if (!ctx.accountOtp) { setStep('otp'); setDevCode('1042 (canvas preview)'); return; }
    setBusy(true);
    try {
      const r = await ctx.accountOtp(phone);
      setSession(r.sessionToken);
      setDevCode(r.devCode || null);
      setStep('otp');
    } catch (e2) { setErr(String(e2?.message || 'Couldn’t send the code')); }
    finally { setBusy(false); }
  };

  const verify = async (ev) => {
    ev && ev.stopPropagation();
    if (busy || !ctx.preview) return;
    setErr(null);
    if (!ctx.accountOrders) {
      setOrders([
        { num: '#SHQ-1042', status: 'PENDING', total: 6800, at: new Date().toISOString() },
        { num: '#SHQ-1038', status: 'SHIPPED', total: 2400, at: new Date(Date.now() - 3 * 864e5).toISOString() },
        { num: '#SHQ-1031', status: 'DELIVERED', total: 4950, at: new Date(Date.now() - 12 * 864e5).toISOString() },
      ]);
      setStep('orders');
      return;
    }
    setBusy(true);
    try {
      const r = await ctx.accountOrders(session, otp);
      setOrders(r.orders || []);
      setStep('orders');
    } catch (e2) { setErr(String(e2?.message || 'That code isn’t right')); }
    finally { setBusy(false); }
  };

  return (
    <div style={sx('padding:' + (mob ? 40 : 70) + 'px ' + (mob ? 20 : 48) + 'px 90px; max-width:480px; margin:0 auto; box-sizing:border-box; text-align:center; color:' + c.fg + ';')}>
      <Editable secId="__sys:account" k="head" value={ap.head} style={headFont + 'font-size:' + (mob ? 28 : 36) + 'px; line-height:1.08;'} preview={ctx.preview} />
      <Editable secId="__sys:account" k="sub" value={ap.sub} style={'font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:10px; line-height:1.6;'} multiline preview={ctx.preview} />
      <div style={sx('margin-top:26px; padding:' + (mob ? '22px 18px' : '28px 26px') + '; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + '; text-align:left;' + (ctx.shCard || ''))}>
        {step === 'phone' && (
          <>
            <div style={sx(lbl)}>PHONE NUMBER</div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={phone} onChange={(ev) => setPhone(ev.target.value)} placeholder="01XXX-XXXXXX" style={sx(inp)} readOnly={!ctx.preview} /></div>
            {err && <div style={sx('margin-top:10px; font-family:' + F.b + '; font-size:12px; color:#B03A2E;')}>{err}</div>}
            <div onClick={sendCode} style={sx('margin-top:14px; display:flex; align-items:center; justify-content:center; gap:9px; padding:14px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:13.5px; cursor:pointer;' + (busy ? ' opacity:0.6; pointer-events:none;' : ''))}>
              {busy && <div style={{ width: 13, height: 13, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
              Text me a code
            </div>
          </>
        )}
        {step === 'otp' && (
          <>
            <div style={sx(lbl)}>4-DIGIT CODE</div>
            <div style={{ marginTop: 10 }}>
              <input onClick={(ev) => ev.stopPropagation()} value={otp} onChange={(ev) => setOtp(ev.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" maxLength={4} style={sx(inp + 'text-align:center; letter-spacing:10px; font-size:20px; font-weight:800;')} readOnly={!ctx.preview} />
            </div>
            {devCode && <div style={sx('margin-top:10px; font-family:' + F.b + '; font-size:11px; color:' + c.sub + '; text-align:center;')}>Dev: SMS not configured — your code is <b>{devCode}</b></div>}
            {err && <div style={sx('margin-top:10px; font-family:' + F.b + '; font-size:12px; color:#B03A2E; text-align:center;')}>{err}</div>}
            <div onClick={verify} style={sx('margin-top:14px; display:flex; align-items:center; justify-content:center; gap:9px; padding:14px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:13.5px; cursor:pointer;' + (busy ? ' opacity:0.6; pointer-events:none;' : ''))}>
              {busy && <div style={{ width: 13, height: 13, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
              Show my orders
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 18 }}>
              <span onClick={ctx.preview ? sendCode : undefined} style={sx('font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>Resend code</span>
              <span onClick={ctx.preview ? () => { setStep('phone'); setErr(null); setDevCode(null); } : undefined} style={sx('font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>Change number</span>
            </div>
          </>
        )}
        {step === 'orders' && (
          <>
            {orders.length === 0 && <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; text-align:center; padding:14px 0;')}>No orders on this number yet.</div>}
            {orders.map((o, i) => (
              <div key={o.num} style={sx('display:flex; align-items:center; gap:12px; padding:13px 0;' + (i ? ' border-top:1px solid ' + c.line + ';' : ''))}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={sx('font-family:' + F.b + '; font-size:13.5px; font-weight:800; font-variant-numeric:tabular-nums;')}>{o.num}</div>
                  <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; margin-top:2px;')}>{fmtPr(o.total)} · {new Date(o.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                </div>
                <div style={sx('flex-shrink:0; padding:5px 12px; border-radius:99px; font-family:' + F.b + '; font-size:10.5px; font-weight:800; background:color-mix(in srgb, ' + (STATUS_COL[o.status] || '#B07A2A') + ' 14%, transparent); color:' + (STATUS_COL[o.status] || '#B07A2A') + ';')}>
                  {STATUS_LBL[o.status] || o.status}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <span onClick={ctx.preview ? () => { setStep('phone'); setOrders([]); setErr(null); setDevCode(null); } : undefined} style={sx('font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>Not you? Change number</span>
            </div>
          </>
        )}
      </div>
      {step === 'orders' && (
        <div style={sx('margin-top:14px; font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + ';')}>Delivery updates also arrive by SMS — nothing to install.</div>
      )}
    </div>
  );
}
