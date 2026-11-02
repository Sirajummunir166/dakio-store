// Campaigns audit CMP-14: the default theme shows a running sale and the
// campaign's banner — the API sent both, the theme dropped both.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeProduct } from './normalizers/normalizeProduct.js'
import { normalizeStore } from './normalizers/normalizeStore.js'

test('a sale price shows its pre-sale price (API compareAtPrice) as the struck "was"', () => {
  const p = normalizeProduct({ id: 'p', name: 'Saree', sellingPrice: 800, compareAtPrice: 1000 })
  assert.equal(p.price, 800)
  assert.equal(p.comparePrice, 1000)
  assert.equal(p.discount.percent, 20)
})

test('no sale, or a compare-at price not above the price: no "was"', () => {
  assert.equal(normalizeProduct({ id: 'p', sellingPrice: 800, compareAtPrice: null }).comparePrice, null)
  assert.equal(normalizeProduct({ id: 'p', sellingPrice: 800, compareAtPrice: 800 }).comparePrice, null)
  // A merchant MRP still wins when it is there.
  assert.equal(normalizeProduct({ id: 'p', sellingPrice: 800, mrp: 1200, compareAtPrice: 1000 }).comparePrice, 1200)
})

test('the running campaign banner reaches the theme', () => {
  assert.equal(normalizeStore({ name: 'S', campaignBanner: { text: 'Puja sale 20% off', campaignId: 'c' } }).campaignBanner, 'Puja sale 20% off')
  assert.equal(normalizeStore({ name: 'S', campaignBanner: null }).campaignBanner, null)
})
