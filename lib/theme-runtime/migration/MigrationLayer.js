/**
 * Migration Layer — utilities for moving tenants from legacy templates to Fashion theme.
 *
 * Phase 1: placeholder only. Actual migration logic built when DB migration is approved.
 * Do NOT call these functions in production paths yet.
 */

const LEGACY_TEMPLATES = new Set(['minimal', 'tech', 'organic', 'beauty', 'bold'])

export function hasLegacyTemplate(store) {
  return LEGACY_TEMPLATES.has(store?.storeTemplate)
}

export function getLegacyTemplateName(store) {
  return store?.storeTemplate || null
}

/**
 * Placeholder — future conversion of legacy themeSettings to Fashion pageConfig.
 * Returns null until implemented. Callers must fall back to Fashion Classic preset defaults.
 */
export function migrateLegacyConfig(_legacyConfig, _sourceTemplate) {
  return null
}
