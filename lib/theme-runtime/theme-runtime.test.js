import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { buildContract, SCHEMA_VERSION, THEME_VERSIONS } from './ThemeContract.js'
import { normalizeStore }       from './normalizers/normalizeStore.js'
import { normalizeProduct }     from './normalizers/normalizeProduct.js'
import { normalizeProducts }    from './normalizers/normalizeProducts.js'
import { normalizeCategory, normalizeCategories } from './normalizers/normalizeCategories.js'
import { normalizeCartItem, normalizeCartItems, buildCartBridge, CART_STORAGE_KEY } from './bridges/CartBridge.js'
import { isCompatible, upgradeContract } from './compatibility/CompatibilityLayer.js'
import { hasLegacyTemplate, getLegacyTemplateName, migrateLegacyConfig } from './migration/MigrationLayer.js'

// ─────────────────────────────────────────────
// ThemeContract
// ─────────────────────────────────────────────
describe('buildContract', () => {
  test('includes schemaVersion and themeVersion in _meta', () => {
    const contract = buildContract({
      themeKey: 'fashion',
      store: {}, products: [], categories: [],
      pageConfig: {}, cart: {}, checkout: {}, routing: {},
    })
    assert.equal(contract._meta.schemaVersion, SCHEMA_VERSION)
    assert.equal(contract._meta.themeVersion, THEME_VERSIONS.fashion)
    assert.equal(contract._meta.themeKey, 'fashion')
  })

  test('unknown themeKey falls back to 1.0.0', () => {
    const contract = buildContract({ themeKey: 'unknown', store: {}, products: [], categories: {}, pageConfig: {}, cart: {}, checkout: {}, routing: {} })
    assert.equal(contract._meta.themeVersion, '1.0.0')
  })

  test('contract includes all required top-level keys', () => {
    const contract = buildContract({
      themeKey: 'fashion', store: { id: '1' }, products: [{ id: 'p1' }],
      categories: [], pageConfig: { version: 1 }, cart: { items: [] }, checkout: {}, routing: {},
    })
    assert.ok('store' in contract)
    assert.ok('products' in contract)
    assert.ok('categories' in contract)
    assert.ok('pageConfig' in contract)
    assert.ok('cart' in contract)
    assert.ok('checkout' in contract)
    assert.ok('routing' in contract)
  })
})

// ─────────────────────────────────────────────
// normalizeStore
// ─────────────────────────────────────────────
describe('normalizeStore', () => {
  const raw = {
    id: 'abc', name: 'Test Store', slug: 'test-store',
    logoUrl: 'https://cdn/logo.png', accentColor: '#FF6B6B',
    currency: 'BDT', announcementBar: 'Free delivery on ৳2500+',
    phone: '01700000000', whatsappNumber: '01700000000',
    facebookUrl: 'https://fb.com/test', instagramUrl: null,
    deliveryInsideDhaka: 60, deliveryOutsideDhaka: 120,
    storeTemplate: 'fashion',
  }

  test('maps all core fields correctly', () => {
    const s = normalizeStore(raw)
    assert.equal(s.id, 'abc')
    assert.equal(s.name, 'Test Store')
    assert.equal(s.slug, 'test-store')
    assert.equal(s.logoUrl, 'https://cdn/logo.png')
    assert.equal(s.accentColor, '#FF6B6B')
    assert.equal(s.currency, 'BDT')
    assert.equal(s.announcementBar, 'Free delivery on ৳2500+')
    assert.equal(s.deliveryInsideDhaka, 60)
    assert.equal(s.deliveryOutsideDhaka, 120)
  })

  test('returns null for null input', () => {
    assert.equal(normalizeStore(null), null)
  })

  test('accentColor defaults to #111111 when missing', () => {
    const s = normalizeStore({ id: '1', name: 'X', slug: 'x' })
    assert.equal(s.accentColor, '#111111')
  })

  test('currency defaults to BDT when missing', () => {
    const s = normalizeStore({ id: '1', name: 'X', slug: 'x' })
    assert.equal(s.currency, 'BDT')
  })

  test('delivery fees default to 60 / 120 when missing', () => {
    const s = normalizeStore({ id: '1', name: 'X', slug: 'x' })
    assert.equal(s.deliveryInsideDhaka, 60)
    assert.equal(s.deliveryOutsideDhaka, 120)
  })
})

