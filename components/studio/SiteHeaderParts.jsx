'use client';
import { useEffect } from 'react';

// The header's right side and the phone menu (DAKIO_SERVICES_WEBSITE_PLAN.md W0).
// Shared by the public site (PublicSite) and the editor canvas (StudioCanvas),
// so what the owner edits is what visitors get.
//
// `doc.menus.bar` (optional) sets the header's mode:
//   { mode: 'shop' | 'service', cta: { label, link } | null, wa: bool, call: bool }
// 'shop' (the default, and every site made before W0) keeps search, cart and
// account. 'service' shows the business's main button plus WhatsApp and call.

const WORDS = {
  en: { menu: 'Menu', close: 'Close menu', contact: 'Contact us', call: 'Call', whatsapp: 'WhatsApp' },
  bn: { menu: 'মেনু', close: 'মেনু বন্ধ করুন', contact: 'যোগাযোগ করুন', call: 'কল করুন', whatsapp: 'হোয়াটসঅ্যাপ' },
};
export const headerWords = (lang) => WORDS[lang === 'bn' ? 'bn' : 'en'];

/** The header settings, safe whatever the doc holds. */
export function barOf(doc) {
  const b = doc?.menus?.bar && typeof doc.menus.bar === 'object' ? doc.menus.bar : {};
  const cta = b.cta && typeof b.cta === 'object' && typeof b.cta.label === 'string' && b.cta.label.trim() ? { label: b.cta.label.trim().slice(0, 40), link: b.cta.link || null } : null;
  return { mode: b.mode === 'service' ? 'service' : 'shop', cta, wa: b.wa !== false, call: b.call === true };
}

/** The first Contact section's phone, as digits with the country code (8801…), or null. */
export function contactDigits(doc) {
  for (const pg of doc?.pages || []) {
    const s = (pg.sections || []).find((x) => x.type === 'contact');
    if (s && s.props && s.props.phone) {
      const d = String(s.props.phone).replace(/\D/g, '');
      if (d) return d.startsWith('0') ? '88' + d : d;
    }
  }
  return null;
}

/** The link the main button follows: the owner's, else WhatsApp, else the first Contact section. */
export function ctaLinkOf(doc, bar) {
  if (bar.cta?.link) return bar.cta.link;
  if (contactDigits(doc)) return { t: 'wa', ref: 'chat' };
  for (const pg of doc?.pages || []) {
    const s = (pg.sections || []).find((x) => x.type === 'contact' && !x.hidden);
    if (s) return { t: 'sec', ref: pg.id, sec: s.id };
  }
  return null;
}

const ico = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const WaIcon = () => <svg {...ico}><path d="M21 15a4 4 0 01-4 4H8l-5 3V6a4 4 0 014-4h10a4 4 0 014 4v9z" /></svg>;
export const CallIcon = () => <svg {...ico}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" /></svg>;
export const MenuIcon = () => <svg {...ico}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
const CloseIcon = () => <svg {...ico}><path d="M6 6l12 12M18 6L6 18" /></svg>;

/**
 * The business header's right side: the main button, then WhatsApp and call.
 * `on.cta / on.wa / on.call` are click handlers (the canvas routes them over
 * the bridge); `hrefs` are real links for the public site.
 */
export function ServiceActions({ bar, label, P, C, mob, hasWa, hasCall, hrefs = {}, on = {}, words }) {
  const btn = { display: 'inline-flex', alignItems: 'center', padding: mob ? '8px 14px' : '10px 20px', borderRadius: C?.btn ?? 99, background: P.accent, color: P.accentInk, fontSize: mob ? 12.5 : 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', fontFamily: 'inherit' };
  const iconLink = { display: 'flex', color: 'inherit', textDecoration: 'none', cursor: 'pointer' };
  const A = ({ href, onClick, style, title, children, ext }) => (href
    ? <a href={href} onClick={onClick} style={style} title={title} {...(ext ? { target: '_blank', rel: 'noopener' } : {})}>{children}</a>
    : <span onClick={onClick} style={style} title={title}>{children}</span>);
  return (
    <div data-header-mode="service" style={{ display: 'flex', gap: mob ? 12 : 16, alignItems: 'center' }}>
      {bar.wa && hasWa && !mob ? <A href={hrefs.wa} ext onClick={on.wa} style={iconLink} title={words.whatsapp}><WaIcon /></A> : null}
      {bar.call && hasCall ? <A href={hrefs.call} onClick={on.call} style={iconLink} title={words.call}><CallIcon /></A> : null}
      <A href={hrefs.cta} ext={hrefs.ctaExt} onClick={on.cta} style={btn}>{label}</A>
    </div>
  );
}

/**
 * The phone menu: a drawer from the right with the header links, and — for a
 * business — the main button, WhatsApp and call. Closes on Escape, on the
 * backdrop, and when a link is followed.
 */
export function MobileMenu({ open, onClose, items, P, F, C, base, words, footer = null }) {
  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div data-mobile-menu role="dialog" aria-modal="true" aria-label={words.menu} style={{ position: 'fixed', inset: 0, zIndex: 2147483646 }}>
      <style>{'@keyframes shpFade{0%{opacity:0}100%{opacity:1}}@keyframes shpSlide{0%{transform:translateX(100%)}100%{transform:translateX(0)}}'}</style>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,11,8,0.45)', animation: 'shpFade .2s ease both' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(84vw, 340px)', background: P.bg, color: P.ink, display: 'flex', flexDirection: 'column', animation: 'shpSlide .25s cubic-bezier(.16,1,.3,1) both', fontFamily: F.b }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 16px' }}>
          <button type="button" onClick={onClose} aria-label={words.close} style={{ display: 'flex', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 6 }}><CloseIcon /></button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', overflowY: 'auto', flex: 1 }}>
          {items.map((it) => (
            <a key={it.id} href={it.href || undefined} onClick={(e) => { if (it.onClick) { e.preventDefault(); it.onClick(); } onClose(); }} {...(it.ext ? { target: '_blank', rel: 'noopener' } : {})}
              style={{ padding: '14px 12px', fontSize: 16, fontWeight: it.active ? 700 : 600, color: 'inherit', textDecoration: 'none', borderBottom: '1px solid ' + base.line, cursor: 'pointer' }}>
              {it.label}
            </a>
          ))}
        </nav>
        {footer ? <div style={{ padding: 16, borderTop: '1px solid ' + base.line, display: 'flex', flexDirection: 'column', gap: 10 }}>{footer}</div> : null}
      </div>
    </div>
  );
}
