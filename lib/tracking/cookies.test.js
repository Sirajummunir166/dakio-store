import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readCookie, readAdIds, isSharedHost, fbclidOfFbc } from './cookies.js'

const cookie = '_fbp=fb.1.1700000000000.123456789; _fbc=fb.1.1700000000001.IwAR_Ours.x; _ga=GA1.1.1.2; _ttp=ttp1; other=1'

test('readCookie finds a cookie by exact name', () => {
  assert.equal(readCookie('_fbp', cookie), 'fb.1.1700000000000.123456789')
  assert.equal(readCookie('_fb', cookie), null)
  assert.equal(readCookie('x', ''), null)
})

test('on a store\'s own domain _fbc is used as is', () => {
  const ids = readAdIds({ cookie, hostname: 'shop.glameen.com' })
  assert.equal(ids.fbp, 'fb.1.1700000000000.123456789')
  assert.equal(ids.fbc, 'fb.1.1700000000001.IwAR_Ours.x')
  assert.equal(ids.ga, 'GA1.1.1.2')
  assert.equal(ids.ttp, 'ttp1')
})

test('on a shared Dakio host _fbc is used only when it is our own captured fbclid', () => {
  assert.ok(isSharedHost('glameen.dakio.shop'))
  assert.ok(isSharedHost('store.dakio.io'))
  assert.ok(!isSharedHost('shop.glameen.com'))
  assert.equal(readAdIds({ cookie, hostname: 'glameen.dakio.shop' }).fbc, undefined)
  assert.equal(readAdIds({ cookie, hostname: 'glameen.dakio.shop', fbclid: 'IwAR_Other' }).fbc, undefined)
  assert.equal(readAdIds({ cookie, hostname: 'store.dakio.io', fbclid: 'IwAR_Ours.x' }).fbc, 'fb.1.1700000000001.IwAR_Ours.x')
  assert.equal(fbclidOfFbc('fb.1.123.a.b'), 'a.b')
})

test('malformed fb cookies are dropped', () => {
  const ids = readAdIds({ cookie: '_fbp=<script>; _fbc=fb.x.1.y', hostname: 'a.com' })
  assert.equal(ids.fbp, undefined)
  assert.equal(ids.fbc, undefined)
})
