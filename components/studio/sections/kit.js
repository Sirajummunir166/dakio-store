// Shared bits of the service sections (DAKIO_SERVICES_WEBSITE_PLAN.md W3).

/**
 * A section button's click: its own link when the owner set one, else the
 * business's main action (the header's button — Book, Enquire, WhatsApp…).
 * Inert while editing, like every other section button.
 */
export function act(ctx, link) {
  if (!ctx.preview) return undefined;
  return (ev) => {
    ev.stopPropagation();
    if (link && ctx.onLink) ctx.onLink(link);
    else if (ctx.onMainAction) ctx.onMainAction();
  };
}

/** Items of a list section, each with a stable key (images are keyed by it). */
export function itemsOf(p) {
  return (Array.isArray(p.items) ? p.items : []).map((it, i) => ({ ...it, k: it.k || 'i' + i }));
}

/** Lines of a multi-line or comma list, trimmed, empties dropped. */
export function linesOf(text, { commas = false } = {}) {
  return String(text || '').split(commas ? /[\n,،]/ : /\n/).map((x) => x.trim()).filter(Boolean);
}

/** The section's sub line under the heading. */
export const subStyle = (F, c, mob) => 'font-family:' + F.b + '; font-size:' + (mob ? 14 : 15) + 'px; line-height:1.6; color:' + c.sub + '; margin-top:10px; max-width:620px; white-space:pre-wrap;';

// ── Section options shared by the service sections (Store Studio's Style tab) ──

/** Columns of a card grid: the owner's pick (2 to 4), else `def`; phones get `mobCols`. */
export function colsOf(pick, def, mob, mobCols = 1) {
  if (mob) return mobCols;
  const n = Number(pick);
  return [2, 3, 4].includes(n) ? n : def;
}

/**
 * A card's look: `box` (filled, the default), `line` (an outline on the
 * section's own colour) or `plain` (no frame at all).
 */
export function cardLook(look, { C, c, s }, pad = '') {
  if (look === 'plain') return pad ? 'padding:0;' : '';
  if (look === 'line') return 'border-radius:' + C.r + 'px; border:1.5px solid ' + c.line + ';' + pad;
  return 'border-radius:' + C.r + 'px; background:' + c.card + '; border:1px solid ' + c.line + ';' + s.sh + pad;
}

/** One of the allowed values, else the first (a layout or look the section knows). */
export const oneOf = (v, allowed) => (allowed.includes(v) ? v : allowed[0]);
