'use client'
import { IconClose } from './Icons.jsx'
import { useFashionTheme } from '../FashionThemeContext.jsx'

export default function CartToast() {
  const { contract } = useFashionTheme()
  const cart = contract.cart

  // toast and dismissToast are optional extensions to the cart contract
  const toast = cart.toast
  const dismissToast = cart.dismissToast

  if (!toast) return null

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <div className="cart-toast__body">
        <strong>{toast.message}</strong>
        {toast.detail && <span>{toast.detail}</span>}
      </div>
      <div className="cart-toast__actions">
        <button type="button" className="cart-toast__link" onClick={cart.open}>
          View Cart
        </button>
        <button type="button" className="cart-toast__close" aria-label="Dismiss" onClick={dismissToast}>
          <IconClose size={16} />
        </button>
      </div>
    </div>
  )
}
