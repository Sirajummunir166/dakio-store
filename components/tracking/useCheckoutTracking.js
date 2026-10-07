'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useTracking } from './TrackingRoot'
import { cartFingerprint, itemsValue, purchaseFromResponse } from '../../lib/tracking/items'

/**
 * The checkout funnel's events, shared by the basic checkout (CheckoutClient),
 * Studio's CheckoutPage and the funnel quick-order form (Qform):
 *
 *   begin_checkout     once per cart fingerprint per session (same bc_ id on reload)
 *   add_shipping_info  once per bc_ id, `delayMs` after the contact details are
 *                      complete (`contactReady`); calls onShipping(tracking) so
 *                      the caller saves the Incomplete Order (/leads) with the
 *                      same asi_ id — the server sends Meta's twin event
 *   add_payment_info   once per placement attempt (paymentInfo)
 *   purchase           from the order API's 201 body (purchase), guarded by
 *                      dk:{slug}:tx:<orderId> across tabs; nothing on a 202
 *
 * purchaseId() is the pur_ id for this placement — kept across the SMS-code
 * step and across retries until an order succeeds — sent as tracking.event_id.
 * Outside the TrackingRoot provider (the Studio canvas) all of this is silent.
 */
export function useCheckoutTracking({
  items = [],
  value = null,
  ready = true,
  autoBegin = true,
  contactReady = false,
  contactKey = '',
  onShipping = null,
  delayMs = 1500,
} = {}) {
  const tk = useTracking()
  const fp = cartFingerprint(items)
  const live = useRef({})
  live.current = { items, value: value != null ? value : itemsValue(items), fp, onShipping }
  const bcRef = useRef(null)
  const purRef = useRef(null)

  const begin = useCallback(() => {
    const { items: its, value: val, fp: f } = live.current
    if (!tk.enabled || !its.length) return null
    const bc = tk.checkoutEventId(f)
    if (!bc) return null
    bcRef.current = bc
    if (tk.once(`bc:${bc}`, { storage: 'session' })) {
      tk.track('begin_checkout', { ecommerce: { currency: tk.currency, value: val, items: its } }, { eventId: bc })
    }
    return bc
  }, [tk])

  useEffect(() => {
    if (autoBegin && ready && fp) begin()
  }, [autoBegin, ready, fp, begin])

  const shipping = useCallback(() => {
    const { items: its, value: val, onShipping: cb } = live.current
    const bc = bcRef.current || begin()
    if (!bc || !tk.once(`asi:${bc}`, { storage: 'session' })) return false
    const asi = tk.newEventId('asi')
    tk.track('add_shipping_info', { ecommerce: { currency: tk.currency, value: val, items: its } }, { eventId: asi })
    if (cb) {
      try { cb(tk.buildTracking(asi, { checkout_event_id: bc })) } catch { /* the lead is best-effort */ }
    }
    return true
  }, [tk, begin])

  // Debounced: restarts while the shopper is still typing (contactKey changes).
  useEffect(() => {
    if (!contactReady) return undefined
    const t = setTimeout(shipping, delayMs)
    return () => clearTimeout(t)
  }, [contactReady, contactKey, shipping, delayMs])

  const purchaseId = useCallback(() => {
    if (!purRef.current) purRef.current = tk.newEventId('pur')
    return purRef.current
  }, [tk])

  const paymentInfo = useCallback((paymentType = null) => {
    const { items: its, value: val } = live.current
    if (!tk.enabled || !its.length) return
    if (!tk.once(`api:${purchaseId()}`)) return
    tk.track('add_payment_info', {
      ecommerce: { currency: tk.currency, value: val, items: its, ...(paymentType ? { payment_type: paymentType } : {}) },
    })
  }, [tk, purchaseId])

  /** On a 201 only. `value` is the client's subtotal − discount, used if the API is older. */
  const purchase = useCallback((data, { value: fallbackValue = null, paymentType = null } = {}) => {
    if (!data || !(data.orderId || data.orderNumber)) return
    const { items: its, value: val } = live.current
    const ec = purchaseFromResponse(data, {
      items: its, value: fallbackValue != null ? fallbackValue : val, currency: tk.currency, paymentType,
    })
    const eventId = data.eventId || purRef.current || tk.newEventId('pur')
    purRef.current = null
    if (!tk.once(`tx:${data.orderId || data.orderNumber}`, { storage: 'local' })) return
    tk.track('purchase', { ecommerce: ec }, { eventId })
  }, [tk])

  const trackingFor = useCallback((eventId, extra) => tk.buildTracking(eventId, extra), [tk])

  return { begin, shipping, purchaseId, paymentInfo, purchase, trackingFor, checkoutId: () => bcRef.current }
}

// Bangladesh mobile, any common spelling (01XXXXXXXXX, +8801…, 8801…).
export function isValidBDPhone(raw) {
  const p = String(raw || '').replace(/[\s\-(). ]/g, '')
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(p)
}
