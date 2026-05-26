'use client'
import { useState } from 'react'
import { ShoppingBag, Search, X, Menu } from 'lucide-react'
import { fmt } from '../../lib/storefront'
import { CartDrawer, QuickAddModal, ProductDetailPage, CheckoutPage, SuccessPage, AnnouncementBar } from '../StoreOverlays'
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

  const accent = store?.accentColor || '#111'
  const gold   = '#b89a6a'

  const ts       = store?.themeSettings || {}
  const hero     = ts.hero     || {}
  const banner   = ts.banner   || {}
  const sections = ts.sections || {}
  const showTrustBar   = sections.showTrustBar   !== false
  const showBanner     = sections.showBanner     !== false
  const showNewsletter = sections.showNewsletter !== false

  const demoMode = products.length === 0 && !isFiltered
  const allCats  = categories.length > 0 ? categories : D.products.reduce((acc, p) => {
    if (p.category && !acc.find(c => c.id === p.category.id)) acc.push(p.category); return acc
  }, [])
  const allProds = demoMode
    ? D.products
    : isFiltered
      ? products
      : [...(catSections || []).flatMap(s => s.items), ...(uncategorised || [])]

  const heroImg = allProds[0]?.imageUrl || null

  if (view === 'checkout') return <CheckoutPage {...{ cart, products: allProds, store, cartTotal, form, setForm, formErr, placing, placeOrder, setView, accent, couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon }} />
  if (view === 'success')  return <SuccessPage  {...{ orderNum, form, setView, setForm, accent }} />

  return (
    <div style={{ fontFamily: SANS, background: '#fff', color: '#111', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Header */
        .fh { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #e8e8e8; }
        .fh-inner { max-width: 1280px; margin: 0 auto; padding: 0 32px; height: 68px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .fh-logo { font-size: 22px; font-weight: 800; letter-spacing: -.5px; cursor: pointer; color: #111; flex-shrink: 0; }
        .fh-logo span { color: ${gold}; }
        .fh-nav { display: flex; gap: 2px; align-items: center; flex: 1; justify-content: center; }
        .fh-nav-btn { padding: 8px 14px; font-size: 13px; font-weight: 500; color: #444; border-radius: 6px; background: none; border: none; cursor: pointer; font-family: ${SANS}; letter-spacing: .02em; transition: background .15s, color .15s; white-space: nowrap; }
        .fh-nav-btn:hover, .fh-nav-btn.active { background: #f5f5f3; color: #111; }
        .fh-icons { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .fh-icon { width: 40px; height: 40px; border-radius: 8px; border: none; background: none; display: flex; align-items: center; justify-content: center; color: #444; cursor: pointer; position: relative; transition: background .15s; }
        .fh-icon:hover { background: #f5f5f3; }
        .fh-badge { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; border-radius: 50%; background: #111; color: #fff; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .fh-mob { display: none !important; }

        /* Hero */
        .fa-hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 560px; background: #f5f5f3; overflow: hidden; }
        .fa-hero-left { display: flex; flex-direction: column; justify-content: center; padding: 64px 48px 64px 80px; }
        .fa-hero-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${gold}; margin-bottom: 20px; }
        .fa-hero-tag::before { content: ''; width: 24px; height: 2px; background: ${gold}; flex-shrink: 0; }
        .fa-hero-h1 { font-family: ${SERIF}; font-size: clamp(34px, 4vw, 54px); font-weight: 700; line-height: 1.08; letter-spacing: -1.5px; color: #111; margin-bottom: 18px; }
        .fa-hero-h1 em { font-style: italic; font-weight: 400; color: ${gold}; }
        .fa-hero-sub { font-size: 15px; color: #888; line-height: 1.75; max-width: 380px; margin-bottom: 36px; }
        .fa-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .fa-btn-p { padding: 14px 32px; background: #111; color: #fff; border: none; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; border-radius: 4px; cursor: pointer; font-family: ${SANS}; transition: opacity .2s; }
        .fa-btn-p:hover { opacity: .82; }
        .fa-btn-o { padding: 14px 32px; background: transparent; color: #111; border: 1.5px solid #111; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; border-radius: 4px; cursor: pointer; font-family: ${SANS}; transition: background .2s, color .2s; }
        .fa-btn-o:hover { background: #111; color: #fff; }
        .fa-hero-stats { display: flex; gap: 32px; margin-top: 48px; padding-top: 32px; border-top: 1px solid #e8e8e8; }
        .fa-stat-n { font-size: 24px; font-weight: 800; color: #111; }
        .fa-stat-l { font-size: 11px; color: #aaa; letter-spacing: .06em; text-transform: uppercase; margin-top: 2px; }
        .fa-hero-right { position: relative; overflow: hidden; background: linear-gradient(135deg,#e8ddd0,#d4c4b0); min-height: 400px; }
        .fa-hero-right img { width: 100%; height: 100%; object-fit: cover; object-position: center top; transition: transform .6s ease; }
        .fa-hero-right:hover img { transform: scale(1.04); }
        .fa-hero-badge { position: absolute; bottom: 32px; left: 32px; background: #fff; border-radius: 12px; padding: 14px 18px; box-shadow: 0 8px 24px rgba(0,0,0,.14); display: flex; align-items: center; gap: 12px; }
        .fa-badge-img { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #f5f5f3; }
        .fa-badge-name { font-size: 13px; font-weight: 700; color: #111; }
        .fa-badge-price { font-size: 12px; color: ${gold}; font-weight: 600; margin-top: 2px; }

        /* Cat pills */
        .fa-cats { display: flex; gap: 10px; overflow-x: auto; padding: 20px 32px; border-bottom: 1px solid #e8e8e8; scrollbar-width: none; }
        .fa-cats::-webkit-scrollbar { display: none; }
        .fa-pill { flex-shrink: 0; padding: 9px 20px; border: 1.5px solid #e8e8e8; border-radius: 999px; font-size: 13px; font-weight: 600; background: #fff; color: #555; cursor: pointer; font-family: ${SANS}; transition: all .15s; white-space: nowrap; }
        .fa-pill:hover { border-color: #111; color: #111; }
        .fa-pill.active { background: #111; border-color: #111; color: #fff; }

        /* Trust */
        .fa-trust { background: #f5f5f3; border-bottom: 1px solid #e8e8e8; }
        .fa-trust-in { max-width: 1280px; margin: 0 auto; padding: 22px 32px; display: flex; justify-content: center; gap: 56px; flex-wrap: wrap; }
        .fa-trust-item { display: flex; align-items: center; gap: 10px; }
        .fa-trust-icon { width: 38px; height: 38px; border-radius: 10px; background: #fff; border: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .fa-trust-strong { display: block; font-size: 13px; font-weight: 700; color: #111; }
        .fa-trust-span { font-size: 11px; color: #aaa; }

        /* Products */
        .fa-products { max-width: 1280px; margin: 0 auto; padding: 72px 32px; }
        .fa-sec-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; }
        .fa-sec-title { font-family: ${SERIF}; font-size: 28px; font-weight: 700; letter-spacing: -.5px; color: #111; }
        .fa-sec-title span { color: ${gold}; }
        .fa-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 32px 20px; }

        /* Product card */
        .fa-card { cursor: pointer; }
        .fa-card-img { position: relative; width: 100%; padding-bottom: 130%; overflow: hidden; background: #f5f5f3; border-radius: 12px; margin-bottom: 14px; }
        .fa-card-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .55s ease; }
        .fa-card:hover .fa-card-img img { transform: scale(1.07); }
        .fa-card-badge { position: absolute; top: 12px; left: 12px; z-index: 1; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
        .badge-new  { background: #111; color: #fff; }
        .badge-sale { background: #e53e3e; color: #fff; }
        .badge-out  { background: #e5e7eb; color: #666; }
        .fa-card-over { position: absolute; inset: 0; border-radius: 12px; display: flex; align-items: flex-end; padding: 12px; opacity: 0; transition: opacity .25s; }
        .fa-card:hover .fa-card-over { opacity: 1; }
        .fa-overlay-add { flex: 1; padding: 11px; background: #fff; color: #111; border: none; font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; border-radius: 8px; cursor: pointer; font-family: ${SANS}; transition: background .15s, color .15s; }
        .fa-overlay-add:hover { background: #111; color: #fff; }
        .fa-card-cat { font-size: 11px; color: #bbb; font-weight: 500; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 5px; }
        .fa-card-name { font-size: 14px; font-weight: 600; line-height: 1.35; margin-bottom: 8px; color: #111; }
        .fa-card-price { font-size: 15px; font-weight: 800; color: #111; }

        /* Feature banner */
        .fa-banner { display: grid; grid-template-columns: 1fr 1fr; min-height: 360px; background: #111; overflow: hidden; }
        .fa-banner-left { padding: 60px 56px; display: flex; flex-direction: column; justify-content: center; }
        .fa-banner-tag { font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: ${gold}; margin-bottom: 16px; }
        .fa-banner-h2 { font-family: ${SERIF}; font-size: clamp(28px,3vw,44px); font-weight: 700; color: #fff; line-height: 1.1; letter-spacing: -1px; margin-bottom: 16px; }
        .fa-banner-p { font-size: 14px; color: rgba(255,255,255,.5); line-height: 1.7; margin-bottom: 32px; }
        .fa-banner-right { background: #2a2a2a; overflow: hidden; position: relative; min-height: 360px; }
        .fa-banner-right img { width: 100%; height: 100%; object-fit: cover; opacity: .8; }
        .fa-banner-empty { width: 100%; height: 100%; min-height: 360px; background: linear-gradient(135deg,#1a1a1a,#2a2a2a); display: flex; align-items: center; justify-content: center; font-size: 80px; opacity: .12; font-style: normal; }

        /* Newsletter */
        .fa-nl { background: #111; padding: 88px 32px; text-align: center; }
        .fa-nl-inner { max-width: 520px; margin: 0 auto; }
        .fa-nl-tag { font-size: 10px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; color: ${gold}; margin-bottom: 16px; }
        .fa-nl h2 { font-family: ${SERIF}; font-size: clamp(26px,4vw,40px); font-weight: 700; color: #fff; line-height: 1.12; margin-bottom: 12px; letter-spacing: -1px; }
        .fa-nl p { font-size: 14px; color: rgba(255,255,255,.4); margin-bottom: 36px; line-height: 1.7; }
        .fa-nl-form { display: flex; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,.12); max-width: 420px; margin: 0 auto; }
        .fa-nl-input { flex: 1; padding: 14px 18px; background: rgba(255,255,255,.06); border: none; outline: none; color: #fff; font-size: 13px; font-family: ${SANS}; }
        .fa-nl-input::placeholder { color: rgba(255,255,255,.3); }
        .fa-nl-btn { padding: 14px 22px; background: ${gold}; color: #fff; border: none; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; font-family: ${SANS}; white-space: nowrap; }
        .fa-nl-btn:hover { opacity: .9; }

        /* Footer */
        .fa-footer { background: #0a0a0a; color: #fff; padding: 64px 32px 32px; }
        .fa-footer-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .fa-footer-logo { font-size: 20px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 14px; }
        .fa-footer-logo span { color: ${gold}; }
        .fa-footer-desc { font-size: 13px; color: rgba(255,255,255,.35); line-height: 1.75; max-width: 240px; }
        .fa-footer-social { display: flex; gap: 8px; margin-top: 20px; }
        .fa-soc-btn { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,.08); border: none; color: rgba(255,255,255,.5); font-size: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s; font-family: ${SANS}; font-weight: 700; }
        .fa-soc-btn:hover { background: rgba(255,255,255,.16); color: #fff; }
        .fa-footer-col h4 { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.3); margin-bottom: 18px; }
        .fa-footer-link { display: block; font-size: 13px; color: rgba(255,255,255,.6); cursor: pointer; background: none; border: none; text-align: left; font-family: ${SANS}; transition: color .15s; padding: 0; margin-bottom: 10px; }
        .fa-footer-link:hover { color: #fff; }
        .fa-footer-bottom { max-width: 1280px; margin: 0 auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.07); display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: rgba(255,255,255,.22); flex-wrap: wrap; gap: 10px; }
        .fa-pay { padding: 3px 8px; background: rgba(255,255,255,.07); border-radius: 4px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.4); letter-spacing: .06em; }

        /* Filtered header */
        .fa-filter-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e8e8e8; }
        .fa-back-btn { font-size: 11px; color: #888; background: none; border: 1px solid #e0e0e0; padding: 8px 18px; cursor: pointer; letter-spacing: .1em; text-transform: uppercase; font-family: ${SANS}; border-radius: 4px; }
        .fa-back-btn:hover { border-color: #111; color: #111; }

        /* Empty state */
        .fa-empty { text-align: center; padding: 80px 20px; color: #bbb; }

        /* Responsive */
        @media (max-width: 768px) {
          .fh-inner { padding: 0 16px; }
          .fh-nav { display: none !important; }
          .fh-mob { display: flex !important; }
          .fa-hero { grid-template-columns: 1fr; }
          .fa-hero-left { padding: 44px 20px 32px; }
          .fa-hero-right { min-height: 300px; }
          .fa-hero-stats { gap: 20px; }
          .fa-hero-badge { display: none; }
          .fa-cats { padding: 14px 16px; }
          .fa-trust-in { gap: 20px; justify-content: flex-start; padding: 18px 16px; }
          .fa-products { padding: 48px 16px; }
          .fa-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px 12px; }
          .fa-banner { grid-template-columns: 1fr; }
          .fa-banner-left { padding: 44px 28px; }
          .fa-banner-right { min-height: 240px; }
          .fa-nl { padding: 64px 20px; }
          .fa-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; padding: 0; }
          .fa-footer { padding: 48px 20px 28px; }
        }

        @keyframes fa-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fa-anim-1 { animation: fa-up .7s ease both; }
        .fa-anim-2 { animation: fa-up .7s .1s ease both; }
        .fa-anim-3 { animation: fa-up .7s .2s ease both; }
        .fa-anim-4 { animation: fa-up .7s .3s ease both; }
      `}</style>

      {/* Announcement */}
      <AnnouncementBar message={store?.announcementBar} accent='#111' />

      {/* Header */}
      <header className="fh">
        <div className="fh-inner">
          <button className="fh-icon fh-mob" onClick={() => setMobileNav(true)}><Menu size={20} /></button>

          <div className="fh-logo" onClick={() => { setActiveCat('all'); setSearchQ('') }}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt={store?.name} style={{ height: '34px', objectFit: 'contain' }} />
              : <>{(store?.name || 'Fashion').split(' ')[0]}<span>.</span></>
            }
          </div>

          <nav className="fh-nav">
            <button className={`fh-nav-btn ${activeCat === 'all' && !searchQ ? 'active' : ''}`} onClick={() => { setActiveCat('all'); setSearchQ('') }}>New In</button>
            {allCats.map(c => (
              <button key={c.id} className={`fh-nav-btn ${activeCat === c.id ? 'active' : ''}`}
                onClick={() => !demoMode && setActiveCat(c.id)}>{c.name}</button>
            ))}
          </nav>

          <div className="fh-icons">
            {searchOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #111' }}>
                <input autoFocus type="text" placeholder="Search…" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  style={{ border: 'none', outline: 'none', padding: '6px 8px', fontSize: '13px', width: '140px', fontFamily: SANS, background: 'transparent' }} />
                <button onClick={() => { setSearchOpen(false); setSearchQ('') }} className="fh-icon" style={{ width: '30px', height: '30px' }}><X size={13} /></button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="fh-icon"><Search size={17} /></button>
            )}
            <button onClick={() => setCartOpen(true)} className="fh-icon">
              <ShoppingBag size={17} />
              {cartCount > 0 && <span className="fh-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileNav && (
        <>
          <div onClick={() => setMobileNav(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 198 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#fff', zIndex: 199, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="fh-logo" style={{ fontSize: '18px' }}>{(store?.name || 'Fashion').split(' ')[0]}<span>.</span></div>
              <button onClick={() => setMobileNav(false)} className="fh-icon"><X size={18} /></button>
            </div>
            {[{ id: 'all', name: 'All Products' }, ...allCats].map(c => (
              <button key={c.id} onClick={() => { if (!demoMode) setActiveCat(c.id); setMobileNav(false) }}
                style={{ width: '100%', textAlign: 'left', padding: '14px 22px', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: activeCat === c.id ? 700 : 400, color: '#111', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: SANS }}>
                {c.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Hero */}
      {!isFiltered && (
        <section className="fa-hero">
          <div className="fa-hero-left">
            <div className="fa-hero-tag fa-anim-1">New Season 2025</div>
            <h1 className="fa-hero-h1 fa-anim-2">
              {hero.headline || <><>Dress for the<br /></><em>Moment</em><br />You Live In</>}
            </h1>
            <p className="fa-hero-sub fa-anim-3">
              {hero.subtext || store?.description || 'Curated fashion for every story — timeless pieces crafted with intention, designed to move with you.'}
            </p>
            <div className="fa-hero-btns fa-anim-4">
              <button className="fa-btn-p" onClick={() => document.getElementById('fa-shop')?.scrollIntoView({ behavior: 'smooth' })}>
                {hero.btnText || 'Shop Collection'}
              </button>
              <button className="fa-btn-o">Lookbook</button>
            </div>
            <div className="fa-hero-stats fa-anim-4">
              <div><div className="fa-stat-n">4.9★</div><div className="fa-stat-l">Avg Rating</div></div>
              <div><div className="fa-stat-n">{allProds.length > 0 ? `${allProds.length}+` : '500+'}</div><div className="fa-stat-l">Products</div></div>
              <div><div className="fa-stat-n">Fast</div><div className="fa-stat-l">Delivery</div></div>
            </div>
          </div>
          <div className="fa-hero-right">
            {heroImg
              ? <img src={heroImg} alt="" />
              : <div style={{ width: '100%', height: '100%', minHeight: '500px', background: 'linear-gradient(135deg,#e8ddd0,#d4c4b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '120px' }}>👗</div>
            }
            {allProds[0] && (
              <div className="fa-hero-badge">
                <div className="fa-badge-img">
                  {allProds[0].imageUrl
                    ? <img src={allProds[0].imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: '#f5f5f3' }}>👗</div>
                  }
                </div>
                <div>
                  <div className="fa-badge-name">Trending Now</div>
                  <div className="fa-badge-price">{fmt(allProds[0].sellingPrice, store?.currency)}</div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Pills */}
      <div className="fa-cats" id="fa-shop">
        {[{ id: 'all', name: 'All' }, ...allCats].map(c => (
          <button key={c.id} className={`fa-pill ${activeCat === c.id ? 'active' : ''}`}
            onClick={() => !demoMode && setActiveCat(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Trust Bar */}
      {!isFiltered && showTrustBar && (
        <div className="fa-trust">
          <div className="fa-trust-in">
            {[
              { icon: '🚚', title: 'Free Delivery', sub: 'Orders over Tk 1,500' },
              { icon: '🔄', title: '7-Day Returns', sub: 'Hassle-free returns' },
              { icon: '🔒', title: 'Secure Payment', sub: '100% protected' },
              { icon: '💬', title: 'Live Support', sub: 'Mon–Sat 9am–8pm' },
            ].map(item => (
              <div key={item.title} className="fa-trust-item">
                <div className="fa-trust-icon">{item.icon}</div>
                <div>
                  <strong className="fa-trust-strong">{item.title}</strong>
                  <span className="fa-trust-span">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="fa-products">
        {isFiltered ? (
          <div className="fa-filter-head">
            <div>
              <h2 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, marginBottom: '3px' }}>
                {searchQ ? `"${searchQ}"` : categories.find(c => c.id === activeCat)?.name || 'Products'}
              </h2>
              <span style={{ fontSize: '12px', color: '#aaa', letterSpacing: '.06em' }}>{products.length} pieces</span>
            </div>
            <button className="fa-back-btn" onClick={() => { setActiveCat('all'); setSearchQ('') }}>← Back</button>
          </div>
        ) : (
          <div className="fa-sec-head">
            <h2 className="fa-sec-title">New <span>Arrivals</span></h2>
          </div>
        )}
        {allProds.length === 0
          ? <div className="fa-empty"><div style={{ fontSize: '48px', marginBottom: '14px' }}>🔍</div><div style={{ fontSize: '14px' }}>No products found</div></div>
          : <div className="fa-grid">{allProds.map(p => <FashionCard key={p.id} p={p} accent={accent} currency={store?.currency} onAdd={addToCart} onView={setDetail} />)}</div>
        }
      </div>

      {/* Feature Banner */}
      {!isFiltered && showBanner && (
        <div className="fa-banner">
          <div className="fa-banner-left">
            <div className="fa-banner-tag">Limited Collection</div>
            <h2 className="fa-banner-h2">{banner.title || 'New Season Edit'}</h2>
            <p className="fa-banner-p">{banner.desc || 'The pieces that define the season — handpicked for warmth, movement, and effortless style.'}</p>
            <button className="fa-btn-p" style={{ width: 'fit-content' }}
              onClick={() => document.getElementById('fa-shop')?.scrollIntoView({ behavior: 'smooth' })}>
              {banner.btnText || 'Explore Collection'}
            </button>
          </div>
          <div className="fa-banner-right">
            {banner.image
              ? <img src={banner.image} alt="" />
              : <div className="fa-banner-empty">✦</div>
            }
          </div>
        </div>
      )}

      {/* Newsletter */}
      {!isFiltered && showNewsletter && (
        <div className="fa-nl">
          <div className="fa-nl-inner">
            <div className="fa-nl-tag">Join the Club</div>
            <h2>Get 15% off your first order</h2>
            <p>Subscribe for early access to new drops, exclusive deals, and style inspiration.</p>
            {subscribed
              ? <p style={{ color: gold, fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px' }}>Thank you for joining. ✦</p>
              : <div className="fa-nl-form">
                  <input className="fa-nl-input" type="email" placeholder="Enter your email address…" value={email} onChange={e => setEmail(e.target.value)} />
                  <button className="fa-nl-btn" onClick={() => email.includes('@') && setSubscribed(true)}>Subscribe</button>
                </div>
            }
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fa-footer">
        <div className="fa-footer-grid">
          <div>
            <div className="fa-footer-logo">{(store?.name || 'Fashion').split(' ')[0]}<span>.</span></div>
            <p className="fa-footer-desc">{store?.description || 'Curated fashion for the modern wardrobe. Quality pieces, thoughtful design.'}</p>
            <div className="fa-footer-social">
              {store?.facebookUrl  && <button className="fa-soc-btn" onClick={() => window.open(store.facebookUrl)}>f</button>}
              {store?.instagramUrl && <button className="fa-soc-btn" onClick={() => window.open(store.instagramUrl)}>ig</button>}
              {store?.whatsappNumber && <button className="fa-soc-btn" onClick={() => window.open(`https://wa.me/${store.whatsappNumber}`)}>w</button>}
            </div>
          </div>
          <div className="fa-footer-col">
            <h4>Shop</h4>
            <button className="fa-footer-link" onClick={() => { setActiveCat('all'); setSearchQ('') }}>New Arrivals</button>
            {allCats.map(c => <button key={c.id} className="fa-footer-link" onClick={() => !demoMode && setActiveCat(c.id)}>{c.name}</button>)}
          </div>
          <div className="fa-footer-col">
            <h4>Help</h4>
            {['Size Guide', 'Easy Returns', 'Shipping Info', 'Track Order', 'Contact Us'].map(l => <span key={l} className="fa-footer-link">{l}</span>)}
          </div>
          <div className="fa-footer-col">
            <h4>Contact</h4>
            {store?.phone   && <span className="fa-footer-link">📞 {store.phone}</span>}
            {store?.email   && <span className="fa-footer-link">✉️ {store.email}</span>}
            {store?.address && <span className="fa-footer-link">📍 {store.address}</span>}
            {store?.city    && <span className="fa-footer-link">🏙️ {store.city}</span>}
          </div>
        </div>
        <div className="fa-footer-bottom">
          <span>© {new Date().getFullYear()} {store?.name || 'Fashion Store'}. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {['VISA', 'MC', 'BKASH', 'NAGAD'].map(p => <span key={p} className="fa-pay">{p}</span>)}
          </div>
        </div>
      </footer>

      {detail    && <ProductDetailPage product={detail} store={store} accent={accent} onAdd={addToCart} onClose={() => setDetail(null)} />}
      {quickView && <QuickAddModal product={quickView} store={store} accent={accent} onAdd={addToCart} onClose={() => setQuickView(null)} onFull={() => { setDetail(quickView); setQuickView(null) }} />}
      <CartDrawer {...{ cart, products: allProds, store, cartCount, cartTotal, cartOpen, setCartOpen, changeQty, removeFromCart, setView, accent }} />
    </div>
  )
}

function FashionCard({ p, accent, currency, onAdd, onView }) {
  const [hovered, setHovered] = useState(false)
  const oos = p.totalStock !== undefined && p.totalStock <= 0
  return (
    <div className="fa-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onView(p)}>
      <div className="fa-card-img">
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} style={{ transform: hovered ? 'scale(1.07)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', background: '#f5f5f3' }}>👗</div>
        }
        {oos
          ? <span className="fa-card-badge badge-out">Sold Out</span>
          : <span className="fa-card-badge badge-new">New</span>
        }
        {!oos && (
          <div className="fa-card-over" style={{ opacity: hovered ? 1 : 0 }}>
            <button className="fa-overlay-add" onClick={e => { e.stopPropagation(); onAdd(p, 1) }}>Quick Add</button>
          </div>
        )}
      </div>
      {p.category && <div className="fa-card-cat">{p.category.name}</div>}
      <div className="fa-card-name">{p.name}</div>
      <div className="fa-card-price">{fmt(p.sellingPrice, currency)}</div>
    </div>
  )
}
