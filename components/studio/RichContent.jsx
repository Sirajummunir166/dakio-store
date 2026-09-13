'use client';
import { sanitizeRichHtml, htmlToText } from '../../lib/theme/sanitizeHtml';

// Merchant rich text (Tiptap HTML) inside a Studio page: sanitised again at
// render time and styled from the theme tokens so it sits with the rest of
// the page. Older products hold plain text — shown as paragraphs.
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function toRichHtml(value) {
  const s = value == null ? '' : String(value);
  if (!s.trim()) return '';
  if (/<[a-z][\s\S]*>/i.test(s)) return sanitizeRichHtml(s);
  return s.split(/\n{2,}/).map((p) => '<p>' + escape(p.trim()).replace(/\n/g, '<br>') + '</p>').join('');
}

// The page that hosts RichContent renders this once (a module-level "emit
// once" flag would flip on the server after the first request and leave
// every later SSR response without the stylesheet — a hydration mismatch).
export function RichContentStyles() {
  return <style>{RICH_CSS}</style>;
}

export default function RichContent({ html, ctx, c, compact = false, style = '' }) {
  const out = toRichHtml(html);
  if (!out) return null;
  const { F, C, P } = ctx;
  const base = 'font-family:' + F.b + '; line-height:1.75; color:' + c.sub + '; overflow-wrap:anywhere; ' + style;
  // The rules read CSS variables the wrapper sets, so every instance gets
  // its own theme colours from one shared stylesheet.
  const vars = '--rc-fg:' + c.fg + '; --rc-sub:' + c.sub + '; --rc-line:' + c.line + '; --rc-card:' + c.card + '; --rc-accent:' + P.accent + '; --rc-h:' + F.h + '; --rc-hw:' + F.hw + '; --rc-r:' + Math.min(C.rs, 12) + 'px;';
  return <div className={'dk-rich' + (compact ? ' dk-rich--compact' : '')} style={sxStyle(base + vars)} dangerouslySetInnerHTML={{ __html: out }} />;
}

// Same idea as theme.js sx(): a CSS string → React style object.
function sxStyle(str) {
  const o = {};
  for (const decl of String(str).split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) continue;
    o[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = val;
  }
  return o;
}

const RICH_CSS = `
.dk-rich > * + * { margin-top: 0.7em; }
.dk-rich h2, .dk-rich h3, .dk-rich h4 { font-family: var(--rc-h); font-weight: var(--rc-hw); color: var(--rc-fg); line-height: 1.25; margin-top: 1.2em; }
.dk-rich h2 { font-size: 1.35em; } .dk-rich h3 { font-size: 1.15em; } .dk-rich h4 { font-size: 1em; }
.dk-rich > :first-child { margin-top: 0; }
.dk-rich p { margin: 0; }
.dk-rich ul, .dk-rich ol { padding-left: 1.4em; margin: 0; }
.dk-rich ul { list-style: disc; } .dk-rich ol { list-style: decimal; }
.dk-rich li + li { margin-top: 0.25em; }
.dk-rich strong, .dk-rich b { font-weight: 700; color: var(--rc-fg); }
.dk-rich a { color: var(--rc-fg); text-decoration: underline; text-underline-offset: 3px; }
.dk-rich blockquote { margin: 0; padding-left: 1em; border-left: 3px solid var(--rc-line); }
.dk-rich hr { border: 0; border-top: 1px solid var(--rc-line); margin: 1.2em 0; }
.dk-rich code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; padding: 0.1em 0.35em; border-radius: 5px; background: var(--rc-card); }
.dk-rich pre { margin: 0; padding: 12px 14px; border-radius: var(--rc-r); background: var(--rc-card); overflow-x: auto; }
.dk-rich pre code { padding: 0; background: none; }
.dk-rich img { display: block; max-width: 100%; height: auto; border-radius: var(--rc-r); margin: 1em 0; }
.dk-rich table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.95em; }
.dk-rich th, .dk-rich td { border: 1px solid var(--rc-line); padding: 8px 12px; text-align: left; vertical-align: top; }
.dk-rich th { background: var(--rc-card); color: var(--rc-fg); font-weight: 700; }
.dk-rich--compact { line-height: 1.65; }
.dk-rich--compact > * + * { margin-top: 0.4em; }
`;
