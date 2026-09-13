import { test } from 'node:test'
import assert from 'node:assert/strict'
import { variantFor, sizeInStock, firstInStockSize, priceFor, orderVariantId } from './variants.js'

const shirt = {
  id: 'p1', pr: 850,
  vars: [
    { id: 'v-s', n: 'S', stock: 0, pr: null },
    { id: 'v-m', n: 'M', stock: 4, pr: null },
    { id: 'v-xl', n: 'XL', stock: 2, pr: 990 },
  ],
}
// Sizes typed into Studio's Catalog tab — no variant rows behind them.
const attrOnly = { id: 'p2', pr: 500, vars: [] }

test('a size maps to its variant by name, ignoring case and spaces', () => {
  assert.equal(variantFor(shirt, 'm').id, 'v-m')
  assert.equal(variantFor(shirt, ' XL ').id, 'v-xl')
  assert.equal(variantFor(shirt, 'XXL'), null)
  assert.equal(variantFor(shirt, null), null)
})

test('sold-out sizes are not in stock; attribute-only sizes always are', () => {
  assert.equal(sizeInStock(shirt, 'S'), false)
  assert.equal(sizeInStock(shirt, 'M'), true)
  assert.equal(sizeInStock(attrOnly, 'L'), true)
})

test('preselects the first size that can be bought', () => {
  assert.equal(firstInStockSize(shirt, ['S', 'M', 'XL']), 'M')
  assert.equal(firstInStockSize({ ...shirt, vars: shirt.vars.map((v) => ({ ...v, stock: 0 })) }, ['S', 'M', 'XL']), null)
  assert.equal(firstInStockSize(attrOnly, ['S', 'M']), 'S')
})

test('a variant price overrides the product price', () => {
  assert.equal(priceFor(shirt, 'XL'), 990)
  assert.equal(priceFor(shirt, 'M'), 850)
  assert.equal(priceFor(attrOnly, 'M'), 500)
  assert.equal(priceFor(shirt, null), 850)
})

test('checkout sends the real variant id, or null when there is no variant', () => {
  assert.equal(orderVariantId(shirt, 'M'), 'v-m')
  assert.equal(orderVariantId(attrOnly, 'M'), null)
  assert.equal(orderVariantId(shirt, null), null)
})
