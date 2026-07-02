const API = process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api'

async function post(path, data) {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await r.json()
  if (!r.ok) throw new Error(json?.error || 'Request failed')
  return json
}

/**
 * Build the checkout handle object passed into ThemeContract.checkout.
 * Themes call these functions — they never call the API directly.
 *
 * store must be the normalized ThemeContract.store (not raw API object).
 */
export function buildCheckoutBridge(slug, store) {
  function calcShipping(district) {
    const INSIDE_DHAKA_DISTRICTS = ['Dhaka']
    const isInside = INSIDE_DHAKA_DISTRICTS.includes(district)
    return isInside
      ? (store.deliveryInsideDhaka ?? 60)
      : (store.deliveryOutsideDhaka ?? 120)
  }

  async function validateCoupon(code, subtotal) {
    if (!code || !code.trim()) return { ok: false, error: 'Enter a coupon code' }
    try {
      const r = await post('/coupons/validate', { code: code.trim(), slug, subtotal })
      if (r.valid) return { ok: true, discount: r.discount, coupon: r.coupon }
      return { ok: false, error: r.error || 'Invalid coupon' }
    } catch (e) {
      return { ok: false, error: e?.message || 'Invalid coupon' }
    }
  }

  async function placeOrder(payload) {
    return post(`/store/${slug}/orders`, payload)
  }

  return { calcShipping, validateCoupon, placeOrder }
}
