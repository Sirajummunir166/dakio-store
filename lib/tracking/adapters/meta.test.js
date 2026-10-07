import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createMetaAdapter } from './meta.js'
import { createConsent } from '../consent.js'

function fakeWin() {
  const appended = []
  return {
    appended,
    document: { createElement: (tag) => ({ tag }), head: { appendChild: (el) => appended.push(el) } },
  }
}
const calls = (win) => win.fbq.queue.map((a) => [...a])
const ec = { currency: 'BDT', value: 850, items: [{ item_id: 'p1', item_name: 'Shirt', price: 850, quantity: 1 }] }

test('loads fbevents once, disablePushState before the first init', () => {
  const win = fakeWin()
  const m = createMetaAdapter({ win })
  let pushStateAtInit = null
  assert.equal(m.addPixel('1234567890'), true)
  // the stub queued 'init' — disablePushState was already set on it
  pushStateAtInit = win.fbq.disablePushState
  assert.equal(pushStateAtInit, true)
  assert.deepEqual(calls(win)[0], ['init', '1234567890'])
  m.addPixel('9999999999')
  assert.equal(win.appended.length, 1, 'one fbevents.js')
  assert.ok(win.appended[0].src.includes('connect.facebook.net/en_US/fbevents.js'))
})

test('invalid or duplicate pixel ids are refused', () => {
  const win = fakeWin()
  const m = createMetaAdapter({ win })
  assert.equal(m.addPixel("123');alert(1)//"), false)
  assert.equal(m.addPixel('123'), false)
  assert.equal(win.fbq, undefined, 'nothing loaded for a bad id')
  assert.equal(m.addPixel('1234567890'), true)
  assert.equal(m.addPixel('1234567890'), false)
})

test('trackSingle per pixel with {eventID}; AddShippingInfo is custom', () => {
  const win = fakeWin()
  const m = createMetaAdapter({ win })
  m.addPixel('1111111111')
  m.addPixel('2222222222')
  m.handle('add_to_cart', { eventId: 'atc_abcdefgh', ecommerce: ec })
  m.handle('add_shipping_info', { eventId: 'asi_abcdefgh', ecommerce: ec })
  m.handle('view_cart', { eventId: 'vc_abcdefgh', ecommerce: ec })
  const sent = calls(win).filter((c) => c[0].startsWith('track'))
  assert.deepEqual(sent.map((c) => [c[0], c[1], c[2], c[4].eventID]), [
    ['trackSingle', '1111111111', 'AddToCart', 'atc_abcdefgh'],
    ['trackSingle', '2222222222', 'AddToCart', 'atc_abcdefgh'],
    ['trackSingleCustom', '1111111111', 'AddShippingInfo', 'asi_abcdefgh'],
    ['trackSingleCustom', '2222222222', 'AddShippingInfo', 'asi_abcdefgh'],
  ])
  assert.deepEqual(sent[0][3].content_ids, ['p1'])
})

test('a funnel pixel added after the page view still gets that PageView', () => {
  const win = fakeWin()
  const m = createMetaAdapter({ win })
  m.addPixel('1111111111')
  m.handle('page_view', { eventId: 'pv_abcdefgh' })
  m.addPixel('2222222222')
  const pv = calls(win).filter((c) => c[2] === 'PageView')
  assert.deepEqual(pv.map((c) => [c[1], c[4].eventID]), [['1111111111', 'pv_abcdefgh'], ['2222222222', 'pv_abcdefgh']])
})

test('nothing is sent while ad_storage consent is denied', () => {
  const win = fakeWin()
  const consent = createConsent({ ad_storage: 'denied' })
  const m = createMetaAdapter({ win, consent })
  m.addPixel('1111111111')
  m.handle('purchase', { eventId: 'pur_abcdefgh', ecommerce: ec })
  assert.equal(calls(win).filter((c) => c[0].startsWith('track')).length, 0)
})
