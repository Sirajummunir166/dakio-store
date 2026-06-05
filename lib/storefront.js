'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'
const get  = path => fetch(`${API}${path}`).then(r => r.json())
const post = async (path, data) => {
  const r = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const json = await r.json()
  if (!r.ok) throw new Error(json?.error || 'Request failed')
  return json
}

export function fmt(price, currency) {
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Tk '
  return `${sym}${Number(price || 0).toLocaleString('en-GB')}.00`
}

export function useStorefront({ store: initialStore, products: initialProducts, categories: initialCategories, slug }) {
  const router        = useRouter()
  const [store]       = useState(initialStore)
  const [products, setProducts]     = useState(initialProducts || [])
  const [categories]  = useState(initialCategories || [])

  const [activeCat, setActiveCat]   = useState('all')
  const [searchQ, setSearchQ]       = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNav, setMobileNav]   = useState(false)

  const [cart, setCart]             = useState(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(`dk_cart_${slug}`) || '[]') } catch { return [] }
  })
  const [cartOpen, setCartOpen]     = useState(false)
  const [quickView, _setQuickView]  = useState(null)
  const [detail,   _setDetail]      = useState(null)

  // ── Tracking helpers — safe no-op if Pixel/GTM not loaded ────────────────
  function _fireViewContent(product) {
    if (!product || typeof window === 'undefined') return
    try {
      window.fbq?.('track', 'ViewContent', {
        value:        product.sellingPrice,
        currency:     store.currency || 'BDT',
        content_ids:  [product.id],
        content_name: product.name,
        content_type: 'product',
      })
      window.dataLayer?.push({
        event:    'view_item',
        value:    product.sellingPrice,
        currency: store.currency || 'BDT',
        items:    [{ item_id: product.id, item_name: product.name, price: product.sellingPrice }],
      })
    } catch {}
  }

  function setQuickView(product) { _setQuickView(product); if (product) _fireViewContent(product) }
  function setDetail(product)    { _setDetail(product);    if (product) _fireViewContent(product) }

  const [view, _setView]            = useState('home')

  function setView(v) {
    if (v === 'checkout') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`dk_cart_${slug}`, JSON.stringify(cart))
        // Custom domain: pathname won't start with /slug, use /checkout directly
        const isCustomDomain = !window.location.pathname.startsWith(`/${slug}`)
        router.push(isCustomDomain ? '/checkout' : `/${slug}/checkout`)
      }
      return
    }
    _setView(v)
  }
  const [orderNum, setOrderNum]     = useState('')
  const [form, setForm]             = useState({ name: '', phone: '', address: '', city: '', note: '' })
  const [formErr, setFormErr]       = useState('')
  const [placing, setPlacing]       = useState(false)
  const [email, setEmail]           = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const [couponCode, setCouponCode]       = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponErr, setCouponErr]         = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dk_cart_${slug}`, JSON.stringify(cart))
    }
  }, [cart, slug])

  const leadSaved = useRef(false)

  // Filter products by category or search
  useEffect(() => {
    if (!slug) return
    const p = new URLSearchParams({ status: 'PUBLISHED', limit: 48 })
    if (activeCat !== 'all') p.set('category', activeCat)
    if (searchQ.trim()) p.set('search', searchQ.trim())
    get(`/store/${slug}/products?${p}`).then(d => setProducts(d.products || [])).catch(() => {})
  }, [activeCat, searchQ, slug])

  function addToCart(product, qty = 1, variant = null) {
    setCart(prev => {
      const key = product.id + (variant?.id || '')
      const idx = prev.findIndex(i => i.key === key)
      if (idx >= 0) {
        const n = [...prev]; n[idx] = { ...n[idx], qty: n[idx].qty + qty }; return n
      }
      const price = variant?.price != null ? variant.price : product.sellingPrice
      const name = variant ? `${product.name} — ${variant.name}` : product.name
      const sku = variant?.sku || product.sku || ''
      const imageUrl = product.imageUrl || (product.images?.[0]) || null
      return [...prev, { key, productId: product.id, variantId: variant?.id || null, name, sku, unitPrice: price, qty, imageUrl }]
    })
    _setQuickView(null); _setDetail(null)
    setCartOpen(true)

    // ── AddToCart tracking ────────────────────────────────────────────────
    try {
      const price = variant?.price != null ? variant.price : product.sellingPrice
      const currency = store.currency || 'BDT'
      window.fbq?.('track', 'AddToCart', {
        value:        price * qty,
        currency,
        content_ids:  [product.id],
        content_name: product.name,
        content_type: 'product',
      })
      window.dataLayer?.push({
        event:    'add_to_cart',
        value:    price * qty,
        currency,
        items:    [{ item_id: product.id, item_name: product.name, price, quantity: qty }],
      })
    } catch {}
  }

  function changeQty(key, d) {
    setCart(p => p.map(i => i.key === key ? { ...i, qty: Math.max(1, i.qty + d) } : i))
  }

  function removeFromCart(key) {
    setCart(p => p.filter(i => i.key !== key))
  }

  const cartTotal = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  async function applyCoupon(code) {
    if (!code.trim()) return
    setCouponLoading(true); setCouponErr('')
    try {
      const r = await post('/coupons/validate', { code: code.trim(), slug, subtotal: cartTotal })
      if (r.valid) {
        setAppliedCoupon(r.coupon)
        setCouponDiscount(r.discount)
        setCouponErr('')
      } else {
        setCouponErr(r.error || 'Invalid coupon')
      }
    } catch (e) {
      setCouponErr(e?.message || 'Invalid coupon code')
    }
    setCouponLoading(false)
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponCode('')
    setCouponErr('')
  }

  function tryLeadCapture() {
    if (leadSaved.current || !cart.length || !form.name.trim() || form.phone.length < 8) return
    leadSaved.current = true
    fetch(`${API}/store/${slug}/leads`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:      form.name,
        phone:     form.phone,
        address:   form.address  || undefined,
        city:      form.city     || undefined,
        cart:      cart.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
        cartValue: cart.reduce((s, i) => s + i.qty * i.unitPrice, 0),
        sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
      keepalive: true,
    }).catch(() => {})
  }

  useEffect(() => {
    window.addEventListener('beforeunload', tryLeadCapture)
    return () => window.removeEventListener('beforeunload', tryLeadCapture)
  }, [cart, form]) // eslint-disable-line

  useEffect(() => {
    if (!cart.length || !form.name.trim() || form.phone.length < 8 || leadSaved.current) return
    const t = setTimeout(tryLeadCapture, 20000)
    return () => clearTimeout(t)
  }, [cart, form]) // eslint-disable-line

  async function placeOrder() {
    leadSaved.current = true
    if (!form.name.trim())      { setFormErr('Please enter your name'); return }
    if (form.phone.length < 10) { setFormErr('Enter a valid phone number'); return }
    setFormErr(''); setPlacing(true)
    // Generate event_id for Meta browser+server deduplication
    const metaEventId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    try {
      const r = await post(`/store/${slug}/orders`, {
        ...form, items: cart, paymentMethod: 'COD',
        discount: couponDiscount,
        couponCode: appliedCoupon?.code || null,
        metaEventId,
      })
      // Fire browser-side Purchase with matching event_id for deduplication with server CAPI event
      try {
        const purchaseValue = cartTotal - (couponDiscount || 0)
        const currency = store.currency || 'BDT'
        window.fbq?.('track', 'Purchase', {
          value:        purchaseValue,
          currency,
          order_id:     r.orderNumber,
          content_ids:  cart.map(i => i.productId),
          content_type: 'product',
          num_items:    cart.reduce((s, i) => s + i.qty, 0),
        }, { eventID: metaEventId })
        window.dataLayer?.push({
          event:          'purchase',
          value:          purchaseValue,
          currency,
          transaction_id: r.orderNumber,
          items: cart.map(i => ({ item_id: i.productId, item_name: i.name, price: i.unitPrice, quantity: i.qty })),
        })
      } catch {}
      setOrderNum(r.orderNumber)
      setCart([]); removeCoupon(); setView('success')
    } catch {
      setFormErr('Order failed. Try again.')
      leadSaved.current = false
    } finally { setPlacing(false) }
  }

  const isFiltered    = activeCat !== 'all' || !!searchQ.trim()
  const catSections   = categories.map(c => ({ ...c, items: products.filter(p => p.category?.id === c.id) })).filter(c => c.items.length > 0)
  const uncategorised = products.filter(p => !p.category)

  return {
    slug,
    store, products, categories, loading: false, notFound: !store,
    activeCat, setActiveCat, searchQ, setSearchQ, searchOpen, setSearchOpen,
    mobileNav, setMobileNav,
    cart, cartOpen, setCartOpen, cartCount, cartTotal,
    addToCart, changeQty, removeFromCart,
    quickView, setQuickView, detail, setDetail,
    view, setView, form, setForm, formErr, placing, placeOrder, orderNum,
    email, setEmail, subscribed, setSubscribed,
    isFiltered, catSections, uncategorised,
    couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon,
    couponLoading, applyCoupon, removeCoupon,
  }
}
