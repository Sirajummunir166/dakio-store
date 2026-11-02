import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deliveryCharge, freeDeliveryOver } from './delivery.js'

// RV-SST-05: checkout and the funnel's quick order form charge through one rule.
const ctx = (store) => ({ store })

test('district Dhaka at the inside rate, every other district at the outside rate; nothing before a district', () => {
  const c = ctx({ deliveryInsideDhaka: 70, deliveryOutsideDhaka: 150 })
  assert.equal(deliveryCharge(c, 'Dhaka', 1000), 70)
  assert.equal(deliveryCharge(c, 'Khulna', 1000), 150)
  assert.equal(deliveryCharge(c, '', 1000), 0)
})

test('the 60 / 120 defaults when the store set no rates; 0 is free', () => {
  assert.equal(deliveryCharge(ctx({}), 'Dhaka', 500), 60)
  assert.equal(deliveryCharge(ctx({}), 'Sylhet', 500), 120)
  assert.equal(deliveryCharge(ctx({ deliveryInsideDhaka: 0, deliveryOutsideDhaka: 0 }), 'Dhaka', 500), 0)
})

test('free once the goods reach the store threshold', () => {
  const c = ctx({ deliveryInsideDhaka: 60, deliveryOutsideDhaka: 120, freeDeliveryOver: 2000 })
  assert.equal(deliveryCharge(c, 'Khulna', 1999), 120)
  assert.equal(deliveryCharge(c, 'Khulna', 2000), 0)
  assert.equal(freeDeliveryOver(ctx({ freeDeliveryOver: 0 })), null)
  assert.equal(freeDeliveryOver(ctx({ freeDeliveryOver: 'x' })), null)
})
