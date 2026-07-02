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

    deliveryInsideDhaka: Number(raw.deliveryInsideDhaka) || 60,
    deliveryOutsideDhaka: Number(raw.deliveryOutsideDhaka) || 120,

    storeTemplate: raw.storeTemplate || 'fashion',
  }
}
