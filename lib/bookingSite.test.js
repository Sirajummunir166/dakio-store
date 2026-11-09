import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bookingLang, bookingOnlyDoc, bookingDocOf, carryQuery, isEmbed } from './bookingSite.js'

test('the page language: ?lang=en or bn, else Bangla', () => {
  assert.equal(bookingLang({ lang: 'en' }), 'en')
  assert.equal(bookingLang({ lang: 'EN' }), 'en')
  assert.equal(bookingLang({ lang: 'fr' }), 'bn')
  assert.equal(bookingLang({}), 'bn')
})

test('a published site always wins', () => {
  const site = { theme: {}, pages: [] }
  assert.deepEqual(bookingDocOf({ site }, { business: { booking: { on: true } } }), { doc: site, standalone: false })
})

test('no site: the stand-in page when the business takes bookings, nothing otherwise', () => {
  const store = { name: 'Glow', phone: '01700000000', business: { booking: { on: true } } }
  const shown = bookingDocOf({ site: null }, store, { lang: 'en' })
  assert.equal(shown.standalone, true)
  assert.equal(shown.doc.theme.brandName, 'Glow')
  assert.equal(shown.doc.theme.lang, 'en')
  assert.equal(shown.doc.menus.bar.call, true)
  assert.equal(bookingDocOf({ site: null }, { name: 'Shop', business: {} }), null)
  // A client's own booking page always opens: the booking exists.
  assert.equal(bookingDocOf({ site: null }, { name: 'Shop', business: {} }, { always: true }).standalone, true)
})

test('the stand-in uses only an https logo and no phone buttons without a phone', () => {
  const doc = bookingOnlyDoc({ name: 'A', logoUrl: 'http://x/logo.png' })
  assert.equal(doc.theme.brandMode, 'text')
  assert.deepEqual(doc.assets, {})
  assert.equal(doc.menus.bar.call, false)
  assert.deepEqual(doc.pages[0].sections, [])
  assert.equal(bookingOnlyDoc({ name: 'A', logoUrl: 'https://x/logo.png' }).assets['st-brand-logo'], 'https://x/logo.png')
})

test('embed and language carry to the client booking page', () => {
  assert.equal(isEmbed({ embed: '1' }), true)
  assert.equal(isEmbed({}), false)
  assert.equal(carryQuery({ embed: '1', lang: 'en' }), '?embed=1&lang=en')
  assert.equal(carryQuery({ lang: 'xx' }), '')
})
