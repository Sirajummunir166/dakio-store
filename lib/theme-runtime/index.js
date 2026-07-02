// Theme Runtime — public API
// Import from here. Never import from individual runtime modules in theme packages.

export { buildContract, SCHEMA_VERSION, THEME_VERSIONS } from './ThemeContract.js'

export { normalizeStore }                           from './normalizers/normalizeStore.js'
export { normalizeProduct }                         from './normalizers/normalizeProduct.js'
export { normalizeProducts }                        from './normalizers/normalizeProducts.js'
export { normalizeCategory, normalizeCategories }   from './normalizers/normalizeCategories.js'

export { buildCheckoutBridge }  from './bridges/CheckoutBridge.js'
export { buildRoutingBridge }   from './bridges/RoutingBridge.js'
export {
  buildCartBridge,
  normalizeCartItem,
  normalizeCartItems,
  CART_STORAGE_KEY,
}                               from './bridges/CartBridge.js'

export { isCompatible, upgradeContract }    from './compatibility/CompatibilityLayer.js'
export {
  hasLegacyTemplate,
  getLegacyTemplateName,
  migrateLegacyConfig,
}                                           from './migration/MigrationLayer.js'
