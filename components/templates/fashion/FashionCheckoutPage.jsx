'use client'
import { fmt } from '../../../lib/storefront'
import { fashionCss } from './tokens'

export default function FashionCheckoutPage({
  cart, products, store, cartTotal, form, setForm, formErr, placing, placeOrder, setView, accent = '#111',
  couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon,
}) {
  const inputStyle = { width: '100%', padding: '14px 16px', border: '1px solid #E8E6E1', borderRadius: 0, fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }

  return (
    <div className="ft-root ft-inline-checkout">
      <style>{fashionCss(accent)}{`
        .ft-inline-checkout { position: fixed; inset: 0; z-index: 400; background: #fff; overflow-y: auto; font-family: Inter, system-ui, sans-serif; }
        .ft-co-layout { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr; min-height: 100vh; }
        .ft-co-head { padding: 16px 20px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #fff; z-index: 10; }
        .ft-co-form { padding: 24px 20px 120px; }
        .ft-co-summary { background: #F7F6F3; padding: 24px 20px; border-top: 1px solid #E8E6E1; }
        .ft-co-title { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #6B7280; margin: 0 0 16px; }
        .ft-co-field { margin-bottom: 14px; }
        .ft-co-field label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #374151; }
        .ft-co-item { display: flex; gap: 12px; margin-bottom: 14px; align-items: center; }
        .ft-co-item img { width: 56px; height: 70px; object-fit: cover; background: #EFEDE8; }
        .ft-co-cod { padding: 16px; border: 1px solid #E8E6E1; background: #fff; margin-bottom: 20px; display: flex; gap: 12px; align-items: flex-start; }
        .ft-co-cod strong { display: block; font-size: 14px; margin-bottom: 2px; }
        .ft-co-cod span { font-size: 12px; color: #6B7280; }
        .ft-co-err { padding: 12px; background: #FEF2F2; color: #B42318; font-size: 13px; margin-bottom: 16px; border: 1px solid #FECACA; }
        .ft-co-submit { width: 100%; padding: 16px; background: ${accent}; color: #fff; border: none; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
        .ft-co-submit:disabled { opacity: .6; cursor: not-allowed; }
        .ft-co-coupon { display: flex; gap: 8px; margin-bottom: 16px; }
        .ft-co-coupon input { flex: 1; padding: 12px; border: 1px solid #E8E6E1; }
        .ft-co-coupon button { padding: 12px 16px; background: #111; color: #fff; border: none; font-size: 12px; font-weight: 600; cursor: pointer; }
        @media (min-width: 900px) {
          .ft-co-layout { grid-template-columns: 1fr 420px; }
          .ft-co-summary { border-top: none; border-left: 1px solid #E8E6E1; position: sticky; top: 57px; height: calc(100vh - 57px); overflow-y: auto; }
          .ft-co-form { padding: 40px 48px 80px; }
        }
      `}</style>

      <div className="ft-co-layout">
        <div>
          <div className="ft-co-head">
            <button type="button" onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6B7280' }}>← Back</button>
            <strong>{store?.name}</strong>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Secure</span>
          </div>
          <div className="ft-co-form">
            <h2 className="ft-co-title">Contact</h2>
            <div className="ft-co-field">
              <label>Full name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div className="ft-co-field">
              <label>Phone *</label>
              <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
            </div>
            <h2 className="ft-co-title" style={{ marginTop: 28 }}>Delivery</h2>
            <div className="ft-co-field">
              <label>Address</label>
              <input style={inputStyle} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="House, road, area" />
            </div>
            <div className="ft-co-field">
              <label>City</label>
              <input style={inputStyle} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Dhaka" />
            </div>
            <div className="ft-co-field">
              <label>Order note</label>
              <input style={inputStyle} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Optional instructions" />
            </div>
            <h2 className="ft-co-title" style={{ marginTop: 28 }}>Payment</h2>
            <div className="ft-co-cod">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, marginTop: 6, flexShrink: 0 }} />
              <div>
                <strong>Cash on Delivery</strong>
                <span>Pay when your order arrives at your door</span>
              </div>
            </div>
            {formErr && <div className="ft-co-err">{formErr}</div>}
            <button type="button" className="ft-co-submit" onClick={placeOrder} disabled={placing}>
              {placing ? 'Placing order…' : 'Complete order'}
            </button>
          </div>
        </div>

        <div className="ft-co-summary">
          <h2 className="ft-co-title">Order summary</h2>
          {cart.map(item => {
            const prod = products.find(x => x.id === item.productId)
            const img = item.imageUrl || prod?.imageUrl
            return (
              <div key={item.key || item.productId} className="ft-co-item">
                {img && <img src={img} alt="" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>Qty {item.qty}</div>
                </div>
                <div style={{ fontWeight: 600 }}>{fmt(item.qty * item.unitPrice, store?.currency)}</div>
              </div>
            )
          })}
          {applyCoupon && !appliedCoupon && (
            <div className="ft-co-coupon">
              <input value={couponCode || ''} onChange={e => setCouponCode?.(e.target.value.toUpperCase())} placeholder="Discount code" />
              <button type="button" onClick={() => applyCoupon(couponCode)} disabled={couponLoading}>Apply</button>
            </div>
          )}
          {appliedCoupon && <p style={{ fontSize: 13, color: '#166534', marginBottom: 12 }}>{appliedCoupon.code} applied</p>}
          {couponErr && <p style={{ fontSize: 12, color: '#B42318' }}>{couponErr}</p>}
          <div style={{ borderTop: '1px solid #E8E6E1', paddingTop: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span>Subtotal</span><span>{fmt(cartTotal, store?.currency)}</span>
            </div>
            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#166534' }}>
                <span>Discount</span><span>−{fmt(couponDiscount, store?.currency)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, paddingTop: 12, borderTop: '1px solid #D1D5DB' }}>
              <span>Total</span>
              <span>{fmt(cartTotal - (couponDiscount || 0), store?.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FashionSuccessPage({ orderNum, form, setView, setForm, accent = '#111' }) {
  return (
    <div className="ft-root" style={{ position: 'fixed', inset: 0, zIndex: 400, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
        <p style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>Order confirmed</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 500, margin: '0 0 8px' }}>Thank you, {form.name?.split(' ')[0]}</h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, marginBottom: 28 }}>
          Order <strong style={{ color: '#111' }}>{orderNum}</strong> received. We&apos;ll call <strong style={{ color: '#111' }}>{form.phone}</strong> to confirm delivery.
        </p>
        <button type="button" className="ft-btn ft-btn-primary" style={{ background: accent, padding: '14px 32px' }}
          onClick={() => { setView('home'); setForm({ name: '', phone: '', address: '', city: '', note: '' }) }}>
          Continue shopping
        </button>
      </div>
    </div>
  )
}
