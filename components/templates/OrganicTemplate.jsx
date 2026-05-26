'use client'
import { useState } from 'react'
import { ShoppingBag, Search, X, Menu, Phone, Plus, ChevronRight } from 'lucide-react'
import { fmt } from '../../lib/storefront'
import { CartDrawer, QuickAddModal, ProductDetailPage, CheckoutPage, SuccessPage } from '../StoreOverlays'
import { DEMO } from './demoData'

const F = "'Inter', 'Noto Sans Bengali', sans-serif"

// Unsplash image IDs per category name (food + fashion fallbacks)
const CAT_IMG_ID = {
  'শাকসবজি': '1540420773420-3366772f4999', Vegetables: '1540420773420-3366772f4999',
  'ফলমূল':   '1610832958506-aa56368176cf', Fruits:     '1610832958506-aa56368176cf',
  'মাছ ও মাংস':'1544551763-77ef2d0cbe89',  'Fish & Meat':'1544551763-77ef2d0cbe89',
  'দুধ ও শস্য':'1563636619-e9143da7973b',  Dairy:      '1563636619-e9143da7973b',
  'মশলা':     '1506617420156-8e4536971650', Spices:     '1506617420156-8e4536971650',
  Accessories:'1523275335684-37898b6baf30',
  Electronics:'1518770660439-4636190af475',
  Fashion:    '1558618666-fcd25c85cd64',
  'Home & Living':'1555041469-a586ea2b097c',
  Shirts:     '1581044777550-4cfa60707c03',
  Pants:      '1506629082955-511b1aa562c8',
  Polo:       '1521572163474-6864f9cf17ab',
  Panjabi:    '1583743814966-8d4f4d5b3e3a',
  Sale:       '1607082348970-1ead9a3b54f4',
  'New In':   '1487222477894-f1c70f2d4f9a',
}

const CAT_EMOJI = {
  'শাকসবজি':'🥦', Vegetables:'🥦',
  'ফলমূল':'🍎',   Fruits:'🍎',
  'মাছ ও মাংস':'🐟',
  'দুধ ও শস্য':'🥛', Dairy:'🥛',
  'মশলা':'🌶️',    Spices:'🌶️',
  Accessories:'⌚', Electronics:'📱', Fashion:'👗',
  'Home & Living':'🏠', Shirts:'👕', Pants:'👖', Polo:'👔', Panjabi:'🧣', Sale:'🏷️',
}

const catImg = (name, w = 120) =>
  `https://images.unsplash.com/photo-${CAT_IMG_ID[name] || '1542838132-92c53300491e'}?w=${w}&q=80&auto=format&fit=crop`

