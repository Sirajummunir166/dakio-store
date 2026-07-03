'use client'
import { useFashionTheme } from '../FashionThemeContext.jsx'

/**
 * useProductStore — veluna-compatible product store hook backed by Dakio ThemeContract.
 *
 * Veluna components call useProductStore() expecting:
 *   route, pageSlug, pageProduct, quickViewProduct,
 *   openProductPage(product), goHome(), openCheckout(),
 *   openQuickView(product), closeQuickView()
 *
 * In dakio-store these map to FashionThemeContext: navigate, quickView, contract.
 */
export function useProductStore() {
  const { contract, navigate, quickView } = useFashionTheme()

  return {
    // In the storefront the main product is always products[0] (set by FashionPDPWrapper)
    pageProduct:       contract.products?.[0] ?? null,
    quickViewProduct:  quickView.product,

    openProductPage: (product) => {
      if (product?.slug) navigate.toProduct(product.slug)
    },
    goHome:         () => navigate.toHome(),
    openCheckout:   () => navigate.toCheckout(),
    openQuickView:  (product) => quickView.open(product),
    closeQuickView: () => quickView.close(),

    // route/pageSlug not used by veluna's ProductPage — provided for completeness
    route:     'product',
    pageSlug:  contract.products?.[0]?.slug ?? null,
  }
}
