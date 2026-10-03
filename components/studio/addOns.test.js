import { test } from 'node:test'
import assert from 'node:assert/strict'
import { catProduct, livePairs, priceAddOns, bagSuggestion, toStudioPairs } from './addOns.js'
import { repriceCart } from '../../lib/addOnCart.js'
import { toStudioCatalog } from './publicCatalog.js'

// Goes well with (DAKIO_PAIRINGS_PLAN.md cut 2): both stores price an add-on
// line by the server's rule — together price beside its main product, up to
// its quantity, only when lower — so checkout never refuses a shown price.

const api = [
  { id: 'dress', name: 'Kaftan', sellingPrice: 1480, totalStock: 5, variants: [], pairings: [
    { id: 'belt', name: 'Belt', slug: 'belt', imageUrl: null, price: 450, togetherPrice: 350, reason: 'cinches it', variants: [] },
    { id: 'scarf', name: 'Scarf', slug: 'scarf', imageUrl: null, price: 600, togetherPrice: null, reason: '', variants: [{ id: 'v1', name: 'Red', price: null, stock: 0 }, { id: 'v2', name: 'Blue', price: 650, stock: 3 }] },
  ] },
  { id: 'scarf', name: 'Scarf', sellingPrice: 600, totalStock: 3, variants: [], pairings: [] },
]

test('the public catalog carries pairs, and add-ons outside the list ride in extra', () => {
  const cat = toStudioCatalog(api, [])
  assert.deepEqual(cat.products[0].pairs.map((a) => [a.id, a.together, a.reason]), [['belt', 350, 'cinches it'], ['scarf', null, '']])
  assert.deepEqual(cat.extra.map((p) => p.id), ['belt'], 'scarf is already listed')
  assert.equal(catProduct(cat, 'belt').pr, 450)
  assert.equal(cat.products[0].pairs[1].p.stock, 3)
  assert.equal(cat.products[0].pairs[1].p.sizes, 'Red, Blue')
})

test('Studio bag: together price beside the main, normal price otherwise', () => {
  const cat = toStudioCatalog(api, [])
  const line = (pid, qty, addOnOf) => ({ pid, qty, size: null, addOnOf, p: { ...catProduct(cat, pid) } })
  const both = priceAddOns([line('dress', 1), line('belt', 1, 'dress')], cat)
  assert.equal(both[1].p.pr, 350)
  assert.equal(both[1].p.was, 450)
  assert.equal(priceAddOns([line('belt', 1, 'dress')], cat)[0].p.pr, 450, 'no main in the bag')
  assert.equal(priceAddOns([line('dress', 1), line('belt', 2, 'dress')], cat)[1].p.pr, 450, 'more add-ons than mains')
  assert.equal(priceAddOns([line('dress', 1), line('belt', 1)], cat)[1].p.pr, 450, 'bought on its own')
})

test('Studio cart suggestion: the first unpaired add-on in stock, never one already in the bag', () => {
  const cat = toStudioCatalog(api, [])
  const s = bagSuggestion([{ pid: 'dress', qty: 1 }], cat)
  assert.equal(s.pair.id, 'belt')
  assert.equal(bagSuggestion([{ pid: 'dress', qty: 1 }, { pid: 'belt', qty: 1, addOnOf: 'dress' }], cat).pair.id, 'scarf')
  assert.equal(livePairs({ pairs: toStudioPairs([{ id: 'x', name: 'X', price: 1, variants: [{ id: 'v', name: 'S', stock: 0 }] }]) }).length, 0, 'sold out everywhere')
})

test('basic store cart: unitPrice follows the rule on every change', () => {
  const main = { key: 'dress', productId: 'dress', qty: 1, unitPrice: 1480 }
  const add = { key: 'belt:addon:dress', productId: 'belt', qty: 1, unitPrice: 450, addOnOf: 'dress', basePrice: 450, togetherPrice: 350 }
  assert.equal(repriceCart([main, add])[1].unitPrice, 350)
  assert.equal(repriceCart([add])[0].unitPrice, 450, 'main removed: back to normal')
  assert.equal(repriceCart([main, { ...add, qty: 2 }])[1].unitPrice, 450)
  const plain = [main]
  assert.equal(repriceCart(plain), plain, 'a cart without add-ons is untouched')
})

test('review: chained add-ons and split lines get the normal price in both carts (the server rule)', () => {
  const cat = toStudioCatalog([
    ...api,
    { id: 'pin', name: 'Pin', sellingPrice: 80, totalStock: 9, variants: [], pairings: [] },
  ], [])
  cat.products.find((p) => p.id === 'scarf').pairs = toStudioPairs([{ id: 'pin', name: 'Pin', price: 80, togetherPrice: 50, variants: [] }])
  const line = (pid, qty, addOnOf, size = null) => ({ pid, qty, size, addOnOf, p: { ...catProduct(cat, pid) } })
  // Kaftan → scarf (an add-on line) → pin: the scarf is not a "main".
  const chained = priceAddOns([line('dress', 1), line('scarf', 1, 'dress'), line('pin', 1, 'scarf')], cat)
  assert.equal(chained[2].p.pr, 80)
  // One kaftan, the belt in two lines: more add-ons than mains.
  const split = priceAddOns([line('dress', 1), line('belt', 1, 'dress', 'a'), line('belt', 1, 'dress', 'b')], cat)
  assert.deepEqual(split.slice(1).map((l) => l.p.pr), [450, 450])
  const main = { key: 'dress', productId: 'dress', qty: 1, unitPrice: 1480 }
  const b = (k) => ({ key: k, productId: 'belt', qty: 1, unitPrice: 450, addOnOf: 'dress', basePrice: 450, togetherPrice: 350 })
  assert.deepEqual(repriceCart([main, b('x'), b('y')]).slice(1).map((l) => l.unitPrice), [450, 450])
  const chainedBasic = repriceCart([main, { key: 's', productId: 'scarf', qty: 1, addOnOf: 'dress', basePrice: 600, togetherPrice: null, unitPrice: 600 }, { key: 'p', productId: 'pin', qty: 1, addOnOf: 'scarf', basePrice: 80, togetherPrice: 50, unitPrice: 80 }])
  assert.equal(chainedBasic[2].unitPrice, 80)
})
