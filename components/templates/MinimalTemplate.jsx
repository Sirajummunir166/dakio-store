'use client'
import { useState } from 'react'
import { ShoppingBag, Search, X, ChevronRight, Menu, Star, Truck, RotateCcw, Shield } from 'lucide-react'
import { fmt } from '../../lib/storefront'
import { CartDrawer, QuickAddModal, ProductDetailPage, CheckoutPage, SuccessPage, AnnouncementBar, SocialFooter } from '../StoreOverlays'
import { DEMO } from './demoData'

const FONT = "'Helvetica Neue', Arial, sans-serif"
const D = DEMO.minimal

export default function MinimalTemplate(props) {
  const {
    store, products, categories, activeCat, setActiveCat, searchQ, setSearchQ,
    searchOpen, setSearchOpen, mobileNav, setMobileNav,
    cart, cartOpen, setCartOpen, cartCount, cartTotal, addToCart, changeQty, removeFromCart,
    quickView, setQuickView, detail, setDetail,
    view, setView, form, setForm, formErr, placing, placeOrder, orderNum,
    couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon,
    email, setEmail, subscribed, setSubscribed,
    isFiltered, catSections, uncategorised,
  } = props

  const accent      = store?.accentColor || '#111111'
  const demoMode    = products.length === 0 && !isFiltered
  const showProds   = products.length > 0 ? products : D.products
  const heroImg     = products[0]?.imageUrl || D.hero
  const allCats     = categories.length > 0 ? categories : D.products.reduce((acc, p) => {
    if (p.category && !acc.find(c => c.id === p.category.id)) acc.push(p.category); return acc
  }, [])

  if (view === 'checkout') return <CheckoutPage {...{ cart, products: showProds, store, cartTotal, form, setForm, formErr, placing, placeOrder, setView, accent, couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon }} />
  if (view === 'success')  return <SuccessPage {...{ orderNum, form, setView, setForm, accent }} />

  const catRows = demoMode
    ? allCats.map(c => ({ ...c, items: D.products.filter(p => p.category?.id === c.id) }))
    : catSections

  return (
    <div style={{ fontFamily: FONT, background: '#fff', minHeight: '100vh', color: '#111' }}>
      <style>{`
        .mn-mob { display: none !important; } .mn-desk { display: flex !important; }
        @media (max-width: 768px) { .mn-mob { display: flex !important; } .mn-desk { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <AnnouncementBar message={store?.announcementBar} accent={accent} />

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setMobileNav(true)} className="mn-mob" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#111' }}><Menu size={22} /></button>
          <nav className="mn-desk" style={{ flex: 1, alignItems: 'center', gap: '2px' }}>
            {[{ id: 'all', name: 'Home' }, ...allCats].map(c => (
              <button key={c.id} onClick={() => { if (!demoMode) { setActiveCat(c.id); setSearchQ('') } }}
                style={{ background: 'none', border: 'none', padding: '8px 14px', fontSize: '13px', fontWeight: activeCat === c.id ? 700 : 400, color: '#111', cursor: demoMode ? 'default' : 'pointer', letterSpacing: '0.02em', fontFamily: FONT, position: 'relative', whiteSpace: 'nowrap' }}>
                {c.name}
                {activeCat === c.id && <span style={{ position: 'absolute', bottom: 0, left: '14px', right: '14px', height: '1.5px', background: '#111' }} />}
              </button>
            ))}
          </nav>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', textAlign: 'center' }} onClick={() => { setActiveCat('all'); setSearchQ('') }}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt={store.name} style={{ height: '34px', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
              : <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.3px', color: '#111' }}>{store?.name || 'My Store'}</div>
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'flex-end' }}>
            {searchOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', overflow: 'hidden' }}>
                <input autoFocus type="text" placeholder="Search…" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  style={{ border: 'none', outline: 'none', padding: '7px 10px', fontSize: '13px', width: '160px', fontFamily: FONT }} />
                <button onClick={() => { setSearchOpen(false); setSearchQ('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '7px 8px', color: '#888' }}><X size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#111' }}><Search size={19} /></button>
            )}
            <button onClick={() => setCartOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#111', position: 'relative' }}>
              <ShoppingBag size={19} />
              {cartCount > 0 && <span style={{ position: 'absolute', top: '3px', right: '3px', minWidth: '15px', height: '15px', background: accent, borderRadius: '50%', fontSize: '9px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileNav && (
        <>
          <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 198 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '75vw', maxWidth: '300px', background: '#fff', zIndex: 199, overflowY: 'auto' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '15px' }}>{store?.name || 'My Store'}</span>
              <button onClick={() => setMobileNav(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
            </div>
            {[{ id: 'all', name: 'All Products' }, ...allCats].map(c => (
              <button key={c.id} onClick={() => { if (!demoMode) { setActiveCat(c.id); setSearchQ(''); setMobileNav(false) } else setMobileNav(false) }}
                style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: 'none', border: 'none', borderBottom: '1px solid #f5f5f5', fontSize: '14px', fontWeight: activeCat === c.id ? 700 : 400, color: '#111', cursor: 'pointer', fontFamily: FONT }}>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Hero */}
      {!isFiltered && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(380px, 55vw, 620px)', overflow: 'hidden', background: '#111' }}>
          <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.6 }} onError={e => { e.target.style.opacity = 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.1) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', padding: '0 48px' }}>
            <div style={{ maxWidth: '520px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: '14px' }}>New Collection · 2025</p>
              <h1 style={{ fontSize: 'clamp(30px, 5vw, 58px)', fontWeight: 900, lineHeight: 1.05, color: '#fff', marginBottom: '18px', letterSpacing: '-1px' }}>
                {store?.name || D.heroTitle}
              </h1>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', marginBottom: '36px', lineHeight: 1.7, maxWidth: '400px' }}>
                {store?.description || D.heroSub}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => document.getElementById('mn-shop')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ padding: '14px 34px', background: '#fff', color: '#111', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>
                  Shop Now
                </button>
                <button style={{ padding: '14px 34px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT }}>
                  View Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Bar */}
      {!isFiltered && (
        <div style={{ background: '#f9fafb', borderBottom: '1px solid #e8e8e8', padding: '14px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[[Truck, 'Free Delivery', 'On orders above Tk 1,500'], [RotateCcw, 'Easy Returns', '7-day hassle-free returns'], [Shield, 'Secure Checkout', '100% safe & encrypted']].map(([Icon, t, s]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={accent} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>{t}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Products */}
      <main id="mn-shop" style={{ maxWidth: '1280px', margin: '0 auto', padding: isFiltered ? '40px 20px' : '56px 20px' }}>
        {isFiltered ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #e8e8e8' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', marginBottom: '2px' }}>
                  {searchQ ? `Results for "${searchQ}"` : categories.find(c => c.id === activeCat)?.name}
                </h2>
                <span style={{ fontSize: '13px', color: '#aaa' }}>{products.length} products</span>
              </div>
              <button onClick={() => { setActiveCat('all'); setSearchQ('') }} style={{ fontSize: '12px', color: '#555', background: 'none', border: '1px solid #ddd', padding: '7px 16px', cursor: 'pointer', fontFamily: FONT }}>← Back</button>
            </div>
            <ProductGrid products={products.length > 0 ? products : D.products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
          </>
        ) : (
          <>
            {catRows.map(cat => (
              <section key={cat.id} style={{ marginBottom: '72px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: 0 }}>{cat.name}</h2>
                    <span style={{ fontSize: '12px', color: '#bbb' }}>{cat.items.length} items</span>
                  </div>
                  {!demoMode && <button onClick={() => setActiveCat(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>View All <ChevronRight size={13} /></button>}
                </div>
                <ProductGrid products={cat.items.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            ))}
            {!demoMode && uncategorised.length > 0 && (
              <section style={{ marginBottom: '72px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', marginBottom: '28px' }}>All Products</h2>
                <ProductGrid products={uncategorised.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
            {demoMode && catRows.length === 0 && (
              <section style={{ marginBottom: '72px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', marginBottom: '28px' }}>Featured Products</h2>
                <ProductGrid products={D.products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
          </>
        )}
      </main>

      {/* Newsletter */}
      <div style={{ background: '#111', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '14px' }}>Stay Updated</p>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '10px', letterSpacing: '-0.3px' }}>Join Our Newsletter</h3>
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '28px', lineHeight: 1.7 }}>Get exclusive deals and new arrivals delivered straight to your inbox.</p>
          {subscribed ? <p style={{ fontSize: '15px', color: '#4ade80', fontWeight: 600 }}>✓ You're subscribed!</p> : (
            <div style={{ display: 'flex', maxWidth: '380px', margin: '0 auto', border: '1px solid #333' }}>
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, padding: '13px 16px', border: 'none', fontSize: '13px', outline: 'none', fontFamily: FONT, background: '#1a1a1a', color: '#fff' }} />
              <button onClick={() => email.includes('@') && setSubscribed(true)}
                style={{ padding: '13px 22px', background: '#fff', color: '#111', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.08em', fontFamily: FONT }}>
                SUBSCRIBE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e8e8e8', padding: '48px 32px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.2px', marginBottom: '10px' }}>{store?.name || 'My Store'}</div>
            <div style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.8 }}>{store?.description || 'Quality products for modern living.'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '14px' }}>Shop</div>
            {allCats.map(c => <div key={c.id} style={{ fontSize: '13px', color: '#555', marginBottom: '10px', cursor: 'pointer' }} onClick={() => !demoMode && setActiveCat(c.id)}>{c.name}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '14px' }}>Help</div>
            {['Track Order', 'Return Policy', 'Shipping Info', 'Privacy Policy'].map(l => <div key={l} style={{ fontSize: '13px', color: '#555', marginBottom: '10px', cursor: 'pointer' }}>{l}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '14px' }}>Contact</div>
            {store?.phone   && <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>📞 {store.phone}</div>}
            {store?.email   && <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>✉️ {store.email}</div>}
            {store?.address && <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>📍 {store.address}{store.city ? `, ${store.city}` : ''}</div>}
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '32px auto 0', paddingTop: '24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: '#bbb' }}>© {new Date().getFullYear()} {store?.name || 'My Store'}. All rights reserved.</p>
          <p style={{ fontSize: '12px', color: '#bbb' }}>Powered by <strong style={{ color: '#888' }}>LenDen</strong></p>
        </div>
              <SocialFooter store={store} accent={accent} />
      </footer>

      {/* Overlays */}
      {detail    && <ProductDetailPage product={detail} store={store} accent={accent} onAdd={addToCart} onClose={() => setDetail(null)} />}
      {quickView && <QuickAddModal product={quickView} store={store} accent={accent} onAdd={addToCart} onClose={() => setQuickView(null)} onFull={() => { setDetail(quickView); setQuickView(null) }} />}
      <CartDrawer {...{ cart, products: showProds, store, cartCount, cartTotal, cartOpen, setCartOpen, changeQty, removeFromCart, setView, accent }} />
    </div>
  )
}

function ProductGrid({ products, accent, currency, onAdd, onView, onQuick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '24px 16px' }}>
      {products.map(p => <ProductCard key={p.id} p={p} accent={accent} currency={currency} onAdd={onAdd} onView={onView} onQuick={onQuick} />)}
    </div>
  )
}

function ProductCard({ p, accent, currency, onAdd, onView, onQuick }) {
  const [hovered, setHovered] = useState(false)
  const oos = p.totalStock !== undefined && p.totalStock <= 0
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '125%', overflow: 'hidden', background: '#f5f5f5', marginBottom: '12px' }}>
        <div style={{ position: 'absolute', inset: 0 }} onClick={() => onView(p)}>
          {p.imageUrl
            ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.55s ease', transform: hovered ? 'scale(1.07)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ccc' }}>📦</div>
          }
        </div>
        {oos && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: '#111', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '5px 14px', letterSpacing: '0.12em' }}>SOLD OUT</span></div>}
        {!oos && (
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', gap: '6px', opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.2s' }}>
            <button onClick={e => { e.stopPropagation(); onAdd(p, 1) }}
              style={{ flex: 1, padding: '10px 0', background: '#111', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              ADD TO CART
            </button>
          </div>
        )}
      </div>
      <div onClick={() => onView(p)}>
        {p.category && <div style={{ fontSize: '10px', fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{p.category.name}</div>}
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#111', lineHeight: 1.4, marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: accent || '#111' }}>{fmt(p.sellingPrice, currency)}</div>
          <div style={{ display: 'flex', gap: '1px' }}>{[1,2,3,4,5].map(i => <Star key={i} size={9} fill={i <= 4 ? '#f59e0b' : 'none'} color="#f59e0b" />)}</div>
        </div>
      </div>
    </div>
  )
}
