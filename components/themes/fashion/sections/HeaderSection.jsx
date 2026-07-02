'use client'
import { useEffect, useState } from 'react'
import { IconCart, IconClose, IconMenu, IconSearch } from '../components/Icons.jsx'
import { useFashionTheme } from '../FashionThemeContext.jsx'

export default function HeaderSection({ settings }) {
  const { contract, navigate } = useFashionTheme()
  const cart = contract.cart
  const store = contract.store
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const brandName = settings.brandName ?? store.name
  const brandMark = settings.brandMark ?? store.name?.[0] ?? '◆'

  useEffect(() => {
    if (!menuOpen && !searchOpen) return undefined
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [menuOpen, searchOpen])

  const closeAll = () => { setMenuOpen(false); setSearchOpen(false) }

  return (
    <>
      <header className="header header--flagship">
        <div className="container header__inner">
          <button
            type="button"
            className="icon-btn header__menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => { setSearchOpen(false); setMenuOpen(true) }}
          >
            <IconMenu />
          </button>

          <a href={navigate.toHome()} className="logo logo--flagship" onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate.toHome() }}>
            <span className="logo__mark">{brandMark}</span>
            <span className="logo__text">{brandName}</span>
          </a>

          <nav className="nav nav--flagship" aria-label="Main">
            {settings.navLinks?.map((link) => (
              <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}>{link}</a>
            ))}
          </nav>

          <div className="header__actions">
            {settings.showSearch && (
              <button
                type="button"
                className="icon-btn header__search-btn"
                aria-label="Search"
                onClick={() => { setMenuOpen(false); setSearchOpen(true) }}
              >
                <IconSearch />
              </button>
            )}
            <button type="button" className="icon-btn" aria-label="Cart" onClick={cart.open}>
              <IconCart />
              {cart.count > 0 && <span className="badge badge--pulse">{cart.count}</span>}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button type="button" className="mobile-nav__backdrop" aria-label="Close menu" onClick={closeAll} />
          <aside className="mobile-nav__panel">
            <div className="mobile-nav__head">
              <a href="/" className="logo" onClick={(e) => { e.preventDefault(); closeAll(); navigate.toHome() }}>
                <span className="logo__mark">{brandMark}</span>
                <span className="logo__text">{brandName}</span>
              </a>
              <button type="button" className="icon-btn" aria-label="Close menu" onClick={closeAll}>
                <IconClose />
              </button>
            </div>
            <nav className="mobile-nav__links">
              {settings.navLinks?.map((link) => (
                <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} onClick={closeAll}>{link}</a>
              ))}
            </nav>
            <div className="mobile-nav__foot">
              <p>Free delivery on orders over ৳2,500</p>
              <p>bKash · Nagad · Cash on Delivery</p>
            </div>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
          <button type="button" className="search-overlay__backdrop" aria-label="Close search" onClick={closeAll} />
          <div className="search-overlay__panel">
            <div className="search search--overlay">
              <input
                type="search"
                placeholder={settings.searchPlaceholder ?? 'Search products'}
                aria-label="Search products"
                autoFocus
              />
              <IconSearch />
            </div>
            <button type="button" className="icon-btn search-overlay__close" aria-label="Close" onClick={closeAll}>
              <IconClose />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
