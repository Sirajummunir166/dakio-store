'use client'
import { useEffect } from 'react'
import { IconBag, IconCheck, IconClose, IconMinus, IconPlus } from './Icons.jsx'
import { useFashionTheme } from '../FashionThemeContext.jsx'

const FREE_SHIPPING_THRESHOLD = 2500

function formatPrice(amount) {
  if (amount == null) return '৳0'
  return `৳${Number(amount).toLocaleString('en-BD')}`
}

export default function CartDrawer() {
  const { contract, navigate } = useFashionTheme()
  const cart = contract.cart

  useEffect(() => {
    if (!cart.isOpen) return undefined
    const onKey = (e) => { if (e.key === 'Escape') cart.close() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [cart.isOpen])

  if (!cart.isOpen) return null

  const subtotal = cart.total
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  const goCheckout = () => {
    cart.close()
    navigate.toCheckout()
  }

  return (
    <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="cart-drawer__backdrop" aria-label="Close cart" onClick={cart.close} />
      <aside className="cart-drawer__panel">
        <header className="cart-drawer__head">
          <h2>Your Cart {cart.count > 0 && <span>({cart.count})</span>}</h2>
          <button type="button" className="icon-btn cart-drawer__close" aria-label="Close" onClick={cart.close}>
            <IconClose />
          </button>
        </header>

        {cart.items.length === 0 ? (
          <div className="cart-drawer__empty">
            <div className="cart-drawer__empty-icon" aria-hidden="true">
              <IconBag size={48} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Add something you love — free delivery over {formatPrice(FREE_SHIPPING_THRESHOLD)}.</p>
            <button type="button" className="btn btn--dark" onClick={cart.close}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <div className="cart-drawer__shipping">
                <div className="cart-drawer__shipping-bar" aria-hidden="true">
                  <span style={{ width: `${freeShippingProgress}%` }} />
                </div>
                <p>
                  Add {formatPrice(amountToFreeShipping)} more for <strong>free delivery</strong>
                </p>
              </div>
            )}
            {subtotal >= FREE_SHIPPING_THRESHOLD && (
              <p className="cart-drawer__shipping cart-drawer__shipping--free">
                <IconCheck size={14} />
                You qualify for free delivery
              </p>
            )}

            <ul className="cart-drawer__list">
              {cart.items.map((item) => (
                <li key={item.key} className="cart-drawer__item">
                  <div className="cart-drawer__thumb">
                    {item.image && <img src={item.image} alt={item.name} />}
                  </div>
                  <div className="cart-drawer__body">
                    <span className="cart-drawer__name">{item.name}</span>
                    {item.variantId && <p className="cart-drawer__meta">Size {item.variantId}</p>}
                    <div className="cart-drawer__row">
                      <div className="cart-drawer__qty">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => cart.updateQty(item.key, item.qty - 1)}
                        >
                          <IconMinus size={14} />
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => cart.updateQty(item.key, item.qty + 1)}
                        >
                          <IconPlus size={14} />
                        </button>
                      </div>
                      <strong>{formatPrice(item.price * item.qty)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-drawer__remove"
                    aria-label="Remove item"
                    onClick={() => cart.removeItem(item.key)}
                  >
                    <IconClose size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="cart-drawer__foot">
              <div className="cart-drawer__totals">
                <div className="cart-drawer__total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="cart-drawer__total-row cart-drawer__total-row--grand">
                  <span>Total</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
              </div>
              <button type="button" className="btn btn--accent cart-drawer__checkout" onClick={goCheckout}>
                Checkout
              </button>
              <p className="cart-drawer__trust">bKash · Nagad · Cash on Delivery</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
