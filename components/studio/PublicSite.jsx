'use client';
import { useEffect, useState } from 'react';
import { PAL, FON, COR, co } from './theme';
import { SECTION_COMPONENTS } from './sections';

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
  const P = PAL[theme.p] || PAL.porcelain;
  const F = FON[theme.f] || FON.clean;
  const C = COR[theme.c] || COR.soft;
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

  const linkHref = (link) => {
    if (!link) return null;
    if (link.t === 'page') return pageHref(link.ref);
    if (link.t === 'url') return link.ref;
    if (link.t === 'prod') {
      const p = products.find((x) => x.n === link.ref);
      return p && p.slug ? `${basePath}/products/${p.slug}` : null;
    }
    return null; // collections: no public collection page yet
  };

  const ctx = {
    P, F, C, mob, padX,
    preview: true, theme,
    menus: doc.menus, assets,
    products, collections,
    isSel: false,
    onGoPage: (id) => { window.location.href = pageHref(id); },
  };

  const renderSection = (sec) => {
    if (!sec || sec.hidden) return null;
    const Comp = SECTION_COMPONENTS[sec.type];
    if (!Comp) return null;
    const cc = co(sec.props.bg, P);
    return (
      <div key={sec.id} data-section-type={sec.type} style={{ position: 'relative', background: cc.bg, color: cc.fg }}>
        <Comp sec={sec} ctx={ctx} />
      </div>
    );
  };

  const navItems = (doc.menus?.header || []).slice(0, 6);

  return (
    <div style={{ background: P.bg, color: P.ink, fontFamily: F.b, overflow: 'hidden', minHeight: '100vh' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={`https://fonts.googleapis.com/css2?${FONT_HREF[theme.f] || FONT_HREF.clean}&display=swap`} rel="stylesheet" />
      <style>{`
        html, body { margin:0; }
        @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-33.333%); } }
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
              return href ? (
                <a key={it.id} href={href} className="studio-nav-link" style={style}>{it.label}</a>
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
  );
}
