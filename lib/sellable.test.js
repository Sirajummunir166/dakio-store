import test from 'node:test'
import assert from 'node:assert/strict'
import { sellable, sellableList } from './sellable.js'

test('a continue-selling product and its sizes never read as sold out', () => {
  const p = sellable({ id: 'a', continueSelling: true, totalStock: 0, variants: [{ id: 'S', stock: 0 }, { id: 'M', stock: 120 }] })
  assert.ok(p.totalStock > 0)
  assert.deepEqual(p.variants.map((v) => v.stock > 0), [true, true])
  assert.equal(p.variants[1].stock, 120)
})

test('a continue-selling add-on in pairings is not sold out either, on any main product', () => {
  const scarf = { id: 'scarf', continueSelling: true, variants: [{ id: 'S', name: 'S', stock: 0 }, { id: 'M', name: 'M', stock: 3 }] }
  const pin = { id: 'pin', variants: [{ id: 'X', name: 'X', stock: 0 }] }
  for (const main of [{ id: 'dress', totalStock: 5, pairings: [scarf, pin] }, { id: 'kaftan', continueSelling: true, totalStock: 0, pairings: [scarf, pin] }]) {
    const p = sellable(main)
    assert.deepEqual(p.pairings[0].variants.map((v) => v.stock > 0), [true, true])
    assert.equal(p.pairings[1], pin, 'an add-on without continue selling keeps its real stock')
  }
  assert.equal(scarf.variants[0].stock, 0, 'the API answer itself is not changed')
})

test('any other product is passed through untouched', () => {
  const p = { id: 'b', totalStock: 0, variants: [] }
  assert.equal(sellable(p), p)
  assert.deepEqual(sellableList([p]), [p])
  assert.equal(sellable(null), null)
})