// ─────────────────────────────────────────────
// normalizeProduct
// ─────────────────────────────────────────────
describe('normalizeProduct', () => {
  const raw = {
    id: 'p1', name: 'Black Shirt', slug: 'black-shirt', sku: 'SKU001',
    imageUrl: 'https://cdn/shirt.jpg', images: ['https://cdn/shirt.jpg', 'https://cdn/shirt2.jpg'],
    sellingPrice: 800, mrp: 1200,
    description: 'Premium cotton shirt',
    category: { id: 'cat1', name: 'Shirts' },
    variants: [{ id: 'v1', name: 'M', price: null, stock: 5, sku: 'SKU001-M' }],
    totalStock: 25, status: 'PUBLISHED',
  }

  test('maps imageUrl → image', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.image, 'https://cdn/shirt.jpg')
  })

  test('maps sellingPrice → price', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.price, 800)
  })

  test('maps mrp → comparePrice when mrp > sellingPrice', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.comparePrice, 1200)
  })

  test('comparePrice is null when mrp <= sellingPrice', () => {
    const p = normalizeProduct({ ...raw, mrp: 800 })
    assert.equal(p.comparePrice, null)
  })

  test('computes discount.amount and discount.percent', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.discount.amount, 400)
    assert.equal(p.discount.percent, 33)
  })

  test('discount is 0 when no comparePrice', () => {
    const p = normalizeProduct({ ...raw, mrp: null })
    assert.equal(p.discount.amount, 0)
    assert.equal(p.discount.percent, 0)
  })

  test('badge is SALE when mrp > sellingPrice', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.badge, 'SALE')
  })

  test('badge is null when no discount', () => {
    const p = normalizeProduct({ ...raw, mrp: null })
    assert.equal(p.badge, null)
  })

  test('explicit raw.badge overrides derived badge', () => {
    const p = normalizeProduct({ ...raw, badge: 'NEW' })
    assert.equal(p.badge, 'NEW')
  })

  test('category is object with id and name', () => {
    const p = normalizeProduct(raw)
    assert.deepEqual(p.category, { id: 'cat1', name: 'Shirts' })
  })

  test('category is null when missing', () => {
    const p = normalizeProduct({ ...raw, category: null })
    assert.equal(p.category, null)
  })

  test('variants are normalized', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.variants.length, 1)
    assert.equal(p.variants[0].id, 'v1')
    assert.equal(p.variants[0].name, 'M')
    assert.equal(p.variants[0].stock, 5)
  })

  test('availability.inStock is true when totalStock > 0', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.availability.inStock, true)
  })

  test('availability.inStock is false when totalStock is 0', () => {
    const p = normalizeProduct({ ...raw, totalStock: 0 })
    assert.equal(p.availability.inStock, false)
  })

  test('availability.isLowStock is true when totalStock is 1–5', () => {
    const p = normalizeProduct({ ...raw, totalStock: 3 })
    assert.equal(p.availability.isLowStock, true)
  })

  test('availability.isLowStock is false when totalStock is 0 (out of stock, not low)', () => {
    const p = normalizeProduct({ ...raw, totalStock: 0 })
    assert.equal(p.availability.isLowStock, false)
  })

  test('placeholder fields exist and are null/empty', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.brand, null)
    assert.equal(p.vendor, null)
    assert.deepEqual(p.collections, [])
    assert.deepEqual(p.tags, [])
    assert.deepEqual(p.media, [])
    assert.deepEqual(p.attributes, {})
    assert.deepEqual(p.specifications, [])
    assert.equal(p.rating, null)
    assert.equal(p.reviewCount, 0)
  })

  test('seo block includes title and handle', () => {
    const p = normalizeProduct(raw)
    assert.equal(p.seo.title, 'Black Shirt')
    assert.equal(p.seo.handle, 'black-shirt')
  })

  test('returns null for null input', () => {
    assert.equal(normalizeProduct(null), null)
  })

  test('images array built from imageUrl when images field missing', () => {
    const p = normalizeProduct({ ...raw, images: undefined })
    assert.deepEqual(p.images, ['https://cdn/shirt.jpg'])
  })
})

