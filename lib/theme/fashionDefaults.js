/** Default Fashion Theme v2 config — merged with tenant themeSettings at runtime */

export const FASHION_CONFIG_VERSION = 2

export const DEFAULT_CATEGORY_TILES = [
  { id: 'women',       title: 'Women',       image: '', anchor: 'women' },
  { id: 'men',         title: 'Men',         image: '', anchor: 'men' },
  { id: 'kids',        title: 'Kids',        image: '', anchor: 'kids' },
  { id: 'shoes',       title: 'Shoes',       image: '', anchor: 'shoes' },
  { id: 'bags',        title: 'Bags',        image: '', anchor: 'bags' },
  { id: 'accessories', title: 'Accessories', image: '', anchor: 'accessories' },
]

export const DEFAULT_STYLE_TILES = [
  { id: 'casual',     title: 'Casual',     image: '', tag: 'casual' },
  { id: 'office',     title: 'Office',     image: '', tag: 'office' },
  { id: 'party',      title: 'Party',      image: '', tag: 'party' },
  { id: 'modest',     title: 'Modest',     image: '', tag: 'modest' },
  { id: 'streetwear', title: 'Streetwear', image: '', tag: 'streetwear' },
]

export const DEFAULT_REVIEWS = [
  { name: 'Ayesha K.', text: 'Fabric quality is excellent. Fits true to size and delivery was fast.', rating: 5 },
  { name: 'Rahim H.',  text: 'Premium packaging and the dress looks exactly like the photos.', rating: 5 },
  { name: 'Nadia S.',  text: 'Easy COD checkout. Will order again for Eid collection.', rating: 5 },
]

export const FASHION_DEFAULTS = {
  version: FASHION_CONFIG_VERSION,
  branding: {
    primaryColor: null,
    secondaryColor: '#F7F6F3',
    buttonStyle: 'filled',
    fontStyle: 'modern',
  },
  announcement: {
    enabled: true,
    text: '',
  },
  hero: {
    enabled: true,
    headline: '',
    subtitle: '',
    image: '',
    primaryCta:   { text: 'Shop New Arrivals', anchor: 'new-arrivals' },
    secondaryCta: { text: 'Explore Collection', anchor: 'categories' },
  },
  sections: {
    order: ['categories', 'newArrivals', 'story', 'bestSellers', 'shopByStyle', 'flashSale', 'reviews', 'instagram', 'newsletter'],
    categories:  { enabled: true, title: 'Shop by Category', items: DEFAULT_CATEGORY_TILES },
    newArrivals: { enabled: true, title: 'New Arrivals', limit: 8, categoryId: null },
    story: {
      enabled: true,
      title: '',
      subtitle: '',
      image: '',
      ctaText: 'Discover the Collection',
      ctaAnchor: 'best-sellers',
    },
    bestSellers: { enabled: true, title: 'Best Sellers', limit: 8, categoryId: null },
    shopByStyle: { enabled: true, title: 'Shop by Style', items: DEFAULT_STYLE_TILES },
    flashSale: {
      enabled: false,
      title: 'Limited Time Offer',
      subtitle: 'Selected styles at special prices',
      endsAt: null,
    },
    reviews:    { enabled: true, title: 'What Customers Say', items: DEFAULT_REVIEWS },
    instagram:  { enabled: true, title: 'Follow Us', images: [] },
    newsletter: { enabled: true, title: 'Join Our List', subtitle: 'Be first to know about new drops and exclusive offers.' },
    trust:      { enabled: true },
  },
  productPage: {
    showReviews: true,
    showSizeGuide: true,
    showWhatsapp: true,
    deliveryText: '',
    returnPolicyText: '',
  },
  footer: {
    aboutText: '',
    showPolicies: true,
  },
}

/** Deep-merge saved settings onto defaults */
export function mergeFashionConfig(saved = {}) {
  const d = FASHION_DEFAULTS
  return {
    version: saved.version || d.version,
    branding: { ...d.branding, ...(saved.branding || {}) },
    announcement: { ...d.announcement, ...(saved.announcement || {}) },
    hero: {
      ...d.hero,
      ...(saved.hero || {}),
      primaryCta:   { ...d.hero.primaryCta,   ...(saved.hero?.primaryCta || {}) },
      secondaryCta: { ...d.hero.secondaryCta, ...(saved.hero?.secondaryCta || {}) },
    },
    sections: {
      ...d.sections,
      ...(saved.sections || {}),
      categories:  { ...d.sections.categories,  ...(saved.sections?.categories || {}),
        items: saved.sections?.categories?.items?.length ? saved.sections.categories.items : d.sections.categories.items },
      newArrivals: { ...d.sections.newArrivals, ...(saved.sections?.newArrivals || {}) },
      story:       { ...d.sections.story,       ...(saved.sections?.story || {}) },
      bestSellers: { ...d.sections.bestSellers, ...(saved.sections?.bestSellers || {}) },
      shopByStyle: { ...d.sections.shopByStyle, ...(saved.sections?.shopByStyle || {}),
        items: saved.sections?.shopByStyle?.items?.length ? saved.sections.shopByStyle.items : d.sections.shopByStyle.items },
      flashSale:   { ...d.sections.flashSale,   ...(saved.sections?.flashSale || {}) },
      reviews:     { ...d.sections.reviews,     ...(saved.sections?.reviews || {}),
        items: saved.sections?.reviews?.items?.length ? saved.sections.reviews.items : d.sections.reviews.items },
      instagram:   { ...d.sections.instagram,   ...(saved.sections?.instagram || {}) },
      newsletter:  { ...d.sections.newsletter,  ...(saved.sections?.newsletter || {}) },
      trust:       { ...d.sections.trust,       ...(saved.sections?.trust || {}) },
      order: saved.sections?.order?.length ? saved.sections.order : d.sections.order,
    },
    productPage: { ...d.productPage, ...(saved.productPage || {}) },
    footer:      { ...d.footer,      ...(saved.footer || {}) },
  }
}

export function resolveFashionConfig(store, { useDraft = false } = {}) {
  const raw = useDraft && store?.themeSettingsDraft
    ? store.themeSettingsDraft
    : (store?.themeSettings || {})
  const merged = mergeFashionConfig(typeof raw === 'object' && raw ? raw : {})
  const primary = merged.branding.primaryColor || store?.accentColor || '#111111'
  return { ...merged, primary, storeName: store?.name || 'Store' }
}
