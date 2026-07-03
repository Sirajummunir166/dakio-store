// Tests for fashion_v1 Product/Data Wiring (CTO spec 2026-07-02)
//
// Covers the 6 required assertions:
//   1. PDP uses the same theme-resolution path as the home page (resolveTheme)
//   2. Editor ProductStoreProvider adapts Dakio API products via adaptDakioProducts
//   3. Active editor sections (ProductsSection, HeroDealsSection) read from the provider
//   4. PDP ProductGallery handles string[] images without crashing
//   5. PDP FashionProductPage renders category.name, not raw [object Object]
//   6. The Dakio→Veluna adapter sets all fields that add-to-cart depends on

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const storeRoot = join(__dirname, '../..')
const merchantRoot = join(storeRoot, '../dakio-merchant')

// ─────────────────────────────────────────────────────────────────────────────
// Test 1 — PDP uses the same theme-resolution rule as the home page
// ─────────────────────────────────────────────────────────────────────────────

describe('PDP theme routing (P0)', () => {
  const pdpPath = join(storeRoot, 'components/ProductDetailClient.jsx')
  let src

  test('ProductDetailClient.jsx is readable', () => {
    src = readFileSync(pdpPath, 'utf8')
    assert.ok(src.length > 0, 'file must not be empty')
  })

  test('ProductDetailClient calls resolveTheme() — not a raw storeTemplate string compare', () => {
    src = src ?? readFileSync(pdpPath, 'utf8')
    assert.ok(
      src.includes('resolveTheme('),
      'ProductDetailClient must call resolveTheme() to match home-page theme selection'
    )
  })

  test('ProductDetailClient does not access storeTemplate directly on the store object', () => {
    src = src ?? readFileSync(pdpPath, 'utf8')
    assert.ok(
      !src.includes('storeTemplate ===') && !src.includes(".storeTemplate ==="),
      'ProductDetailClient must not compare storeTemplate directly — use resolveTheme()'
    )
  })

  test('resolveTheme.js returns fashion_v1 for all stores', () => {
    const resolveThemeSrc = readFileSync(join(storeRoot, 'lib/theme/resolveTheme.js'), 'utf8')
    assert.ok(
      resolveThemeSrc.includes("return 'fashion_v1'"),
      "resolveTheme must return 'fashion_v1' unconditionally (it is the universal theme engine)"
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test 2 — Editor ProductStoreProvider adapts Dakio API products
// ─────────────────────────────────────────────────────────────────────────────

describe('Editor product adapter (P1 — prop wiring)', () => {
  const providerPath = join(merchantRoot, 'src/theme-editor/components/ProductStoreProvider.jsx')
  let src

  test('ProductStoreProvider.jsx is readable', () => {
    src = readFileSync(providerPath, 'utf8')
    assert.ok(src.length > 0, 'file must not be empty')
  })

  test('ProductStoreProvider imports adaptDakioProducts', () => {
    src = src ?? readFileSync(providerPath, 'utf8')
    assert.ok(
      src.includes('adaptDakioProducts'),
      'ProductStoreProvider must import and call adaptDakioProducts to normalize Dakio API products'
    )
  })

  test('ProductStoreProvider exposes allProducts on its context value', () => {
    src = src ?? readFileSync(providerPath, 'utf8')
    assert.ok(
      src.includes('allProducts'),
      'ProductStoreProvider must expose allProducts so editor sections can consume real products'
    )
  })

  test('ThemeEditorMount passes products= prop (not dacioProducts=)', () => {
    const mountSrc = readFileSync(
      join(merchantRoot, 'src/theme-editor/ThemeEditorMount.jsx'),
      'utf8'
    )
    assert.ok(
      mountSrc.includes('products={dacioProducts}'),
      'ThemeEditorMount must pass products={dacioProducts} — ProductStoreProvider destructures the prop as "products"'
    )
    assert.ok(
      !mountSrc.includes('dacioProducts={dacioProducts}'),
      'ThemeEditorMount must not use the old dacioProducts= prop name — it was never received by ProductStoreProvider'
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test 3 — Active editor sections use provider products, not static products.json
// ─────────────────────────────────────────────────────────────────────────────

describe('Editor sections consume real products from provider (P1)', () => {
  test('ProductsSection imports useProductStore and reads allProducts', () => {
    const src = readFileSync(
      join(merchantRoot, 'src/theme-editor/sections/ProductsSection.jsx'),
      'utf8'
    )
    assert.ok(
      src.includes('useProductStore'),
      'ProductsSection must import useProductStore to access real Dakio products'
    )
    assert.ok(
      src.includes('allProducts'),
      'ProductsSection must destructure allProducts from the provider context'
    )
  })

  test('HeroDealsSection imports useProductStore and reads allProducts', () => {
    const src = readFileSync(
      join(merchantRoot, 'src/theme-editor/sections/HeroDealsSection.jsx'),
      'utf8'
    )
    assert.ok(
      src.includes('useProductStore'),
      'HeroDealsSection must import useProductStore to access real Dakio products'
    )
    assert.ok(
      src.includes('allProducts'),
      'HeroDealsSection must use allProducts from the provider, not only the demo JSON'
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test 4 — PDP gallery handles string[] images from Dakio API
// ─────────────────────────────────────────────────────────────────────────────

describe('PDP ProductGallery — string[] image support (P1)', () => {
  const galleryPath = join(
    storeRoot,
    'components/themes/fashion/components/ProductGallery.jsx'
  )
  let src

  test('ProductGallery.jsx is readable', () => {
    src = readFileSync(galleryPath, 'utf8')
    assert.ok(src.length > 0, 'file must not be empty')
  })

  test('ProductGallery normalizes string images to {src, alt} objects', () => {
    src = src ?? readFileSync(galleryPath, 'utf8')
    assert.ok(
      src.includes("typeof img === 'string'"),
      "ProductGallery must handle string images: typeof img === 'string' ? { src: img, ... } : img"
    )
  })

  test('ProductGallery falls back to product.image when images array is empty', () => {
    src = src ?? readFileSync(galleryPath, 'utf8')
    assert.ok(
      src.includes('product.image'),
      'ProductGallery must fall back to the primary product.image when images[] is absent or empty'
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test 5 — PDP renders category.name, not raw [object Object]
// ─────────────────────────────────────────────────────────────────────────────

describe('PDP category rendering (P1 — [object Object] fix)', () => {
  const pdpPagePath = join(
    storeRoot,
    'components/themes/fashion/pages/FashionProductPage.jsx'
  )
  let src

  test('FashionProductPage.jsx is readable', () => {
    src = readFileSync(pdpPagePath, 'utf8')
    assert.ok(src.length > 0, 'file must not be empty')
  })

  test('FashionProductPage uses category?.name to avoid [object Object]', () => {
    src = src ?? readFileSync(pdpPagePath, 'utf8')
    assert.ok(
      src.includes('category?.name'),
      'FashionProductPage must use product.category?.name — normalizeProduct returns {id, name} not a string'
    )
  })

  test('FashionProductPage does not render raw category object directly', () => {
    src = src ?? readFileSync(pdpPagePath, 'utf8')
    // Ensure no bare {product.category} JSX expression without .name guard
    const barePattern = /{product\.category}/g
    assert.ok(
      !barePattern.test(src),
      'FashionProductPage must not render {product.category} directly — it is an object from the Dakio API'
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test 6 — adaptDakioProduct output has all fields that add-to-cart requires
// ─────────────────────────────────────────────────────────────────────────────

describe('adaptDakioProduct — add-to-cart field contract (P1)', () => {
  const adapterPath = join(merchantRoot, 'src/theme-editor/lib/products.js')
  let src

  test('adapter file is readable', () => {
    src = readFileSync(adapterPath, 'utf8')
    assert.ok(src.length > 0, 'file must not be empty')
  })

  test('adapter sets id field', () => {
    src = src ?? readFileSync(adapterPath, 'utf8')
    assert.ok(src.includes("id: String(raw.id"), "adapter must set 'id' from raw.id")
  })

  test('adapter sets name field', () => {
    src = src ?? readFileSync(adapterPath, 'utf8')
    assert.ok(src.includes("name: raw.name"), "adapter must set 'name' from raw.name")
  })

  test('adapter sets price from sellingPrice', () => {
    src = src ?? readFileSync(adapterPath, 'utf8')
    assert.ok(
      src.includes('raw.sellingPrice'),
      "adapter must read raw.sellingPrice — Dakio API uses sellingPrice, not price, as the sale price"
    )
  })

  test('adapter sets inStock based on totalStock', () => {
    src = src ?? readFileSync(adapterPath, 'utf8')
    assert.ok(
      src.includes('inStock: totalStock > 0'),
      "adapter must set inStock: totalStock > 0 so CartProvider knows stock availability"
    )
  })

  test('adapter sets image from imageUrl with fallback', () => {
    src = src ?? readFileSync(adapterPath, 'utf8')
    assert.ok(
      src.includes('raw.imageUrl'),
      "adapter must read raw.imageUrl — Dakio API uses imageUrl not image"
    )
  })
})
