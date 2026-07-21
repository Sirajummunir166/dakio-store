'use client';
import { useEffect, useRef, useState } from 'react';
import { send, listen } from './bridge';
import { co, sx, resolveTheme } from './theme';
import { SEC_NAMES, DEMO_CATALOG } from './catalog';
import Editable from './Editable';
import ImageSlot, { ImgCtx } from './ImageSlot';
import { SECTION_COMPONENTS } from './sections';

const I = {
  up: 'M12 19V5m-6 6l6-6 6 6',
  down: 'M12 5v14m6-6l-6 6-6-6',
  dup: 'M5 15V5a2 2 0 012-2h10',
  trash: 'M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6',
  eyeOff: 'M3 3l18 18M10.6 10.7a3 3 0 004.2 4.2M9.9 4.7A10 10 0 0122 12c-.6 1.2-1.5 2.5-2.6 3.6M6.2 6.2A10.6 10.6 0 002 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8',
  plus: 'M12 5v14M5 12h14',
};

function Icon({ d, size = 13, sw = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={d} />
    </svg>
  );
}

function ToolBtn({ d, sw = 2, title, onClick, disabled, danger }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(e); }}
      className={danger ? 'st-tbtn-danger' : 'st-tbtn'}
      style={{
        width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? '#ff9d92' : '#f4f6ec', cursor: 'pointer',
        ...(disabled ? { opacity: 0.3, pointerEvents: 'none' } : {}),
      }}
      title={title}
    >
      <Icon d={d} sw={sw} />
    </div>
  );
}

