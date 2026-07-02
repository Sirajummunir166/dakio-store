'use client'
import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sanitizeThemeUrl } from '../../../lib/theme/sanitizeThemeUrl.js'

const FashionThemeContext = createContext(null)

export function FashionThemeProvider({ contract, children }) {
  const router = useRouter()
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  const navigate = {
    toHome: () => router.push(contract.routing.storeHome()),
    toProduct: (productSlug) => router.push(contract.routing.productPath(productSlug)),
    toCheckout: () => router.push(contract.routing.checkoutPath()),
    toTrack: () => router.push(contract.routing.trackPath()),
    toCollection: (href) => { const safe = sanitizeThemeUrl(href); if (safe) router.push(safe) },
  }

  const quickView = {
    product: quickViewProduct,
    open: (product) => setQuickViewProduct(product),
    close: () => setQuickViewProduct(null),
  }

  const sizeGuide = {
    isOpen: sizeGuideOpen,
    open: () => setSizeGuideOpen(true),
    close: () => setSizeGuideOpen(false),
  }

  return (
    <FashionThemeContext.Provider value={{ contract, navigate, quickView, sizeGuide }}>
      {children}
    </FashionThemeContext.Provider>
  )
}

export function useFashionTheme() {
  const ctx = useContext(FashionThemeContext)
  if (!ctx) throw new Error('useFashionTheme must be used inside FashionThemeProvider')
  return ctx
}
