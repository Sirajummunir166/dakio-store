'use client';
// Public funnel renderer (Phase 9) — chrome-free: no nav, no menus, no footer,
// nothing to leak an ad click. One product, a story built from normal sections,
// a quick order form, and a sticky order bar. Orders land in Dakio Orders,
// tagged by funnel. Noindex is set by the route's metadata.
import { useEffect, useState } from 'react';
import { co, resolveTheme } from './theme';
import { ImgCtx } from './ImageSlot';
import { SECTION_COMPONENTS } from './sections';
import { fmtPr } from './catalog';
import { optImg } from './publicCatalog';
import { orderVariantId, priceFor } from './variants';
import { useTracking } from '../tracking/TrackingRoot';
import { itemFromStudio } from '../../lib/tracking/items';

const MOBILE_QUERY = '(max-width: 767px)';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api';

const FONT_HREF = {
  clean: 'family=Hanken+Grotesk:wght@400;500;600;700;800',
  editorial: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Instrument+Serif',
  bold: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Archivo:wght@500;600;700;800;900',
  boutique: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&family=Karla:wght@400;500;600;700',
  banglam: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700',
  banglas: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@500;600;700',
};

export default function FunnelSite({ doc, fn, storeSlug, products = [], collections = [] }) {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const apply = () => setMob(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const theme = doc.theme || {};
  const { P, F, C, tsM, denM, shCard } = resolveTheme(theme);
  const padX = mob ? 20 : 48;
  const seoF = doc.seo || {};
  const product = products.find((p) => p.id === fn.pid) || products[0] || null;

  // Tracking: the funnel's own pixel fires on top of the store's (never
  // instead of it), and landing here is a view of its one product.
  const tk = useTracking();
  useEffect(() => {
    const pid = String(fn.pixel || '').replace(/[^0-9]/g, '');
    if (/^\d{10,20}$/.test(pid)) tk.addPixel(pid);
    const it = product ? itemFromStudio(product, { collections }) : null;
    if (it && tk.once('vi:' + window.location.pathname)) tk.track('view_item', { ecommerce: { currency: tk.currency, value: it.price, items: [it] } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToForm = () => {
    const q = (fn.sections || []).find((s) => s.type === 'qform');
    const el = q && document.getElementById('sec-' + q.id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Real order placement — the funnel's whole job. A 202 means the store's
  // fake-order protection wants the SMS code first: no order exists yet, so
  // the form shows its code step (verifyOrderOtp) — never a success.
  const placeOrder = async ({ product: bp, qty, size, name, phone, address, pay, eventId = null, tracking }) => {
    const payLbl = pay === 'bkash' ? 'bKash' : pay === 'nagad' ? 'Nagad' : 'COD';
    const res = await fetch(`${API}/store/${storeSlug}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        address: (address || '').trim() || '—',
        city: '—',
        district: '—',
        items: [{ productId: bp.id, variantId: orderVariantId(bp, size), qty, name: bp.n + (size ? ' — ' + size : '') }],
        paymentMethod: payLbl,
        note: `Funnel: ${fn.name} (/f/${fn.slug})${size ? ' · Size: ' + size : ''}`,
        metaEventId: eventId || undefined,
        tracking,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 202 && data.status === 'OTP_REQUIRED') {
      return { otpRequired: true, sessionToken: data.sessionToken, maskedPhone: data.maskedPhone || phone.trim(), expiresAt: data.expiresAt };
    }
    if (!res.ok) throw new Error(data.error || 'Couldn’t place the order — try again.');
    return { num: data.orderNumber, data, tag: `Saved in Dakio Orders — tagged “${fn.name}”. We call ${phone.trim()} to confirm.` };
  };

  // Same body as the basic checkout's verifyOtp (CheckoutClient).
  const verifyOrderOtp = async (sessionToken, otp, tracking) => {
    const res = await fetch(`${API}/store/${storeSlug}/orders/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, otp, tracking }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: data.error, attemptsLeft: data.attemptsLeft };
    return { ok: true, num: data.orderNumber, data, tag: `Saved in Dakio Orders — tagged “${fn.name}”. We call the number you gave to confirm.` };
  };

  // Incomplete Order (Storefront lead) once name + phone + address are in.
  const captureLead = ({ product: bp, qty, size, name, phone, address, tracking }) => {
    const unitPrice = priceFor(bp, size);
    fetch(`${API}/store/${storeSlug}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name: name.trim(), phone: phone.trim(), address: (address || '').trim() || undefined,
        cart: [{ productId: bp.id, name: bp.n + (size ? ' — ' + size : ''), qty, unitPrice }],
        cartValue: unitPrice * qty,
        sourceUrl: window.location.href,
        tracking,
      }),
    }).catch(() => {});
  };

  const ctx = {
    P, F, C, tsM, denM, shCard, mob, padX,
    preview: true, isPublic: true, theme,
    menus: { header: [], footer: [] },
    assets: doc.assets || {},
    cat: { products, collections },
    isSel: false,
    lazyImgs: seoF.lazy !== false,
    optImg: (u) => optImg(u, seoF),
    onLink: () => scrollToForm(), // every unlinked/linked button safely reaches the form
    onOrderForm: scrollToForm,
    fnPid: fn.pid,
    fnProduct: product,
    placeOrder,
    verifyOrderOtp,
    captureLead,
  };

  const renderSection = (sec) => {
    if (!sec || sec.hidden) return null;
    if (mob && sec.props.hideMob) return null;
    const Comp = SECTION_COMPONENTS[sec.type];
    if (!Comp) return null;
    const cc = co(sec.props.bg, P);
    return (
      <div key={sec.id} id={'sec-' + sec.id} data-section-type={sec.type} style={{ position: 'relative', background: cc.bg, color: cc.fg }}>
        <Comp sec={sec} ctx={ctx} />
      </div>
    );
  };

  return (
    <ImgCtx.Provider value={{ crops: doc.crops || {}, cropTarget: null, setCropTarget: null, onCrop: null }}>
    <div style={{ background: P.bg, color: P.ink, fontFamily: F.b, overflow: 'hidden', minHeight: '100vh' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?${FONT_HREF[theme.f] || FONT_HREF.clean}&display=swap`} rel="stylesheet" />
      <style>{`
        html, body { margin:0; scroll-behavior:smooth; }
        @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-33.333%); } }
        @keyframes checkPop { 0% { transform:scale(0.4); opacity:0; } 60% { transform:scale(1.12); } 100% { transform:scale(1); opacity:1; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        input::placeholder { color: currentColor; opacity: .38; }
      `}</style>
      {(fn.sections || []).map(renderSection)}

      {fn.bar !== false && product && (
        <div style={{ position: 'sticky', bottom: 0, zIndex: 40, display: 'flex', alignItems: 'center', gap: 14, padding: mob ? '10px 16px' : '12px 28px', background: P.ink, color: P.bg, fontFamily: F.b, boxShadow: '0 -10px 30px rgba(10,11,8,0.25)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: mob ? 12.5 : 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.n}</div>
            <div style={{ fontSize: mob ? 12 : 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums', opacity: 0.85 }}>
              {fmtPr(product.pr)}{product.was ? <span style={{ textDecoration: 'line-through', opacity: 0.55, marginLeft: 8, fontWeight: 600 }}>{fmtPr(product.was)}</span> : null}
            </div>
          </div>
          <div onClick={scrollToForm} style={{ flexShrink: 0, padding: mob ? '10px 20px' : '11px 26px', borderRadius: 99, background: P.accent, color: P.accentInk, fontSize: mob ? 12.5 : 13.5, fontWeight: 800, cursor: 'pointer' }}>
            Order now
          </div>
        </div>
      )}
    </div>
    </ImgCtx.Provider>
  );
}
