'use client'
import { useFashionTheme } from './FashionThemeContext.jsx'
import FashionProductPage from './pages/FashionProductPage.jsx'

/**
 * FashionProductDetail — PDP entry point.
 * Reads the main product from ThemeContract (always products[0] in PDP context,
 * set by FashionPDPWrapper), then renders the veluna-ported FashionProductPage.
 */
export default function FashionProductDetail() {
  const { contract } = useFashionTheme()
  const product = contract.products?.[0] ?? null

  if (!product) return null

  return <FashionProductPage product={product} />
}