export default function StudioCanvas() {
  const [st, setSt] = useState(null); // {doc, curPage, device, preview, sel, building}
  const [cropTarget, setCropTarget] = useState(null);
  const [revealed, setRevealed] = useState({}); // secId → true once scrolled into view (preview)
  const els = useRef({});
  const rootRef = useRef(null);
  const stR = useRef(null);

  useEffect(() => {
    const off = listen((m) => {
      if (m.t === 'state') setSt({ doc: m.doc, catalog: m.catalog, curPage: m.curPage, device: m.device, preview: m.preview, sel: m.sel, building: m.building, cmts: m.cmts || [], cmtOpen: m.cmtOpen || null });
      if (m.t === 'scrollToSec') {
        const el = els.current[m.id];
        if (el) send('secOffset', { id: m.id, top: el.offsetTop });
      }
      // Chrome asks a specific slot to enter focus & crop mode
      if (m.t === 'cropSlot') setCropTarget(m.slotId || null);
      // Parent owns the scroll (auto-height iframe) — it streams its viewport so
      // reveal-on-scroll can fire as sections come into view during preview.
      if (m.t === 'viewport') {
        const cur = stR.current;
        if (!cur || !cur.preview) return;
        const bottom = (m.top || 0) + (m.h || 0);
        setRevealed((r) => {
          let next = null;
          for (const [id, el] of Object.entries(els.current)) {
            if (r[id] || !el || !el.isConnected) continue;
            if (el.offsetTop < bottom - 40) { next = next || { ...r }; next[id] = true; }
          }
          return next || r;
        });
      }
    });
    send('ready');
    return off;
  }, []);

  stR.current = st;

  // Leaving preview resets reveals so the animations replay next time
  useEffect(() => {
    if (st && !st.preview) setRevealed({});
  }, [st && st.preview]); // eslint-disable-line react-hooks/exhaustive-deps

  // Crop mode ends if the slot's image disappears or preview starts
  useEffect(() => {
    if (!cropTarget || !st) return;
    if (st.preview || !(st.doc.assets || {})[cropTarget]) setCropTarget(null);
  }, [cropTarget, st]);

  // Report content height so the parent can size the iframe and own the scroll
  useEffect(() => {
    if (!rootRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      send('height', { px: rootRef.current ? rootRef.current.offsetHeight : 0 });
    });
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [st !== null]);

  // Forward undo/redo keystrokes to the chrome
  useEffect(() => {
    const kd = (ev) => {
      if (ev.target && (ev.target.isContentEditable || /INPUT|TEXTAREA/.test(ev.target.tagName))) return;
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'z') {
        ev.preventDefault();
        send(ev.shiftKey ? 'redo' : 'undo');
      }
    };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
  }, []);

  if (!st || !st.doc) return null;

  const { doc, catalog, curPage, device, preview, sel, building, cmts, cmtOpen } = st;
  const theme = doc.theme;
  const { P, F, C, tsM, denM, shCard } = resolveTheme(theme);
  const mob = device === 'mobile';
  const padX = mob ? 20 : 48;
  const page = doc.pages.find((p) => p.id === curPage) || doc.pages[0];
  const sections = page.sections;
  const base = co('base', P);
  const brandText = (theme.brandMode ?? 'text') !== 'image';
  const brandName = theme.brandName ?? 'Shahrqee';

  const cat = catalog && Array.isArray(catalog.products) && catalog.products.length ? catalog : DEMO_CATALOG;

  const ctxFor = (sec) => ({
    P, F, C, tsM, denM, shCard, mob, padX, preview, theme,
    menus: doc.menus, assets: doc.assets || {},
    cat,
    isSel: !preview && sel === sec.id,
    onGoPage: (id) => send('goPage', { id }),
    // Preview link clicks route to the chrome, which owns navigation + scrolling
    onLink: (link) => send('navLink', { link }),
  });

  const renderSection = (sec, i, last, isFooter) => {
    const Comp = SECTION_COMPONENTS[sec.type];
    if (!Comp) return null;
    const isSel = !preview && sel === sec.id;
    const hid = !!sec.hidden && !preview;
    const name = SEC_NAMES[sec.type] || 'Section';
    // Per-device control: hidden on phones (desktop keeps it)
    const mobOff = mob && !!sec.props.hideMob && !sec.hidden;
    // Reveal on scroll — plays in preview as the section enters the viewport
    const anim = sec.props.anim && sec.props.anim !== 'none' ? sec.props.anim : null;
    const animStyle = preview && anim
      ? (revealed[sec.id] ? { animation: 'rv' + anim + ' .7s cubic-bezier(.16,1,.3,1) both' } : { opacity: 0 })
      : { animation: 'popIn .35s ease both' };

    return (
      <div key={sec.id}>
        {/* insert-between zone */}
        {!preview && !isFooter && (
          <div className="st-zone" onClick={(e) => { e.stopPropagation(); send('lib', { at: i }); }}
            style={{ height: 0, position: 'relative', zIndex: 24, cursor: 'pointer' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: -1, height: 2, background: '#C6F035' }} />
            <div style={{ position: 'absolute', left: '50%', top: -13, transform: 'translateX(-50%)', width: 26, height: 26, borderRadius: 99, background: '#1A1D12', color: '#C6F035', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(26,29,18,0.35)' }}>
              <Icon d={I.plus} sw={2.6} />
            </div>
          </div>
        )}

        {hid && (
          <div onClick={() => send('act', { a: 'show', id: sec.id })}
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, borderTop: '1.5px dashed rgba(128,128,128,0.3)', borderBottom: '1.5px dashed rgba(128,128,128,0.3)', opacity: 0.55, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <Icon d={I.eyeOff} sw={1.8} size={12} />
            {name} is hidden — click to show
          </div>
        )}

        {mobOff && !preview && (
          <div onClick={() => send('act', { a: 'mobShow', id: sec.id })}
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, borderTop: '1.5px dashed rgba(128,128,128,0.3)', borderBottom: '1.5px dashed rgba(128,128,128,0.3)', opacity: 0.55, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M4 4l16 16" /></svg>
            {name} is hidden on phones — click to show it here too
          </div>
        )}

        {!sec.hidden && !mobOff && (
          <div
            ref={(el) => { if (el) els.current[sec.id] = el; }}
            onClick={(e) => { e.stopPropagation(); if (!preview) send('sel', { id: sec.id }); }}
            className={!preview && !isSel ? 'st-sec' : undefined}
            data-section-type={sec.type}
            style={{
              position: 'relative', background: co(sec.props.bg, P).bg, color: co(sec.props.bg, P).fg,
              ...animStyle,
              ...(preview ? {} : { cursor: 'pointer' }),
              ...(isSel ? { outline: '3px solid #C6F035', outlineOffset: -3, boxShadow: '0 0 0 1px rgba(26,29,18,0.35) inset', zIndex: 2 } : {}),
            }}
          >
            {!preview && (cmts || []).some((c) => c.secId === sec.id && !c.done) && (() => {
              const scs = cmts.filter((c) => c.secId === sec.id && !c.done);
              const open = cmtOpen === sec.id;
              return (
                <>
                  <div
                    onClick={(e) => { e.stopPropagation(); send('cmtToggle', { id: sec.id }); }}
                    title="Comments"
                    style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 21, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 4px', borderRadius: 99, background: '#1A1D12', color: '#f4f6ec', cursor: 'pointer', boxShadow: '0 8px 22px rgba(26,29,18,0.35)', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 11, fontWeight: 800 }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 99, background: '#4C7A3F', color: '#F2F6E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                      {(scs[0].author || 'V')[0].toUpperCase()}
                    </div>
                    {scs.length}
                  </div>
                  {open && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ position: 'absolute', bottom: 56, right: 12, zIndex: 30, width: 272, borderRadius: 14, background: '#f6f7f0', border: '1px solid rgba(27,30,21,0.12)', boxShadow: '0 18px 50px rgba(20,22,14,0.3)', padding: 12, cursor: 'default', textAlign: 'left', fontFamily: "'Hanken Grotesk',sans-serif", color: '#1b1e15' }}
                    >
                      {scs.map((c) => (
                        <div key={c.id} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 99, background: '#4C7A3F', color: '#F2F6E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{(c.author || 'V')[0].toUpperCase()}</div>
                            <div style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.author} <span style={{ color: '#9a9e8c', fontWeight: 600 }}>· {c.role}</span>
                            </div>
                            <div onClick={() => send('cmtResolve', { id: c.id })} style={{ fontSize: 10, fontWeight: 800, color: '#3E7A45', cursor: 'pointer', flexShrink: 0 }}>Resolve</div>
                          </div>
                          <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.5 }}>{c.txt}</div>
                          {(Array.isArray(c.replies) ? c.replies : []).map((rp, ri) => (
                            <div key={ri} style={{ marginTop: 6, padding: '7px 9px', borderRadius: 9, background: '#eef0e6', fontSize: 11.5, lineHeight: 1.45 }}><b>{rp.author || 'You'}</b> — {rp.txt}</div>
                          ))}
                        </div>
                      ))}
                      <input
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const t = (e.target.value || '').trim();
                            if (t) { send('cmtReply', { secId: sec.id, txt: t }); e.target.value = ''; }
                          }
                        }}
                        placeholder="Reply… (Enter to send)"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 9, border: '1.5px solid rgba(27,30,21,0.12)', background: '#fbfcf7', fontSize: 11.5, fontFamily: "'Hanken Grotesk',sans-serif", outline: 'none' }}
                      />
                    </div>
                  )}
                </>
              );
            })()}
            {isSel && (
              <>
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 22, padding: '4px 10px', borderRadius: 99, background: '#1A1D12', color: '#C6F035', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isFooter ? 'FOOTER — ALL PAGES' : name.toUpperCase()}
                </div>
                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 22, display: 'flex', gap: 2, padding: 3, borderRadius: 11, background: '#1A1D12', boxShadow: '0 8px 22px rgba(26,29,18,0.35)' }}>
                  <ToolBtn d={I.up} sw={2.2} title="Move up" disabled={isFooter || i === 0} onClick={() => send('act', { a: 'up', id: sec.id })} />
                  <ToolBtn d={I.down} sw={2.2} title="Move down" disabled={isFooter || i === last} onClick={() => send('act', { a: 'down', id: sec.id })} />
                  {!isFooter && <ToolBtn d={I.dup} title="Duplicate" onClick={() => send('act', { a: 'dup', id: sec.id })} />}
                  <ToolBtn d={I.eyeOff} sw={1.9} title="Hide" onClick={() => send('act', { a: 'hide', id: sec.id })} />
                  {!isFooter && <ToolBtn d={I.trash} title="Delete" danger onClick={() => send('act', { a: 'del', id: sec.id })} />}
                </div>
              </>
            )}
            <Comp sec={sec} ctx={ctxFor(sec)} />
          </div>
        )}
      </div>
    );
  };

  const navItems = (doc.menus.header || []).slice(0, 6);

  return (
    <ImgCtx.Provider value={{
      crops: doc.crops || {},
      cropTarget,
      setCropTarget: preview ? null : setCropTarget,
      onCrop: (slotId, val) => send('crop', { slotId, val }),
    }}>
    <div
      ref={rootRef}
      onClick={() => { if (!preview) send('sel', { id: null }); }}
      style={{ background: P.bg, color: P.ink, fontFamily: F.b, overflow: 'hidden', minHeight: 400 }}
    >
      {/* store nav (theme-owned) */}
      <div
        onClick={(e) => { e.stopPropagation(); if (!preview) send('navMenus', {}); }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: mob ? '15px 20px' : '18px 48px', borderBottom: '1px solid ' + base.line, cursor: 'pointer' }}
      >
        {brandText ? (
          <Editable
            secId="__brand" k="brand" value={brandName} preview={preview} tag="div"
            style={'font-family:' + F.h + '; font-weight:' + Math.max(F.hw, 600) + '; font-size:' + (mob ? 20 : 23) + 'px; letter-spacing:' + F.ls + ';'}
            onClick={(e) => { if (preview) { e.stopPropagation(); send('goPage', { id: 'home' }); } }}
          />
        ) : (
          <div
            onClick={(e) => { e.stopPropagation(); if (preview) send('goPage', { id: 'home' }); }}
            style={{ height: mob ? 26 : 32, width: mob ? 110 : 150, cursor: 'pointer', position: 'relative' }}
          >
            <ImageSlot slotId="st-brand-logo" assets={doc.assets || {}} fit="contain" placeholder="Logo" preview={preview} />
          </div>
        )}
        {!mob && (
          <div style={{ display: 'flex', gap: 26, fontSize: 13, fontWeight: 600, color: base.sub }}>
            {navItems.map((it) => (
              <span
                key={it.id}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap', ...(it.link.t === 'page' && it.link.ref === page.id ? { color: P.ink, textDecoration: 'underline', textUnderlineOffset: 5 } : {}) }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (preview) send('navLink', { link: it.link });
                  else send('navMenus', { label: it.label });
                }}
              >
                {it.label}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <div style={{ position: 'relative' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l1 14H5L6 7zM9 10V6a3 3 0 016 0v4" /></svg>
            <div style={{
              position: 'absolute', top: -6, right: -9, minWidth: 15, height: 15, borderRadius: 99,
              background: P.accent, color: P.accentInk, fontSize: 9, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              fontFamily: "'Hanken Grotesk',sans-serif",
              ...(P.accent === P.ink ? { outline: '1.5px solid ' + P.bg } : {}),
            }}>2</div>
          </div>
        </div>
      </div>

      {sections.length === 0 && !building && (
        <div style={{ padding: '90px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.55 }}>Your page is empty</div>
          <div onClick={(e) => { e.stopPropagation(); send('lib', { at: null }); }}
            style={{ marginTop: 14, padding: '11px 20px', borderRadius: 99, background: '#1A1D12', color: '#C6F035', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Add your first section
          </div>
        </div>
      )}

      {sections.map((sec, i) => renderSection(sec, i, sections.length - 1, false))}
      {doc.footer && renderSection(doc.footer, sections.length, sections.length, true)}

      {!preview && sections.length > 0 && (
        <div className="st-endzone" onClick={(e) => { e.stopPropagation(); send('lib', { at: null }); }}
          style={{ padding: 16, display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
          <div style={{ padding: '8px 16px', borderRadius: 99, border: '1.5px dashed currentColor', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Hanken Grotesk',sans-serif" }}>
            + Add section
          </div>
        </div>
      )}
    </div>
    </ImgCtx.Provider>
  );
}
