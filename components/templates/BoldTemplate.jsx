'use client'
import { useState } from 'react'
import { ShoppingCart, Search, X, Menu, ChevronRight, Zap } from 'lucide-react'
import { fmt } from '../../lib/storefront'
import { CartDrawer, QuickAddModal, ProductDetailPage, CheckoutPage, SuccessPage, AnnouncementBar, SocialFooter } from '../StoreOverlays'
import { DEMO } from './demoData'

const FONT = "'Inter', 'Segoe UI', sans-serif"

export default function BoldTemplate(props) {
  const {
    store, products, categories, activeCat, setActiveCat, searchQ, setSearchQ,
    searchOpen, setSearchOpen, mobileNav, setMobileNav,
    cart, cartOpen, setCartOpen, cartCount, cartTotal, addToCart, changeQty, removeFromCart,
    quickView, setQuickView, detail, setDetail,
    view, setView, form, setForm, formErr, placing, placeOrder, orderNum,
    couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon,
    email, setEmail, subscribed, setSubscribed,
    isFiltered, catSections, uncategorised, heroBg,
  } = props

  const accent = store?.accentColor || '#facc15'

  const D = DEMO.bold
  const demoMode = products.length === 0 && !isFiltered
  const showProds = products.length > 0 ? products : D.products
  const heroImg = products[0]?.imageUrl || D.hero
  const allCats = categories.length > 0 ? categories : D.products.reduce((acc, p) => {
    if (p.category && !acc.find(c => c.id === p.category.id)) acc.push(p.category); return acc
  }, [])
  const catRows = demoMode
    ? allCats.map(c => ({ ...c, items: D.products.filter(p => p.category?.id === c.id) }))
    : catSections

  if (view === 'checkout') return <CheckoutPage {...{ cart, products, store, cartTotal, form, setForm, formErr, placing, placeOrder, setView, accent, couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon }} />
  if (view === 'success')  return <SuccessPage {...{ orderNum, form, setView, setForm, accent }} />

  return (
    <div style={{ fontFamily: FONT, background: '#111', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        .bold-mob { display: none !important; } .bold-desk { display: flex !important; }
        @media (max-width:768px) { .bold-mob { display: flex !important; } .bold-desk { display: none !important; } }
        @keyframes slideIn { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      <AnnouncementBar message={store?.announcementBar} accent={accent} />

      {/* Header */}
      <header style={{ background: '#000', borderBottom: '1px solid #222', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setMobileNav(true)} className="bold-mob" style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent }}><Menu size={22} /></button>

          {/* Logo */}
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={() => { setActiveCat('all'); setSearchQ('') }}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt={store.name} style={{ height: '30px', objectFit: 'contain' }} />
              : <>
                  <div style={{ width: '32px', height: '32px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#111' }}><Zap size={18} /></div>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>{store?.name}</span>
                </>
            }
          </div>

          {/* Nav */}
          <nav className="bold-desk" style={{ flex: 1, alignItems: 'center', gap: '0', overflowX: 'auto' }}>
            {[{ id: 'all', name: 'All' }, ...categories].map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setSearchQ('') }}
                style={{ background: 'none', border: 'none', padding: '8px 14px', fontSize: '13px', fontWeight: activeCat === c.id ? 900 : 600, color: activeCat === c.id ? accent : '#666', cursor: 'pointer', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', borderBottom: activeCat === c.id ? `2px solid ${accent}` : '2px solid transparent' }}>
                {c.name}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {searchOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                <input autoFocus type="text" placeholder="SEARCH…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ border: 'none', outline: 'none', padding: '9px 10px', fontSize: '12px', width: '150px', fontFamily: FONT, background: 'transparent', color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }} />
                <button onClick={() => { setSearchOpen(false); setSearchQ('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666' }}><X size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666' }}><Search size={18} /></button>
            )}
            <button onClick={() => setCartOpen(true)} style={{ background: accent, border: 'none', cursor: 'pointer', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <ShoppingCart size={16} />
              <span className="bold-desk">Cart</span>
              {cartCount > 0 && <span style={{ background: '#111', color: accent, borderRadius: '4px', fontSize: '11px', fontWeight: 900, padding: '1px 6px' }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileNav && (
        <>
          <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 198 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#0a0a0a', zIndex: 199, overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 900, fontSize: '16px', color: accent, textTransform: 'uppercase' }}>{store?.name}</span>
              <button onClick={() => setMobileNav(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
            </div>
            {[{ id: 'all', name: 'All Products' }, ...categories].map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setMobileNav(false) }}
                style={{ width: '100%', textAlign: 'left', padding: '16px 20px', background: activeCat === c.id ? accent + '22' : 'none', border: 'none', borderBottom: '1px solid #1a1a1a', fontSize: '14px', fontWeight: 700, color: activeCat === c.id ? accent : '#888', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Hero */}
      {!isFiltered && (
        <div style={{ position: 'relative', width: '100%', minHeight: 'clamp(400px, 60vw, 680px)', overflow: 'hidden', background: '#000' }}>
          <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} onError={e => { e.target.src = D.hero }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)` }} />
          <div style={{ position: 'absolute', top: '20%', right: '5%', width: '300px', height: '300px', background: accent, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto', padding: '80px 48px', minHeight: 'clamp(400px, 60vw, 680px)', display: 'flex', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: accent, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={12} /> New Drop 2025
              </p>
              <h1 style={{ fontSize: 'clamp(40px, 8vw, 96px)', fontWeight: 900, lineHeight: 0.95, color: '#fff', marginBottom: '20px', letterSpacing: '-2px', textTransform: 'uppercase' }}>
                {store?.name}
              </h1>
              <p style={{ fontSize: '15px', color: '#888', marginBottom: '40px', lineHeight: 1.6, maxWidth: '420px' }}>
                {store?.description || 'Don\'t follow the crowd. Set the trend. Premium gear for those who lead.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => document.getElementById('bold-shop')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ padding: '16px 40px', background: accent, color: '#111', border: 'none', fontSize: '13px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT }}>
                  Shop Now
                </button>
                <button style={{ padding: '16px 40px', background: 'transparent', color: '#fff', border: '1px solid #444', fontSize: '13px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  New Drops
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <main id="bold-shop" style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        {isFiltered ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #1a1a1a' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                  {searchQ ? `"${searchQ}"` : categories.find(c => c.id === activeCat)?.name}
                </h2>
                <span style={{ fontSize: '12px', color: '#666' }}>{products.length} items</span>
              </div>
              <button onClick={() => { setActiveCat('all'); setSearchQ('') }} style={{ fontSize: '12px', fontWeight: 700, color: '#888', background: '#1a1a1a', border: '1px solid #333', padding: '7px 16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>← Back</button>
            </div>
            {products.length === 0 ? <BoldEmpty accent={accent} /> : <BoldGrid products={products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />}
          </>
        ) : (
          <>
            {catRows.map(cat => (
              <section key={cat.id} style={{ marginBottom: '64px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.3px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {cat.name}
                    <span style={{ width: '3px', height: '24px', background: accent, display: 'inline-block', flexShrink: 0 }} />
                  </h2>
                  <button onClick={() => !demoMode && setActiveCat(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 900, color: accent, background: 'none', border: `1px solid ${accent}44`, padding: '6px 12px', cursor: demoMode ? 'default' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    All <ChevronRight size={12} />
                  </button>
                </div>
                <BoldGrid products={cat.items.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            ))}
            {!demoMode && uncategorised.length > 0 && (
              <section style={{ marginBottom: '64px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  All Products <span style={{ width: '3px', height: '24px', background: accent, display: 'inline-block' }} />
                </h2>
                <BoldGrid products={uncategorised.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
            {demoMode && catRows.length === 0 && (
              <section style={{ marginBottom: '64px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  Featured Products <span style={{ width: '3px', height: '24px', background: accent, display: 'inline-block' }} />
                </h2>
                <BoldGrid products={D.products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
            {!demoMode && catSections.length === 0 && uncategorised.length === 0 && <BoldEmpty accent={accent} />}
          </>
        )}
      </main>

      {/* CTA Banner */}
      <div style={{ background: accent, padding: '60px 24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: 'clamp(24px, 4vw, 48px)', fontWeight: 900, color: '#111', marginBottom: '8px', letterSpacing: '-1px', textTransform: 'uppercase' }}>Don't Miss Out</h3>
        <p style={{ fontSize: '14px', color: '#333', marginBottom: '28px' }}>Sign up for exclusive drops, early access & member-only deals.</p>
        {subscribed ? <p style={{ fontWeight: 900, color: '#111' }}>✓ You're in!</p> : (
          <div style={{ display: 'flex', maxWidth: '380px', margin: '0 auto', background: 'rgba(0,0,0,0.1)' }}>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, padding: '14px 16px', border: 'none', fontSize: '13px', outline: 'none', background: 'transparent', color: '#111', fontFamily: FONT }} />
            <button onClick={() => email.includes('@') && setSubscribed(true)} style={{ padding: '14px 20px', background: '#111', color: accent, border: 'none', fontSize: '12px', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Join</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#0a0a0a', padding: '48px 32px 24px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '40px', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: accent, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>{store?.name}</div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.7 }}>{store?.description || 'Premium gear for those who lead.'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#333', marginBottom: '14px' }}>Shop</div>
            {categories.map(c => <div key={c.id} style={{ fontSize: '13px', color: '#666', marginBottom: '8px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }} onClick={() => setActiveCat(c.id)}>{c.name}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#333', marginBottom: '14px' }}>Support</div>
            {['Track Order', 'Returns', 'Size Guide', 'Contact'].map(l => <div key={l} style={{ fontSize: '13px', color: '#666', marginBottom: '8px', cursor: 'pointer' }}>{l}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#333', marginBottom: '14px' }}>Contact</div>
            {store?.phone && <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{store.phone}</div>}
            {store?.email && <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{store.email}</div>}
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: '#333' }}>© {new Date().getFullYear()} {store?.name?.toUpperCase()}</p>
          <p style={{ fontSize: '12px', color: '#333' }}>Powered by <strong style={{ color: '#555' }}>LenDen</strong></p>
        </div>
              <SocialFooter store={store} accent={accent} />
      </footer>

      {detail    && <ProductDetailPage product={detail} store={store} accent={accent} onAdd={addToCart} onClose={() => setDetail(null)} />}
      {quickView && <QuickAddModal product={quickView} store={store} accent={accent} onAdd={addToCart} onClose={() => setQuickView(null)} onFull={() => { setDetail(quickView); setQuickView(null) }} />}
      <CartDrawer {...{ cart, products: showProds, store, cartCount, cartTotal, cartOpen, setCartOpen, changeQty, removeFromCart, setView, accent }} />
    </div>
  )
}

function BoldEmpty({ accent }) {
  return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#333' }}><Zap size={40} strokeWidth={1.5} color={accent} style={{ marginBottom: '12px' }} /><p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No products yet</p></div>
}

function BoldGrid({ products, accent, currency, onAdd, onView, onQuick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2px' }}>
      {products.map(p => <BoldCard key={p.id} p={p} accent={accent} currency={currency} onAdd={onAdd} onView={onView} onQuick={onQuick} />)}
    </div>
  )
}

function BoldCard({ p, accent, currency, onAdd, onView, onQuick }) {
  const [hovered, setHovered] = useState(false)
  const oos = p.totalStock !== undefined && p.totalStock <= 0
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => onView(p)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#1a1a1a', aspectRatio: '3/4' }}>
      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} /> : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>👟</div>}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%)' }} />
      {oos && <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sold Out</div>}
      {!oos && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: accent, color: '#111', fontSize: '10px', fontWeight: 900, padding: '4px 10px', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onAdd(p, 1) }}>
          + ADD
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
        {p.category && <div style={{ fontSize: '9px', fontWeight: 900, color: accent, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>{p.category.name}</div>}
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '8px', textTransform: 'uppercase', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</div>
        <div style={{ fontSize: '16px', fontWeight: 900, color: accent }}>{fmt(p.sellingPrice, currency)}</div>
      </div>
    </div>
  )
}
