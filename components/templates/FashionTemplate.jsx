'use client'
import { useState } from 'react'
import { ShoppingBag, Search, X, Menu, ChevronRight, Truck, RotateCcw, Star } from 'lucide-react'
import { fmt } from '../../lib/storefront'
import { CartDrawer, QuickAddModal, ProductDetailPage, CheckoutPage, SuccessPage, AnnouncementBar, SocialFooter } from '../StoreOverlays'
import { DEMO } from './demoData'

const SERIF = "'Georgia', 'Times New Roman', serif"
const SANS  = "'Helvetica Neue', Arial, sans-serif"
const D     = DEMO.fashion

export default function FashionTemplate(props) {
  const {
    store, products, categories, activeCat, setActiveCat, searchQ, setSearchQ,
    searchOpen, setSearchOpen, mobileNav, setMobileNav,
    cart, cartOpen, setCartOpen, cartCount, cartTotal, addToCart, changeQty, removeFromCart,
    quickView, setQuickView, detail, setDetail,
    view, setView, form, setForm, formErr, placing, placeOrder, orderNum,
    couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon,
    email, setEmail, subscribed, setSubscribed,
    isFiltered, catSections, uncategorised, slug,
  } = props

  const accent   = store?.accentColor || '#8B5E3C'
  const demoMode = products.length === 0 && !isFiltered
  const showProds = products.length > 0 ? products : D.products
  const heroImg  = products[0]?.imageUrl || D.hero
  const allCats  = categories.length > 0 ? categories : D.products.reduce((acc, p) => {
    if (p.category && !acc.find(c => c.id === p.category.id)) acc.push(p.category); return acc
  }, [])
  const catRows  = demoMode
    ? allCats.map(c => ({ ...c, items: D.products.filter(p => p.category?.id === c.id) }))
    : catSections

  if (view === 'checkout') return <CheckoutPage {...{ cart, products: showProds, store, cartTotal, form, setForm, formErr, placing, placeOrder, setView, accent, couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon }} />
  if (view === 'success')  return <SuccessPage {...{ orderNum, form, setView, setForm, accent }} />

  return (
    <div style={{ fontFamily: SANS, background: '#fffdf9', minHeight: '100vh', color: '#1a1a1a' }}>
      <style>{`
        .fa-mob { display: none !important; } .fa-desk { display: flex !important; }
        @media (max-width: 768px) { .fa-mob { display: flex !important; } .fa-desk { display: none !important; } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <AnnouncementBar message={store?.announcementBar} accent='#1a1a1a' />

      {/* Header */}
      <header style={{ background: '#fffdf9', borderBottom: '1px solid #e8e0d5', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setMobileNav(true)} className="fa-mob" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}><Menu size={22} /></button>
          <nav className="fa-desk" style={{ flex: 1, alignItems: 'center' }}>
            {[{ id: 'all', name: 'New In' }, ...allCats].map(c => (
              <button key={c.id} onClick={() => !demoMode && setActiveCat(c.id)}
                style={{ background: 'none', border: 'none', padding: '8px 16px', fontSize: '12px', fontWeight: activeCat === c.id ? 700 : 400, color: '#1a1a1a', cursor: demoMode ? 'default' : 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: SANS, whiteSpace: 'nowrap', textDecoration: activeCat === c.id ? 'underline' : 'none', textUnderlineOffset: '4px' }}>
                {c.name}
              </button>
            ))}
          </nav>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setActiveCat('all'); setSearchQ('') }}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt={store.name} style={{ height: '36px', objectFit: 'contain' }} />
              : <>
                  <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, letterSpacing: '0.08em', color: '#1a1a1a', lineHeight: 1 }}>{store?.name || 'My Fashion Store'}</div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.3em', color: '#bbb', textTransform: 'uppercase', marginTop: '2px' }}>EST. 2025</div>
                </>
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'flex-end' }}>
            {searchOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a1a1a' }}>
                <input autoFocus type="text" placeholder="Search…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ border: 'none', outline: 'none', padding: '4px 8px', fontSize: '12px', width: '140px', fontFamily: SANS, background: 'transparent', letterSpacing: '0.08em' }} />
                <button onClick={() => { setSearchOpen(false); setSearchQ('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={13} /></button>
              </div>
            ) : <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#1a1a1a' }}><Search size={17} /></button>}
            <button onClick={() => setCartOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#1a1a1a', position: 'relative' }}>
              <ShoppingBag size={17} />
              {cartCount > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', width: '14px', height: '14px', background: accent, borderRadius: '50%', fontSize: '8px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileNav && (
        <>
          <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 198 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#fffdf9', zIndex: 199, overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e0d5', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '16px' }}>{store?.name || 'My Store'}</span>
              <button onClick={() => setMobileNav(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
            </div>
            {[{ id: 'all', name: 'All Products' }, ...allCats].map(c => (
              <button key={c.id} onClick={() => { if (!demoMode) { setActiveCat(c.id); setMobileNav(false) } else setMobileNav(false) }}
                style={{ width: '100%', textAlign: 'left', padding: '15px 24px', background: 'none', border: 'none', borderBottom: '1px solid #f0e8de', fontSize: '13px', fontWeight: 400, color: '#1a1a1a', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: SANS }}>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Hero */}
      {!isFiltered && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(420px, 62vw, 700px)', overflow: 'hidden', background: '#2c2416' }}>
          <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.65 }} onError={e => { e.target.src = D.hero }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,14,8,0.82) 0%, rgba(20,14,8,0.35) 55%, rgba(20,14,8,0.1) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'flex-end', maxWidth: '1280px', margin: '0 auto', padding: '0 52px 80px' }}>
            <div style={{ animation: 'fadeUp 0.8s ease both' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#d4b896', marginBottom: '18px' }}>New Season · 2025</p>
              <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 6vw, 76px)', fontWeight: 700, lineHeight: 1.03, color: '#fff', marginBottom: '20px' }}>
                {D.heroTitle}
              </h1>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.72)', marginBottom: '40px', maxWidth: '380px', lineHeight: 1.75, fontFamily: SERIF, fontStyle: 'italic' }}>
                {store?.description || D.heroSub}
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button onClick={() => document.getElementById('fa-shop')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ padding: '15px 44px', background: '#fff', color: '#1a1a1a', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: SANS }}>
                  Shop Collection
                </button>
                <button style={{ padding: '15px 44px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: SANS }}>
                  Lookbook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {!isFiltered && (
        <div style={{ background: '#1a1a1a', overflowX: 'auto', display: 'flex', whiteSpace: 'nowrap' }}>
          {[{ id: 'all', name: 'All' }, ...allCats].map(c => (
            <button key={c.id} onClick={() => !demoMode && setActiveCat(c.id)}
              style={{ padding: '14px 28px', background: 'none', border: 'none', color: activeCat === c.id ? '#d4b896' : '#666', cursor: demoMode ? 'default' : 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: SANS, borderBottom: activeCat === c.id ? '2px solid #d4b896' : '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Trust Bar */}
      {!isFiltered && (
        <div style={{ background: '#f7f0e6', borderBottom: '1px solid #e8e0d5', padding: '12px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[[Truck, 'Free Delivery on Tk 1,500+'], [RotateCcw, '7-Day Easy Returns'], ['✦', 'Premium Quality Only']].map(([Icon, t]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {typeof Icon === 'string' ? <span style={{ color: accent, fontSize: '14px' }}>{Icon}</span> : <Icon size={14} color={accent} />}
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#5a4a3a', letterSpacing: '0.06em' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <main id="fa-shop" style={{ maxWidth: '1280px', margin: '0 auto', padding: isFiltered ? '40px 24px' : '64px 24px' }}>
        {isFiltered ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #e8e0d5' }}>
              <div>
                <h2 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
                  {searchQ ? `"${searchQ}"` : categories.find(c => c.id === activeCat)?.name}
                </h2>
                <span style={{ fontSize: '12px', color: '#999', letterSpacing: '0.06em' }}>{products.length} pieces</span>
              </div>
              <button onClick={() => { setActiveCat('all'); setSearchQ('') }} style={{ fontSize: '11px', color: '#888', background: 'none', border: '1px solid #ddd', padding: '8px 18px', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: SANS }}>Back</button>
            </div>
            <FashionGrid products={products.length > 0 ? products : D.products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
          </>
        ) : (
          <>
            {catRows.map(cat => (
              <section key={cat.id} style={{ marginBottom: '88px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '36px' }}>
                  <div>
                    <h2 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px' }}>{cat.name}</h2>
                    <div style={{ width: '52px', height: '2px', background: accent }} />
                  </div>
                  {!demoMode && <button onClick={() => setActiveCat(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#666', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: SANS }}>View All <ChevronRight size={12} /></button>}
                </div>
                <FashionGrid products={cat.items.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            ))}
            {!demoMode && uncategorised.length > 0 && (
              <section style={{ marginBottom: '88px' }}>
                <div style={{ marginBottom: '36px' }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px' }}>All Pieces</h2>
                  <div style={{ width: '52px', height: '2px', background: accent }} />
                </div>
                <FashionGrid products={uncategorised.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
            {demoMode && catRows.length === 0 && (
              <section style={{ marginBottom: '88px' }}>
                <div style={{ marginBottom: '36px' }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: '28px', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px' }}>Featured Collection</h2>
                  <div style={{ width: '52px', height: '2px', background: accent }} />
                </div>
                <FashionGrid products={D.products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
          </>
        )}
      </main>

      {/* Newsletter */}
      <div style={{ background: '#1a1a1a', padding: '88px 24px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: accent, marginBottom: '18px' }}>The Edit</p>
          <h3 style={{ fontFamily: SERIF, fontSize: '30px', fontWeight: 700, color: '#fff', marginBottom: '12px', lineHeight: 1.3 }}>Stay ahead of the season</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '36px', lineHeight: 1.85, fontStyle: 'italic', fontFamily: SERIF }}>Exclusive access to new arrivals, private sales, and style inspiration — delivered to your inbox.</p>
          {subscribed ? <p style={{ color: '#d4b896', fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px' }}>Thank you for joining.</p> : (
            <div style={{ display: 'flex', borderBottom: '1px solid #333', maxWidth: '380px', margin: '0 auto' }}>
              <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, padding: '13px 0', border: 'none', fontSize: '13px', outline: 'none', fontFamily: SERIF, background: 'transparent', color: '#fff', fontStyle: 'italic' }} />
              <button onClick={() => email.includes('@') && setSubscribed(true)} style={{ padding: '13px 0 13px 18px', background: 'transparent', color: '#d4b896', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Subscribe</button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#f7f0e6', borderTop: '1px solid #e8e0d5', padding: '52px 32px 28px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '44px' }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px' }}>{store?.name || 'My Store'}</div>
            <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.85, fontFamily: SERIF, fontStyle: 'italic' }}>{store?.description || 'Timeless fashion for every occasion.'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>Explore</div>
            {allCats.map(c => <div key={c.id} style={{ fontSize: '13px', color: '#666', marginBottom: '10px', cursor: 'pointer', fontFamily: SERIF, fontStyle: 'italic' }} onClick={() => !demoMode && setActiveCat(c.id)}>{c.name}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>Help</div>
            {['Sizing Guide', 'Easy Returns', 'Shipping Info', 'Contact Us'].map(l => <div key={l} style={{ fontSize: '13px', color: '#666', marginBottom: '10px', cursor: 'pointer' }}>{l}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '16px' }}>Contact</div>
            {store?.phone && <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>📞 {store.phone}</div>}
            {store?.email && <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>✉️ {store.email}</div>}
            {store?.address && <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>📍 {store.address}</div>}
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '40px auto 0', paddingTop: '20px', borderTop: '1px solid #e0d8ce', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '11px', color: '#bbb', fontFamily: SERIF, fontStyle: 'italic' }}>© {new Date().getFullYear()} {store?.name || 'My Store'}. All rights reserved.</p>
          <p style={{ fontSize: '11px', color: '#bbb' }}>Powered by <strong style={{ color: '#999' }}>LenDen</strong></p>
        </div>
              <SocialFooter store={store} slug={slug} accent={accent} />
      </footer>

      {detail    && <ProductDetailPage product={detail} store={store} accent={accent} onAdd={addToCart} onClose={() => setDetail(null)} />}
      {quickView && <QuickAddModal product={quickView} store={store} accent={accent} onAdd={addToCart} onClose={() => setQuickView(null)} onFull={() => { setDetail(quickView); setQuickView(null) }} />}
      <CartDrawer {...{ cart, products: showProds, store, cartCount, cartTotal, cartOpen, setCartOpen, changeQty, removeFromCart, setView, accent }} />
    </div>
  )
}

function FashionGrid({ products, accent, currency, onAdd, onView, onQuick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '28px 18px' }}>
      {products.map(p => <FashionCard key={p.id} p={p} accent={accent} currency={currency} onAdd={onAdd} onView={onView} onQuick={onQuick} />)}
    </div>
  )
}

function FashionCard({ p, accent, currency, onAdd, onView, onQuick }) {
  const [hovered, setHovered] = useState(false)
  const oos = p.totalStock !== undefined && p.totalStock <= 0
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '133%', overflow: 'hidden', background: '#f0ebe3', marginBottom: '14px' }}>
        <div style={{ position: 'absolute', inset: 0 }} onClick={() => onView(p)}>
          {p.imageUrl
            ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.65s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>👗</div>
          }
        </div>
        {oos && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,253,249,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: '#1a1a1a', color: '#d4b896', fontSize: '10px', fontWeight: 700, padding: '6px 16px', letterSpacing: '0.16em' }}>SOLD OUT</span></div>}
        {!oos && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px', display: 'flex', gap: '8px', background: 'linear-gradient(to top, rgba(26,26,26,0.88) 0%, transparent 100%)', opacity: hovered ? 1 : 0, transition: 'opacity 0.25s' }}>
            <button onClick={e => { e.stopPropagation(); onAdd(p, 1) }} style={{ flex: 1, padding: '11px', background: '#fff', color: '#1a1a1a', border: 'none', fontSize: '10px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>Add to Bag</button>
          </div>
        )}
        {/* New badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#1a1a1a', color: '#d4b896', fontSize: '9px', fontWeight: 700, padding: '4px 10px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>New</div>
      </div>
      <div onClick={() => onView(p)}>
        {p.category && <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '5px' }}>{p.category.name}</div>}
        <div style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: 1.4, marginBottom: '7px', fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: accent, fontFamily: "'Georgia', serif" }}>{fmt(p.sellingPrice, currency)}</div>
          <div style={{ display: 'flex', gap: '1px' }}>{[1,2,3,4,5].map(i => <Star key={i} size={9} fill={i<=4?'#d4b896':'none'} color="#d4b896" />)}</div>
        </div>
      </div>
    </div>
  )
}
