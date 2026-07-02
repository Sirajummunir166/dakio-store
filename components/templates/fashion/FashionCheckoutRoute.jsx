'use client'
import { DISTRICTS, getThanas } from '../../../lib/bd-locations'
import { storeHome } from '../../../lib/routes'
import { fmt } from '../../../lib/storefront'
import { fashionCss } from './tokens'
import TrackingScripts from '../../TrackingScripts'

export default function FashionCheckoutRoute(props) {
  const {
    store, slug, accent, router,
    cart, cartReady, form, setForm,
    district, setDistrict, thana, setThana, autoDetected, setAutoDetected,
    formErr, placing, placeOrder, orderNum,
    couponCode, setCouponCode, couponDiscount, couponErr, appliedCoupon, couponLoading, applyCoupon, removeCoupon,
    otpStep, otpInput, setOtpInput, otpErr, setOtpErr, otpVerifying, verifyOtp, otpMaskedPhone, otpExpiresAt, setOtpStep,
    cartTotal, cartCount, shippingCharge, orderTotal, isInsideDhaka, handleAddressBlur,
    summaryOpen, setSummaryOpen,
  } = props

  const inputStyle = { width: '100%', padding: '14px 16px', border: '1px solid #E8E6E1', borderRadius: 0, fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }
  const selectStyle = { ...inputStyle, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', paddingRight: 36, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }

  const coCss = `
    .ft-route-checkout { min-height: 100dvh; background: #fff; font-family: Inter, system-ui, sans-serif; }
    .ft-co-layout { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr; min-height: 100dvh; }
    .ft-co-head { padding: 16px 20px; border-bottom: 1px solid #E8E6E1; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #fff; z-index: 10; }
    .ft-co-form { padding: 24px 20px 120px; max-width: 520px; margin: 0 auto; width: 100%; }
    .ft-co-summary { background: #F7F6F3; padding: 24px 20px; border-top: 1px solid #E8E6E1; }
    .ft-co-title { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #6B7280; margin: 0 0 16px; }
    .ft-co-field { margin-bottom: 14px; }
    .ft-co-field label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #374151; }
    .ft-co-field label span.req { color: #B42318; margin-left: 2px; }
    .ft-co-item { display: flex; gap: 12px; margin-bottom: 14px; align-items: center; }
    .ft-co-item img { width: 56px; height: 70px; object-fit: cover; background: #EFEDE8; }
    .ft-co-cod { padding: 16px; border: 1px solid ${accent}; background: ${accent}08; margin-bottom: 20px; display: flex; gap: 12px; align-items: flex-start; }
    .ft-co-cod strong { display: block; font-size: 14px; margin-bottom: 2px; }
    .ft-co-cod span { font-size: 12px; color: #6B7280; }
    .ft-co-err { padding: 12px; background: #FEF2F2; color: #B42318; font-size: 13px; margin-bottom: 16px; border: 1px solid #FECACA; }
    .ft-co-submit { width: 100%; padding: 16px; background: ${accent}; color: #fff; border: none; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
    .ft-co-submit:disabled { opacity: .6; cursor: not-allowed; }
    .ft-co-coupon { display: flex; gap: 8px; margin-bottom: 16px; }
    .ft-co-coupon input { flex: 1; padding: 12px; border: 1px solid #E8E6E1; font-size: 13px; }
    .ft-co-coupon button { padding: 12px 16px; background: #111; color: #fff; border: none; font-size: 12px; font-weight: 600; cursor: pointer; }
    .ft-co-ship { padding: 12px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; font-size: 13px; border: 1px solid #E8E6E1; background: #fff; }
    .ft-co-mobile-sum { display: none; border-bottom: 1px solid #E8E6E1; }
    .ft-co-mobile-sum button { width: 100%; padding: 14px 20px; background: #F7F6F3; border: none; cursor: pointer; display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }
    .ft-co-mobile-sum-panel { background: #F7F6F3; padding: 16px 20px; border-bottom: 1px solid #E8E6E1; }
    .ft-co-district-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ft-co-auto { font-size: 12px; color: #166534; margin-bottom: 12px; }
    @media (min-width: 900px) {
      .ft-co-layout { grid-template-columns: 1fr 420px; }
      .ft-co-summary { border-top: none; border-left: 1px solid #E8E6E1; position: sticky; top: 57px; height: calc(100vh - 57px); overflow-y: auto; padding: 40px; }
      .ft-co-form { padding: 40px 48px 80px; margin: 0; max-width: none; }
      .ft-co-mobile-sum { display: none !important; }
    }
    @media (max-width: 899px) {
      .ft-co-desktop-sum { display: none !important; }
      .ft-co-mobile-sum { display: block; }
    }
  `

  function SummaryPanel() {
    return (
      <>
        <h2 className="ft-co-title">Order summary</h2>
        {cart.map(item => (
          <div key={item.key || item.productId} className="ft-co-item">
            {item.imageUrl && <img src={item.imageUrl} alt="" />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Qty {item.qty}</div>
            </div>
            <div style={{ fontWeight: 600 }}>{fmt(item.qty * item.unitPrice, store?.currency)}</div>
          </div>
        ))}
        {!appliedCoupon ? (
          <div className="ft-co-coupon">
            <input value={couponCode || ''} onChange={e => setCouponCode?.(e.target.value.toUpperCase())} placeholder="Discount code" onKeyDown={e => e.key === 'Enter' && applyCoupon(couponCode)} />
            <button type="button" onClick={() => applyCoupon(couponCode)} disabled={couponLoading || !couponCode?.trim()}>{couponLoading ? '…' : 'Apply'}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#ECFDF5', fontSize: 13, color: '#166534', marginBottom: 12 }}>
            <span>{appliedCoupon.code} applied</span>
            <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>Remove</button>
          </div>
        )}
        {couponErr && <p style={{ fontSize: 12, color: '#B42318', marginBottom: 12 }}>{couponErr}</p>}
        <div style={{ borderTop: '1px solid #E8E6E1', paddingTop: 16, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
            <span>Subtotal · {cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
            <span>{fmt(cartTotal, store?.currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#6B7280' }}>
            <span>Shipping{district ? ` (${district})` : ''}</span>
            <span>{district ? fmt(shippingCharge, store?.currency) : 'Select district'}</span>
          </div>
          {couponDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#166534' }}>
              <span>Discount</span><span>−{fmt(couponDiscount, store?.currency)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, paddingTop: 12, borderTop: '1px solid #D1D5DB' }}>
            <span>Total</span>
            <span>{fmt(orderTotal, store?.currency)}</span>
          </div>
        </div>
      </>
    )
  }

  if (otpStep) {
    const minutesLeft = otpExpiresAt ? Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 60000)) : 5
    return (
      <div className="ft-root ft-route-checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <style>{fashionCss(accent)}{coCss}</style>
        <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>🔒</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 28, fontWeight: 500, margin: '0 0 8px' }}>Verify your number</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>We sent a 6-digit code to <strong>{otpMaskedPhone}</strong></p>
          <input type="tel" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={otpInput}
            onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{ ...inputStyle, fontSize: 22, letterSpacing: 8, textAlign: 'center', marginBottom: 8, borderColor: otpErr ? '#B42318' : '#E8E6E1' }} />
          {otpErr && <p style={{ fontSize: 13, color: '#B42318', marginBottom: 12 }}>{otpErr}</p>}
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>Code expires in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}</p>
          <button type="button" className="ft-co-submit" onClick={verifyOtp} disabled={otpVerifying || otpInput.length !== 6}>
            {otpVerifying ? 'Verifying…' : 'Confirm order'}
          </button>
          <button type="button" onClick={() => { setOtpStep(false); setOtpInput(''); setOtpErr('') }}
            style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', fontSize: 13, color: '#6B7280', cursor: 'pointer' }}>
            Back to checkout
          </button>
        </div>
      </div>
    )
  }

  if (orderNum) {
    return (
      <div className="ft-root ft-route-checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <style>{fashionCss(accent)}</style>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
          <p style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>Order confirmed</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 500, margin: '0 0 8px' }}>Thank you, {form.name?.split(' ')[0]}</h2>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, marginBottom: 28 }}>
            Order <strong style={{ color: '#111' }}>{orderNum}</strong> received. We&apos;ll call <strong style={{ color: '#111' }}>{form.phone}</strong> to confirm delivery.
          </p>
          <button type="button" className="ft-btn ft-btn-primary" style={{ background: accent, padding: '14px 32px' }} onClick={() => router.push(storeHome(slug))}>
            Continue shopping
          </button>
        </div>
      </div>
    )
  }

  if (cartReady && cart.length === 0) {
    return (
      <div className="ft-root ft-route-checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <style>{fashionCss(accent)}</style>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 20 }}>Your bag is empty.</p>
          <button type="button" className="ft-btn ft-btn-primary" style={{ background: accent, padding: '14px 28px' }} onClick={() => router.push(storeHome(slug))}>
            Back to store
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ft-root ft-route-checkout">
      <TrackingScripts store={store} />
      <style>{fashionCss(accent)}{coCss}</style>

      <div className="ft-co-mobile-sum">
        <button type="button" onClick={() => setSummaryOpen(o => !o)}>
          <span>Order summary ({cartCount})</span>
          <span>{fmt(orderTotal, store?.currency)}</span>
        </button>
        {summaryOpen && <div className="ft-co-mobile-sum-panel"><SummaryPanel /></div>}
      </div>

      <div className="ft-co-layout">
        <div>
          <div className="ft-co-head">
            <button type="button" onClick={() => router.push(storeHome(slug))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6B7280' }}>← Back</button>
            <strong>{store?.name}</strong>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Secure</span>
          </div>
          <div className="ft-co-form">
            <h2 className="ft-co-title">Contact</h2>
            <div className="ft-co-field">
              <label>Full name <span className="req">*</span></label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div className="ft-co-field">
              <label>Phone <span className="req">*</span></label>
              <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
            </div>

            <h2 className="ft-co-title" style={{ marginTop: 28 }}>Delivery</h2>
            <div className="ft-co-field">
              <label>Full address</label>
              <textarea style={{ ...inputStyle, resize: 'none', minHeight: 72, lineHeight: 1.5 }} value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                onBlur={e => handleAddressBlur(e.target.value)} placeholder="House, road, area" rows={2} />
            </div>
            <div className="ft-co-district-grid">
              <div className="ft-co-field">
                <label>District <span className="req">*</span></label>
                <select style={selectStyle} value={district} onChange={e => { setDistrict(e.target.value); setThana(''); setAutoDetected(false) }}>
                  <option value="">Select district</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="ft-co-field">
                <label>Thana / Upazila <span className="req">*</span></label>
                <select style={{ ...selectStyle, opacity: district ? 1 : 0.5 }} value={thana} disabled={!district} onChange={e => setThana(e.target.value)}>
                  <option value="">Select thana</option>
                  {getThanas(district).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {autoDetected && district && <p className="ft-co-auto">✓ Auto-detected from address</p>}
            {district && (
              <div className="ft-co-ship">
                <span>{isInsideDhaka ? 'Inside Dhaka delivery' : 'Outside Dhaka delivery'}</span>
                <strong>{fmt(shippingCharge, store?.currency)}</strong>
              </div>
            )}
            <div className="ft-co-field">
              <label>Order note <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span></label>
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
              {placing ? 'Placing order…' : `Complete order · ${fmt(orderTotal, store?.currency)}`}
            </button>
          </div>
        </div>

        <div className="ft-co-summary ft-co-desktop-sum">
          <SummaryPanel />
        </div>
      </div>
    </div>
  )
}