'use client'
import { useState } from 'react'
import { ShoppingBag, Search, X, Menu, Heart, ChevronRight, Sparkles } from 'lucide-react'
import { fmt } from '../../lib/storefront'
import { CartDrawer, QuickAddModal, ProductDetailPage, CheckoutPage, SuccessPage, AnnouncementBar, SocialFooter } from '../StoreOverlays'
import { DEMO } from './demoData'

const FONT = "'Inter', sans-serif"

export default function BeautyTemplate(props) {
  const {
    store, products, categories, activeCat, setActiveCat, searchQ, setSearchQ,
    searchOpen, setSearchOpen, mobileNav, setMobileNav,
    cart, cartOpen, setCartOpen, cartCount, cartTotal, addToCart, changeQty, removeFromCart,
    quickView, setQuickView, detail, setDetail,
    view, setView, form, setForm, formErr, placing, placeOrder, orderNum,
    couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon,
    email, setEmail, subscribed, setSubscribed,
    isFiltered, catSections, uncategorised, heroBg, slug,
  } = props

  const accent = store?.accentColor || '#e11d48'

  const D = DEMO.beauty
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
    <div style={{ fontFamily: FONT, background: '#fff9fb', minHeight: '100vh', color: '#1a1a2e' }}>
      <style>{`
        .bty-mob { display: none !important; } .bty-desk { display: flex !important; }
        @media (max-width:768px) { .bty-mob { display: flex !important; } .bty-desk { display: none !important; } }
        @keyframes shimmer { 0%{opacity:0.7} 50%{opacity:1} 100%{opacity:0.7} }
      `}</style>

      <AnnouncementBar message={store?.announcementBar} accent={accent} />

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #fde4ef', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setMobileNav(true)} className="bty-mob" style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent }}><Menu size={22} /></button>

          {/* Logo */}
          <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => { setActiveCat('all'); setSearchQ('') }}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt={store.name} style={{ height: '36px', objectFit: 'contain' }} />
              : <>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a1a2e', letterSpacing: '0.06em', lineHeight: 1 }}>{store?.name}</div>
                  <div style={{ fontSize: '9px', color: accent, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '2px' }}>Beauty & Skincare</div>
                </>
            }
          </div>

          {/* Center Nav */}
          <nav className="bty-desk" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', alignItems: 'center', gap: '0' }}>
            {[{ id: 'all', name: 'All' }, ...categories.slice(0, 5)].map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setSearchQ('') }}
                style={{ background: 'none', border: 'none', padding: '8px 14px', fontSize: '13px', fontWeight: activeCat === c.id ? 700 : 400, color: activeCat === c.id ? accent : '#666', cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', borderBottom: activeCat === c.id ? `2px solid ${accent}` : '2px solid transparent' }}>
                {c.name}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {searchOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${accent}66`, borderRadius: '20px', overflow: 'hidden', padding: '0 8px' }}>
                <input autoFocus type="text" placeholder="Search beauty…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ border: 'none', outline: 'none', padding: '7px 4px', fontSize: '13px', width: '130px', fontFamily: FONT, background: 'transparent' }} />
                <button onClick={() => { setSearchOpen(false); setSearchQ('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={13} /></button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#888' }}><Search size={18} /></button>
            )}
            <button onClick={() => setCartOpen(true)} style={{ background: accent, border: 'none', borderRadius: '20px', cursor: 'pointer', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
              <ShoppingBag size={15} />
              {cartCount > 0 && <span style={{ background: '#fff', color: accent, borderRadius: '10px', fontSize: '10px', fontWeight: 800, padding: '0 5px', lineHeight: '16px' }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileNav && (
        <>
          <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 198 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#fff9fb', zIndex: 199, overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #fde4ef', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: '16px', color: accent }}>{store?.name}</span>
              <button onClick={() => setMobileNav(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
            </div>
            {[{ id: 'all', name: 'All Products' }, ...categories].map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setMobileNav(false) }}
                style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: activeCat === c.id ? '#fde4ef' : 'none', border: 'none', borderBottom: '1px solid #fef0f5', fontSize: '14px', fontWeight: activeCat === c.id ? 700 : 400, color: activeCat === c.id ? accent : '#1a1a2e', cursor: 'pointer' }}>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Hero */}
      {!isFiltered && (
        <div style={{ position: 'relative', width: '100%', minHeight: 'clamp(380px, 55vw, 620px)', overflow: 'hidden', background: 'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 40%, #fff1f2 100%)' }}>
          <img src={heroImg} alt="" style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.8 }} onError={e => { e.target.src = D.hero }} />
          <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: 'linear-gradient(to right, #fce7f3 0%, transparent 40%)' }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto', padding: '80px 48px', minHeight: 'clamp(380px, 55vw, 620px)', display: 'flex', alignItems: 'center' }}>
            <div style={{ maxWidth: '500px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(225,29,72,0.1)', borderRadius: '20px', padding: '6px 14px', marginBottom: '20px' }}>
                <Sparkles size={12} color={accent} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: accent, letterSpacing: '0.1em' }}>NEW COLLECTION</span>
              </div>
              <h1 style={{ fontSize: 'clamp(30px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.1, color: '#1a1a2e', marginBottom: '16px', letterSpacing: '-0.5px' }}>
                Reveal Your<br />Natural Beauty
              </h1>
              <p style={{ fontSize: '15px', color: '#666', marginBottom: '36px', lineHeight: 1.7, maxWidth: '380px' }}>
                {store?.description || 'Premium beauty products crafted with care. Skin-safe, cruelty-free formulas that work.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => document.getElementById('beauty-shop')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ padding: '14px 32px', background: accent, color: '#fff', border: 'none', borderRadius: '30px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: FONT, boxShadow: `0 8px 24px ${accent}44` }}>
                  Shop Collection
                </button>
                <button style={{ padding: '14px 32px', background: 'transparent', color: accent, border: `1px solid ${accent}66`, borderRadius: '30px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Our Promise
                </button>
              </div>
              {/* Mini badges */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
                {['✓ Cruelty Free', '✓ Skin Safe', '✓ Dermatologist Tested'].map(b => (
                  <span key={b} style={{ fontSize: '11px', fontWeight: 600, color: '#666' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <main id="beauty-shop" style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px' }}>
        {isFiltered ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: `1px solid ${accent}22` }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', marginBottom: '2px' }}>
                  {searchQ ? `"${searchQ}"` : categories.find(c => c.id === activeCat)?.name}
                </h2>
                <span style={{ fontSize: '12px', color: '#999' }}>{products.length} products</span>
              </div>
              <button onClick={() => { setActiveCat('all'); setSearchQ('') }} style={{ fontSize: '12px', color: accent, background: 'none', border: `1px solid ${accent}66`, padding: '7px 16px', cursor: 'pointer', borderRadius: '20px' }}>← Back</button>
            </div>
            {products.length === 0 ? <BeautyEmpty accent={accent} /> : <BeautyGrid products={products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />}
          </>
        ) : (
          <>
            {catRows.map(cat => (
              <section key={cat.id} style={{ marginBottom: '72px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>{cat.name}</h2>
                    <div style={{ width: '48px', height: '3px', background: `linear-gradient(90deg, ${accent}, #f97316)`, borderRadius: '2px' }} />
                  </div>
                  <button onClick={() => !demoMode && setActiveCat(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 700, color: accent, background: 'none', border: 'none', cursor: demoMode ? 'default' : 'pointer' }}>
                    View All <ChevronRight size={12} />
                  </button>
                </div>
                <BeautyGrid products={cat.items.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            ))}
            {!demoMode && uncategorised.length > 0 && (
              <section style={{ marginBottom: '72px' }}>
                <div style={{ marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>All Products</h2>
                  <div style={{ width: '48px', height: '3px', background: `linear-gradient(90deg, ${accent}, #f97316)`, borderRadius: '2px' }} />
                </div>
                <BeautyGrid products={uncategorised.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
            {demoMode && catRows.length === 0 && (
              <section style={{ marginBottom: '72px' }}>
                <div style={{ marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>Featured Products</h2>
                  <div style={{ width: '48px', height: '3px', background: `linear-gradient(90deg, ${accent}, #f97316)`, borderRadius: '2px' }} />
                </div>
                <BeautyGrid products={D.products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} onQuick={setQuickView} />
              </section>
            )}
            {!demoMode && catSections.length === 0 && uncategorised.length === 0 && <BeautyEmpty accent={accent} />}
          </>
        )}
      </main>

      {/* Newsletter */}
      <div style={{ background: '#1a1a2e', padding: '72px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: accent, borderRadius: '50%', opacity: 0.08, filter: 'blur(60px)' }} />
        <div style={{ position: 'relative', maxWidth: '440px', margin: '0 auto' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>💄</div>
          <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>Be the first to know</h3>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '28px', lineHeight: 1.7 }}>Join our beauty community for exclusive deals, tutorials & new product launches.</p>
          {subscribed ? <p style={{ color: accent, fontWeight: 700 }}>✓ You're in the club!</p> : (
            <div style={{ display: 'flex', maxWidth: '360px', margin: '0 auto', border: `1px solid ${accent}44`, borderRadius: '30px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, padding: '12px 16px', border: 'none', fontSize: '13px', outline: 'none', background: 'transparent', color: '#fff' }} />
              <button onClick={() => email.includes('@') && setSubscribed(true)} style={{ padding: '12px 20px', background: accent, color: '#fff', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', borderRadius: '0 30px 30px 0' }}>Join</button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid #fde4ef', padding: '48px 32px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '40px', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#1a1a2e', marginBottom: '8px' }}>{store?.name}</div>
            <div style={{ fontSize: '12px', color: '#999', lineHeight: 1.7 }}>{store?.description || 'Premium beauty products for everyone.'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ccc', marginBottom: '14px' }}>Shop</div>
            {categories.map(c => <div key={c.id} style={{ fontSize: '13px', color: '#666', marginBottom: '8px', cursor: 'pointer' }} onClick={() => setActiveCat(c.id)}>{c.name}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ccc', marginBottom: '14px' }}>Help</div>
            {['Skin Quiz', 'Returns', 'Shipping', 'Contact'].map(l => <div key={l} style={{ fontSize: '13px', color: '#666', marginBottom: '8px', cursor: 'pointer' }}>{l}</div>)}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ccc', marginBottom: '14px' }}>Contact</div>
            {store?.phone && <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{store.phone}</div>}
            {store?.email && <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{store.email}</div>}
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid #fde4ef', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: '#ccc' }}>© {new Date().getFullYear()} {store?.name}</p>
          <p style={{ fontSize: '12px', color: '#ccc' }}>Powered by <strong style={{ color: '#999' }}>LenDen</strong></p>
        </div>
              <SocialFooter store={store} slug={slug} accent={accent} />
      </footer>

      {detail    && <ProductDetailPage product={detail} store={store} accent={accent} onAdd={addToCart} onClose={() => setDetail(null)} />}
      {quickView && <QuickAddModal product={quickView} store={store} accent={accent} onAdd={addToCart} onClose={() => setQuickView(null)} onFull={() => { setDetail(quickView); setQuickView(null) }} />}
      <CartDrawer {...{ cart, products: showProds, store, cartCount, cartTotal, cartOpen, setCartOpen, changeQty, removeFromCart, setView, accent }} />
    </div>
  )
}

function BeautyEmpty({ accent }) {
  return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}><Heart size={40} strokeWidth={1} style={{ marginBottom: '12px', color: accent + '66' }} /><p>No products yet. Coming soon!</p></div>
}

function BeautyGrid({ products, accent, currency, onAdd, onView, onQuick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
      {products.map(p => <BeautyCard key={p.id} p={p} accent={accent} currency={currency} onAdd={onAdd} onView={onView} onQuick={onQuick} />)}
    </div>
  )
}

function BeautyCard({ p, accent, currency, onAdd, onView, onQuick }) {
  const [hovered, setHovered] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const oos = p.totalStock !== undefined && p.totalStock <= 0
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: hovered ? `0 12px 40px ${accent}22` : '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.2s', cursor: 'pointer' }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '110%', overflow: 'hidden', background: '#fdf2f8' }} onClick={() => onView(p)}>
        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} /> : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>💄</div>}
        {oos && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,249,251,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: '#1a1a2e', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '20px' }}>Sold Out</span></div>}
        <button onClick={e => { e.stopPropagation(); setWishlisted(!wishlisted) }} style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Heart size={14} fill={wishlisted ? accent : 'none'} color={wishlisted ? accent : '#ccc'} />
        </button>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        {p.category && <div style={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{p.category.name}</div>}
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.35, marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '15px', fontWeight: 900, color: accent }}>{fmt(p.sellingPrice, currency)}</div>
          {!oos && (
            <button onClick={e => { e.stopPropagation(); onAdd(p, 1) }}
              style={{ padding: '7px 14px', background: `linear-gradient(135deg, ${accent}, #f97316)`, color: '#fff', border: 'none', borderRadius: '20px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
