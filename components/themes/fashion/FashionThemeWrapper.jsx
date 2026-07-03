'use client'
import { useMemo } from 'react'
import {
  normalizeStore,
  normalizeProducts,
  normalizeCategories,
  buildCheckoutBridge,
  buildRoutingBridge,
  buildCartBridge,
  buildContract,
} from '../../../lib/theme-runtime/index.js'
import FashionTheme from './FashionTheme.jsx'

/**
 * FashionThemeWrapper
 *
 * The only component allowed to touch raw Dakio API data before it enters
 * the Fashion theme package. Responsibilities (in order):
 *
 *   1. Receive raw SSR data (store, products, categories) + cart state from useStorefront
 *   2. Run all Theme Runtime normalizers
 *   3. Build bridge handles (checkout, routing, cart)
 *   4. Assemble the ThemeContract via buildContract()
 *   5. Render <FashionTheme contract={contract} />
 *
 * Nothing inside FashionTheme (or any component it renders) may receive raw
 * API data, call fetch, or import from lib/storefront.js.
 */
export default function FashionThemeWrapper({
  store: rawStore,
  products: rawProducts,
  categories: rawCategories,
  slug,
  previewMode = false,
  sf,
}) {
  // ── Normalize raw API data ──────────────────────────────────────────────
  // These are SSR props — they don't change during a session.
  // useMemo prevents re-running normalizers on every cart update re-render.
  const store      = useMemo(() => normalizeStore(rawStore),        [rawStore])
  const products   = useMemo(() => normalizeProducts(rawProducts),  [rawProducts])
  const categories = useMemo(() => normalizeCategories(rawCategories), [rawCategories])

  // ── Build bridges ───────────────────────────────────────────────────────
  const routing    = useMemo(() => buildRoutingBridge(slug), [slug])

  const checkout   = useMemo(() => {
    const bridge = buildCheckoutBridge(slug, store)
    if (previewMode) {
      return {
        ...bridge,
        placeOrder: async () => {
          throw new Error('Preview mode — orders cannot be placed')
        },
        validateCoupon: async () => ({ ok: false, error: 'Preview mode — coupons disabled' }),
      }
    }
    return bridge
  }, [slug, store, previewMode])

  // Cart bridge rebuilds when cart state changes — that is expected and correct.
  const cart       = useMemo(() => buildCartBridge({
    state: {
      cart:           sf.cart,
      cartOpen:       sf.cartOpen,
      cartTotal:      sf.cartTotal,
      cartCount:      sf.cartCount,
      appliedCoupon:  sf.appliedCoupon ?? null,
      couponDiscount: sf.couponDiscount ?? 0,
    },
    actions: {
      setCartOpen:    sf.setCartOpen,
      addToCart:      sf.addToCart,
      removeFromCart: sf.removeFromCart,
      changeQty:      sf.changeQty,
    },
    slug,
  }), [sf.cart, sf.cartOpen, sf.cartTotal, sf.cartCount, sf.appliedCoupon, sf.couponDiscount, sf.setCartOpen, sf.addToCart, sf.removeFromCart, sf.changeQty, slug])

  // Live pageConfig from published themeSettings. Null → Classic preset auto-applied in FashionTheme.
  // In preview mode the store API already swaps in themeSettingsDraft before it reaches here.
  const pageConfig = rawStore?.themeSettings ?? null

  // ── Assemble ThemeContract ──────────────────────────────────────────────
  const contract   = useMemo(() => buildContract({
    themeKey: 'fashion_v1',
    store,
    products,
    categories,
    pageConfig,
    cart,
    checkout,
    routing,
  }), [store, products, categories, pageConfig, cart, checkout, routing])

  return <FashionTheme contract={contract} />
}
