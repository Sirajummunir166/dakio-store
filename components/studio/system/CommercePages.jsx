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
import { getCart, setQty, updateSize, clearCart } from '../cartStore';
import { priceFor } from '../variants';
import { catProduct, priceAddOns } from '../addOns';
import { DISTRICTS, DHAKA_DISTRICTS, getThanas, detectLocation } from '../../../lib/bd-locations';
import { useCheckoutTracking } from '../../tracking/useCheckoutTracking';
import { useTracking } from '../../tracking/TrackingRoot';
import { itemFromStudio } from '../../../lib/tracking/items';
import { siteText } from '../siteText';

function isValidBDPhone(raw) {
  const p = String(raw || '').replace(/[\s\-().]/g, '');
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(p);
}

export const SYS10_DEFAULTS = {
  cart: { head: 'Your bag', note: 'Cash on delivery everywhere · We call to confirm before shipping' },
  checkout: { pays: { cod: true, bkash: true, nagad: true }, payOrder: ['cod', 'bkash', 'nagad'], trust: true, note: 'We call to confirm before shipping — pay nothing until it arrives.' },
  account: { head: 'Your orders', sub: 'Enter the phone number you order with — we’ll text a code, no password needed.' },
};
export const sys10 = (sys, k) => ({ ...SYS10_DEFAULTS[k], ...((sys || {})[k] || {}) });
// The same, with the starter words in the site's language — the merchant's own words still win.
const SYS10_TEXT = { cart: { head: 'cart.head', note: 'cart.note' }, checkout: { note: 'checkout.defaultNote' }, account: { head: 'account.head', sub: 'account.sub' } };
const sys10t = (sys, k, tx) => ({ ...SYS10_DEFAULTS[k], ...Object.fromEntries(Object.entries(SYS10_TEXT[k] || {}).map(([f, key]) => [f, tx(key)])), ...((sys || {})[k] || {}) });

// payment_type as the order records it (PublicSite placeCartOrder's label)
const PAY_TYPE = { cod: 'COD', bkash: 'bKash', nagad: 'Nagad' };

// Payment labels in the site's language (siteText checkout.pay.<k>.n / .d).
const payLbl = (tx, k) => ({ n: tx('checkout.pay.' + k + '.n'), d: tx('checkout.pay.' + k + '.d') });

// Delivery is charged by district at checkout — Dhaka district at the store's
// inside rate, every other district at its outside rate (dakio-api
// lib/deliveryZone.js, the one rule) — and free once the goods reach the
// store's `freeDeliveryOver`, which the server applies to every order too.
// The bag pages never invent a charge or a threshold the server won't honour;
// they say what the rates are.
export function freeDeliveryOver(ctx) {
  const n = Number(ctx && ctx.store && ctx.store.freeDeliveryOver);
  return Number.isFinite(n) && n > 0 ? n : null;
}
export function deliveryRates(ctx) {
  const s = ctx && ctx.store;
  if (!s || s.deliveryInsideDhaka == null || s.deliveryOutsideDhaka == null) return null;
  return { inside: Number(s.deliveryInsideDhaka), outside: Number(s.deliveryOutsideDhaka), freeOver: freeDeliveryOver(ctx) };
}
export function deliveryNote(ctx, goods = null) {
  const tx = siteText(ctx && ctx.theme && ctx.theme.lang);
  const r = deliveryRates(ctx);
  if (!r) return tx('delivery.setAtCheckout');
  if (r.freeOver != null && goods != null && goods >= r.freeOver) return tx('delivery.free');
  return tx('delivery.rates', { inside: r.inside === 0 ? tx('delivery.free') : fmtPr(r.inside), outside: r.outside === 0 ? tx('delivery.freeLower') : fmtPr(r.outside) })
    + (r.freeOver != null ? ' · ' + tx('delivery.freeOver', { amount: fmtPr(r.freeOver) }) : '');
}

// Resolve stored cart lines against the live catalog (canvas gets a demo bag).
// localStorage is read only after mount so SSR and first client render match.
// Shared with CartPanel (the header/add-to-cart preview drawer) so the bag
// totals are identical everywhere they're shown.
export function useBag(ctx) {
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
    const bag = lines
      .map((l) => {
        // The catalog, else an add-on the pairings carried (Goes well with).
        const p = catProduct(ctx.cat, l.pid);
        // A size's variant can carry its own price — the order charges it, so
        // every bag total (drawer, /cart, /checkout) shows that price too.
        return { ...l, p: p ? { ...p, pr: priceFor(p, l.size) } : p };
      })
      .filter((l) => l.p && !l.p.arch);
    // An add-on beside its main product: the together price, by the server's rule.
    return priceAddOns(bag, ctx.cat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.storeSlug, ctx.cat, tick, mounted, ctx.demoBag]);
}

// A bag line's quantity; the public store's ctx.setLineQty also reports
// add_to_cart / remove_from_cart. 0 removes the line.
export function setBagLineQty(ctx, l, qty) {
  if (ctx.setLineQty) ctx.setLineQty(l, qty);
  else if (ctx.storeSlug) setQty(ctx.storeSlug, l.pid, l.size, qty, l.addOnOf);
}

// Resolved bag lines → GA4 items, at the price the bag shows (sizes, together prices).
export const bagItems = (bag, cat) => bag.map((l, i) => itemFromStudio(l.p, { size: l.size, qty: l.qty, price: l.p.pr, index: i, collections: (cat && cat.collections) || [] })).filter(Boolean);

export const bagTotals = (bag) => {
  const sub = bag.reduce((n, l) => n + l.p.pr * l.qty, 0);
  return { sub };
};

