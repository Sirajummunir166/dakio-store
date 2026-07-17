'use client';
import { useEffect, useState } from 'react';

// Comment layer for the shared draft-preview link: a pin on each section lets
// teammates drop feedback anchored to that section's internal id. Renders
// nothing when the merchant turned viewer comments off.
export default function PreviewComments({ slug, token, apiBase }) {
  const [pins, setPins] = useState([]);
  const [openFor, setOpenFor] = useState(null);
  const [author, setAuthor] = useState('');
  const [txt, setTxt] = useState('');
  const [sent, setSent] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const place = () => {
      const els = [...document.querySelectorAll('[id^="sec-"]')];
      setPins(els.map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.id.slice(4), top: r.top + window.scrollY + 14 };
      }));
    };
    place();
    const t = setTimeout(place, 600); // after fonts/images settle
    window.addEventListener('resize', place);
    return () => { clearTimeout(t); window.removeEventListener('resize', place); };
  }, []);

  const send = async () => {
    if (!txt.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${apiBase}/store/${slug}/studio-comments?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secId: openFor, txt: txt.trim(), author: author.trim() || 'Viewer' }),
      });
      if (res.ok) {
        setSent((s) => ({ ...s, [openFor]: (s[openFor] || 0) + 1 }));
        setTxt('');
        setOpenFor(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const ui = { fontFamily: "'Hanken Grotesk',sans-serif" };

  return (
    <>
      {pins.map((p) => (
        <div
          key={p.id}
          onClick={() => setOpenFor(openFor === p.id ? null : p.id)}
          title="Comment on this section"
          style={{
            ...ui, position: 'absolute', top: p.top, right: 14, zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99,
            background: '#1A1D12', color: '#C6F035', fontSize: 11, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 8px 22px rgba(26,29,18,0.35)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15a4 4 0 01-4 4H8l-5 3V6a4 4 0 014-4h10a4 4 0 014 4v9z" /></svg>
          {sent[p.id] ? '✓ Sent' : 'Comment'}
        </div>
      ))}
      {openFor && (
        <div style={{ ...ui, position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 60, width: 340, borderRadius: 16, background: '#f6f7f0', border: '1px solid rgba(27,30,21,0.15)', boxShadow: '0 24px 60px rgba(20,22,14,0.35)', padding: 13, color: '#1b1e15' }}>
          <div style={{ fontSize: 12.5, fontWeight: 800 }}>Comment for the store team</div>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            style={{ ...ui, marginTop: 8, width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 9, border: '1.5px solid rgba(27,30,21,0.14)', background: '#fbfcf7', fontSize: 12, outline: 'none' }}
          />
          <textarea
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            placeholder="What should change here?"
            rows={2}
            style={{ ...ui, marginTop: 6, width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 9, border: '1.5px solid rgba(27,30,21,0.14)', background: '#fbfcf7', fontSize: 12, outline: 'none', resize: 'none' }}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <div onClick={send} style={{ flex: 1, padding: 9, borderRadius: 9, background: '#C6F035', color: '#1A1D12', textAlign: 'center', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Sending…' : 'Send'}</div>
            <div onClick={() => setOpenFor(null)} style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid rgba(27,30,21,0.2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</div>
          </div>
        </div>
      )}
    </>
  );
}