// ─────────────────────────────────────────────
// normalizeProducts
// ─────────────────────────────────────────────
describe('normalizeProducts', () => {
  test('maps array of raw products', () => {
    const raw = [
      { id: 'p1', name: 'A', slug: 'a', sellingPrice: 100 },
      { id: 'p2', name: 'B', slug: 'b', sellingPrice: 200 },
    ]
    const result = normalizeProducts(raw)
    assert.equal(result.length, 2)
    assert.equal(result[0].price, 100)
    assert.equal(result[1].price, 200)
  })

  test('filters out null results', () => {
    const result = normalizeProducts([null, { id: 'p1', name: 'A', slug: 'a', sellingPrice: 100 }, null])
    assert.equal(result.length, 1)
  })

  test('returns empty array for non-array input', () => {
    assert.deepEqual(normalizeProducts(null), [])
    assert.deepEqual(normalizeProducts(undefined), [])
    assert.deepEqual(normalizeProducts('bad'), [])
  })
})

// ─────────────────────────────────────────────
// normalizeCategories
// ─────────────────────────────────────────────
describe('normalizeCategories', () => {
  test('maps id, name, slug, image, count', () => {
    const raw = [{ id: 'c1', name: 'Shirts', image: 'https://cdn/shirts.jpg', count: 42 }]
    const result = normalizeCategories(raw)
    assert.equal(result[0].id, 'c1')
    assert.equal(result[0].name, 'Shirts')
    assert.equal(result[0].count, 42)
  })

  test('slug falls back to id when slug missing', () => {
    const result = normalizeCategories([{ id: 'c1', name: 'Shirts' }])
    assert.equal(result[0].slug, 'c1')
  })

  test('returns empty array for non-array', () => {
    assert.deepEqual(normalizeCategories(null), [])
  })
})

// ─────────────────────────────────────────────
// CartBridge
// ─────────────────────────────────────────────
describe('CART_STORAGE_KEY', () => {
  test('returns dk_cart_{slug}', () => {
    assert.equal(CART_STORAGE_KEY('my-store'), 'dk_cart_my-store')
  })
})

describe('normalizeCartItem', () => {
  test('maps unitPrice → price and imageUrl → image', () => {
    const raw = {
      key: 'p1v1', productId: 'p1', variantId: 'v1',
      name: 'Black Shirt — M', sku: 'SKU001-M',
      imageUrl: 'https://cdn/shirt.jpg',
      unitPrice: 800, qty: 2,
    }
    const item = normalizeCartItem(raw)
    assert.equal(item.price, 800)
    assert.equal(item.image, 'https://cdn/shirt.jpg')
    assert.equal(item.qty, 2)
  })

  test('returns null for null input', () => {
    assert.equal(normalizeCartItem(null), null)
  })
})

describe('normalizeCartItems', () => {
  test('filters out nulls', () => {
    const result = normalizeCartItems([null, { key: 'k', productId: 'p', unitPrice: 100, qty: 1 }])
    assert.equal(result.length, 1)
  })
})

