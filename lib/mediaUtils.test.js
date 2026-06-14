import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveMedia } from './mediaUtils.js'

// ── helpers ───────────────────────────────────────────────────────────────────

const CDN  = 'https://res.cloudinary.com/dakio/image/upload/product.jpg'
const CDN2 = 'https://res.cloudinary.com/dakio/image/upload/product2.jpg'
const CDN3 = 'https://res.cloudinary.com/dakio/image/upload/product3.jpg'

// ── 1. Null / missing product guard ──────────────────────────────────────────

test('null product returns empty result', () => {
  const r = resolveMedia(null)
  assert.equal(r.primary, null)
  assert.deepEqual(r.gallery, [])
})

test('undefined product returns empty result', () => {
  const r = resolveMedia(undefined)
  assert.equal(r.primary, null)
  assert.deepEqual(r.gallery, [])
})

// ── 2. Regular merchant product ───────────────────────────────────────────────

test('regular product with only imageUrl', () => {
  const r = resolveMedia({ imageUrl: CDN, images: [] })
  assert.equal(r.primary, CDN)
  assert.deepEqual(r.gallery, [CDN])
})

test('regular product with imageUrl and images[]', () => {
  const r = resolveMedia({ imageUrl: CDN, images: [CDN2, CDN3] })
  assert.equal(r.primary, CDN)
  assert.deepEqual(r.gallery, [CDN, CDN2, CDN3])
})

// ── 3. Dropship product — imageUrl null, valid images[] ──────────────────────

test('dropship: imageUrl null but valid images[] → uses images[0]', () => {
  const r = resolveMedia({ imageUrl: null, images: [CDN, CDN2] })
  assert.equal(r.primary, CDN)
  assert.deepEqual(r.gallery, [CDN, CDN2])
})

test('dropship: imageUrl undefined and valid images[]', () => {
  const r = resolveMedia({ images: [CDN] })
  assert.equal(r.primary, CDN)
})

// ── 4. Placeholder-first, real image later ───────────────────────────────────

