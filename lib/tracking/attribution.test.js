import { test } from 'node:test'
import assert from 'node:assert/strict'
import { captureAttribution, readAttribution, attrKey, sessionLanding, TTL_MS, parseTouch } from './attribution.js'

function memStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)) },
    removeItem: (k) => { m.delete(k) },
    _m: m,
  }
}
const DAY = 24 * 60 * 60 * 1000

test('click ids and utm are captured case-preserved, per store key', () => {
  const storage = memStorage(), session = memStorage()
  const href = 'https://store.dakio.io/glameen?fbclid=IwAR_AbC.dEf&ScCid=SnApX&utm_source=Facebook&utm_campaign=Eid&token=secret'
  const a = captureAttribution('glameen', { href, search: new URL(href).search, referrer: 'https://l.facebook.com/', storage, session, now: 1000 })
  assert.deepEqual(a.last.click.fbclid, { v: 'IwAR_AbC.dEf', at: 1000 })
  assert.deepEqual(a.last.click.sc_click_id, { v: 'SnApX', at: 1000 })
  assert.deepEqual(a.last.utm, { source: 'Facebook', campaign: 'Eid' })
  assert.ok(!a.last.landing_url.includes('token'), 'landing url is sanitized')
  assert.equal(a.last.referrer, 'https://l.facebook.com/')
  assert.ok(storage.getItem(attrKey('glameen')))
  assert.equal(storage.getItem(attrKey('other')), null)
  assert.ok(sessionLanding('glameen', session).startsWith('https://store.dakio.io/glameen'))
})

test('last touch per click type; first touch kept', () => {
  const storage = memStorage()
  captureAttribution('s', { search: '?gclid=G1&utm_source=google', storage, now: 1000 })
  const b = captureAttribution('s', { search: '?fbclid=F1&utm_source=fb', storage, now: 2000 })
  assert.equal(b.last.click.gclid.v, 'G1', 'an older gclid survives a newer fbclid')
  assert.equal(b.last.click.fbclid.v, 'F1')
  assert.deepEqual(b.last.utm, { source: 'fb' })
  assert.equal(b.first.click.gclid.v, 'G1')
  assert.equal(b.first.click.fbclid, undefined)
  const c = captureAttribution('s', { search: '?fbclid=F2', storage, now: 3000 })
  assert.equal(c.last.click.fbclid.v, 'F2')
  assert.deepEqual(c.last.utm, { source: 'fb' }, 'no new utm → the last campaign stays')
})

test('a page with no touch changes nothing', () => {
  const storage = memStorage()
  captureAttribution('s', { search: '?fbclid=F1', storage, now: 1000 })
  const before = storage.getItem(attrKey('s'))
  captureAttribution('s', { search: '?q=shirt', storage, now: 5000 })
  assert.equal(storage.getItem(attrKey('s')), before)
})

test('touches expire after 90 days, per click type', () => {
  const storage = memStorage()
  captureAttribution('s', { search: '?gclid=OLD', storage, now: 0 })
  captureAttribution('s', { search: '?fbclid=NEW', storage, now: 80 * DAY })
  const r = readAttribution('s', { storage, now: 95 * DAY })
  assert.equal(r.last.click.gclid, undefined)
  assert.equal(r.last.click.fbclid.v, 'NEW')
  assert.equal(r.first, null, 'the first touch is older than 90 days')
  assert.equal(readAttribution('s', { storage, now: 80 * DAY + TTL_MS }).last, null)
})

test('blocked or corrupt storage never throws', () => {
  const throwing = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
  assert.doesNotThrow(() => captureAttribution('s', { href: 'https://x.io/?fbclid=1', search: '?fbclid=1', storage: throwing, session: throwing }))
  const bad = memStorage(); bad.setItem(attrKey('s'), '{not json')
  assert.deepEqual(readAttribution('s', { storage: bad }), { first: null, last: null })
  assert.deepEqual(readAttribution('s', {}), { first: null, last: null })
})

test('values are capped', () => {
  const t = parseTouch('?fbclid=' + 'a'.repeat(900) + '&utm_term=' + 'b'.repeat(500), 1)
  assert.equal(t.click.fbclid.v.length, 512)
  assert.equal(t.utm.term.length, 200)
})
