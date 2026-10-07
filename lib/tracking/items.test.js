import { test } from 'node:test'
import assert from 'node:assert/strict'
import { itemFromStudio, itemFromBasic, itemFromCartLine, cartFingerprint, purchaseFromResponse, listPayload } from './items.js'

const shirt = { id: 'p1', n: 'Linen Shirt', sku: 'LS-1', pr: 850, col: 'c1', vars: [{ id: 'v-m', n: 'M', stock: 3, pr: null }, { id: 'v-xl', n: 'XL', stock: 2, pr: 990 }] }
const cols = [{ id: 'c1', n: 'Shirts' }]

test('a Studio product at a size → its variant, its price, its collection', () => {
  assert.deepEqual(itemFromStudio(shirt, { size: 'XL', qty: 2, index: 0, list: { id: 'shop', name: 'Shop all' }, collections: cols }), {
    item_id: 'p1', item_name: 'Linen Shirt', item_variant: 'XL', item_variant_id: 'v-xl', item_sku: 'LS-1',
    item_category: 'Shirts', price: 990, quantity: 2, index: 0, item_list_id: 'shop', item_list_name: 'Shop all',
  })
  assert.equal(itemFromStudio(shirt, { size: 'M' }).price, 850)
  assert.equal(itemFromStudio(shirt, { size: 'M', price: 700 }).price, 700, 'a bag line\'s together price wins')
})

test('a basic normalized product and a raw API product', () => {
  const norm = { id: 'p2', name: 'Panjabi', sku: 'PJ', price: 2900, category: { id: 'c', name: 'Menswear' }, variants: [{ id: 'v1', name: 'L', price: 3100, sku: 'PJ-L' }] }
  assert.deepEqual(itemFromBasic(norm, { variant: norm.variants[0], qty: 1 }), {
    item_id: 'p2', item_name: 'Panjabi', item_variant: 'L', item_variant_id: 'v1', item_sku: 'PJ-L', item_category: 'Menswear', price: 3100, quantity: 1,
  })
  assert.equal(itemFromBasic({ id: 'p3', name: 'Raw', sellingPrice: 500 }).price, 500)
})

test('a cart line, with a delta quantity', () => {
  const l = { productId: 'p1', variantId: 'v-m', name: 'Linen Shirt — M', sku: 'LS-1', unitPrice: 850, qty: 3 }
  assert.equal(itemFromCartLine(l).quantity, 3)
  assert.equal(itemFromCartLine(l, { qty: 1 }).quantity, 1)
  assert.equal(itemFromCartLine({ productId: 'p1', price: 10, qty: 1 }).price, 10)
})

test('the cart fingerprint ignores line order and changes with quantity', () => {
  const a = [itemFromStudio(shirt, { size: 'M' }), itemFromBasic({ id: 'p9', name: 'x', price: 1 })]
  assert.equal(cartFingerprint(a), cartFingerprint([...a].reverse()))
  assert.notEqual(cartFingerprint(a), cartFingerprint([itemFromStudio(shirt, { size: 'M', qty: 2 }), a[1]]))
  assert.equal(cartFingerprint([]), '')
})

test('purchase is built from the API answer (contract 3)', () => {
  const ec = purchaseFromResponse({
    orderNumber: '#GLM-AB12', orderId: 'ord1', eventId: 'pur_x', currency: 'BDT',
    subtotal: 1840, discount: 100, shipping: 60, total: 1800, value: 1740, coupon: 'EID10',
    items: [{ productId: 'p1', variantId: 'v-xl', sku: 'LS-1', name: 'Linen Shirt — XL', qty: 1, unitPrice: 990 }, { productId: 'p2', variantId: null, sku: null, name: 'Panjabi', qty: 1, unitPrice: 850 }],
  }, { items: [], value: 1, currency: 'USD', paymentType: 'COD' })
  assert.equal(ec.transaction_id, '#GLM-AB12')
  assert.equal(ec.value, 1740)
  assert.equal(ec.currency, 'BDT')
  assert.equal(ec.shipping, 60)
  assert.equal(ec.coupon, 'EID10')
  assert.equal(ec.payment_type, 'COD')
  assert.deepEqual(ec.items[0], { item_id: 'p1', item_name: 'Linen Shirt — XL', item_variant_id: 'v-xl', item_sku: 'LS-1', price: 990, quantity: 1, index: 0 })
})

test('an older API (orderNumber/orderId only) falls back to the client cart', () => {
  const items = [itemFromStudio(shirt, { size: 'M', qty: 2 })]
  const ec = purchaseFromResponse({ orderNumber: '#A', orderId: 'o' }, { items, value: 1600, currency: 'BDT' })
  assert.equal(ec.value, 1600)
  assert.deepEqual(ec.items, items)
  assert.equal(purchaseFromResponse({ orderNumber: '#A', subtotal: 1000, discount: 200 }).value, 800)
})

test('listPayload wraps a list for view_item_list / select_item', () => {
  const p = listPayload({ id: 'shop', name: 'Shop all' }, [null, itemFromStudio(shirt)])
  assert.equal(p.ecommerce.item_list_id, 'shop')
  assert.equal(p.ecommerce.items.length, 1)
})
