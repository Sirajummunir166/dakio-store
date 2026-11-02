// Delivery is charged by district — Dhaka district at the store's inside rate,
// every other district at its outside rate (dakio-api lib/deliveryZone.js, the
// one rule; 60 / 120 when the store set none) — and free once the goods reach
// the store's `freeDeliveryOver`, which the server applies to every order too.
// Checkout and the funnel's quick order form charge through here (RV-SST-05).
import { DHAKA_DISTRICTS } from '../../lib/bd-locations.js';

export function freeDeliveryOver(ctx) {
  const n = Number(ctx && ctx.store && ctx.store.freeDeliveryOver);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** The delivery charge for goods worth `goods` to `district`: 0 until a district is picked. */
export function deliveryCharge(ctx, district, goods) {
  if (!district) return 0;
  const freeOver = freeDeliveryOver(ctx);
  if (freeOver != null && goods >= freeOver) return 0;
  const s = (ctx && ctx.store) || {};
  return DHAKA_DISTRICTS.includes(district)
    ? (s.deliveryInsideDhaka != null ? Number(s.deliveryInsideDhaka) : 60)
    : (s.deliveryOutsideDhaka != null ? Number(s.deliveryOutsideDhaka) : 120);
}
