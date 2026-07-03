export const SCHEMA_VERSION = '1.0.0'

// Incremented independently per theme as their section/preset APIs evolve.
// Runtime schema version and theme version are intentionally separate:
// runtime can update without forcing every theme to bump.
export const THEME_VERSIONS = {
  fashion: '1.0.0',
}

/**
 * Assemble the full ThemeContract from normalized data + bridge handles.
 * This is the ONLY object a theme package receives.
 * Themes must never reach outside this contract.
 */
export function buildContract({ themeKey, store, products, categories, relatedProducts, pageConfig, cart, checkout, routing }) {
  return {
    _meta: {
      schemaVersion: SCHEMA_VERSION,
      themeVersion: THEME_VERSIONS[themeKey] || '1.0.0',
      themeKey,
    },
    store,
    products,
    categories,
    relatedProducts: relatedProducts ?? [],
    pageConfig,
    cart,
    checkout,
    routing,
  }
}
