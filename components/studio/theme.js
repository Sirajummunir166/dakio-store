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
};

export const COR = {
  sharp: { n: 'Sharp', r: 0, rs: 2, btn: '3px' },
  soft: { n: 'Soft', r: 18, rs: 12, btn: '12px' },
  round: { n: 'Round', r: 26, rs: 16, btn: '99px' },
};

export const SPM = { compact: { d: 48, m: 32 }, normal: { d: 76, m: 48 }, roomy: { d: 110, m: 66 } };

// Resolve the active palette: 'custom' = palette extracted from the merchant's
// logo pixels, carried in theme.custom (validated server-side as five hex colors).
export function resolvePal(theme) {
  if (theme && theme.p === 'custom' && theme.custom && theme.custom.bg) return theme.custom;
  return PAL[theme && theme.p] || PAL.porcelain;
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

// Shared per-section style bits — port of the common part of buildVM()
export function baseStyles(sec, ctx) {
  const { P, F, C, mob, padX } = ctx;
  const p = sec.props;
  const c = co(p.bg, P);
  const B = btnColors(p.bg, P);
  const spY = (SPM[p.sp] || SPM.normal)[mob ? 'm' : 'd'];
  const headFont = 'font-family:' + F.h + '; font-weight:' + F.hw + '; letter-spacing:' + F.ls + ';';
  const accCol = (p.bg === 'ink' || p.bg === 'accent' || P.accent === P.ink) ? c.sub : P.accent;
  return {
    c, B, spY, headFont, accCol,
    pad: 'padding:' + spY + 'px max(' + padX + 'px, calc((100% - 1120px)/2));',
    padNarrow: 'padding:' + spY + 'px max(' + padX + 'px, calc((100% - 760px)/2));',
    padCenter: 'padding:' + (mob ? 66 : 112) + 'px ' + padX + 'px; text-align:center; box-sizing:border-box;',
    h2: headFont + 'font-size:' + (mob ? 26 : 36) + 'px; line-height:1.12; min-width:0;',
    h2Center: headFont + 'font-size:' + (mob ? 26 : 36) + 'px; line-height:1.12; text-align:center;',
    btn: 'display:inline-flex; align-items:center; gap:8px; padding:' + (mob ? '12px 22px' : '14px 28px') + '; border-radius:' + C.btn + '; background:' + B.bg + '; color:' + B.fg + '; font-family:' + F.b + '; font-weight:600; font-size:' + (mob ? 13.5 : 14.5) + 'px; cursor:pointer; white-space:nowrap;',
    btnGhost: 'display:inline-flex; align-items:center; padding:' + (mob ? '11px 20px' : '13px 26px') + '; border-radius:' + C.btn + '; border:1.5px solid ' + c.sub + '; color:' + c.fg + '; font-family:' + F.b + '; font-weight:600; font-size:' + (mob ? 13 : 14) + 'px; cursor:pointer;',
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
