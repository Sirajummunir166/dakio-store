'use client';
import { useEffect, useRef, useState } from 'react';
import { co, resolveTheme } from './theme';
import { ImgCtx } from './ImageSlot';
import { SECTION_COMPONENTS } from './sections';
import { optImg } from './publicCatalog';
import { sanitizeThemeUrl } from '../../lib/theme/sanitizeThemeUrl';

// Public renderer for a published Store Studio site — the same section components
// the studio canvas uses, in preview mode (no editing affordances), with real
// navigation instead of the postMessage bridge.
//
// basePath: '/{tenantSlug}' on the path-based tree, '' on a custom domain.

const MOBILE_QUERY = '(max-width: 767px)';

// Hanken Grotesk is always needed (hardcoded UI bits in sections); the rest per pair.
const FONT_HREF = {
  clean: 'family=Hanken+Grotesk:wght@400;500;600;700;800',
  editorial: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Instrument+Serif',
  bold: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Archivo:wght@500;600;700;800;900',
  boutique: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&family=Karla:wght@400;500;600;700',
  banglam: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700',
  banglas: 'family=Hanken+Grotesk:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@500;600;700',
};

export default function PublicSite({ doc, pageId, basePath = '', products = [], collections = [] }) {
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
  const page = doc.pages.find((p) => p.id === pageId) || doc.pages[0];
  const base = co('base', P);
  const brandText = (theme.brandMode ?? 'text') !== 'image';
  const brandName = theme.brandName ?? 'Store';
  const assets = doc.assets || {};

  const pageHref = (id) => {
    const pg = doc.pages.find((p) => p.id === id);
    if (!pg || pg.slug === '/') return basePath || '/';
    return basePath + pg.slug;
  };

  // WhatsApp number comes from the first Contact section anywhere on the site
  const waDigits = () => {
    let ph = '';
    for (const pg of doc.pages) {
      const s = pg.sections.find((x) => x.type === 'contact');
      if (s && s.props.phone) { ph = s.props.phone; break; }
    }
    const d = String(ph).replace(/\D/g, '');
    if (!d) return null;
    return d.startsWith('0') ? '88' + d : d;
  };

  // Resolve a stored link to an href. Deleted targets fall back gracefully:
  // a missing section scrolls to the top of its page, a missing page goes home.
  const linkHref = (link) => {
    if (!link) return null;
    if (link.t === 'page') return pageHref(link.ref);
    if (link.t === 'sec') {
      const pg = doc.pages.find((p) => p.id === link.ref);
      if (!pg) return basePath || '/';
      const s = pg.sections.find((x) => x.id === link.sec && !x.hidden);
      if (!s) return pageHref(pg.id);
      return pg.id === page.id ? `#sec-${s.id}` : `${pageHref(pg.id)}#sec-${s.id}`;
    }
    if (link.t === 'wa') {
      const d = waDigits();
      return d ? `https://wa.me/${d}` : null;
    }
    if (link.t === 'url') return sanitizeThemeUrl(link.ref);
    if (link.t === 'prod') {
      // Refs are product ids; pre-Phase-5 docs stored display names — match both
      const p = products.find((x) => x.id === link.ref) || products.find((x) => x.n === link.ref);
      return p && p.slug ? `${basePath}/products/${p.slug}` : null;
    }
    if (link.t === 'col') {
      const c = collections.find((x) => x.id === link.ref) || collections.find((x) => x.n === link.ref);
      return c && c.slug ? `${basePath}/collections/${c.slug}` : null;
    }
    return null;
  };

  const isExternal = (href) => /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');

  // Click navigation for section CTAs (ann link, hero/story buttons, footer items)
  const onLink = (link) => {
    const href = linkHref(link);
    if (!href) return; // unlinked or unresolvable — inert on the live store
    if (href.startsWith('#')) {
      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (isExternal(href)) { window.open(href, '_blank', 'noopener'); return; }
    window.location.href = href;
  };

  // Cross-page section links land with a #sec-… hash — scroll to it once rendered
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash.startsWith('#sec-')) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) {
      const tm = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      return () => clearTimeout(tm);
    }
  }, []);

  const seoF = doc.seo || {};
  const ctx = {
    P, F, C, tsM, denM, shCard, mob, padX,
    preview: true, isPublic: true, theme,
    menus: doc.menus, assets,
    cat: { products, collections },
    isSel: false,
    lazyImgs: seoF.lazy !== false,
    optImg: (u) => optImg(u, seoF),
    onGoPage: (id) => { window.location.href = pageHref(id); },
    onLink,
  };

  // Reveal on scroll — IntersectionObserver flips each animated section once
  const [revealed, setRevealed] = useState({});
  const revEls = useRef({});
  const hasAnim = doc.pages.some((pg) => pg.sections.some((s) => s.props.anim && s.props.anim !== 'none'));
  useEffect(() => {
    if (!hasAnim || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((ents) => {
      const add = {};
      ents.forEach((en) => {
        if (en.isIntersecting) {
          const id = en.target.getAttribute('data-rv');
          if (id) { add[id] = true; io.unobserve(en.target); }
        }
      });
      if (Object.keys(add).length) setRevealed((r) => ({ ...r, ...add }));
    }, { threshold: 0.05 });
    Object.values(revEls.current).forEach((el) => { if (el && el.isConnected) io.observe(el); });
    return () => io.disconnect();
  }, [hasAnim, page.id]);

  const renderSection = (sec) => {
    if (!sec || sec.hidden) return null;
    if (mob && sec.props.hideMob) return null; // per-device control: hidden on phones
    const Comp = SECTION_COMPONENTS[sec.type];
    if (!Comp) return null;
    const cc = co(sec.props.bg, P);
    const anim = sec.props.anim && sec.props.anim !== 'none' ? sec.props.anim : null;
    const animStyle = anim
      ? (revealed[sec.id] ? { animation: 'rv' + anim + ' .7s cubic-bezier(.16,1,.3,1) both' } : { opacity: 0 })
      : {};
    return (
      <div
        key={sec.id} id={'sec-' + sec.id} data-section-type={sec.type}
        {...(anim ? { 'data-rv': sec.id, ref: (el) => { if (el) revEls.current[sec.id] = el; } } : {})}
        style={{ position: 'relative', background: cc.bg, color: cc.fg, ...animStyle }}
      >
        <Comp sec={sec} ctx={ctx} />
      </div>
    );
  };

  const navItems = (doc.menus?.header || []).slice(0, 6);

  return (
    <ImgCtx.Provider value={{ crops: doc.crops || {}, cropTarget: null, setCropTarget: null, onCrop: null }}>
    <div style={{ background: P.bg, color: P.ink, fontFamily: F.b, overflow: 'hidden', minHeight: '100vh' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?${FONT_HREF[theme.f] || FONT_HREF.clean}&display=swap`} rel="stylesheet" />
      <style>{`
        html, body { margin:0; scroll-behavior:smooth; }
        @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-33.333%); } }
        @keyframes rvrise { 0% { opacity:0; transform:translateY(30px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes rvfade { 0% { opacity:0; } 100% { opacity:1; } }
        @keyframes rvzoom { 0% { opacity:0; transform:scale(0.94); } 100% { opacity:1; transform:scale(1); } }
        input::placeholder { color: currentColor; opacity: .38; }
        .studio-nav-link { color: inherit; text-decoration: none; }
      `}</style>

      {/* store nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: mob ? '15px 20px' : '18px 48px', borderBottom: '1px solid ' + base.line }}>
        <a href={basePath || '/'} className="studio-nav-link" style={{ display: 'block' }}>
          {brandText ? (
            <div style={{ fontFamily: F.h, fontWeight: Math.max(F.hw, 600), fontSize: mob ? 20 : 23, letterSpacing: F.ls }}>
              {brandName}
            </div>
          ) : (
            <div style={{ height: mob ? 26 : 32, width: mob ? 110 : 150, position: 'relative' }}>
              {assets['st-brand-logo'] ? (
                <img src={assets['st-brand-logo']} alt={brandName} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left', display: 'block' }} />
              ) : (
                <div style={{ fontFamily: F.h, fontWeight: Math.max(F.hw, 600), fontSize: mob ? 20 : 23, letterSpacing: F.ls }}>{brandName}</div>
              )}
            </div>
          )}
        </a>
        {!mob && (
          <div style={{ display: 'flex', gap: 26, fontSize: 13, fontWeight: 600, color: base.sub }}>
            {navItems.map((it) => {
              const href = linkHref(it.link);
              const active = it.link.t === 'page' && it.link.ref === page.id;
              const style = { whiteSpace: 'nowrap', ...(active ? { color: P.ink, textDecoration: 'underline', textUnderlineOffset: 5 } : {}) };
              const ext = href && isExternal(href);
              return href ? (
                <a key={it.id} href={href} className="studio-nav-link" style={style} {...(ext ? { target: '_blank', rel: 'noopener' } : {})}>{it.label}</a>
              ) : (
                <span key={it.id} style={style}>{it.label}</span>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l1 14H5L6 7zM9 10V6a3 3 0 016 0v4" /></svg>
        </div>
      </div>

      {(page.sections || []).map(renderSection)}
      {doc.footer && renderSection(doc.footer)}
    </div>
    </ImgCtx.Provider>
  );
}
