export const FT = {
  bg: '#FFFFFF',
  bgSoft: '#F7F6F3',
  bgMuted: '#EFEDE8',
  text: '#111111',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E8E6E1',
  sale: '#B42318',
  cod: '#166534',
  codBg: '#ECFDF5',
  max: '1320px',
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  display: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
}

export function fashionCss(primary) {
  const accent = primary || FT.text
  return `
    .ft-root *, .ft-root *::before, .ft-root *::after { box-sizing: border-box; }
    .ft-root { font-family: ${FT.sans}; color: ${FT.text}; background: ${FT.bg}; -webkit-font-smoothing: antialiased; }
    .ft-container { max-width: ${FT.max}; margin: 0 auto; padding-left: 16px; padding-right: 16px; }
    .ft-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 2px; cursor: pointer; transition: opacity 0.2s, background 0.2s; font-family: inherit; border: none; text-decoration: none; }
    .ft-btn-primary { background: ${accent}; color: #fff; }
    .ft-btn-primary:hover { opacity: 0.88; }
    .ft-btn-outline { background: transparent; color: ${FT.text}; border: 1px solid ${FT.text}; }
    .ft-btn-outline:hover { background: ${FT.text}; color: #fff; }
    .ft-section { padding: 48px 0; }
    .ft-section-title { font-family: ${FT.display}; font-size: clamp(22px, 4vw, 32px); font-weight: 500; letter-spacing: -0.02em; margin: 0 0 8px; }
    .ft-section-sub { font-size: 14px; color: ${FT.textMuted}; margin: 0 0 28px; line-height: 1.6; }
    .ft-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .ft-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .ft-announce { background: ${FT.bgSoft}; color: ${FT.text}; font-size: 12px; font-weight: 500; text-align: center; padding: 10px 40px; position: relative; border-bottom: 1px solid ${FT.border}; letter-spacing: 0.02em; }
    .ft-header { position: sticky; top: 0; z-index: 200; background: rgba(255,255,255,0.96); backdrop-filter: blur(8px); border-bottom: 1px solid ${FT.border}; }
    .ft-header-inner { max-width: ${FT.max}; margin: 0 auto; padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .ft-logo { font-size: 18px; font-weight: 700; letter-spacing: -0.03em; cursor: pointer; flex-shrink: 0; }
    .ft-nav { display: none; align-items: center; gap: 4px; flex: 1; justify-content: center; }
    .ft-nav-link { padding: 8px 12px; font-size: 13px; font-weight: 500; color: ${FT.textMuted}; background: none; border: none; cursor: pointer; font-family: inherit; }
    .ft-nav-link:hover, .ft-nav-link.active { color: ${FT.text}; }
    .ft-icon-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: ${FT.text}; position: relative; border-radius: 50%; }
    .ft-icon-btn:hover { background: ${FT.bgSoft}; }
    .ft-badge { position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: ${accent}; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .ft-hero { position: relative; min-height: 72vh; display: flex; align-items: flex-end; overflow: hidden; background: ${FT.bgMuted}; }
    .ft-hero-bg { position: absolute; inset: 0; }
    .ft-hero-bg img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
    .ft-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%); }
    .ft-hero-content { position: relative; z-index: 1; padding: 48px 16px 56px; max-width: ${FT.max}; margin: 0 auto; width: 100%; }
    .ft-hero h1 { font-family: ${FT.display}; font-size: clamp(32px, 8vw, 56px); font-weight: 500; color: #fff; line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 12px; max-width: 12ch; }
    .ft-hero p { font-size: 15px; color: rgba(255,255,255,0.82); line-height: 1.65; max-width: 420px; margin: 0 0 28px; }
    .ft-hero-btns { display: flex; flex-wrap: wrap; gap: 10px; }
    .ft-cat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .ft-cat-tile { position: relative; aspect-ratio: 3/4; overflow: hidden; cursor: pointer; background: ${FT.bgMuted}; border-radius: 2px; }
    .ft-cat-tile img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .ft-cat-tile:hover img { transform: scale(1.04); }
    .ft-cat-label { position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 16px; background: linear-gradient(transparent 40%, rgba(0,0,0,0.45)); color: #fff; font-size: 15px; font-weight: 600; letter-spacing: 0.04em; }
    .ft-card { cursor: pointer; }
    .ft-card-img { position: relative; aspect-ratio: 3/4; overflow: hidden; background: ${FT.bgSoft}; margin-bottom: 12px; }
    .ft-card-img img { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.35s ease; }
    .ft-card-img .ft-img-hover { position: absolute; inset: 0; opacity: 0; }
    .ft-card:hover .ft-img-hover { opacity: 1; }
    .ft-card-actions { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px; display: flex; gap: 6px; opacity: 0; transform: translateY(6px); transition: all 0.25s ease; }
    .ft-card:hover .ft-card-actions { opacity: 1; transform: translateY(0); }
    .ft-card-action-btn { flex: 1; padding: 10px; background: rgba(255,255,255,0.95); border: none; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; font-family: inherit; }
    .ft-wish { position: absolute; top: 10px; right: 10px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.92); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; }
    .ft-discount { position: absolute; top: 10px; left: 10px; background: ${FT.text}; color: #fff; font-size: 10px; font-weight: 700; padding: 4px 8px; letter-spacing: 0.04em; }
    .ft-card-title { font-size: 14px; font-weight: 500; line-height: 1.35; margin: 0 0 6px; color: ${FT.text}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .ft-price { font-size: 14px; font-weight: 600; }
    .ft-compare { font-size: 12px; color: ${FT.textLight}; text-decoration: line-through; margin-left: 6px; font-weight: 400; }
    .ft-cod-pill { display: inline-block; font-size: 10px; font-weight: 600; color: ${FT.cod}; background: ${FT.codBg}; padding: 2px 8px; border-radius: 999px; margin-top: 6px; }
    .ft-story { display: grid; grid-template-columns: 1fr; background: ${FT.bgSoft}; overflow: hidden; }
    .ft-story-img { aspect-ratio: 4/3; overflow: hidden; }
    .ft-story-img img { width: 100%; height: 100%; object-fit: cover; }
    .ft-story-copy { padding: 40px 24px; display: flex; flex-direction: column; justify-content: center; }
    .ft-trust { display: flex; gap: 24px; overflow-x: auto; padding: 20px 0; scrollbar-width: none; }
    .ft-trust-item { flex-shrink: 0; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; color: ${FT.textMuted}; }
    .ft-review-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    .ft-review-card { padding: 20px; border: 1px solid ${FT.border}; background: ${FT.bg}; }
    .ft-ig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
    .ft-ig-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; }
    .ft-newsletter { text-align: center; padding: 56px 16px; background: ${FT.bgSoft}; }
    .ft-nl-form { display: flex; max-width: 440px; margin: 20px auto 0; border: 1px solid ${FT.border}; background: #fff; }
    .ft-nl-input { flex: 1; border: none; outline: none; padding: 14px 16px; font-size: 14px; font-family: inherit; }
    .ft-footer { background: ${FT.bgSoft}; border-top: 1px solid ${FT.border}; padding: 48px 0 24px; }
    .ft-footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .ft-footer h4 { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${FT.textMuted}; margin: 0 0 14px; }
    .ft-footer a, .ft-footer button.ft-link { display: block; font-size: 13px; color: ${FT.textMuted}; text-decoration: none; background: none; border: none; padding: 0; margin-bottom: 8px; cursor: pointer; font-family: inherit; text-align: left; }
    .ft-footer a:hover, .ft-footer button.ft-link:hover { color: ${FT.text}; }
    .ft-mobile-bar { display: flex; gap: 8px; position: fixed; left: 0; right: 0; bottom: 0; padding: 10px 12px calc(10px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid ${FT.border}; z-index: 180; }
    .ft-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 400; }
    .ft-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(320px, 88vw); background: #fff; z-index: 401; padding: 20px 16px; overflow-y: auto; }
    .ft-search-overlay { position: fixed; inset: 0; background: #fff; z-index: 500; padding: 16px; }
    @media (min-width: 768px) {
      .ft-container { padding-left: 24px; padding-right: 24px; }
      .ft-header-inner { height: 64px; padding: 0 24px; }
      .ft-nav { display: flex; }
      .ft-hero { min-height: 85vh; align-items: center; }
      .ft-hero-content { padding: 64px 24px; }
      .ft-cat-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .ft-grid-2 { gap: 20px; }
      .ft-grid-4 { gap: 24px; }
      .ft-story { grid-template-columns: 1fr 1fr; }
      .ft-story-copy { padding: 64px 48px; }
      .ft-review-grid { grid-template-columns: repeat(3, 1fr); }
      .ft-ig-grid { grid-template-columns: repeat(6, 1fr); }
      .ft-footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; }
      .ft-section { padding: 72px 0; }
      .ft-card-actions { opacity: 0; }
    }
    @media (min-width: 1024px) {
      .ft-cat-grid { grid-template-columns: repeat(6, 1fr); }
    }
  `
}
