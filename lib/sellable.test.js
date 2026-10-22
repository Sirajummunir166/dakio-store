import test from 'node:test'
import assert from 'node:assert/strict'
import { sellable, sellableList } from './sellable.js'

test('a continue-selling product and its sizes never read as sold out', () => {
  const p = sellable({ id: 'a', continueSelling: true, totalStock: 0, variants: [{ id: 'S', stock: 0 }, { id: 'M', stock: 120 }] })
  assert.ok(p.totalStock > 0)
  assert.deepEqual(p.variants.map((v) => v.stock > 0), [true, true])
  assert.equal(p.variants[1].stock, 120)
})

test('any other product is passed through untouched', () => {
  const p = { id: 'b', totalStock: 0, variants: [] }
  assert.equal(sellable(p), p)
  assert.deepEqual(sellableList([p]), [p])
  assert.equal(sellable(null), null)
})