describe('buildCartBridge.addItem — field translation', () => {
  test('translates price → sellingPrice and image → imageUrl before calling addToCart', () => {
    let capturedProduct, capturedQty, capturedVariant
    const actions = {
      addToCart: (p, qty, variant) => { capturedProduct = p; capturedQty = qty; capturedVariant = variant },
      removeFromCart: () => {},
      changeQty: () => {},
      setCartOpen: () => {},
    }
    const cart = buildCartBridge({ state: { cart: [], cartOpen: false, cartTotal: 0, cartCount: 0 }, actions, slug: 'test-store' })

    const normalizedProduct = {
      id: 'p1', name: 'Black Shirt', slug: 'black-shirt',
      price: 850,        // ThemeContract field name
      image: 'https://cdn/shirt.jpg',  // ThemeContract field name
    }
    cart.addItem(normalizedProduct, 2, 'L')

    assert.equal(capturedQty, 2)
    // addToCart must receive sellingPrice (not price) and imageUrl (not image)
    assert.equal(capturedProduct.sellingPrice, 850, 'sellingPrice must be translated from price')
    assert.equal(capturedProduct.imageUrl, 'https://cdn/shirt.jpg', 'imageUrl must be translated from image')
    // Original ThemeContract field names must also be present (spread)
    assert.equal(capturedProduct.price, 850)
    assert.equal(capturedProduct.image, 'https://cdn/shirt.jpg')
  })

  test('translates string size into a variant object', () => {
    let capturedVariant
    const actions = {
      addToCart: (p, qty, v) => { capturedVariant = v },
      removeFromCart: () => {}, changeQty: () => {}, setCartOpen: () => {},
    }
    const cart = buildCartBridge({ state: { cart: [], cartOpen: false, cartTotal: 0, cartCount: 0 }, actions, slug: 'test-store' })
    cart.addItem({ id: 'p1', name: 'Shirt', price: 500, image: null }, 1, 'XL')
    assert.equal(capturedVariant?.id, 'XL', 'string size must become variant.id')
    assert.equal(capturedVariant?.name, 'XL', 'string size must become variant.name')
  })

  test('passes variant object through unchanged when already an object', () => {
    let capturedVariant
    const actions = {
      addToCart: (p, qty, v) => { capturedVariant = v },
      removeFromCart: () => {}, changeQty: () => {}, setCartOpen: () => {},
    }
    const cart = buildCartBridge({ state: { cart: [], cartOpen: false, cartTotal: 0, cartCount: 0 }, actions, slug: 'test-store' })
    const variant = { id: 'v1', name: 'M', price: null, stock: 5 }
    cart.addItem({ id: 'p1', name: 'Shirt', price: 500, image: null }, 1, variant)
    assert.deepEqual(capturedVariant, variant)
  })
})

// ─────────────────────────────────────────────
// CompatibilityLayer
// ─────────────────────────────────────────────
describe('isCompatible', () => {
  test('returns true for current schema version', () => {
    assert.equal(isCompatible({ _meta: { schemaVersion: SCHEMA_VERSION } }), true)
  })

  test('returns false for old schema version', () => {
    assert.equal(isCompatible({ _meta: { schemaVersion: '0.9.0' } }), false)
  })

  test('returns false for contract with no _meta', () => {
    assert.equal(isCompatible({}), false)
    assert.equal(isCompatible(null), false)
  })
})

describe('upgradeContract', () => {
  test('returns contract unchanged at v1.0.0 (no upgrade path needed)', () => {
    const contract = { _meta: { schemaVersion: '1.0.0' }, store: { id: 'x' } }
    const upgraded = upgradeContract(contract)
    assert.deepEqual(upgraded, contract)
  })

  test('returns input unchanged if _meta missing', () => {
    const contract = { store: { id: 'x' } }
    assert.deepEqual(upgradeContract(contract), contract)
  })
})

// ─────────────────────────────────────────────
// MigrationLayer
// ─────────────────────────────────────────────
describe('hasLegacyTemplate', () => {
  test('returns true for legacy templates', () => {
    for (const t of ['minimal', 'tech', 'organic', 'beauty', 'bold']) {
      assert.equal(hasLegacyTemplate({ storeTemplate: t }), true, `${t} should be legacy`)
    }
  })

  test('returns false for fashion', () => {
    assert.equal(hasLegacyTemplate({ storeTemplate: 'fashion' }), false)
  })

  test('returns false for null store', () => {
    assert.equal(hasLegacyTemplate(null), false)
  })
})

describe('getLegacyTemplateName', () => {
  test('returns the storeTemplate string', () => {
    assert.equal(getLegacyTemplateName({ storeTemplate: 'minimal' }), 'minimal')
  })

  test('returns null for null store', () => {
    assert.equal(getLegacyTemplateName(null), null)
  })
})

describe('migrateLegacyConfig', () => {
  test('returns null (placeholder — not yet implemented)', () => {
    assert.equal(migrateLegacyConfig({ hero: {} }, 'minimal'), null)
  })
})
