'use client'
import { useCart } from '../compat/useCart.js'
import { useProductStore } from '../compat/useProductStore.js'
import { getCartLine } from '../compat/lib-cart.js'
import { IconBagAddPlus, IconCheck } from './Icons.jsx'

export default function ProductPurchaseActions({ product, size, qty, compact = false }) {
  const { addItem, buyNow, closeCart, items, openCart } = useCart()
  const { openCheckout } = useProductStore()
  const cartLine = getCartLine(items, product.id, size)
  const inCart = Boolean(cartLine)

  const handleAdd = () => {
    if (inCart) {
      openCart()
      return
    }
    addItem(product, { size, qty })
  }

  const handleBuyNow = () => {
    buyNow(product, { size, qty })
    closeCart()
    openCheckout()
  }

  const className = compact ? 'product-purchase product-purchase--compact' : 'product-purchase'

  return (
    <div className={className}>
      <button
        type="button"
        className={`btn btn--purchase product-purchase__cart${inCart ? ' is-in-cart' : ''}`}
        onClick={handleAdd}
      >
        {inCart ? (
          <>
            <IconCheck size={16} />
            View cart{cartLine.qty > 1 ? ` (${cartLine.qty})` : ''}
          </>
        ) : (
          <>
            <IconBagAddPlus size={compact ? 14 : 16} />
            Add to cart
          </>
        )}
      </button>
      <button type="button" className="btn btn--purchase product-purchase__buy" onClick={handleBuyNow}>
        Buy now
      </button>
      {inCart && (
        <p className="product-purchase__status">
          <IconCheck size={14} />
          Size {size} is in your cart
          {cartLine.qty > 1 ? ` · Qty ${cartLine.qty}` : ''}
        </p>
      )}
    </div>
  )
}
