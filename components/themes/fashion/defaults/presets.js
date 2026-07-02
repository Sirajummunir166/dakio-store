/*
 * Fashion Theme Presets — Classic, Editorial, Campaign
 *
 * Each preset defines:
 *   - name / label / description
 *   - preset token (applied as data-preset="..." on .veluna root)
 *   - sections array (ordered, with enabled + default settings)
 *
 * Merchants select a preset during onboarding or from Theme Settings.
 * Presets do NOT store backend data — they define default section shapes.
 * The CMS can override any section setting on top of the preset.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIC — Clean, accessible, comfortable. Good for mass-market fashion.
// ─────────────────────────────────────────────────────────────────────────────
export const CLASSIC_PRESET = {
  id: 'classic',
  name: 'Classic',
  description: 'Clean, comfortable. Works for any fashion store.',
  dataPreset: 'classic',
  sections: [
    { id: 'topbar',         type: 'topbar',         enabled: true,  settings: {} },
    { id: 'header',         type: 'header',         enabled: true,  settings: {} },
    {
      id: 'hero-deals',
      type: 'hero-deals',
      enabled: true,
      settings: {
        heading: 'New Season, New You',
        subheading: 'Fresh arrivals every week',
        ctaLabel: 'Shop Now',
      },
    },
    { id: 'categories',    type: 'categories',    enabled: true,  settings: {} },
    { id: 'products',      type: 'products',      enabled: true,  settings: { heading: 'Latest Arrivals' } },
    { id: 'shop-by-style', type: 'shop-by-style', enabled: true,  settings: {} },
    { id: 'promo-banner',  type: 'promo-banner',  enabled: true,  settings: {} },
    { id: 'fabric-care',   type: 'fabric-care',   enabled: true,  settings: {} },
    { id: 'features',      type: 'features',      enabled: true,  settings: {} },
    { id: 'footer',        type: 'footer',        enabled: true,  settings: {} },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// EDITORIAL — Generous space, refined typography, luxury feel.
// For boutique / premium fashion brands.
// ─────────────────────────────────────────────────────────────────────────────
export const EDITORIAL_PRESET = {
  id: 'editorial',
  name: 'Editorial',
  description: 'Luxury feel, generous whitespace. For premium brands.',
  dataPreset: 'editorial',
  sections: [
    { id: 'header',     type: 'header',        enabled: true,  settings: {} },
    {
      id: 'hero-deals',
      type: 'hero-deals',
      enabled: true,
      settings: {
        heading: 'The New Collection',
        subheading: 'Crafted with intention',
        ctaLabel: 'Discover',
      },
    },
    {
      id: 'lookbook',
      type: 'lookbook',
      enabled: true,
      settings: {
        heading: 'The Lookbook',
        eyebrow: 'Editorial',
        layout: 'asymmetric',
      },
    },
    { id: 'categories', type: 'categories',    enabled: true,  settings: {} },
    { id: 'products',   type: 'products',      enabled: true,  settings: { heading: 'Selected Pieces' } },
    { id: 'size-guide', type: 'size-guide',    enabled: true,  settings: {} },
    { id: 'fabric-care',type: 'fabric-care',   enabled: true,  settings: {} },
    { id: 'features',   type: 'features',      enabled: true,  settings: {} },
    { id: 'footer',     type: 'footer',        enabled: true,  settings: {} },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN — Bold, compact, conversion-focused. For sale seasons & launches.
// ─────────────────────────────────────────────────────────────────────────────
export const CAMPAIGN_PRESET = {
  id: 'campaign',
  name: 'Campaign',
  description: 'Bold and high-impact. Built for campaigns and sale events.',
  dataPreset: 'campaign',
  sections: [
    { id: 'topbar',       type: 'topbar',        enabled: true,  settings: {} },
    { id: 'header',       type: 'header',        enabled: true,  settings: {} },
    {
      id: 'hero-deals',
      type: 'hero-deals',
      enabled: true,
      settings: {
        heading: 'UP TO 50% OFF',
        subheading: 'Limited time — shop before it ends',
        ctaLabel: 'Shop the Sale',
      },
    },
    { id: 'categories',   type: 'categories',    enabled: true,  settings: {} },
    { id: 'shop-by-style',type: 'shop-by-style', enabled: true,  settings: {} },
    { id: 'products',     type: 'products',      enabled: true,  settings: { heading: 'Best Sellers' } },
    {
      id: 'lookbook',
      type: 'lookbook',
      enabled: true,
      settings: {
        heading: 'The Campaign',
        eyebrow: 'Limited Collection',
        layout: 'asymmetric',
      },
    },
    { id: 'promo-banner', type: 'promo-banner',  enabled: true,  settings: {} },
    { id: 'features',     type: 'features',      enabled: true,  settings: {} },
    { id: 'footer',       type: 'footer',        enabled: true,  settings: {} },
  ],
}

// All presets indexed by id for fast lookup
export const PRESETS = {
  classic:   CLASSIC_PRESET,
  editorial: EDITORIAL_PRESET,
  campaign:  CAMPAIGN_PRESET,
}

/**
 * Resolve a preset by id. Falls back to Classic if unknown.
 * Returns a deep clone so callers can mutate settings without affecting the constant.
 */
export function resolvePreset(presetId) {
  const preset = PRESETS[presetId] ?? CLASSIC_PRESET
  return {
    ...preset,
    sections: preset.sections.map((s) => ({ ...s, settings: { ...s.settings } })),
  }
}
