'use client'
import { useState } from 'react'
import { ShoppingCart, Search, X, Menu, ChevronRight, Zap, Star } from 'lucide-react'
import { fmt } from '../../lib/storefront'
import { CartDrawer, QuickAddModal, ProductDetailPage, CheckoutPage, SuccessPage, AnnouncementBar, SocialFooter } from '../StoreOverlays'
import { DEMO } from './demoData'

const FONT = "'Inter', 'Segoe UI', sans-serif"

export default function TechTemplate(props) {
  const {
    store, products, categories, activeCat, setActiveCat, searchQ, setSearchQ,
    searchOpen, setSearchOpen, mobileNav, setMobileNav,
    cart, cartOpen, setCartOpen, cartCount, cartTotal, addToCart, changeQty, removeFromCart,
    quickView, setQuickView, detail, setDetail,
    view, setView, form, setForm, formErr, placing, placeOrder, orderNum,
    email, setEmail, subscribed, setSubscribed,
    isFiltered, catSections, uncategorised, heroBg,
  } = props

  const accent = store?.accentColor || '#3b82f6'

  const D = DEMO.tech
  const demoMode = products.length === 0 && !isFiltered
  const showProds = products.length > 0 ? products : D.products
  const heroImg = products[0]?.imageUrl || D.hero
  const allCats = categories.length > 0 ? categories : D.products.reduce((acc, p) => {
    if (p.category && !acc.find(c => c.id === p.category.id)) acc.push(p.category); return acc
  }, [])
  const catRows = demoMode
    ? allCats.map(c => ({ ...c, items: D.products.filter(p => p.category?.id === c.id) }))
    : catSections

  if (view === 'checkout') return <CheckoutPage {...{ cart, products, store, cartTotal, form, setForm, formErr, placing, placeOrder, setView, accent }} />
  if (view === 'success')  return <SuccessPage {...{ orderNum, form, setView, setForm, accent }} />

  return (
    <div style={{ fontFamily: FONT, background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <style>{`
        .tech-mob { display: none !important; } .tech-desk { display: flex !important; }
        @media (max-width:768px) { .tech-mob { display: flex !important; } .tech-desk { display: none !important; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      <AnnouncementBar message={store?.announcementBar} accent={accent} />

      {/* Header */}
      <header style={{ background: '#1e293b', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setMobileNav(true)} className="tech-mob" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Menu size={22} /></button>

          {/* Logo */}
          <div style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setActiveCat('all'); setSearchQ('') }}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt={store.name} style={{ height: '30px', objectFit: 'contain' }} />
              : <>
                  <div style={{ width: '28px', height: '28px', background: accent, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>{store?.name?.[0] || 'T'}</div>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{store?.name}</span>
                </>
            }
          </div>

          {/* Nav — desktop */}
          <nav className="tech-desk" style={{ flex: 1, alignItems: 'center', gap: '0', overflowX: 'auto' }}>
            {[{ id: 'all', name: 'All' }, ...categories].map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setSearchQ('') }}
                style={{ background: 'none', border: 'none', padding: '8px 14px', fontSize: '13px', fontWeight: activeCat === c.id ? 600 : 400, color: activeCat === c.id ? accent : '#94a3b8', cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', borderBottom: activeCat === c.id ? `2px solid ${accent}` : '2px solid transparent' }}>
                {c.name}
              </button>
            ))}
          </nav>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden', flex: '0 0 auto', width: searchOpen ? '220px' : '40px', transition: 'width 0.2s' }}>
            <button onClick={() => setSearchOpen(!searchOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', color: '#64748b', display: 'flex', flexShrink: 0 }}><Search size={15} /></button>
            {searchOpen && <input autoFocus type="text" placeholder="Search products…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#e2e8f0', paddingRight: '8px', fontFamily: FONT }} />}
            {searchOpen && <button onClick={() => { setSearchOpen(false); setSearchQ('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#64748b' }}><X size={13} /></button>}
          </div>

          {/* Cart */}
          <button onClick={() => setCartOpen(true)} style={{ position: 'relative', background: accent, border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
            <ShoppingCart size={16} />
            <span className="tech-desk">Cart</span>
            {cartCount > 0 && <span style={{ background: '#fff', color: accent, borderRadius: '10px', fontSize: '11px', fontWeight: 800, padding: '0 6px', lineHeight: '18px', minWidth: '18px', textAlign: 'center' }}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileNav && (
        <>
          <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 198 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#1e293b', zIndex: 199, overflowY: 'auto' }}>
            <div style={{ padding: '20px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>{store?.name}</span>
              <button onClick={() => setMobileNav(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            {[{ id: 'all', name: 'All Products' }, ...categories].map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setMobileNav(false) }}
                style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: activeCat === c.id ? '#0f172a' : 'none', border: 'none', borderBottom: '1px solid #1e293b', fontSize: '14px', fontWeight: activeCat === c.id ? 600 : 400, color: activeCat === c.id ? accent : '#94a3b8', cursor: 'pointer' }}>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Hero */}
      {!isFiltered && (
        <div style={{ position: 'relative', width: '100%', minHeight: 'clamp(360px, 50vw, 580px)', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
          <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} onError={e => { e.target.src = D.hero }} />
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 70% 50%, ${accent}22 0%, transparent 60%)` }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto', padding: '80px 40px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: accent + '22', border: `1px solid ${accent}44`, borderRadius: '20px', padding: '4px 12px', marginBottom: '20px' }}>
                <Zap size={12} color={accent} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: accent, letterSpacing: '0.08em' }}>NEW ARRIVALS</span>
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, color: '#fff', marginBottom: '16px', letterSpacing: '-1px' }}>
                {store?.name}
              </h1>
              <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '32px', lineHeight: 1.7, maxWidth: '400px' }}>
                {store?.description || 'The latest tech at the best prices. Free delivery. 7-day returns.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => document.getElementById('tech-shop')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ padding: '13px 28px', background: accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', fontFamily: FONT }}>
                  Shop Now
                </button>
                <button onClick={() => { const s = categories.find(c => c.name.toLowerCase().includes('deal') || c.name.toLowerCase().includes('sale')); if (s) setActiveCat(s.id) }}
                  style={{ padding: '13px 28px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                  View Deals
                </button>
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[['10K+', 'Happy Customers'], ['500+', 'Products'], ['7-Day', 'Returns'], ['Free', 'Delivery']].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: accent }}>{v}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <main id="tech-shop" style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
        {isFiltered ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>
                  {searchQ ? `Search: "${searchQ}"` : categories.find(c => c.id === activeCat)?.name}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{products.length} products found</span>
              </div>
              <button onClick={() => { setActiveCat('all'); setSearchQ('') }} style={{ fontSize: '12px', color: '#64748b', background: '#1e293b', border: '1px solid #334155', padding: '7px 16px', cursor: 'pointer', borderRadius: '6px', fontFamily: FONT }}>← Back</button>
            </div>
            {products.length === 0 ? <TechEmpty accent={accent} /> : <TechGrid products={products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />}
          </>
        ) : (
          <>
            {catRows.map(cat => (
              <section key={cat.id} style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>{cat.name}</h2>
                    <span style={{ background: accent + '22', color: accent, fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>{cat.items.length}</span>
                  </div>
                  <button onClick={() => !demoMode && setActiveCat(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: accent, background: 'none', border: 'none', cursor: demoMode ? 'default' : 'pointer', fontFamily: FONT }}>
                    View All <ChevronRight size={13} />
                  </button>
                </div>
                <TechGrid products={cat.items.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            ))}
            {!demoMode && uncategorised.length > 0 && (
              <section style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>All Products</h2>
                <TechGrid products={uncategorised.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
            {demoMode && catRows.length === 0 && (
              <section style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>Featured Products</h2>
                <TechGrid products={D.products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
            {!demoMode && catSections.length === 0 && uncategorised.length === 0 && <TechEmpty accent={accent} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#1e293b', borderTop: '1px solid #334155', padding: '48px 32px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>{store?.name}</div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.7 }}>{store?.description || 'Your trusted tech store.'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: '14px' }}>Categories</div>
            {categories.map(c => <div key={c.id} style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', cursor: 'pointer' }} onClick={() => setActiveCat(c.id)}>{c.name}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: '14px' }}>Support</div>
            {['Track Order', 'Returns', 'Warranty', 'Contact'].map(l => <div key={l} style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', cursor: 'pointer' }}>{l}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: '14px' }}>Contact</div>
            {store?.phone  && <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{store.phone}</div>}
            {store?.email  && <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{store.email}</div>}
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: '#475569' }}>© {new Date().getFullYear()} {store?.name}. All rights reserved.</p>
          <p style={{ fontSize: '12px', color: '#475569' }}>Powered by <strong style={{ color: '#64748b' }}>LenDen</strong></p>
        </div>
              <SocialFooter store={store} slug={slug} accent={accent} />
      </footer>

      {detail    && <ProductDetailPage product={detail} store={store} accent={accent} onAdd={addToCart} onClose={() => setDetail(null)} />}
      {quickView && <QuickAddModal product={quickView} store={store} accent={accent} onAdd={addToCart} onClose={() => setQuickView(null)} onFull={() => { setDetail(quickView); setQuickView(null) }} />}
      <CartDrawer {...{ cart, products: showProds, store, cartCount, cartTotal, cartOpen, setCartOpen, changeQty, removeFromCart, setView, accent }} />
    </div>
  )
}

function TechEmpty({ accent }) {
  return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#475569' }}><ShoppingCart size={48} strokeWidth={1} style={{ marginBottom: '16px', color: accent + '66' }} /><p style={{ fontSize: '15px', color: '#64748b' }}>No products found</p></div>
}

function TechGrid({ products, accent, currency, onAdd, onView, onQuick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
      {products.map(p => <TechCard key={p.id} p={p} accent={accent} currency={currency} onAdd={onAdd} onView={onView} onQuick={onQuick} />)}
    </div>
  )
}

function TechCard({ p, accent, currency, onAdd, onView, onQuick }) {
  const [hovered, setHovered] = useState(false)
  const oos = p.totalStock !== undefined && p.totalStock <= 0
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => onView(p)}
      style={{ background: '#1e293b', border: `1px solid ${hovered ? accent + '55' : '#334155'}`, borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s', transform: hovered ? 'translateY(-2px)' : 'none' }}>
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#0f172a' }}>
        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📱</div>}
        {oos && <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '4px' }}>OUT OF STOCK</span></div>}
        {/* Fake rating */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(15,23,42,0.8)', borderRadius: '4px', padding: '3px 7px' }}>
          <Star size={10} fill="#fbbf24" color="#fbbf24" />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#fbbf24' }}>4.8</span>
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        {p.category && <div style={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{p.category.name}</div>}
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.35, marginBottom: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>{fmt(p.sellingPrice, currency)}</div>
          {!oos && (
            <button onClick={e => { e.stopPropagation(); onAdd(p, 1) }}
              style={{ padding: '7px 14px', background: accent, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
