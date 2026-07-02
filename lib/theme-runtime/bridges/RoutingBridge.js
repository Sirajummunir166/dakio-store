import { storeHome, productPath, checkoutPath, trackPath } from '../../routes.js'

/**
 * Build the routing handle object passed into ThemeContract.routing.
 * Themes call these functions — they never construct URLs directly.
 * Tenant-prefix vs custom-domain logic lives in lib/routes.js, not in themes.
 */
export function buildRoutingBridge(slug) {
  return {
    slug,
    storeHome: () => storeHome(slug),
    productPath: (productSlug) => productPath(productSlug, slug),
    checkoutPath: () => checkoutPath(slug),
    trackPath: () => trackPath(slug),
  }
}