export default function OrganicTemplate(props) {
  const {
    store, products, categories, activeCat, setActiveCat, searchQ, setSearchQ,
    mobileNav, setMobileNav,
    cart, cartOpen, setCartOpen, cartCount, cartTotal, addToCart, changeQty, removeFromCart,
    quickView, setQuickView, detail, setDetail,
    view, setView, form, setForm, formErr, placing, placeOrder, orderNum,
    couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon,
    email, setEmail, subscribed, setSubscribed,
    isFiltered, catSections, uncategorised,
  } = props

  const accent   = store?.accentColor || '#1b8a3c'
  const D        = DEMO.organic
  const demoMode = products.length === 0 && !isFiltered
  const heroImg  = products[0]?.imageUrl || D.hero

  const allCats = categories.length > 0 ? categories : D.products.reduce((a, p) => {
    if (p.category && !a.find(c => c.id === p.category.id)) a.push(p.category); return a
  }, [])

  const catRows = demoMode
    ? allCats.map(c => ({ ...c, items: D.products.filter(p => p.category?.id === c.id) }))
    : catSections

  if (view === 'checkout') return <CheckoutPage {...{ cart, products, store, cartTotal, form, setForm, formErr, placing, placeOrder, setView, accent, couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon }} />
  if (view === 'success')  return <SuccessPage  {...{ orderNum, form, setView, setForm, accent }} />

  return (
    <div style={{ fontFamily: F, background: '#f2f4f2', minHeight: '100vh', color: '#1a1a1a' }}>
      <style>{`
        .sc::-webkit-scrollbar{display:none}.sc{-ms-overflow-style:none;scrollbar-width:none}
        .dk{display:flex!important}.mb{display:none!important}
        @media(max-width:768px){.dk{display:none!important}.mb{display:flex!important}}
        .pc{transition:box-shadow .2s,transform .2s;cursor:pointer}
        .pc:hover{box-shadow:0 8px 24px rgba(27,138,60,.18)!important;transform:translateY(-3px)!important}
        .ab{transition:background .15s,transform .12s}.ab:active{transform:scale(.84)!important}
        .cat-tile:hover .cat-circle{border-color:${1}px!important}
      `}</style>

      {/* Announcement bar */}
      <div style={{ background: accent, color: '#fff', textAlign: 'center', padding: '9px 16px', fontSize: '12px', fontWeight: 600 }}>
        🌿 {D.announce}
      </div>

      {/* ═══ HEADER ═══ */}
      <header style={{ background: '#fff', borderBottom: '1px solid #deeede', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', height: '66px', display: 'flex', alignItems: 'center', gap: '14px' }}>

          {/* Hamburger */}
          <button className="mb" onClick={() => setMobileNav(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '4px', flexShrink: 0 }}>
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div onClick={() => { setActiveCat('all'); setSearchQ('') }}
            style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', flexShrink: 0, userSelect: 'none' }}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt="" style={{ height: '40px', objectFit: 'contain' }} />
              : <>
                  <div style={{ width: '40px', height: '40px', background: accent, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🛒</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: accent, lineHeight: 1.1 }}>{store?.name || 'ঘরের বাজার'}</div>
                    <div style={{ fontSize: '9px', color: '#aaa', fontWeight: 500 }}>Fresh & Organic</div>
                  </div>
                </>
            }
          </div>

          {/* Search bar — large and prominent */}
          <div style={{ flex: 1, maxWidth: '580px', margin: '0 auto', display: 'flex', alignItems: 'center', background: '#f2f5f2', border: `2px solid ${searchQ ? accent : '#d5e8d5'}`, borderRadius: '10px', overflow: 'hidden', transition: 'border-color .2s' }}>
            <Search size={15} color="#999" style={{ margin: '0 10px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="পণ্য খুঁজুন... (যেমন: টমেটো, আলু, দুধ)"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ flex: 1, padding: '11px 6px', border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', fontFamily: F, color: '#1a1a1a' }}
            />
            {searchQ && (
              <button onClick={() => setSearchQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: '#bbb' }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Phone + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            {store?.phone && (
              <div className="dk" style={{ alignItems: 'center', gap: '5px' }}>
                <Phone size={13} color={accent} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: accent }}>{store.phone}</span>
              </div>
            )}
            <button onClick={() => setCartOpen(true)}
              style={{ position: 'relative', background: accent, border: 'none', borderRadius: '10px', cursor: 'pointer', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '7px', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: F }}>
              <ShoppingBag size={17} />
              <span className="dk">কার্ট</span>
              {cartCount > 0 && (
                <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#f97316', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                  {cartCount}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Desktop sub-nav */}
        {!isFiltered && (
          <div className="dk sc" style={{ borderTop: '1px solid #eef4ee', overflowX: 'auto', padding: '0 20px', maxWidth: '1280px', margin: '0 auto', gap: 0, alignItems: 'center' }}>
            {[{ id: 'all', name: 'সব পণ্য' }, ...allCats].map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setSearchQ('') }}
                style={{ background: 'none', border: 'none', borderBottom: activeCat === c.id ? `3px solid ${accent}` : '3px solid transparent', padding: '10px 14px', fontSize: '13px', fontWeight: activeCat === c.id ? 700 : 500, color: activeCat === c.id ? accent : '#555', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: F, transition: 'color .15s' }}>
                <span>{CAT_EMOJI[c.name] || (c.id === 'all' ? '🛒' : '🌿')}</span>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {mobileNav && (
        <>
          <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 198 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#fff', zIndex: 199, overflowY: 'auto' }}>
            <div style={{ background: accent, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>{store?.name || 'ঘরের বাজার'}</span>
              <button onClick={() => setMobileNav(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {[{ id: 'all', name: 'সব পণ্য' }, ...allCats].map(c => (
              <button key={c.id} onClick={() => { setActiveCat(c.id); setMobileNav(false); setSearchQ('') }}
                style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: activeCat === c.id ? accent + '18' : 'none', border: 'none', borderBottom: '1px solid #f5f5f5', fontSize: '14px', fontWeight: activeCat === c.id ? 700 : 400, color: activeCat === c.id ? accent : '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: F }}>
                <span style={{ fontSize: '18px' }}>{CAT_EMOJI[c.name] || (c.id === 'all' ? '🛒' : '🌿')}</span>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ═══ HERO BANNER ═══ */}
      {!isFiltered && (
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#053317 0%,#0c5522 45%,#1b8a3c 100%)' }}>
          {/* Bg image */}
          <img
            src={heroImg}
            alt=""
            style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '52%', objectFit: 'cover', objectPosition: 'center', opacity: .38 }}
            onError={e => { e.target.src = D.hero }}
          />
          {/* Fade overlay */}
          <div style={{ position: 'absolute', right: 0, top: 0, width: '58%', height: '100%', background: 'linear-gradient(to right,#0c5522 0%,transparent 65%)' }} />

          {/* Trust badges */}
          <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '7px', zIndex: 3 }}>
            {['✅ ১০০% অর্গানিক', '🚚 ফ্রি ডেলিভারি', '❄️ তাজা গ্যারান্টি'].map(b => (
              <div key={b} style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{b}</div>
            ))}
          </div>

          {/* Hero content */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto', padding: 'clamp(36px,5vw,68px) 28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f97316', borderRadius: '6px', padding: '5px 12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>🔥 আজকের বিশেষ অফার</span>
            </div>
            <h1 style={{ fontSize: 'clamp(24px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.12, color: '#fff', marginBottom: '12px', letterSpacing: '-.4px' }}>
              তাজা শাকসবজি &amp; ফলমূল<br />
              <span style={{ color: '#7eeaa0' }}>সরাসরি কৃষকের খামার থেকে</span>
            </h1>
            <p style={{ fontSize: 'clamp(12px,1.5vw,14px)', color: 'rgba(255,255,255,.82)', marginBottom: '26px', lineHeight: 1.75, maxWidth: '390px' }}>
              {store?.description || 'প্রতিদিন সকালে তাজা সংগ্রহ করা পণ্য — কোনো কেমিক্যাল নেই। ঘরে বসে অর্ডার করুন।'}
            </p>
            <button
              onClick={() => document.getElementById('gb-shop')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '13px 28px', background: '#fff', color: accent, border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: F }}>
              এখনই কিনুন →
            </button>
          </div>
        </div>
      )}

      {/* ═══ CATEGORY IMAGE TILES — Ghorer Bazar style ═══ */}
      {!isFiltered && allCats.length > 0 && (
        <div style={{ background: '#fff', padding: '20px 0 16px', borderBottom: '1px solid #e8e8e8' }}>
          <div className="sc" style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '0 20px', maxWidth: '1280px', margin: '0 auto' }}>
            {[{ id: 'all', name: 'সব পণ্য', _imgKey: null }, ...allCats].map(c => {
              const active = activeCat === c.id
              const imgId = c._imgKey !== undefined ? null : (CAT_IMG_ID[c.name] || '1542838132-92c53300491e')
              const isAll = c.id === 'all'
              return (
                <button key={c.id} onClick={() => { setActiveCat(c.id); setSearchQ('') }} className="cat-tile"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '78px', padding: '10px 6px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, fontFamily: F }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${active ? accent : '#e0e0e0'}`, transition: 'border-color .2s', background: '#f0f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isAll
                      ? <span style={{ fontSize: '28px' }}>🛒</span>
                      : <img
                          src={`https://images.unsplash.com/photo-${imgId}?w=120&q=80&auto=format&fit=crop`}
                          alt={c.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<span style="font-size:26px">${CAT_EMOJI[c.name] || '🌿'}</span>` }}
                        />
                    }
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: active ? 700 : 500, color: active ? accent : '#555', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                    {c.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ FLASH SALE STRIP ═══ */}
      {!isFiltered && (
        <div className="sc" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: 'linear-gradient(90deg,#e53e3e,#f97316)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,.22)', borderRadius: '7px', padding: '5px 10px', flexShrink: 0 }}>
            <span style={{ fontSize: '13px' }}>⚡</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>ফ্ল্যাশ ডিল</span>
          </div>
          {(demoMode ? D.products : products).filter(p => p.mrp && p.mrp > p.sellingPrice).slice(0, 8).map(p => {
            const pct = Math.round((1 - p.sellingPrice / p.mrp) * 100)
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,.18)', borderRadius: '8px', padding: '5px 12px', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.name}</span>
                <span style={{ background: 'rgba(0,0,0,.2)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{pct}% ছাড়</span>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>৳{p.sellingPrice}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ PRODUCT SECTIONS ═══ */}
      <main id="gb-shop" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 20px 48px' }}>
        {isFiltered ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#1a1a1a', marginBottom: '2px' }}>
                  {searchQ ? `"${searchQ}" এর ফলাফল` : categories.find(c => c.id === activeCat)?.name || 'পণ্যসমূহ'}
                </h2>
                <span style={{ fontSize: '12px', color: '#888' }}>{products.length}টি পণ্য</span>
              </div>
              <button onClick={() => { setActiveCat('all'); setSearchQ('') }}
                style={{ fontSize: '13px', fontWeight: 600, color: accent, background: '#e8f5e9', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', fontFamily: F }}>
                ← ফিরে যান
              </button>
            </div>
            {products.length === 0
              ? <GBEmpty />
              : <GBGrid products={products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} />
            }
          </>
        ) : (
          <>
            {catRows.map(cat => cat.items?.length > 0 && (
              <section key={cat.id} style={{ marginBottom: '40px' }}>
                <GBSectionHeader cat={cat} accent={accent} demoMode={demoMode} onSeeAll={() => !demoMode && setActiveCat(cat.id)} />
                <GBGrid products={cat.items.slice(0, 8)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} />
              </section>
            ))}

            {!demoMode && uncategorised.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <GBSectionHeader cat={{ name: 'সব পণ্য', items: uncategorised }} accent={accent} demoMode onSeeAll={() => {}} />
                <GBGrid products={uncategorised.slice(0, 12)} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} />
              </section>
            )}

            {demoMode && catRows.length === 0 && (
              <section style={{ marginBottom: '40px' }}>
                <GBSectionHeader cat={{ name: 'সেরা পণ্যসমূহ', items: D.products }} accent={accent} demoMode onSeeAll={() => {}} />
                <GBGrid products={D.products} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} />
              </section>
            )}

            {!demoMode && catSections.length === 0 && uncategorised.length === 0 && <GBEmpty />}
          </>
        )}
      </main>

      {/* ═══ WHY US ═══ */}
      {!isFiltered && (
        <div style={{ background: '#fff', padding: '48px 24px', borderTop: '1px solid #deeede' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h3 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 900, color: '#111', marginBottom: '32px' }}>কেন আমাদের থেকে কিনবেন?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '18px' }}>
              {[
                ['🌱', '১০০% অর্গানিক',  'কোনো কেমিক্যাল বা কৃত্রিম সার ছাড়া — প্রাকৃতিক পদ্ধতিতে উৎপাদিত'],
                ['🚚', 'দ্রুত ডেলিভারি', 'সকালে অর্ডার করুন, সেদিনই পৌঁছে যাবে আপনার দরজায়'],
                ['❄️', 'তাজা গ্যারান্টি', 'প্রতিদিন সকালে সংগ্রহ করা পণ্য — সন্তুষ্টি না হলে ফেরত'],
                ['💰', 'সেরা দাম',        'সরাসরি কৃষক থেকে — মধ্যস্থতাকারী নেই, তাই দাম কম'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ textAlign: 'center', padding: '22px 14px', background: '#f6faf6', borderRadius: '14px', border: '1px solid #deeede' }}>
                  <div style={{ fontSize: '34px', marginBottom: '10px' }}>{icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a3a20', marginBottom: '6px' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.65 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ NEWSLETTER ═══ */}
      <div style={{ background: accent, padding: '52px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ fontSize: '34px', marginBottom: '10px' }}>📱</div>
          <h3 style={{ fontSize: '21px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>অফার মিস করবেন না!</h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.85)', marginBottom: '26px', lineHeight: 1.75 }}>
            সাবস্ক্রাইব করুন — প্রতিদিনের বিশেষ ছাড় সবার আগে পান।
          </p>
          {subscribed
            ? <p style={{ color: '#7eeaa0', fontWeight: 700, fontSize: '15px' }}>✓ সাবস্ক্রাইব করা হয়েছে!</p>
            : (
              <div style={{ display: 'flex', maxWidth: '390px', margin: '0 auto', background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
                <input type="email" placeholder="আপনার ইমেইল লিখুন..." value={email} onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '12px 14px', border: 'none', fontSize: '13px', outline: 'none', fontFamily: F }} />
                <button onClick={() => email.includes('@') && setSubscribed(true)}
                  style={{ padding: '12px 18px', background: '#f97316', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: F }}>
                  সাবস্ক্রাইব
                </button>
              </div>
            )
          }
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: '#0a2e14', padding: '44px 24px 20px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '36px', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#7eeaa0', marginBottom: '10px' }}>{store?.name || 'ঘরের বাজার'}</div>
            <div style={{ fontSize: '12px', color: '#6b9e78', lineHeight: 1.85 }}>{store?.description || 'তাজা ও অর্গানিক পণ্যের সেরা গন্তব্য।'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#4a7a56', marginBottom: '12px' }}>বিভাগ</div>
            {allCats.map(c => (
              <div key={c.id} style={{ fontSize: '13px', color: '#6b9e78', marginBottom: '8px', cursor: 'pointer' }} onClick={() => setActiveCat(c.id)}>
                {CAT_EMOJI[c.name] || '🌿'} {c.name}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#4a7a56', marginBottom: '12px' }}>তথ্য</div>
            {['আমাদের সম্পর্কে', 'ডেলিভারি তথ্য', 'রিটার্ন পলিসি', 'যোগাযোগ'].map(l => (
              <div key={l} style={{ fontSize: '13px', color: '#6b9e78', marginBottom: '8px', cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#4a7a56', marginBottom: '12px' }}>যোগাযোগ</div>
            {store?.phone && <div style={{ fontSize: '13px', color: '#6b9e78', marginBottom: '8px' }}>📞 {store.phone}</div>}
            {store?.email && <div style={{ fontSize: '13px', color: '#6b9e78', marginBottom: '8px' }}>✉️ {store.email}</div>}
            <div style={{ fontSize: '13px', color: '#6b9e78' }}>⏰ সকাল ৭টা – রাত ১০টা</div>
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '18px', borderTop: '1px solid #1a4a28', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <p style={{ fontSize: '12px', color: '#4a7a56' }}>© {new Date().getFullYear()} {store?.name}</p>
          <p style={{ fontSize: '12px', color: '#4a7a56' }}>Powered by <strong style={{ color: '#6b9e78' }}>LenDen</strong></p>
        </div>
      </footer>

      {detail    && <ProductDetailPage product={detail} store={store} accent={accent} onAdd={addToCart} onClose={() => setDetail(null)} />}
      {quickView && <QuickAddModal product={quickView} store={store} accent={accent} onAdd={addToCart} onClose={() => setQuickView(null)} onFull={() => { setDetail(quickView); setQuickView(null) }} />}
      <CartDrawer {...{ cart, products: products.length > 0 ? products : D.products, store, cartCount, cartTotal, cartOpen, setCartOpen, changeQty, removeFromCart, setView, accent }} />
    </div>
  )
}

/* ── Sub-components ── */

function GBSectionHeader({ cat, accent, demoMode, onSeeAll }) {
  const CAT_EMOJI_L = { 'শাকসবজি':'🥦', Vegetables:'🥦', 'ফলমূল':'🍎', Fruits:'🍎', 'মাছ ও মাংস':'🐟', 'দুধ ও শস্য':'🥛', Dairy:'🥛', 'মশলা':'🌶️', Spices:'🌶️', Accessories:'⌚', Electronics:'📱', Fashion:'👗', 'Home & Living':'🏠', Shirts:'👕', Pants:'👖', Polo:'👔', Panjabi:'🧣', Sale:'🏷️', 'সব পণ্য':'🛒', 'সেরা পণ্যসমূহ':'⭐' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #deeede' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>{CAT_EMOJI_L[cat.name] || '🌿'}</span>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1a1a1a', marginBottom: '1px' }}>{cat.name}</h2>
          <div style={{ fontSize: '11px', color: '#999' }}>{cat.items?.length || 0}+ পণ্য</div>
        </div>
      </div>
      <button onClick={onSeeAll}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: accent, background: '#e8f5e9', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: demoMode ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif" }}>
        সব দেখুন <ChevronRight size={12} />
      </button>
    </div>
  )
}

function GBEmpty() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
      <div style={{ fontSize: '52px', marginBottom: '16px' }}>🥬</div>
      <p style={{ fontSize: '16px', fontWeight: 600 }}>কোনো পণ্য পাওয়া যায়নি</p>
      <p style={{ fontSize: '13px', marginTop: '8px' }}>শীঘ্রই নতুন পণ্য আসছে!</p>
    </div>
  )
}

function GBGrid({ products, accent, currency, onAdd, onView }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: '13px' }}>
      {products.map(p => <GBCard key={p.id} p={p} accent={accent} currency={currency} onAdd={onAdd} onView={onView} />)}
    </div>
  )
}

function GBCard({ p, accent, currency, onAdd, onView }) {
  const [added, setAdded] = useState(false)
  const oos      = p.totalStock !== undefined && p.totalStock <= 0
  const discount = p.mrp && p.mrp > p.sellingPrice ? Math.round((1 - p.sellingPrice / p.mrp) * 100) : null

  function handleAdd(e) {
    e.stopPropagation()
    if (oos) return
    setAdded(true)
    onAdd(p, 1)
    setTimeout(() => setAdded(false), 900)
  }

  return (
    <div className="pc" onClick={() => onView(p)}
      style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>

      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#f0f7f0' }}>
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px' }}>🥬</div>
        }

        {/* Discount badge */}
        {discount && (
          <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 7px', borderRadius: '5px', lineHeight: 1.3 }}>
            {discount}% ছাড়
          </div>
        )}

        {/* Organic badge */}
        <div style={{ position: 'absolute', top: discount ? '33px' : '8px', left: '8px', background: accent + 'dd', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '5px', lineHeight: 1.3 }}>
          🌱 অর্গানিক
        </div>

        {/* Out of stock */}
        {oos && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '6px' }}>স্টক শেষ</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        {p.unit && <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '3px', fontWeight: 500 }}>{p.unit}</div>}
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.35, marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {p.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: accent, lineHeight: 1 }}>৳{p.sellingPrice}</div>
            {p.mrp && p.mrp > p.sellingPrice && (
              <div style={{ fontSize: '11px', color: '#bbb', textDecoration: 'line-through', marginTop: '1px' }}>৳{p.mrp}</div>
            )}
          </div>
          {!oos && (
            <button className="ab" onClick={handleAdd}
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: added ? '#16a34a' : accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {added
                ? <span style={{ fontSize: '16px', color: '#fff' }}>✓</span>
                : <Plus size={18} color="#fff" strokeWidth={3} />
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