// ── /cart ────────────────────────────────────────────────────────────────────
export function CartPage({ ctx, sys, edit }) {
  const { P, F, C, mob } = ctx;
  const c = co('base', P);
  const tx = siteText(ctx.theme?.lang);
  const cp = sys10t(sys, 'cart', tx);
  const bag = useBag(ctx);
  const { sub } = bagTotals(bag);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const B = btnColors('base', P);
  const change = (l, d) => setBagLineQty(ctx, l, l.qty + d);
  const remove = (l) => setBagLineQty(ctx, l, 0);
  // Landing on /cart is a view_cart (once, when the bag has loaded).
  const tk = useTracking();
  const hasBag = bag.length > 0;
  useEffect(() => {
    if (!hasBag || !tk.once('vc:' + window.location.pathname)) return;
    const items = bagItems(bag, ctx.cat);
    tk.track('view_cart', { ecommerce: { currency: tk.currency, value: sub, items } });
  }, [hasBag]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={sx('padding:' + (mob ? 36 : 60) + 'px ' + (mob ? 20 : 48) + 'px 80px; max-width:660px; margin:0 auto; box-sizing:border-box; color:' + c.fg + ';')}>
      <Editable secId="__sys:cart" k="head" value={cp.head} style={headFont + 'font-size:' + (mob ? 28 : 38) + 'px; line-height:1.08;'} preview={ctx.preview} />
      <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:8px;')}>{bag.length === 0 ? tx('cart.nothingYet') : tx(bag.reduce((n, l) => n + l.qty, 0) === 1 ? 'cart.count1' : 'cart.countN', { n: bag.reduce((n, l) => n + l.qty, 0) })}</div>
      {bag.length === 0 ? (
        <div style={sx('margin-top:34px; padding:46px 24px; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + '; text-align:center; font-family:' + F.b + '; font-size:14px; color:' + c.sub + ';')}>
          {tx('cart.empty')}
          <div style={{ marginTop: 18 }}>
            <div onClick={ctx.preview && ctx.onShop ? (ev) => { ev.stopPropagation(); ctx.onShop(); } : undefined} style={sx('display:inline-flex; padding:12px 24px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:13.5px; cursor:pointer;')}>{tx('cart.browse')}</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 22 }}>
            {bag.map((l, i) => (
              <div key={l.pid + ':' + (l.size || '') + ':' + (l.addOnOf || '')} style={sx('display:grid; grid-template-columns:64px 1fr auto; gap:14px; align-items:center; padding:14px 0;' + (i ? ' border-top:1px solid ' + c.line + ';' : ''))}>
                <div onClick={ctx.preview && ctx.onProduct ? () => ctx.onProduct(l.p) : undefined} style={sx('width:64px; height:80px; border-radius:' + Math.min(C.rs, 12) + 'px; overflow:hidden; position:relative; background:' + c.card + '; cursor:pointer;')}>
                  <ImageSlot slotId={'st-prod-' + l.p.id} assets={{ ...(ctx.assets || {}), ['st-prod-' + l.p.id]: (ctx.assets || {})['st-prod-' + l.p.id] || l.p.img }} fit="cover" placeholder="" preview />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div onClick={ctx.preview && ctx.onProduct ? () => ctx.onProduct(l.p) : undefined} style={sx('font-family:' + F.b + '; font-size:14px; font-weight:700; cursor:pointer;')}>{l.p.n}</div>
                  <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; margin-top:2px;')}>{fmtPr(l.p.pr)}{l.p.together ? ' (' + tx('cart.together', { was: fmtPr(l.p.was) }) + ')' : ''}{l.size ? ' · ' + l.size : ''}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <div onClick={() => change(l, -1)} style={sx('width:26px; height:26px; border-radius:8px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800; font-size:13px;')}>−</div>
                    <div style={{ minWidth: 20, textAlign: 'center', fontWeight: 800, fontSize: 13 }}>{l.qty}</div>
                    <div onClick={() => change(l, 1)} style={sx('width:26px; height:26px; border-radius:8px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800; font-size:13px;')}>+</div>
                    <div onClick={() => remove(l)} style={sx('font-family:' + F.b + '; font-size:11.5px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer; margin-left:6px;')}>{tx('cart.remove')}</div>
                  </div>
                </div>
                <div style={sx('font-family:' + F.b + '; font-size:14px; font-weight:800; font-variant-numeric:tabular-nums;')}>{fmtPr(l.p.pr * l.qty)}</div>
              </div>
            ))}
          </div>
          <div style={sx('margin-top:8px; padding-top:16px; border-top:1px solid ' + c.line + '; display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:14px; font-weight:700;')}>
            <span>{tx('cart.subtotal')}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPr(sub)}</span>
          </div>
          <div style={sx('margin-top:8px; display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + ';')}>
            <span>{tx('cart.delivery')}</span><span>{deliveryNote(ctx, sub)}</span>
          </div>
          <div onClick={ctx.preview && ctx.onCheckout ? (ev) => { ev.stopPropagation(); ctx.onCheckout(); } : undefined} style={sx('margin-top:22px; display:flex; align-items:center; justify-content:center; gap:9px; padding:16px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:14.5px; cursor:pointer;')}>
            {tx('cart.toCheckout')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
          </div>
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <span onClick={ctx.preview && ctx.onShop ? () => ctx.onShop() : undefined} style={sx('font-family:' + F.b + '; font-size:12.5px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>{tx('cart.keepShopping')}</span>
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
// Ported from the old Fashion checkout route (components/templates/fashion/
// FashionCheckoutRoute.jsx) — district/thana delivery, address auto-detect,
// coupon codes, SMS OTP confirmation, itemized summary with photos — restyled
// with theme tokens. Payment-method choice (cod/bkash/nagad) is kept from the
// Studio version; the old route only ever offered COD.
export function CheckoutPage({ ctx, sys, edit }) {
  const { P, F, C, mob } = ctx;
  const c = co('base', P);
  const tx = siteText(ctx.theme?.lang);
  const cs = sys10t(sys, 'checkout', tx);
  const bag = useBag(ctx);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const B = btnColors('base', P);
  // Payment methods group into two cards (Cash on Delivery / Pay online) —
  // "Pay online" bundles whichever of bKash/Nagad the merchant has enabled,
  // matching the theme-editor's Veluna preview. No card/gateway logos: there's
  // no real card-payment capability anywhere in the platform to back that up —
  // every method here (COD, bKash, Nagad) is still "pay manually, we record
  // which one for the merchant to reconcile," not a live charge.
  const pays = (cs.payOrder || ['cod', 'bkash', 'nagad']).filter((k) => (cs.pays || {})[k] !== false);
  const [pay, setPay] = useState(null);
  const payK = pay && pays.includes(pay) ? pay : pays[0];
  const onlineMethods = pays.filter((k) => k === 'bkash' || k === 'nagad');
  const hasCod = pays.includes('cod');
  const hasOnline = onlineMethods.length > 0;
  const payGroup = payK === 'cod' ? 'cod' : 'online';
  const selectOnline = () => setPay(onlineMethods.includes(payK) ? payK : onlineMethods[0]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', note: '' });
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [autoDetected, setAutoDetected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponErr, setCouponErr] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpErr, setOtpErr] = useState(null);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSessionToken, setOtpSessionToken] = useState('');
  const [otpMaskedPhone, setOtpMaskedPhone] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

  const sub = bag.reduce((n, l) => n + l.p.pr * l.qty, 0);
  const insideDhaka = DHAKA_DISTRICTS.includes(district);
  const insideCharge = ctx.store && ctx.store.deliveryInsideDhaka != null ? Number(ctx.store.deliveryInsideDhaka) : 60;
  const outsideCharge = ctx.store && ctx.store.deliveryOutsideDhaka != null ? Number(ctx.store.deliveryOutsideDhaka) : 120;
  const freeOver = freeDeliveryOver(ctx);
  const freeByAmount = freeOver != null && sub >= freeOver;
  const dlv = district && !freeByAmount ? (insideDhaka ? insideCharge : outsideCharge) : 0;
  const total = sub + dlv - (couponDiscount || 0);

  // begin_checkout → add_shipping_info (+ the Incomplete Order) →
  // add_payment_info → purchase from the API's answer. Silent in the canvas.
  const ck = useCheckoutTracking({
    items: bagItems(bag, ctx.cat),
    value: sub,
    ready: !!ctx.storeSlug && bag.length > 0,
    contactReady: !!ctx.captureLead && bag.length > 0 && !!form.name.trim() && isValidBDPhone(form.phone) && !!district && !!thana,
    contactKey: [form.name, form.phone, form.email, form.address, district, thana].join('|'),
    onShipping: (tracking) => ctx.captureLead && ctx.captureLead({ name: form.name, phone: form.phone, email: form.email, address: form.address, city: thana, district, bag, tracking }),
  });

  const lbl = 'font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + '; margin-top:18px;';
  const inp = 'width:100%; padding:14px 16px; border-radius:' + Math.min(C.rs, 14) + 'px; border:1.5px solid ' + c.line + '; background:' + c.card + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:13.5px; outline:none; box-sizing:border-box;';
  const selectStyle = {
    width: '100%', padding: '14px 16px', borderRadius: Math.min(C.rs, 14), border: '1.5px solid ' + c.line,
    background: c.card, color: c.fg, fontFamily: F.b, fontSize: 13.5, outline: 'none', boxSizing: 'border-box',
    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', paddingRight: 36,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
  };

  const applyCoupon = async (code) => {
    if (!code.trim() || !ctx.validateCoupon) return;
    setCouponLoading(true); setCouponErr(null);
    try {
      const data = await ctx.validateCoupon(code.trim(), sub);
      setAppliedCoupon(data.coupon); setCouponDiscount(data.discount); setCouponErr(null);
    } catch (e2) { setCouponErr(String(e2?.message || tx('checkout.couponInvalid'))); }
    setCouponLoading(false);
  };
  const removeCoupon = () => { setAppliedCoupon(null); setCouponDiscount(0); setCouponCode(''); setCouponErr(null); };

  const handleAddressBlur = (val) => {
    if (!val.trim()) return;
    const { district: d, thana: t } = detectLocation(val);
    if (d) { setDistrict(d); if (t) setThana(t); setAutoDetected(true); } else { setAutoDetected(false); }
  };

  const submit = async (ev) => {
    ev.stopPropagation();
    if (busy || !ctx.preview) return;
    if (!form.name.trim()) { setErr(tx('checkout.errName')); return; }
    if (!isValidBDPhone(form.phone)) { setErr(tx('checkout.errPhone')); return; }
    if (!district) { setErr(tx('checkout.errDistrict')); return; }
    if (!thana) { setErr(tx('checkout.errThana')); return; }
    setErr(null);
    if (!ctx.placeCartOrder) {
      setDone({ num: '#SHQ-1042 (preview)', msg: 'On your live store this lands in Dakio Orders and clears the bag.' });
      return;
    }
    setBusy(true);
    const eventId = ck.purchaseId();
    ck.paymentInfo(PAY_TYPE[payK] || payK);
    try {
      const res = await ctx.placeCartOrder({ bag, name: form.name, phone: form.phone, email: form.email, address: form.address, note: form.note, district, city: thana, pay: payK, couponCode: appliedCoupon?.code, shippingCharge: dlv, eventId, tracking: ck.trackingFor(eventId) });
      if (res.otpRequired) {
        setOtpSessionToken(res.sessionToken); setOtpMaskedPhone(res.maskedPhone); setOtpExpiresAt(res.expiresAt ? new Date(res.expiresAt) : null);
        setOtpStep(true); setBusy(false); return;
      }
      ck.purchase(res.data, { value: sub - (couponDiscount || 0), paymentType: PAY_TYPE[payK] || payK });
      setDone(res);
      if (ctx.storeSlug) clearCart(ctx.storeSlug);
    } catch (e2) {
      setErr(String(e2?.message || tx('order.failed')));
    } finally { setBusy(false); }
  };

  const verifyOtp = async (ev) => {
    ev && ev.stopPropagation();
    if (otpVerifying || otpInput.length !== 6 || !ctx.verifyCheckoutOtp) return;
    setOtpErr(null); setOtpVerifying(true);
    const r = await ctx.verifyCheckoutOtp(otpSessionToken, otpInput, ck.trackingFor(ck.purchaseId()));
    if (!r.ok) {
      if (r.status === 410 || r.status === 429) {
        setOtpStep(false); setOtpInput(''); setOtpSessionToken(''); setErr(r.error || tx('checkout.verifyFailed'));
      } else {
        setOtpErr((r.error || tx('checkout.wrongCode')) + (r.attemptsLeft != null ? ' (' + tx('checkout.attemptsLeft', { n: r.attemptsLeft }) + ')' : ''));
      }
      setOtpVerifying(false); return;
    }
    ck.purchase(r.data, { value: sub - (couponDiscount || 0), paymentType: PAY_TYPE[payK] || payK });
    setDone(r);
    if (ctx.storeSlug) clearCart(ctx.storeSlug);
    setOtpVerifying(false);
  };

  const summaryBlock = (
    <>
      <div style={sx('font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; color:' + c.sub + ';')}>{tx('checkout.summary')}</div>
      <div style={{ marginTop: 12 }}>
        {bag.map((l, i) => {
          const lineSizes = String(l.p.sizes || '').split(',').map((s) => s.trim()).filter(Boolean);
          const sizeOptions = l.size && !lineSizes.includes(l.size) ? [l.size, ...lineSizes] : lineSizes;
          return (
            <div key={l.pid + ':' + (l.size || '') + ':' + (l.addOnOf || '')} style={sx('display:flex; gap:12px; align-items:center; padding:10px 0;' + (i ? ' border-top:1px solid ' + c.line + ';' : ''))}>
              <div style={sx('width:52px; height:66px; flex-shrink:0; border-radius:' + Math.min(C.rs, 10) + 'px; overflow:hidden; position:relative; background:' + c.bg + ';')}>
                <ImageSlot slotId={'st-prod-' + l.p.id} assets={{ ...(ctx.assets || {}), ['st-prod-' + l.p.id]: (ctx.assets || {})['st-prod-' + l.p.id] || l.p.img }} fit="cover" placeholder="" preview />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={sx('font-family:' + F.b + '; font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{l.p.n}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div onClick={(e) => { e.stopPropagation(); setBagLineQty(ctx, l, l.qty - 1); }} style={sx('width:20px; height:20px; border-radius:6px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800; font-size:11px;')}>−</div>
                    <span style={sx('font-family:' + F.b + '; font-size:11.5px; font-weight:700; min-width:12px; text-align:center;')}>{l.qty}</span>
                    <div onClick={(e) => { e.stopPropagation(); setBagLineQty(ctx, l, l.qty + 1); }} style={sx('width:20px; height:20px; border-radius:6px; border:1.5px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:800; font-size:11px;')}>+</div>
                  </div>
                  {sizeOptions.length > 0 && (
                    <select
                      value={l.size || ''} onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { if (ctx.storeSlug) updateSize(ctx.storeSlug, l.pid, l.size, e.target.value, l.addOnOf); }}
                      style={sx('font-family:' + F.b + '; font-size:11px; font-weight:700; color:' + c.fg + '; background:' + c.bg + '; border:1px solid ' + c.line + '; border-radius:' + Math.min(C.rs, 8) + 'px; padding:2px 5px; outline:none; cursor:pointer;')}
                    >
                      {sizeOptions.map((z) => <option key={z} value={z}>{tx('cart.size', { size: z })}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <div onClick={(e) => { e.stopPropagation(); setBagLineQty(ctx, l, 0); }} style={sx('cursor:pointer; color:' + c.sub + ';')} title={tx('cart.remove')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </div>
                <div style={sx('font-family:' + F.b + '; font-size:13px; font-weight:700; font-variant-numeric:tabular-nums;')}>{fmtPr(l.p.pr * l.qty)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid ' + c.line }}>
        {appliedCoupon ? (
          <div style={sx('display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:' + Math.min(C.rs, 10) + 'px; background:rgba(62,122,69,0.1);')}>
            <span style={sx('font-family:' + F.b + '; font-size:12.5px; font-weight:700; color:#3E7A45;')}>{tx('checkout.applied', { code: appliedCoupon.code })}</span>
            <span onClick={removeCoupon} style={sx('font-family:' + F.b + '; font-size:11.5px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>{tx('cart.remove')}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && applyCoupon(couponCode)}
              onClick={(e) => e.stopPropagation()} placeholder={tx('checkout.codePlaceholder')}
              style={sx('flex:1; padding:11px 13px; border-radius:' + Math.min(C.rs, 10) + 'px; border:1.5px solid ' + c.line + '; background:' + c.bg + '; color:' + c.fg + '; font-family:' + F.b + '; font-size:12.5px; outline:none; box-sizing:border-box;')}
              readOnly={!ctx.preview}
            />
            <div
              onClick={(e) => { e.stopPropagation(); applyCoupon(couponCode); }}
              style={sx('flex-shrink:0; display:flex; align-items:center; padding:0 16px; border-radius:' + Math.min(C.rs, 10) + 'px; background:' + (couponCode.trim() ? c.fg : c.line) + '; color:' + c.bg + '; font-family:' + F.b + '; font-weight:700; font-size:12px; cursor:pointer;')}
            >
              {couponLoading ? '…' : tx('checkout.apply')}
            </div>
          </div>
        )}
        {couponErr && <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:#B03A2E; margin-top:6px;')}>{couponErr}</div>}
      </div>

      <div style={sx('margin-top:14px; padding-top:14px; border-top:1px solid ' + c.line + ';')}>
        <div style={sx('display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + '; margin-bottom:8px;')}>
          <span>{tx('cart.subtotal')} · {tx(bag.reduce((n, l) => n + l.qty, 0) === 1 ? 'cart.count1' : 'cart.countN', { n: bag.reduce((n, l) => n + l.qty, 0) })}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPr(sub)}</span>
        </div>
        <div style={sx('display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + '; margin-bottom:8px;')}>
          <span>{tx('cart.delivery')}{district ? ' (' + district + ')' : ''}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{district ? fmtPr(dlv) : tx('checkout.selectDistrict')}</span>
        </div>
        {couponDiscount > 0 && (
          <div style={sx('display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:12.5px; color:#3E7A45; margin-bottom:8px;')}>
            <span>{tx('checkout.discount')}</span><span>−{fmtPr(couponDiscount)}</span>
          </div>
        )}
        <div style={sx('display:flex; justify-content:space-between; font-family:' + F.b + '; font-size:15.5px; font-weight:800; padding-top:12px; border-top:1px solid ' + c.line + ';')}>
          <span>{tx('checkout.total')}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPr(total)}</span>
        </div>
      </div>
    </>
  );

  /* ── OTP verification screen ──────────────────────────────── */
  if (otpStep) {
    const minutesLeft = otpExpiresAt ? Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 60000)) : 5;
    return (
      <div style={sx('padding:' + (mob ? 60 : 90) + 'px 24px; text-align:center; color:' + c.fg + ';')}>
        <div style={{ maxWidth: 360, margin: '0 auto' }}>
          <div style={sx('width:56px; height:56px; border-radius:99px; background:' + c.card + '; border:1px solid ' + c.line + '; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          </div>
          <div style={sx(headFont + 'font-size:' + (mob ? 24 : 28) + 'px; margin-bottom:8px;')}>{tx('checkout.verifyHead')}</div>
          <div style={sx('font-family:' + F.b + '; font-size:13.5px; color:' + c.sub + '; margin-bottom:24px; line-height:1.6;')}>{tx('checkout.sentCodeA')}<b style={{ color: c.fg }}>{otpMaskedPhone}</b>{tx('checkout.sentCodeB')}</div>
          <input
            type="tel" inputMode="numeric" maxLength={6} placeholder={tx('checkout.otpPlaceholder')} value={otpInput}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={sx(inp + 'font-size:22px; letter-spacing:8px; text-align:center; margin-bottom:8px;' + (otpErr ? ' border-color:#B03A2E;' : ''))}
            readOnly={!ctx.preview}
          />
          {otpErr && <div style={sx('font-family:' + F.b + '; font-size:12.5px; color:#B03A2E; margin-bottom:12px;')}>{otpErr}</div>}
          <div style={sx('font-family:' + F.b + '; font-size:12px; color:' + c.sub + '; margin-bottom:20px;')}>{tx(minutesLeft !== 1 ? 'checkout.expiresN' : 'checkout.expires1', { n: minutesLeft })}</div>
          <div onClick={verifyOtp} style={sx('display:flex; align-items:center; justify-content:center; gap:9px; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:14px; cursor:pointer; margin-bottom:12px;' + ((otpVerifying || otpInput.length !== 6) ? ' opacity:0.5; pointer-events:none;' : ''))}>
            {otpVerifying && <div style={{ width: 14, height: 14, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
            {otpVerifying ? tx('checkout.verifying') : tx('checkout.confirm')}
          </div>
          <div onClick={() => { setOtpStep(false); setOtpInput(''); setOtpErr(null); }} style={sx('font-family:' + F.b + '; font-size:12.5px; color:' + c.sub + '; cursor:pointer;')}>{tx('checkout.back')}</div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={sx('padding:' + (mob ? 60 : 90) + 'px 24px; text-align:center; color:' + c.fg + ';')}>
        <div style={sx('margin:0 auto; width:64px; height:64px; border-radius:99px; background:' + P.accent + '; color:' + P.accentInk + '; display:flex; align-items:center; justify-content:center; animation:checkPop .4s ease both;')}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <div style={sx(headFont + 'font-size:' + (mob ? 28 : 36) + 'px; margin-top:18px;')}>{tx('checkout.placed')}</div>
        <div style={sx('font-family:' + F.b + '; font-size:16px; font-weight:800; margin-top:10px; font-variant-numeric:tabular-nums;')}>{done.num}</div>
        <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:8px; line-height:1.6; max-width:420px; margin-left:auto; margin-right:auto;')}>{done.msg}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <div onClick={ctx.onAccount ? () => ctx.onAccount() : undefined} style={sx('padding:12px 22px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:13px; cursor:pointer;')}>{tx('checkout.track')}</div>
          <div onClick={ctx.onShop ? () => ctx.onShop() : undefined} style={sx('padding:12px 22px; border-radius:' + C.btn + '; border:1.5px solid ' + c.line + '; font-family:' + F.b + '; font-weight:700; font-size:13px; cursor:pointer;')}>{tx('checkout.keepShopping')}</div>
        </div>
      </div>
    );
  }

  if (bag.length === 0) {
    return (
      <div style={sx('padding:' + (mob ? 60 : 90) + 'px 24px; text-align:center; color:' + c.fg + ';')}>
        <div style={sx('font-family:' + F.b + '; font-size:14px; color:' + c.sub + '; margin-bottom:18px;')}>{tx('checkout.emptyBag')}</div>
        <div onClick={ctx.preview && ctx.onShop ? () => ctx.onShop() : undefined} style={sx('display:inline-flex; padding:12px 24px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:700; font-size:13.5px; cursor:pointer;')}>{tx('cart.browse')}</div>
      </div>
    );
  }

  return (
    <div style={sx('color:' + c.fg + ';')}>
      {mob && (
        <div style={sx('border-bottom:1px solid ' + c.line + ';')}>
          <div onClick={(e) => { e.stopPropagation(); setSummaryOpen((v) => !v); }} style={sx('padding:14px 20px; background:' + c.card + '; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-family:' + F.b + '; font-size:13px; font-weight:700;')}>
            <span>{tx('checkout.summaryCount', { n: bag.reduce((n, l) => n + l.qty, 0) })} {summaryOpen ? '▲' : '▼'}</span>
            <span>{fmtPr(total)}</span>
          </div>
          {summaryOpen && <div style={sx('padding:16px 20px; background:' + c.card + ';')}>{summaryBlock}</div>}
        </div>
      )}
      <div style={sx('padding:' + (mob ? 26 : 48) + 'px ' + (mob ? 20 : 48) + 'px 80px; max-width:1100px; margin:0 auto; box-sizing:border-box;')}>
        <div onClick={ctx.preview && ctx.onCart ? () => ctx.onCart() : undefined} style={sx('display:inline-flex; align-items:center; gap:7px; font-family:' + F.b + '; font-size:12.5px; font-weight:700; color:' + c.sub + '; cursor:pointer;')}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6 6l-6-6 6-6" /></svg>{tx('checkout.backToBag')}
        </div>
        <div style={sx(headFont + 'font-size:' + (mob ? 28 : 38) + 'px; line-height:1.08; margin-top:10px;')}>{tx('checkout.head')}</div>

        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.1fr 0.9fr', gap: mob ? 26 : 44, marginTop: 22, alignItems: 'start' }}>
          <div style={{ minWidth: 0, maxWidth: mob ? 'none' : 480 }}>
            <div style={sx('font-family:' + F.b + '; font-size:11px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:' + c.sub + ';')}>{tx('checkout.contact')}</div>
            <div style={sx(lbl + ' margin-top:14px;')}>{tx('checkout.fullName')} <span style={{ color: '#B03A2E' }}>*</span></div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.name} onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))} placeholder={tx('checkout.namePlaceholder')} style={sx(inp)} readOnly={!ctx.preview} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={sx(lbl)}>{tx('checkout.phone')} <span style={{ color: '#B03A2E' }}>*</span></div>
                <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} type="tel" value={form.phone} onChange={(ev) => setForm((f) => ({ ...f, phone: ev.target.value }))} placeholder="01XXXXXXXXX" style={sx(inp)} readOnly={!ctx.preview} /></div>
              </div>
              <div>
                <div style={sx(lbl)}>{tx('checkout.email')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{tx('checkout.optional')}</span></div>
                <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} type="email" value={form.email} onChange={(ev) => setForm((f) => ({ ...f, email: ev.target.value }))} placeholder="you@email.com" style={sx(inp)} readOnly={!ctx.preview} /></div>
              </div>
            </div>
            <div style={sx(lbl)}>{tx('checkout.address')}</div>
            <div style={{ marginTop: 8 }}>
              <textarea
                onClick={(ev) => ev.stopPropagation()} value={form.address} rows={2}
                onChange={(ev) => setForm((f) => ({ ...f, address: ev.target.value }))}
                onBlur={(ev) => handleAddressBlur(ev.target.value)}
                placeholder={tx('checkout.addressPlaceholder')} style={sx(inp + 'resize:none; line-height:1.5;')} readOnly={!ctx.preview}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <div>
                <div style={sx(lbl + ' margin-top:0;')}>{tx('checkout.district')} <span style={{ color: '#B03A2E' }}>*</span></div>
                <div style={{ marginTop: 8 }}>
                  <select
                    value={district} disabled={!ctx.preview}
                    onChange={(ev) => { ev.stopPropagation(); setDistrict(ev.target.value); setThana(''); setAutoDetected(false); }}
                    onClick={(ev) => ev.stopPropagation()} style={{ ...selectStyle, color: district ? c.fg : c.sub }}
                  >
                    <option value="">{tx('checkout.selectDistrict')}</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div style={sx(lbl + ' margin-top:0;')}>{tx('checkout.thana')} <span style={{ color: '#B03A2E' }}>*</span></div>
                <div style={{ marginTop: 8 }}>
                  <select
                    value={thana} disabled={!district || !ctx.preview}
                    onChange={(ev) => { ev.stopPropagation(); setThana(ev.target.value); }}
                    onClick={(ev) => ev.stopPropagation()} style={{ ...selectStyle, color: thana ? c.fg : c.sub, opacity: district ? 1 : 0.55 }}
                  >
                    <option value="">{tx('checkout.selectThana')}</option>
                    {getThanas(district).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {autoDetected && district && (
              <div style={sx('font-family:' + F.b + '; font-size:12px; color:#3E7A45; margin-top:10px; display:flex; align-items:center; gap:6px;')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                {tx('checkout.autoDetected')}
              </div>
            )}
            {district && (
              <div style={sx('margin-top:14px; padding:12px 14px; border-radius:' + Math.min(C.rs, 12) + 'px; border:1px solid ' + c.line + '; background:' + c.card + '; display:flex; align-items:center; justify-content:space-between; font-family:' + F.b + '; font-size:13px;')}>
                <span>{insideDhaka ? tx('checkout.insideDhaka') : tx('checkout.outsideDhaka')}</span>
                <b style={{ fontVariantNumeric: 'tabular-nums' }}>{freeByAmount ? tx('delivery.free') : fmtPr(dlv)}</b>
              </div>
            )}
            <div style={sx(lbl)}>{tx('checkout.orderNote')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{tx('checkout.optional')}</span></div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={form.note} onChange={(ev) => setForm((f) => ({ ...f, note: ev.target.value }))} placeholder={tx('checkout.notePlaceholder')} style={sx(inp)} readOnly={!ctx.preview} /></div>

            <div style={sx('font-family:' + F.b + '; font-size:11px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:' + c.sub + '; margin-top:26px; margin-bottom:10px;')}>{tx('checkout.payment')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hasCod && (
                <div onClick={ctx.preview ? (ev) => { ev.stopPropagation(); setPay('cod'); } : undefined} style={sx('display:flex; align-items:center; gap:11px; padding:12px 14px; border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (payGroup === 'cod' ? c.fg : c.line) + '; background:' + c.card + '; cursor:pointer;')}>
                  <div style={sx('width:17px; height:17px; border-radius:99px; border:1.5px solid ' + (payGroup === 'cod' ? c.fg : c.line) + '; display:flex; align-items:center; justify-content:center; flex-shrink:0;')}>
                    {payGroup === 'cod' && <div style={sx('width:9px; height:9px; border-radius:99px; background:' + c.fg + ';')} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={sx('font-family:' + F.b + '; font-size:13px; font-weight:700;')}>{payLbl(tx, 'cod').n}</div>
                    <div style={sx('font-family:' + F.b + '; font-size:11px; color:' + c.sub + '; margin-top:1px;')}>{payLbl(tx, 'cod').d}</div>
                  </div>
                  <img src="/payments/cash.svg" alt={tx('checkout.cashAlt')} style={{ height: 22, width: 'auto', flexShrink: 0 }} />
                </div>
              )}
              {hasOnline && (
                <div style={sx('border-radius:' + Math.min(C.rs, 12) + 'px; border:1.5px solid ' + (payGroup === 'online' ? c.fg : c.line) + '; background:' + c.card + '; overflow:hidden;')}>
                  <div onClick={ctx.preview ? (ev) => { ev.stopPropagation(); selectOnline(); } : undefined} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', cursor: 'pointer' }}>
                    <div style={sx('width:17px; height:17px; border-radius:99px; border:1.5px solid ' + (payGroup === 'online' ? c.fg : c.line) + '; display:flex; align-items:center; justify-content:center; flex-shrink:0;')}>
                      {payGroup === 'online' && <div style={sx('width:9px; height:9px; border-radius:99px; background:' + c.fg + ';')} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={sx('font-family:' + F.b + '; font-size:13px; font-weight:700;')}>{tx('checkout.payOnline')}</div>
                      <div style={sx('font-family:' + F.b + '; font-size:11px; color:' + c.sub + '; margin-top:1px;')}>{tx('checkout.payOnlineSub')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', maxWidth: 150, justifyContent: 'flex-end' }}>
                      {onlineMethods.includes('bkash') && <img src="/payments/bkash.png" alt="bKash" style={{ height: 20, width: 'auto' }} />}
                      {onlineMethods.includes('nagad') && <img src="/payments/nagad.svg" alt="Nagad" style={{ height: 20, width: 'auto' }} />}
                      <img src="/payments/visa.png" alt="Visa" style={{ height: 20, width: 'auto' }} />
                      <img src="/payments/mastercard.png" alt="Mastercard" style={{ height: 20, width: 'auto' }} />
                    </div>
                  </div>
                  {payGroup === 'online' && onlineMethods.length > 1 && (
                    <div onClick={(ev) => ev.stopPropagation()} style={sx('display:flex; gap:8px; padding:0 14px 12px 42px;')}>
                      {onlineMethods.map((k) => (
                        <div key={k} onClick={ctx.preview ? () => setPay(k) : undefined} style={sx('display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; border:1.5px solid ' + (payK === k ? c.fg : c.line) + '; font-family:' + F.b + '; font-size:11.5px; font-weight:700; cursor:pointer;' + (payK === k ? ' background:' + c.fg + '; color:' + c.bg + ';' : ''))}>
                          <img src={'/payments/' + (k === 'bkash' ? 'bkash.png' : 'nagad.svg')} alt="" style={{ height: 14, width: 'auto', borderRadius: 3, background: '#fff', padding: 1 }} />
                          {payLbl(tx, k).n}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {cs.trust !== false && (
              <div style={sx('margin-top:18px; display:flex; flex-wrap:wrap; gap:10px 22px; align-items:center;')}>
                {['ssl', 'verified', 'exchange'].map((t) => (
                  <div key={t} style={sx('display:flex; align-items:center; gap:7px; font-family:' + F.b + '; font-size:12px; font-weight:600; color:' + c.sub + ';')}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5" /></svg>{tx('checkout.trust.' + t)}
                  </div>
                ))}
              </div>
            )}

            {err && <div style={sx('margin-top:16px; padding:10px 12px; border-radius:10px; background:rgba(176,58,46,0.1); color:#B03A2E; font-family:' + F.b + '; font-size:12px; line-height:1.5;')}>{err}</div>}
            <div onClick={submit} style={sx('margin-top:16px; display:flex; align-items:center; justify-content:center; gap:9px; padding:15px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:14px; cursor:pointer;' + (busy ? ' opacity:0.6; pointer-events:none;' : ''))}>
              {busy && <div style={{ width: 14, height: 14, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
              {busy ? tx('checkout.placing') : tx('checkout.place', { total: fmtPr(total) })}
            </div>
            <div style={sx('margin-top:12px; display:flex; align-items:center; justify-content:center; gap:8px; font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; text-align:center;')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.5 2.8.7a2 2 0 011.8 2z" /></svg>
              <Editable secId="__sys:checkout" k="note" value={cs.note} style={''} preview={ctx.preview} tag="span" />
            </div>
          </div>

          {!mob && (
            <div style={sx('padding:20px 20px 18px; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';' + (ctx.shCard || ''))}>
              {summaryBlock}
            </div>
          )}
        </div>
      </div>
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
  const tx = siteText(ctx.theme?.lang);
  const ap = sys10t(sys, 'account', tx);
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
    } catch (e2) { setErr(String(e2?.message || tx('account.sendFailed'))); }
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
    } catch (e2) { setErr(String(e2?.message || tx('account.wrongCode'))); }
    finally { setBusy(false); }
  };

  return (
    <div style={sx('padding:' + (mob ? 40 : 70) + 'px ' + (mob ? 20 : 48) + 'px 90px; max-width:480px; margin:0 auto; box-sizing:border-box; text-align:center; color:' + c.fg + ';')}>
      <Editable secId="__sys:account" k="head" value={ap.head} style={headFont + 'font-size:' + (mob ? 28 : 36) + 'px; line-height:1.08;'} preview={ctx.preview} />
      <Editable secId="__sys:account" k="sub" value={ap.sub} style={'font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; margin-top:10px; line-height:1.6;'} multiline preview={ctx.preview} />
      <div style={sx('margin-top:26px; padding:' + (mob ? '22px 18px' : '28px 26px') + '; border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + '; text-align:left;' + (ctx.shCard || ''))}>
        {step === 'phone' && (
          <>
            <div style={sx(lbl)}>{tx('account.phone')}</div>
            <div style={{ marginTop: 8 }}><input onClick={(ev) => ev.stopPropagation()} value={phone} onChange={(ev) => setPhone(ev.target.value)} placeholder="01XXX-XXXXXX" style={sx(inp)} readOnly={!ctx.preview} /></div>
            {err && <div style={sx('margin-top:10px; font-family:' + F.b + '; font-size:12px; color:#B03A2E;')}>{err}</div>}
            <div onClick={sendCode} style={sx('margin-top:14px; display:flex; align-items:center; justify-content:center; gap:9px; padding:14px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:13.5px; cursor:pointer;' + (busy ? ' opacity:0.6; pointer-events:none;' : ''))}>
              {busy && <div style={{ width: 13, height: 13, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
              {tx('account.textMe')}
            </div>
          </>
        )}
        {step === 'otp' && (
          <>
            <div style={sx(lbl)}>{tx('account.code')}</div>
            <div style={{ marginTop: 10 }}>
              <input onClick={(ev) => ev.stopPropagation()} value={otp} onChange={(ev) => setOtp(ev.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" maxLength={4} style={sx(inp + 'text-align:center; letter-spacing:10px; font-size:20px; font-weight:800;')} readOnly={!ctx.preview} />
            </div>
            {devCode && <div style={sx('margin-top:10px; font-family:' + F.b + '; font-size:11px; color:' + c.sub + '; text-align:center;')}>Dev: SMS not configured — your code is <b>{devCode}</b></div>}
            {err && <div style={sx('margin-top:10px; font-family:' + F.b + '; font-size:12px; color:#B03A2E; text-align:center;')}>{err}</div>}
            <div onClick={verify} style={sx('margin-top:14px; display:flex; align-items:center; justify-content:center; gap:9px; padding:14px 20px; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:800; font-size:13.5px; cursor:pointer;' + (busy ? ' opacity:0.6; pointer-events:none;' : ''))}>
              {busy && <div style={{ width: 13, height: 13, borderRadius: 99, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'currentColor', animation: 'spin .7s linear infinite' }} />}
              {tx('account.show')}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 18 }}>
              <span onClick={ctx.preview ? sendCode : undefined} style={sx('font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>{tx('account.resend')}</span>
              <span onClick={ctx.preview ? () => { setStep('phone'); setErr(null); setDevCode(null); } : undefined} style={sx('font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>{tx('account.change')}</span>
            </div>
          </>
        )}
        {step === 'orders' && (
          <>
            {orders.length === 0 && <div style={sx('font-family:' + F.b + '; font-size:13px; color:' + c.sub + '; text-align:center; padding:14px 0;')}>{tx('account.none')}</div>}
            {orders.map((o, i) => (
              <div key={o.num} style={sx('display:flex; align-items:center; gap:12px; padding:13px 0;' + (i ? ' border-top:1px solid ' + c.line + ';' : ''))}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={sx('font-family:' + F.b + '; font-size:13.5px; font-weight:800; font-variant-numeric:tabular-nums;')}>{o.num}</div>
                  <div style={sx('font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + '; margin-top:2px;')}>{fmtPr(o.total)} · {new Date(o.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                </div>
                <div style={sx('flex-shrink:0; padding:5px 12px; border-radius:99px; font-family:' + F.b + '; font-size:10.5px; font-weight:800; background:color-mix(in srgb, ' + (STATUS_COL[o.status] || '#B07A2A') + ' 14%, transparent); color:' + (STATUS_COL[o.status] || '#B07A2A') + ';')}>
                  {STATUS_LBL[o.status] ? tx('account.status.' + o.status) : o.status}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <span onClick={ctx.preview ? () => { setStep('phone'); setOrders([]); setErr(null); setDevCode(null); } : undefined} style={sx('font-family:' + F.b + '; font-size:12px; font-weight:700; color:' + c.sub + '; text-decoration:underline; text-underline-offset:3px; cursor:pointer;')}>{tx('account.notYou')}</span>
            </div>
          </>
        )}
      </div>
      {step === 'orders' && (
        <div style={sx('margin-top:14px; font-family:' + F.b + '; font-size:11.5px; color:' + c.sub + ';')}>{tx('account.sms')}</div>
      )}
    </div>
  );
}
