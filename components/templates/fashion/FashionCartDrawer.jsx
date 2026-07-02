'use client'
import { X, ShoppingBag, Truck, Shield, Lock } from 'lucide-react'
import { fmt } from '../../../lib/storefront'

export default function FashionCartDrawer({
  cart, products, store, cartCount, cartTotal, cartOpen, setCartOpen,
  changeQty, removeFromCart, setView, accent = '#111',
  couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon,
}) {
  if (!cartOpen) return null

  const hasOos = cart.some(item => {
    const prod = products.find(x => x.id === item.productId)
    return prod && prod.totalStock !== undefined && prod.totalStock <= 0
  })

  return (
    <>
      <div className="ft-cart-backdrop" onClick={() => setCartOpen(false)} />
      <aside className="ft-cart-drawer" aria-label="Shopping cart">
        <div className="ft-cart-head">
          <span>Your Bag ({cartCount})</span>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Close"><X size={20} /></button>
        </div>

        {cart.length === 0 ? (
          <div className="ft-cart-empty">
            <ShoppingBag size={40} strokeWidth={1} color="#D1D5DB" />
            <p>Your bag is empty</p>
            <button type="button" className="ft-btn ft-btn-primary" onClick={() => setCartOpen(false)}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className="ft-cart-items">
              {cart.map(item => {
                const prod = products.find(x => x.id === item.productId)
                const itemKey = item.key || item.productId
                const img = item.imageUrl || prod?.imageUrl
                const oos = prod && prod.totalStock !== undefined && prod.totalStock <= 0
                return (
                  <div key={itemKey} className="ft-cart-item">
                    <div className="ft-cart-item-img">
                      {img ? <img src={img} alt="" /> : <ShoppingBag size={20} color="#ccc" />}
                    </div>
                    <div className="ft-cart-item-info">
                      <div className="ft-cart-item-name">{item.name}</div>
                      {oos && <div className="ft-cart-oos">Out of stock</div>}
                      <div className="ft-cart-item-price">{fmt(item.unitPrice, store?.currency)}</div>
                      {!oos && (
                        <div className="ft-cart-qty">
                          <button type="button" onClick={() => changeQty(itemKey, -1)}>−</button>
                          <span>{item.qty}</span>
                          <button type="button" onClick={() => changeQty(itemKey, 1)}>+</button>
                        </div>
                      )}
                    </div>
                    <div className="ft-cart-item-right">
                      <button type="button" className="ft-cart-remove" onClick={() => removeFromCart(itemKey)}><X size={14} /></button>
                      <strong>{fmt(item.qty * item.unitPrice, store?.currency)}</strong>
                    </div>
                  </div>
                )
              })}
            </div>

            {applyCoupon && (
              <div className="ft-cart-coupon">
                {appliedCoupon ? (
                  <div className="ft-cart-coupon-applied">
                    <span>{appliedCoupon.code} applied</span>
                    <button type="button" onClick={removeCoupon}>Remove</button>
                  </div>
                ) : (
                  <>
                    <input value={couponCode || ''} onChange={e => setCouponCode?.(e.target.value.toUpperCase())} placeholder="Discount code" />
                    <button type="button" onClick={() => applyCoupon(couponCode)} disabled={couponLoading}>{couponLoading ? '…' : 'Apply'}</button>
                  </>
                )}
                {couponErr && <p className="ft-cart-err">{couponErr}</p>}
              </div>
            )}

            <div className="ft-cart-trust">
              <span><Truck size={14} /> Delivery calculated at checkout</span>
              <span><Shield size={14} /> Easy returns</span>
              <span><Lock size={14} /> Secure order</span>
            </div>

            <div className="ft-cart-foot">
              <div className="ft-cart-subtotal">
                <span>Subtotal</span>
                <span>{fmt(cartTotal - (couponDiscount || 0), store?.currency)}</span>
              </div>
              {hasOos && <p className="ft-cart-err">Remove out-of-stock items to checkout</p>}
              <button type="button" className="ft-btn ft-btn-primary ft-cart-checkout" disabled={hasOos}
                onClick={() => { if (!hasOos) { setCartOpen(false); setView('checkout') } }}>
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
      <style>{`
        .ft-cart-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 350; }
        .ft-cart-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100vw); background: #fff; z-index: 351; display: flex; flex-direction: column; font-family: Inter, system-ui, sans-serif; }
        .ft-cart-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #E8E6E1; font-weight: 600; font-size: 15px; }
        .ft-cart-head button { background: none; border: none; cursor: pointer; color: #6B7280; }
        .ft-cart-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #9CA3AF; padding: 24px; }
        .ft-cart-items { flex: 1; overflow-y: auto; padding: 16px 20px; }
        .ft-cart-item { display: flex; gap: 12px; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #F3F4F6; }
        .ft-cart-item-img { width: 80px; aspect-ratio: 3/4; background: #F7F6F3; overflow: hidden; flex-shrink: 0; }
        .ft-cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .ft-cart-item-info { flex: 1; min-width: 0; }
        .ft-cart-item-name { font-size: 14px; font-weight: 500; line-height: 1.35; margin-bottom: 4px; }
        .ft-cart-item-price { font-size: 13px; color: #6B7280; margin-bottom: 8px; }
        .ft-cart-oos { font-size: 11px; color: #B42318; font-weight: 600; margin-bottom: 4px; }
        .ft-cart-qty { display: inline-flex; border: 1px solid #E8E6E1; }
        .ft-cart-qty button { width: 32px; height: 32px; border: none; background: #fff; cursor: pointer; }
        .ft-cart-qty span { width: 32px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; border-left: 1px solid #E8E6E1; border-right: 1px solid #E8E6E1; }
        .ft-cart-item-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; }
        .ft-cart-remove { background: none; border: none; cursor: pointer; color: #D1D5DB; }
        .ft-cart-coupon { display: flex; gap: 8px; padding: 0 20px 12px; }
        .ft-cart-coupon input { flex: 1; padding: 10px 12px; border: 1px solid #E8E6E1; font-size: 13px; }
        .ft-cart-coupon button { padding: 10px 14px; background: #111; color: #fff; border: none; font-size: 12px; font-weight: 600; cursor: pointer; }
        .ft-cart-coupon-applied { flex: 1; display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #ECFDF5; font-size: 13px; color: #166534; }
        .ft-cart-coupon-applied button { background: none; border: none; cursor: pointer; font-size: 12px; color: #6B7280; }
        .ft-cart-trust { display: flex; flex-direction: column; gap: 6px; padding: 12px 20px; font-size: 11px; color: #6B7280; border-top: 1px solid #F3F4F6; }
        .ft-cart-trust span { display: flex; align-items: center; gap: 6px; }
        .ft-cart-foot { padding: 16px 20px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid #E8E6E1; }
        .ft-cart-subtotal { display: flex; justify-content: space-between; font-size: 15px; font-weight: 600; margin-bottom: 12px; }
        .ft-cart-checkout { width: 100%; justify-content: center; padding: 16px; }
        .ft-cart-err { font-size: 12px; color: #B42318; margin: 0 0 8px; }
      `}</style>
    </>
  )
}
