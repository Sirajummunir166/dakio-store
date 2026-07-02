'use client'
import { Search, ShoppingBag, Heart, Menu, X, User } from 'lucide-react'

export default function FashionHeader({
  store, config, categories, activeCat, setActiveCat, setSearchQ, searchQ,
  cartCount, wishCount, cartOpen, setCartOpen, mobileNav, setMobileNav,
  searchOpen, setSearchOpen, onHome,
}) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileNav(false)
  }

  return (
    <>
      <header className="ft-header">
        <div className="ft-header-inner">
          <button type="button" className="ft-icon-btn" style={{ display: 'flex' }} onClick={() => setMobileNav(true)} aria-label="Menu">
            <Menu size={20} className="ft-nav-mobile" />
          </button>

          <div className="ft-logo" onClick={onHome} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onHome()}>
            {store?.logoUrl
              ? <img src={store.logoUrl} alt={store.name} style={{ height: 28, objectFit: 'contain' }} />
              : store?.name || 'Store'}
          </div>

          <nav className="ft-nav" aria-label="Categories">
            <button type="button" className={`ft-nav-link ${activeCat === 'all' ? 'active' : ''}`} onClick={() => { setActiveCat('all'); setSearchQ('') }}>New In</button>
            {categories.slice(0, 5).map(c => (
              <button key={c.id} type="button" className={`ft-nav-link ${activeCat === c.id ? 'active' : ''}`} onClick={() => { setActiveCat(c.id); setSearchQ('') }}>{c.name}</button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button type="button" className="ft-icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={18} /></button>
            <button type="button" className="ft-icon-btn" aria-label="Wishlist">
              <Heart size={18} />
              {wishCount > 0 && <span className="ft-badge">{wishCount}</span>}
            </button>
            <button type="button" className="ft-icon-btn" aria-label="Account"><User size={18} /></button>
            <button type="button" className="ft-icon-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="ft-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="ft-search-overlay">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input
              autoFocus
              type="search"
              placeholder="Search products…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ flex: 1, border: 'none', borderBottom: `2px solid #111`, outline: 'none', fontSize: 18, padding: '12px 0', fontFamily: 'inherit' }}
            />
            <button type="button" className="ft-icon-btn" onClick={() => { setSearchOpen(false); setSearchQ('') }}><X size={22} /></button>
          </div>
        </div>
      )}

      {mobileNav && (
        <>
          <div className="ft-drawer-backdrop" onClick={() => setMobileNav(false)} />
          <div className="ft-drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <strong style={{ fontSize: 16 }}>Menu</strong>
              <button type="button" className="ft-icon-btn" onClick={() => setMobileNav(false)}><X size={20} /></button>
            </div>
            <button type="button" className="ft-link" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', border: 'none', background: 'none', fontSize: 15, cursor: 'pointer', borderBottom: '1px solid #E8E6E1' }} onClick={() => { setActiveCat('all'); setSearchQ(''); setMobileNav(false) }}>New In</button>
            {categories.map(c => (
              <button key={c.id} type="button" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', border: 'none', background: 'none', fontSize: 15, cursor: 'pointer', borderBottom: '1px solid #E8E6E1' }} onClick={() => { setActiveCat(c.id); setSearchQ(''); setMobileNav(false) }}>{c.name}</button>
            ))}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {config?.sections?.order?.filter(id => !['newArrivals', 'bestSellers'].includes(id)).map(id => (
                <button key={id} type="button" style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#6B7280', cursor: 'pointer', padding: '8px 0' }} onClick={() => scrollTo(id)}>{id.replace(/([A-Z])/g, ' $1')}</button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`.ft-nav-mobile { display: flex; } @media (min-width: 768px) { .ft-nav-mobile { display: none !important; } }`}</style>
    </>
  )
}
