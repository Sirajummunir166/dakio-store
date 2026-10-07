import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeUrl, isExcludedLocation } from './url.js'

test('sanitizeUrl strips token, previewToken and q, keeps utm and click ids', () => {
  const u = sanitizeUrl('https://store.dakio.io/glameen/shop?q=01712345678&token=abc&previewToken=x&utm_source=fb&fbclid=IwAR_Abc&gclid=Cj0K#sec-1')
  assert.equal(u, 'https://store.dakio.io/glameen/shop?utm_source=fb&fbclid=IwAR_Abc&gclid=Cj0K')
})

test('sanitizeUrl masks the order tracking code', () => {
  assert.equal(sanitizeUrl('https://glameen.dakio.shop/track/ABCD1234'), 'https://glameen.dakio.shop/track/redacted')
})

test('a query value that is itself a phone or an email is redacted; a numeric campaign id is not', () => {
  const u = new URL(sanitizeUrl('https://x.dakio.shop/?ph=%2B8801712345678&e=a%40b.co&utm_campaign=120208291234567'))
  assert.equal(u.searchParams.get('ph'), 'redacted')
  assert.equal(u.searchParams.get('e'), 'redacted')
  assert.equal(u.searchParams.get('utm_campaign'), '120208291234567')
})

test('a phone in Bengali digits in a query value is redacted', () => {
  const u = new URL(sanitizeUrl('https://x.dakio.shop/?phone=' + encodeURIComponent('০১৭১২৩৪৫৬৭৮') + '&size=' + encodeURIComponent('৪২')))
  assert.equal(u.searchParams.get('phone'), 'redacted')
  assert.equal(u.searchParams.get('size'), '৪২')
})

test('sanitizeUrl rejects non-http and junk', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), '')
  assert.equal(sanitizeUrl('not a url'), '')
  assert.equal(sanitizeUrl(''), '')
})

test('excluded pages: preview, studio-preview, track, token URLs', () => {
  assert.equal(isExcludedLocation({ pathname: '/glameen/preview/fashion' }, 'path'), true)
  assert.equal(isExcludedLocation({ pathname: '/glameen/studio-preview' }, 'path'), true)
  assert.equal(isExcludedLocation({ pathname: '/track/ABC' }, 'domain'), true)
  assert.equal(isExcludedLocation({ pathname: '/', search: '?token=x' }, 'domain'), true)
  assert.equal(isExcludedLocation({ pathname: '/glameen/p/x', search: '?previewToken=x' }, 'path'), true)
  assert.equal(isExcludedLocation({ pathname: '/glameen/checkout' }, 'path'), false)
  // a store whose slug is "track" is still a store home on the path tree
  assert.equal(isExcludedLocation({ pathname: '/track' }, 'path'), false)
})
