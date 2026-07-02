/**
 * Default page config (Classic preset) used when contract.pageConfig.sections is empty.
 * Mirrors the veluna-classic preset — 8 sections, editorial layout.
 */
export const CLASSIC_PAGE_CONFIG = {
  version: 1,
  preset: 'classic',
  theme: {
    accent: '#111111',
    accentDark: '#000000',
    dark: '#111111',
  },
  sections: [
    {
      id: 'section-topbar',
      type: 'topbar',
      enabled: true,
      settings: {
        message: 'Free delivery on orders over ৳2,500',
        links: [{ label: 'Help', href: '#help' }],
        currency: 'BDT',
      },
    },
    {
      id: 'section-header',
      type: 'header',
      enabled: true,
      settings: {
        brandMark: null,
        navLinks: ['Shop', 'Collections', 'About'],
        showSearch: true,
        searchPlaceholder: 'Search',
      },
    },
    {
      id: 'section-hero',
      type: 'hero-deals',
      enabled: true,
      settings: {
        layout: 'editorial',
        eyebrow: '',
        heroImage: '/media/files/most-wanted-man-in-black-pinstripes-shirt-3331203.jpg',
        heroImageAlt: 'New collection',
        deals: [
          {
            title: 'New Collection',
            subtitle: 'Crafted for everyday confidence.',
            cta: 'Explore collection',
            tone: 'dark',
          },
        ],
        productIndexes: [],
      },
    },
    {
      id: 'section-categories',
      type: 'categories',
      enabled: true,
      settings: {
        editorial: true,
        showItemCounts: false,
        eyebrow: '',
        title: 'Collections',
        linkLabel: 'View all',
        linkHref: '#shop',
        items: [],
      },
    },
    {
      id: 'section-products',
      type: 'products',
      enabled: true,
      settings: {
        eyebrow: '',
        title: 'New Arrivals',
        tabs: [
          { id: 'new', label: 'New' },
          { id: 'best', label: 'Best sellers' },
          { id: 'sale', label: 'On sale' },
        ],
        defaultTab: 'new',
        limit: 8,
        loadMoreLabel: 'View all',
        showTabs: false,
        showReviews: false,
        showQuickView: true,
        showComparePrice: true,
        curated: true,
        addToCartLabel: 'Add to cart',
        quickViewLabel: 'Quick view',
      },
    },
    {
      id: 'section-brand-story',
      type: 'promo-banner',
      enabled: true,
      settings: {
        variant: 'brand-story',
        eyebrow: '',
        title: 'The Linen Season',
        description: 'Timeless silhouettes, woven for long summer days.',
        ctaLabel: 'Explore collection',
        mainImage: '/media/files/sky-serenity-pure-cotton-panjabi-3214117.jpg',
        mainImageAlt: 'Brand story',
        floatProductIndex: null,
      },
    },
    {
      id: 'section-features',
      type: 'features',
      enabled: true,
      settings: {
        quiet: true,
        items: [
          { title: 'Free Delivery', subtitle: 'Across Bangladesh' },
          { title: 'Easy Returns', subtitle: 'Within 7 days' },
          { title: 'Secure Checkout', subtitle: 'SSL protected' },
        ],
      },
    },
    {
      id: 'section-footer',
      type: 'footer',
      enabled: true,
      settings: {
        brandMark: null,
        description: 'Refined essentials for modern Bangladesh.',
        socialLinks: [],
        shopLinks: [],
        supportLinks: [
          { label: 'Contact', href: '#contact' },
          { label: 'Shipping', href: '#shipping' },
          { label: 'Returns', href: '#returns' },
        ],
        newsletterTitle: 'Stay in touch',
        newsletterDescription: 'New collections — no spam.',
        newsletterPlaceholder: 'Email address',
        newsletterButton: 'Sign up',
        copyright: null,
        showProductCount: false,
      },
    },
  ],
}

export function getDefaultPageConfig() {
  return structuredClone(CLASSIC_PAGE_CONFIG)
}
