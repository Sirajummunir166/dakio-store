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

  const scrollToForm = () => {
    const q = (fn.sections || []).find((s) => s.type === 'qform');
    const el = q && document.getElementById('sec-' + q.id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Real order placement — the funnel's whole job
  const placeOrder = async ({ product: bp, qty, size, name, phone, address, pay }) => {
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
        items: [{ productId: bp.id, qty, name: bp.n }],
        paymentMethod: payLbl,
        note: `Funnel: ${fn.name} (/f/${fn.slug})${size ? ' · Size: ' + size : ''}`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Couldn’t place the order — try again.');
    // FB pixel Purchase — fires only on a real 201 with an order number
    try {
      if (fn.pixel && typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', { value: bp.pr * qty, currency: 'BDT' });
      }
    } catch { /* pixel is best-effort */ }
    return { num: data.orderNumber, tag: `Saved in Dakio Orders — tagged “${fn.name}”. We call ${phone.trim()} to confirm.` };
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
      {fn.pixel && (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${String(fn.pixel).replace(/[^0-9]/g, '')}');fbq('track','PageView');`,
          }}
        />
      )}

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
