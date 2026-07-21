// Store Studio theme system — render contract shared with the studio chrome (dakio-merchant).
// Values ported 1:1 from the Claude Design source "Dakio Store Studio.dc.html".
// Any change here must be mirrored in dakio-merchant/src/store-studio/constants.js.

export const PAL = {
  porcelain: { name: 'Porcelain & Ink', bg: '#FAF7F1', surface: '#FFFFFF', ink: '#1D1A16', accent: '#1D1A16', accentInk: '#FAF7F1' },
  sage: { name: 'Sage Court', bg: '#F1F4EA', surface: '#FBFCF7', ink: '#22291C', accent: '#4C7A3F', accentInk: '#F2F6E9' },
  terra: { name: 'Terracotta', bg: '#F8F1E8', surface: '#FFFBF4', ink: '#2B211B', accent: '#C05A38', accentInk: '#FFF3EC' },
  noir: { name: 'Noir', bg: '#141511', surface: '#1E1F1A', ink: '#F0EFE6', accent: '#D8CB9A', accentInk: '#191713' },
  lime: { name: 'Lime & Ink', bg: '#EFF1E9', surface: '#FBFCF7', ink: '#1A1D12', accent: '#C6F035', accentInk: '#1A1D12' },
  blush: { name: 'Blush Clay', bg: '#F9F1EF', surface: '#FFFAF8', ink: '#33221E', accent: '#B4574E', accentInk: '#FFF3F0' },
};

export const FON = {
  clean: { name: 'Clean', sub: 'Hanken Grotesk', h: "'Hanken Grotesk',sans-serif", b: "'Hanken Grotesk',sans-serif", hw: 700, ls: '-0.03em' },
  editorial: { name: 'Editorial', sub: 'Instrument Serif · Hanken', h: "'Instrument Serif',serif", b: "'Hanken Grotesk',sans-serif", hw: 400, ls: '-0.015em' },
  bold: { name: 'Statement', sub: 'Archivo', h: "'Archivo',sans-serif", b: "'Archivo',sans-serif", hw: 800, ls: '-0.04em' },
  boutique: { name: 'Boutique', sub: 'Cormorant · Karla', h: "'Cormorant Garamond',serif", b: "'Karla',sans-serif", hw: 600, ls: '-0.005em' },
  banglam: { name: 'Bangla Modern', sub: 'Noto Sans Bengali', h: "'Noto Sans Bengali','Hanken Grotesk',sans-serif", b: "'Noto Sans Bengali','Hanken Grotesk',sans-serif", hw: 700, ls: '-0.01em', g: 'অ', bn: true },
  banglas: { name: 'Bangla Heritage', sub: 'Noto Serif Bengali · Noto Sans', h: "'Noto Serif Bengali',serif", b: "'Noto Sans Bengali','Hanken Grotesk',sans-serif", hw: 600, ls: '0em', g: 'অ', bn: true },
};

export const COR = {
  sharp: { n: 'Sharp', r: 0, rs: 2, btn: '3px' },
  soft: { n: 'Soft', r: 18, rs: 12, btn: '12px' },
  round: { n: 'Round', r: 26, rs: 16, btn: '99px' },
};

export const SPM = { compact: { d: 48, m: 32 }, normal: { d: 76, m: 48 }, roomy: { d: 110, m: 66 } };

// Theme Studio axes (Phase 4) — type scale, density, depth. One-tap segments;
// every value multiplies/decorates the base render, nothing per-section.
export const TSC = { compact: { n: 'Compact', m: 0.86 }, regular: { n: 'Regular', m: 1 }, display: { n: 'Display', m: 1.18 } };
export const DEN = { cozy: { n: 'Cozy', m: 0.68 }, normal: { n: 'Normal', m: 1 }, airy: { n: 'Airy', m: 1.38 } };
export const SHA = { flat: { n: 'Flat', css: '' }, soft: { n: 'Soft', css: ' box-shadow:0 12px 30px rgba(15,16,10,0.10);' }, float: { n: 'Float', css: ' box-shadow:0 30px 70px rgba(15,16,10,0.17);' } };

// Resolve the active palette: 'custom' = palette extracted from the merchant's
// logo pixels, carried in theme.custom (validated server-side as five hex colors).
export function resolvePal(theme) {
  if (theme && theme.p === 'custom' && theme.custom && theme.custom.bg) return theme.custom;
  return PAL[theme && theme.p] || PAL.porcelain;
}

// Perceived luminance of a #rrggbb color (0–1); non-hex input reads as mid-grey
export function lum(h) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '').trim());
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

// Dark storefront: derive night colors from the current palette. A palette
// that is already dark passes through untouched; a dark accent flips to the
// paper color so buttons stay readable.
export function dkPal(P) {
  if (lum(P.bg) < 0.45) return P;
  const accDark = lum(P.accent) < 0.34;
  return {
    name: (P.name || '') + ' — dark',
    bg: P.ink,
    surface: mix(P.ink, 86, P.bg),
    ink: P.bg,
    accent: accDark ? P.bg : P.accent,
    accentInk: accDark ? P.ink : P.accentInk,
  };
}

// Full theme resolution — palette (accent role + dark mode applied), fonts,
// corners (button-shape override), and the Phase 4 render multipliers.
export function resolveTheme(theme) {
  let P = resolvePal(theme);
  if (theme && theme.acc && theme.acc.a) P = { ...P, accent: theme.acc.a, accentInk: theme.acc.i || P.accentInk };
  if (theme && theme.mode === 'dark') P = dkPal(P);
  const F = FON[theme && theme.f] || FON.clean;
  const C0 = COR[theme && theme.c] || COR.soft;
  const C = theme && theme.btn ? { ...C0, btn: theme.btn === 'pill' ? '99px' : '3px' } : C0;
  return {
    P, F, C,
    tsM: (TSC[theme && theme.ts] || TSC.regular).m,
    denM: (DEN[theme && theme.den] || DEN.normal).m,
    shCard: (SHA[theme && theme.sh] || SHA.flat).css,
  };
}

