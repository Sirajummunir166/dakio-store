/**
 * Normalize a raw Dakio store API object into the ThemeContract.store shape.
 * Theme packages read only from this normalized shape — never from raw API.
 */
export function normalizeStore(raw) {
  if (!raw) return null

  return {
    id: raw.id || '',
    name: raw.name || '',
    slug: raw.slug || '',
    description: raw.description || null,

    logoUrl: raw.logoUrl || null,
    faviconUrl: raw.faviconUrl || null,

    accentColor: raw.accentColor || '#111111',
    currency: raw.currency || 'BDT',

    announcementBar: raw.announcementBar || null,

    phone: raw.phone || null,
    email: raw.email || null,
    address: raw.address || null,
    city: raw.city || null,

    whatsappNumber: raw.whatsappNumber || null,
    facebookUrl: raw.facebookUrl || null,
    instagramUrl: raw.instagramUrl || null,

    // `?? 60`, not `|| 60`: a store that delivers free (0) must show free.
    deliveryInsideDhaka: raw.deliveryInsideDhaka != null && Number.isFinite(Number(raw.deliveryInsideDhaka)) ? Number(raw.deliveryInsideDhaka) : 60,
    deliveryOutsideDhaka: raw.deliveryOutsideDhaka != null && Number.isFinite(Number(raw.deliveryOutsideDhaka)) ? Number(raw.deliveryOutsideDhaka) : 120,

    // Goods at or above this ship free (null = off) — the server's rule too.
    freeDeliveryOver: Number(raw.freeDeliveryOver) > 0 ? Number(raw.freeDeliveryOver) : null,

    storeTemplate: raw.storeTemplate || 'fashion',
  }
}
