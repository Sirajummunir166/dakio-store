/**
 * Theme Runtime — full pipeline integration test.
 * Simulates the exact data flow that FashionThemeWrapper runs on every request:
 *   raw API store + raw products + raw categories
 *     → normalizers
 *     → bridges
 *     → buildContract()
 *     → valid ThemeContract
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildContract,
  SCHEMA_VERSION,
  THEME_VERSIONS,
  normalizeStore,
  normalizeProducts,
  normalizeCategories,
  buildRoutingBridge,
  buildCartBridge,
  isCompatible,
} from './index.js'

// ── Fixtures — raw Dakio API shapes ─────────────────────────────────────────

const RAW_STORE = {
  id: 'store-abc',
  name: 'Dhaka Fashion',
  slug: 'dhaka-fashion',
  logoUrl: 'https://cdn.dakio.io/logo.png',
  faviconUrl: null,
  accentColor: '#C8A96E',
  currency: 'BDT',
  announcementBar: 'Free delivery on orders above ৳2500',
  phone: '01700000000',
  email: 'hello@dhakafashion.com',
  address: '45 Gulshan Avenue',
  city: 'Dhaka',
  whatsappNumber: '01700000000',
  facebookUrl: 'https://facebook.com/dhakafashion',
  instagramUrl: null,
  deliveryInsideDhaka: 60,
  deliveryOutsideDhaka: 120,
  storeTemplate: 'fashion_v1',
}

const RAW_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Sky Blue Panjabi',
    slug: 'sky-blue-panjabi',
    sku: 'PAN-001',
    imageUrl: 'https://cdn.dakio.io/pan-1.jpg',
    images: ['https://cdn.dakio.io/pan-1.jpg', 'https://cdn.dakio.io/pan-2.jpg'],
    sellingPrice: 1200,
    mrp: 1800,
    description: 'Soft cotton panjabi for everyday wear.',
    category: { id: 'cat-panjabi', name: 'Panjabi' },
    variants: [
      { id: 'v1', name: 'M', price: null, stock: 10, sku: 'PAN-001-M' },
      { id: 'v2', name: 'L', price: null, stock: 3, sku: 'PAN-001-L' },
    ],
    totalStock: 13,
    status: 'PUBLISHED',
  },
  {
    id: 'prod-2',
    name: 'Black Pinstripe Shirt',
    slug: 'black-pinstripe-shirt',
    sku: 'SHT-002',
    imageUrl: 'https://cdn.dakio.io/shirt-1.jpg',
    images: [],
    sellingPrice: 850,
    mrp: null,
    description: null,
    category: { id: 'cat-shirts', name: 'Shirts' },
    variants: [],
    totalStock: 4,
    status: 'PUBLISHED',
  },
]

const RAW_CATEGORIES = [
  { id: 'cat-panjabi', name: 'Panjabi', count: 48 },
  { id: 'cat-shirts',  name: 'Shirts',  count: 120, image: 'https://cdn.dakio.io/cats/shirts.jpg' },
]

// ── Pipeline test ────────────────────────────────────────────────────────────

describe('Theme Runtime — full pipeline', () => {
  const store      = normalizeStore(RAW_STORE)
  const products   = normalizeProducts(RAW_PRODUCTS)
  const categories = normalizeCategories(RAW_CATEGORIES)
  const routing    = buildRoutingBridge('dhaka-fashion')
  const cart       = buildCartBridge({
    state:   { cart: [], cartOpen: false, cartTotal: 0, cartCount: 0 },
    actions: { setCartOpen: () => {}, addToCart: () => {}, removeFromCart: () => {}, changeQty: () => {} },
    slug: 'dhaka-fashion',
  })
  const pageConfig = { version: 1, sections: [], theme: {} }
  const checkout   = { placeOrder: async () => {}, validateCoupon: async () => {}, calcShipping: () => 60 }

  const contract = buildContract({
    themeKey: 'fashion_v1',
    store,
    products,
    categories,
    pageConfig,
    cart,
    checkout,
    routing,
  })

  test('contract is compatible with current schema', () => {
    assert.equal(isCompatible(contract), true)
  })

  test('_meta carries correct versions', () => {
    assert.equal(contract._meta.schemaVersion, SCHEMA_VERSION)
    assert.equal(contract._meta.themeVersion, THEME_VERSIONS.fashion)
    assert.equal(contract._meta.themeKey, 'fashion_v1')
  })

  test('store fields are fully normalized', () => {
    assert.equal(contract.store.id, 'store-abc')
    assert.equal(contract.store.name, 'Dhaka Fashion')
    assert.equal(contract.store.accentColor, '#C8A96E')
    assert.equal(contract.store.currency, 'BDT')
    assert.equal(contract.store.deliveryInsideDhaka, 60)
    assert.equal(contract.store.deliveryOutsideDhaka, 120)
  })

  test('products array length matches raw input', () => {
    assert.equal(contract.products.length, 2)
  })

  test('first product — imageUrl mapped to image', () => {
    assert.equal(contract.products[0].image, 'https://cdn.dakio.io/pan-1.jpg')
  })

  test('first product — sellingPrice mapped to price', () => {
    assert.equal(contract.products[0].price, 1200)
  })

  test('first product — mrp mapped to comparePrice', () => {
    assert.equal(contract.products[0].comparePrice, 1800)
  })

  test('first product — discount computed correctly', () => {
    assert.equal(contract.products[0].discount.amount, 600)
    assert.equal(contract.products[0].discount.percent, 33)
  })

  test('first product — badge is SALE (mrp > price)', () => {
    assert.equal(contract.products[0].badge, 'SALE')
  })

  test('first product — category is object (not string)', () => {
    assert.deepEqual(contract.products[0].category, { id: 'cat-panjabi', name: 'Panjabi' })
  })

  test('first product — images array populated', () => {
    assert.equal(contract.products[0].images.length, 2)
  })

  test('second product — comparePrice is null (no mrp)', () => {
    assert.equal(contract.products[1].comparePrice, null)
  })

  test('second product — images falls back to [imageUrl]', () => {
    assert.deepEqual(contract.products[1].images, ['https://cdn.dakio.io/shirt-1.jpg'])
  })

  test('second product — badge is null', () => {
    assert.equal(contract.products[1].badge, null)
  })

  test('second product — isLowStock true (totalStock = 4)', () => {
    assert.equal(contract.products[1].availability.isLowStock, true)
  })

  test('categories are normalized', () => {
    assert.equal(contract.categories.length, 2)
    assert.equal(contract.categories[0].name, 'Panjabi')
    assert.equal(contract.categories[0].count, 48)
    assert.equal(contract.categories[1].image, 'https://cdn.dakio.io/cats/shirts.jpg')
  })

  test('cart bridge has correct slug and empty initial state', () => {
    assert.equal(contract.cart.slug, 'dhaka-fashion')
    assert.equal(contract.cart.count, 0)
    assert.equal(contract.cart.total, 0)
    assert.deepEqual(contract.cart.items, [])
  })

  test('routing bridge produces correct paths for non-custom-domain', () => {
    // In Node.js test (no browser), isCustomDomain() returns false → slug-prefixed
    assert.equal(contract.routing.slug, 'dhaka-fashion')
    const productUrl = contract.routing.productPath('sky-blue-panjabi')
    assert.ok(productUrl.includes('sky-blue-panjabi'), `unexpected path: ${productUrl}`)
  })

  test('checkout bridge has placeOrder, validateCoupon, calcShipping', () => {
    assert.equal(typeof contract.checkout.placeOrder, 'function')
    assert.equal(typeof contract.checkout.validateCoupon, 'function')
    assert.equal(typeof contract.checkout.calcShipping, 'function')
  })

  test('ThemeContract has all required top-level keys', () => {
    const REQUIRED = ['_meta', 'store', 'products', 'categories', 'pageConfig', 'cart', 'checkout', 'routing']
    for (const key of REQUIRED) {
      assert.ok(key in contract, `missing key: ${key}`)
    }
  })

  test('placeholder fields exist on product (future-proofing)', () => {
    const p = contract.products[0]
    assert.ok('brand'          in p, 'missing: brand')
    assert.ok('vendor'         in p, 'missing: vendor')
    assert.ok('collections'    in p, 'missing: collections')
    assert.ok('tags'           in p, 'missing: tags')
    assert.ok('attributes'     in p, 'missing: attributes')
    assert.ok('specifications' in p, 'missing: specifications')
    assert.ok('media'          in p, 'missing: media')
    assert.ok('seo'            in p, 'missing: seo')
    assert.ok('rating'         in p, 'missing: rating')
    assert.ok('reviewCount'    in p, 'missing: reviewCount')
  })
})
