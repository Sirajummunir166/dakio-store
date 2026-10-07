import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildTracking } from './context.js'

const env = {
  attribution: {
    first: null,
    last: {
      at: 1000,
      click: { fbclid: { v: 'IwAR_AbC', at: 1000 }, gclid: { v: 'Cj0K', at: 900 } },
      utm: { source: 'facebook', campaign: 'eid' },
      landing_url: 'https://glameen.dakio.shop/p/shirt?fbclid=IwAR_AbC',
      referrer: 'https://l.facebook.com/',
    },
  },
  ids: { fbp: 'fb.1.1700000000000.123', fbc: 'fb.1.1700000000000.IwAR_AbC' },
  href: 'https://glameen.dakio.shop/checkout?token=secret&q=01712345678',
  landing: '',
}

test('the contract-2 tracking object', () => {
  assert.deepEqual(buildTracking('pur_12345678', {}, env), {
    v: 1,
    event_id: 'pur_12345678',
    ids: { fbp: 'fb.1.1700000000000.123', fbc: 'fb.1.1700000000000.IwAR_AbC' },
    click: { fbclid: { v: 'IwAR_AbC', at: 1000 }, gclid: { v: 'Cj0K', at: 900 } },
    utm: { source: 'facebook', campaign: 'eid' },
    page_url: 'https://glameen.dakio.shop/checkout',
    landing_url: 'https://glameen.dakio.shop/p/shirt?fbclid=IwAR_AbC',
    referrer: 'https://l.facebook.com/',
  })
})

test('leads carry the begin_checkout id too; a bad id gives no tracking at all', () => {
  const t = buildTracking('asi_12345678', { checkout_event_id: 'bc_12345678' }, env)
  assert.equal(t.checkout_event_id, 'bc_12345678')
  assert.equal(buildTracking('asi_12345678', { checkout_event_id: 'x' }, env).checkout_event_id, undefined)
  assert.equal(buildTracking('bad id!', {}, env), undefined)
})

test('a visit with no attribution sends just the id and the page', () => {
  assert.deepEqual(buildTracking('pur_12345678', {}, { attribution: { first: null, last: null }, ids: {}, href: 'https://a.com/checkout' }), {
    v: 1, event_id: 'pur_12345678', page_url: 'https://a.com/checkout',
  })
})
