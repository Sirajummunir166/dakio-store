'use client'
import { useMemo } from 'react'
import { useStorefront } from '../../../lib/storefront'
import {
  normalizeStore,
  normalizeProduct,
  normalizeProducts,
  buildCheckoutBridge,
  buildRoutingBridge,
  buildCartBridge,
  buildContract,
} from '../../../lib/theme-runtime/index.js'
import { FashionThemeProvider } from './FashionThemeContext.jsx'
import FashionStyleInjector from './styles/FashionStyleInjector.jsx'
import FashionProductDetail from './FashionProductDetail.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ProductQuickView from './components/ProductQuickView.jsx'

/**
 * FashionPDPWrapper
 *
 * Boundary layer for the Fashion Product Detail Page. Same role as FashionThemeWrapper
 * but for the PDP context — receives raw API data, runs normalizers, builds ThemeContract,
 * then renders FashionProductDetail inside FashionThemeProvider.
 *
 * Receives from ProductDetailClient:
 *   store, product, relatedProducts, allProducts, slug, isCustomDomain
 *
 * The product under detail is always contract.products[0].
 * Related products are contract.products[1..n].
 */
export default function FashionPDPWrapper({
  store: rawStore,
  product: rawProduct,
  relatedProducts: rawRelated = [],
  slug,
}) {
  // useStorefront provides live cart state on the PDP
  const sf = useStorefront({ store: rawStore, products: [], categories: [], slug })

  const store      = useMemo(() => normalizeStore(rawStore), [rawStore])
  const product    = useMemo(() => normalizeProduct(rawProduct), [rawProduct])
  const related    = useMemo(() => normalizeProducts(rawRelated), [rawRelated])
  // PDP contract: products = [product, ...related]
  const products   = useMemo(() => [product, ...related], [product, related])

  const routing    = useMemo(() => buildRoutingBridge(slug), [slug])
  const checkout   = useMemo(() => buildCheckoutBridge(slug, store), [slug, store])

  const cart       = useMemo(() => buildCartBridge({
    state: {
      cart:      sf.cart,
      cartOpen:  sf.cartOpen,
      cartTotal: sf.cartTotal,
      cartCount: sf.cartCount,
    },
    actions: {
      setCartOpen:    sf.setCartOpen,
      addToCart:      sf.addToCart,
      removeFromCart: sf.removeFromCart,
      changeQty:      sf.changeQty,
    },
    slug,
  }), [sf.cart, sf.cartOpen, sf.cartTotal, sf.cartCount, sf.setCartOpen, sf.addToCart, sf.removeFromCart, sf.changeQty, slug])

  // PDP doesn't render the homepage sections, so pageConfig only carries preset/branding tokens.
  const pageConfig = rawStore?.themeSettings ?? null

  const contract   = useMemo(() => buildContract({
    themeKey: 'fashion_v1',
    store,
    products,
    categories: [],
    pageConfig,
    cart,
    checkout,
    routing,
  }), [store, products, cart, checkout, routing])

  return (
    <FashionThemeProvider contract={contract}>
      <FashionStyleInjector accentColor={store.accentColor} />
      <div className="veluna">
        <FashionProductDetail />
      </div>
      <CartDrawer />
      <ProductQuickView />
    </FashionThemeProvider>
  )
}