test('imageUrl is null, images[0] is real → images[0] promoted', () => {
  const r = resolveMedia({ imageUrl: null, images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('imageUrl is empty string, images[0] is real → images[0] promoted', () => {
  const r = resolveMedia({ imageUrl: '', images: [CDN] })
  assert.equal(r.primary, CDN)
})

// ── 5. data: URI rejection ────────────────────────────────────────────────────

test('data: URI in imageUrl rejected, falls back to images[]', () => {
  const r = resolveMedia({ imageUrl: 'data:image/png;base64,abc123==', images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('data: URI in images[] filtered out', () => {
  const r = resolveMedia({ imageUrl: null, images: ['data:image/png;base64,xyz', CDN] })
  assert.equal(r.primary, CDN)
  assert.deepEqual(r.gallery, [CDN])
})

test('all data: URIs → primary null, gallery empty', () => {
  const r = resolveMedia({
    imageUrl: 'data:image/jpeg;base64,abc',
    images:   ['data:image/png;base64,def'],
  })
  assert.equal(r.primary, null)
  assert.deepEqual(r.gallery, [])
})

// ── 6. blob: URL rejection ────────────────────────────────────────────────────

test('blob: URL in imageUrl rejected', () => {
  const r = resolveMedia({ imageUrl: 'blob:https://example.com/1234', images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('blob: URL in images[] filtered out', () => {
  const r = resolveMedia({ imageUrl: null, images: ['blob:https://example.com/x', CDN] })
  assert.deepEqual(r.gallery, [CDN])
})

// ── 7. Non-http(s) / malformed URL rejection ──────────────────────────────────

test('relative path rejected', () => {
  const r = resolveMedia({ imageUrl: '/images/product.jpg', images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('ftp: URL rejected', () => {
  const r = resolveMedia({ imageUrl: 'ftp://files.example.com/img.jpg', images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('bare filename rejected', () => {
  const r = resolveMedia({ imageUrl: 'product.jpg', images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('http:// URL accepted (non-https)', () => {
  const r = resolveMedia({ imageUrl: 'http://cdn.example.com/img.jpg', images: [] })
  assert.equal(r.primary, 'http://cdn.example.com/img.jpg')
})

// ── 8. Known placeholder patterns rejected ────────────────────────────────────

test('via.placeholder.com URL rejected', () => {
  const r = resolveMedia({ imageUrl: 'https://via.placeholder.com/300x300', images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('placehold.it URL rejected', () => {
  const r = resolveMedia({ imageUrl: 'https://placehold.it/300', images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('/placeholder path in URL rejected', () => {
  const r = resolveMedia({ imageUrl: 'https://example.com/placeholder/300', images: [CDN] })
  assert.equal(r.primary, CDN)
})

test('/no-image path rejected', () => {
  const r = resolveMedia({ imageUrl: 'https://example.com/no-image.png', images: [CDN] })
  assert.equal(r.primary, CDN)
})

// ── 9. Valid Cloudinary/CDN URLs preserved ────────────────────────────────────

test('Cloudinary URL with transform params accepted', () => {
  const url = 'https://res.cloudinary.com/dakio/image/upload/w_800,c_fill/product.jpg'
  const r = resolveMedia({ imageUrl: url, images: [] })
  assert.equal(r.primary, url)
})

test('S3 CDN URL accepted', () => {
  const url = 'https://mybucket.s3.amazonaws.com/products/img.webp'
  const r = resolveMedia({ imageUrl: url, images: [] })
  assert.equal(r.primary, url)
})

// ── 10. Empty / malformed images ──────────────────────────────────────────────

test('empty imageUrl and empty images[] → null', () => {
  const r = resolveMedia({ imageUrl: null, images: [] })
  assert.equal(r.primary, null)
  assert.deepEqual(r.gallery, [])
})

test('null values inside images[] are skipped', () => {
  const r = resolveMedia({ imageUrl: null, images: [null, undefined, '', CDN] })
  assert.equal(r.primary, CDN)
  assert.deepEqual(r.gallery, [CDN])
})

test('images field missing entirely', () => {
  const r = resolveMedia({ imageUrl: CDN })
  assert.equal(r.primary, CDN)
  assert.deepEqual(r.gallery, [CDN])
})

// ── 11. Deduplication ─────────────────────────────────────────────────────────

test('imageUrl appearing again in images[] shown once', () => {
  const r = resolveMedia({ imageUrl: CDN, images: [CDN, CDN2] })
  assert.equal(r.gallery.filter(u => u === CDN).length, 1)
  assert.deepEqual(r.gallery, [CDN, CDN2])
})

test('duplicate URLs inside images[] deduplicated', () => {
  const r = resolveMedia({ imageUrl: null, images: [CDN, CDN, CDN] })
  assert.deepEqual(r.gallery, [CDN])
})

test('case-insensitive deduplication (same URL, different casing)', () => {
  const upper = CDN.replace('product', 'PRODUCT')
  const r = resolveMedia({ imageUrl: CDN, images: [upper] })
  assert.equal(r.gallery.length, 1)
})

test('URLs with surrounding whitespace deduplicated correctly', () => {
  const r = resolveMedia({ imageUrl: CDN, images: [`  ${CDN}  `] })
  assert.equal(r.gallery.length, 1)
  assert.equal(r.gallery[0], CDN)
})

// ── 12. Card and detail resolve same primary image ────────────────────────────

test('card and detail see same primary for dropship product', () => {
  const product = { imageUrl: null, images: [CDN, CDN2] }
  assert.equal(resolveMedia(product).primary, resolveMedia(product).primary)
  assert.equal(resolveMedia(product).primary, CDN)
})

// ── 13. Gallery order preserved ───────────────────────────────────────────────

test('gallery: imageUrl first, images[] appended in order', () => {
  const r = resolveMedia({ imageUrl: CDN, images: [CDN2, CDN3] })
  assert.deepEqual(r.gallery, [CDN, CDN2, CDN3])
})

test('gallery: imageUrl null → images[] order preserved', () => {
  const r = resolveMedia({ imageUrl: null, images: [CDN, CDN2, CDN3] })
  assert.deepEqual(r.gallery, [CDN, CDN2, CDN3])
})
