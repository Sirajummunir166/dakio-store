'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { productPath, checkoutPath } from './routes'
import { repriceCart } from './addOnCart'
import { useTracking } from '../components/tracking/TrackingRoot'
import { itemFromBasic, itemFromCartLine, purchaseFromResponse } from './tracking/items'

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
  const tk            = useTracking()
  const [store]       = useState(initialStore)
  const [products, setProducts]     = useState(initialProducts || [])
  const [categories]  = useState(initialCategories || [])

  const [activeCat, setActiveCat]   = useState('all')
  const [searchQ, setSearchQ]       = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNav, setMobileNav]   = useState(false)

  const [cart, setCartRaw]          = useState(() => {
    if (typeof window === 'undefined') return []
    try { return repriceCart(JSON.parse(localStorage.getItem(`dk_cart_${slug}`) || '[]')) } catch { return [] }
  })
  // Add-on lines (Goes well with) are re-priced on every change, so the cart
  // never shows — or sends — a together price the server would refuse.
  const setCart = (next) => setCartRaw((prev) => repriceCart(typeof next === 'function' ? next(prev) : next))
  const [cartOpen, setCartOpen]     = useState(false)
  const [quickView, _setQuickView]  = useState(null)
  const [detail,   _setDetail]      = useState(null)

  // ── Tracking (components/tracking) — a no-op outside the store layout ────
  function _fireViewContent(product) {
    const item = itemFromBasic(product)
    if (item) tk.track('view_item', { ecommerce: { currency: tk.currency, value: item.price, items: [item] } })
  }

  // add_to_cart / remove_from_cart for a cart line's quantity change (a delta).
  function _trackLineDelta(line, delta) {
    if (!line || !delta) return
    const item = itemFromCartLine(line, { qty: Math.abs(delta) })
    if (!item) return
    tk.track(delta > 0 ? 'add_to_cart' : 'remove_from_cart', {
      ecommerce: { currency: tk.currency, value: item.price * item.quantity, items: [item] },
    })
  }

  function setQuickView(product) { _setQuickView(product); if (product) _fireViewContent(product) }

  // Navigate to the dedicated product page so the URL becomes /products/{slug}.
  // All templates call onView={setDetail} — this single change fixes all of them.
  function setDetail(product) {
    if (!product) { _setDetail(null); return }
    _fireViewContent(product)
    if (product.slug) {
      router.push(productPath(product.slug, slug))
      return
    }
    _setDetail(product) // fallback for products without a slug
  }

  const [view, _setView]            = useState('home')

  function setView(v) {
    if (v === 'checkout') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`dk_cart_${slug}`, JSON.stringify(cart))
        router.push(checkoutPath(slug))
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

  // `addOn`: { of: <main product id>, together: <together price|null> } when
  // added from a product's Goes well with block — its own line, re-priced by
  // repriceCart (lib/addOnCart.js).
  function addToCart(product, qty = 1, variant = null, addOn = null) {
    const stockAvailable = variant ? (variant.stock ?? 0) : (product.totalStock ?? 0)
    if (stockAvailable <= 0) return

    // What actually lands in the cart — the stock cap can clip it to nothing.
    const key = product.id + (variant?.id || '') + (addOn?.of ? ':addon:' + addOn.of : '')
    const maxQty = variant ? (variant.stock ?? Infinity) : (product.totalStock ?? Infinity)
    const had = cart.find(i => i.key === key)?.qty || 0
    const added = Math.max(0, Math.min(maxQty, had + qty) - had)

    setCart(prev => {
      const idx = prev.findIndex(i => i.key === key)
      if (idx >= 0) {
        const n = [...prev]; n[idx] = { ...n[idx], qty: Math.min(maxQty, n[idx].qty + qty) }; return n
      }
      const price = variant?.price != null ? variant.price : product.sellingPrice
      const name = variant ? `${product.name} — ${variant.name}` : product.name
      const sku = variant?.sku || product.sku || ''
      const imageUrl = product.imageUrl || (product.images?.[0]) || null
      return [...prev, {
        key, productId: product.id, variantId: variant?.id || null, name, sku, unitPrice: price, qty: Math.min(maxQty, qty), imageUrl,
        ...(addOn?.of ? { addOnOf: addOn.of, basePrice: price, togetherPrice: addOn.together ?? null } : {}),
      }]
    })
    _setQuickView(null); _setDetail(null)
    setCartOpen(true)

    if (added > 0) {
      const item = itemFromBasic(product, { variant, qty: added })
      if (item) tk.track('add_to_cart', { ecommerce: { currency: tk.currency, value: item.price * added, items: [item] } })
    }
  }

  // `d` is a delta (+1 / −1), never an absolute quantity.
  function changeQty(key, d) {
    const line = cart.find(i => i.key === key)
    if (line) {
      const prod   = products.find(x => x.id === line.productId)
      const maxQty = prod?.totalStock ?? Infinity
      _trackLineDelta(line, Math.min(maxQty, Math.max(1, line.qty + d)) - line.qty)
    }
    setCart(p => p.map(i => {
      if (i.key !== key) return i
      const prod   = products.find(x => x.id === i.productId)
      const maxQty = prod?.totalStock ?? Infinity
      return { ...i, qty: Math.min(maxQty, Math.max(1, i.qty + d)) }
    }))
  }

  function removeFromCart(key) {
    const line = cart.find(i => i.key === key)
    if (line) _trackLineDelta(line, -line.qty)
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

    // Legacy in-page form (preview templates only — setView('checkout') always
    // goes to /checkout). No browser Lead: a phone capture is not a lead.
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
    // Event id shared by the browser and server Meta Purchase
    const metaEventId = tk.newEventId('pur')
    try {
      const r = await post(`/store/${slug}/orders`, {
        ...form, items: cart, paymentMethod: 'COD',
        discount: couponDiscount,
        couponCode: appliedCoupon?.code || null,
        metaEventId,
        tracking: tk.buildTracking(metaEventId),
      })
      // Purchase from the server's answer, same event id as the server's Meta event.
      // Only a 201 has an order — a 202 (SMS code wanted) is not a purchase.
      if (r?.orderNumber && tk.once(`tx:${r.orderId || r.orderNumber}`, { storage: 'local' })) {
        tk.track('purchase', {
          ecommerce: purchaseFromResponse(r, { items: cart.map((i, n) => itemFromCartLine(i, { index: n })), value: cartTotal - (couponDiscount || 0), currency: tk.currency }),
        }, { eventId: r.eventId || metaEventId })
      }
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