const mix = (a, pct, b) => 'color-mix(in oklab, ' + a + ' ' + pct + '%, ' + b + ')';

// Section background resolution: choice ∈ base|card|tint|ink|accent
export function co(choice, P) {
  let bg, fg;
  if (choice === 'ink') { bg = P.ink; fg = P.bg; }
  else if (choice === 'accent') { bg = P.accent; fg = P.accentInk; }
  else if (choice === 'card') { bg = P.surface; fg = P.ink; }
  else if (choice === 'tint') { bg = mix(P.accent, 10, P.bg); fg = P.ink; }
  else { bg = P.bg; fg = P.ink; }
  return {
    bg, fg,
    sub: mix(fg, 64, bg),
    line: mix(fg, 15, bg),
    card: choice === 'card' ? P.bg : (choice === 'ink' ? mix(fg, 9, bg) : P.surface),
  };
}

// Primary button colors on a given section background (monochrome-palette safe)
export function btnColors(choice, P) {
  if ((choice === 'ink' || choice === 'accent') && P.accent === P.ink) return { bg: P.bg, fg: P.ink };
  if (choice === 'accent') return { bg: P.accentInk, fg: P.accent === P.ink ? P.bg : P.accent };
  return { bg: P.accent, fg: P.accentInk };
}

// Shared per-section style bits — port of the common part of buildVM().
// Phase 3 additions: hz() scales headline sizes by the per-section mobile
// headline size (props.mts: 's'|'l') and the theme type scale (ctx.tsM,
// Phase 4); spY/padCenter scale by density (ctx.denM); ctx.shCard is the
// theme depth shadow appended to cards/image wraps.
export function baseStyles(sec, ctx) {
  const { P, F, C, mob, padX } = ctx;
  const p = sec.props;
  const c = co(p.bg, P);
  const B = btnColors(p.bg, P);
  const denM = ctx.denM || 1;
  const mts = mob ? ({ s: 0.88, l: 1.15 }[p.mts] || 1) : 1;
  const hz = (n) => Math.round(n * (ctx.tsM || 1) * mts);
  const sh = ctx.shCard || '';
  const spY = Math.round((SPM[p.sp] || SPM.normal)[mob ? 'm' : 'd'] * denM);
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const accCol = (p.bg === 'ink' || p.bg === 'accent' || P.accent === P.ink) ? c.sub : P.accent;
  return {
    c, B, spY, headFont, accCol, hz, sh, denM,
    pad: 'padding:' + spY + 'px max(' + padX + 'px, calc((100% - 1120px)/2));',
    padNarrow: 'padding:' + spY + 'px max(' + padX + 'px, calc((100% - 760px)/2));',
    padCenter: 'padding:' + Math.round((mob ? 66 : 112) * denM) + 'px ' + padX + 'px; text-align:center; box-sizing:border-box;',
    h2: headFont + 'font-size:' + hz(mob ? 26 : 36) + 'px; line-height:1.12; min-width:0;',
    h2Center: headFont + 'font-size:' + hz(mob ? 26 : 36) + 'px; line-height:1.12; text-align:center;',
    btn: 'display:inline-flex; align-items:center; gap:8px; padding:' + (mob ? '12px 22px' : '14px 28px') + '; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:600; font-size:' + (mob ? 13.5 : 14.5) + 'px; cursor:pointer; white-space:nowrap;',
    btnGhost: 'display:inline-flex; align-items:center; padding:' + (mob ? '11px 20px' : '13px 26px') + '; border-radius:' + C.btn + '; border:1.5px solid ' + c.sub + '; color:' + c.fg + '; font-family:' + F.b + '; font-weight:600; font-size:' + (mob ? 13 : 14) + 'px; cursor:pointer;',
  };
}

// Which block types each section supports (Phase 3), and their defaults.
// Mirror of BLK/BLKD in dakio-merchant/src/store-studio/constants.js.
export const BLK = { hero: ['badge', 'cta2', 'trust'], story: ['badge', 'cta2'], promo: ['trust'], mail: ['trust'] };

// Shared style strings for the Phase 3 blocks (badge / second button / trust row)
export function blockStyles(sec, ctx, base) {
  const { P, F } = ctx;
  const p = sec.props;
  const { c, accCol } = base;
  return {
    badgeRow: 'margin-bottom:16px; display:flex;',
    badge: 'display:inline-flex; padding:5px 12px; border-radius:99px; background:' + (p.bg === 'accent' ? c.fg : P.accent) + '; color:' + (p.bg === 'accent' ? c.bg : P.accentInk) + '; font-family:' + F.b + '; font-size:10.5px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase;',
    trustRow: 'margin-top:22px; display:flex; flex-wrap:wrap; gap:10px 22px; align-items:center;',
    trustItem: 'display:flex; align-items:center; gap:7px; font-family:' + F.b + '; font-size:12.5px; font-weight:600; color:' + c.sub + ';',
    trustTick: accCol,
  };
}

// Convert a "k:v; k:v" inline-style string to a React style object
export function sx(str) {
  const out = {};
  for (const part of String(str).split(';')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (!k || !v) continue;
    out[k.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = v;
  }
  return out;
}
