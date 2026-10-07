import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildEnvelope, redactPII } from './schema.js'

const ec = { currency: 'BDT', value: 850, items: [{ item_id: 'p1', item_name: 'Shirt', price: 850, quantity: 1 }] }

test('an ecommerce event is two pushes: {ecommerce:null} first, then the envelope', () => {
  const pushes = buildEnvelope({ event: 'view_item', eventId: 'vi_1234567890', store: 'glameen', storeId: 't1', pageType: 'product', consent: { ad_storage: 'granted' }, ecommerce: ec })
  assert.equal(pushes.length, 2)
  assert.deepEqual(pushes[0], { ecommerce: null })
  const env = pushes[1]
  assert.equal(env.event, 'view_item')
  assert.equal(env.event_id, 'vi_1234567890')
  assert.deepEqual(env.dk, { v: 1, store: 'glameen', store_id: 't1', page_type: 'product', sent_by: 'dakio-store', consent: { ad_storage: 'granted' } })
  assert.deepEqual(env.ecommerce, ec)
  assert.equal(env.value, undefined, 'view_item carries no legacy mirror')
})

test('add_to_cart / begin_checkout / purchase mirror the old top-level fields', () => {
  for (const event of ['add_to_cart', 'begin_checkout', 'purchase']) {
    const env = buildEnvelope({ event, eventId: 'x_1234567890', ecommerce: { ...ec, transaction_id: '#A-1' } })[1]
    assert.equal(env.value, 850)
    assert.equal(env.currency, 'BDT')
    assert.deepEqual(env.items, ec.items)
    if (event === 'purchase') assert.equal(env.transaction_id, '#A-1')
  }
})

test('a non-ecommerce event is one push with its params', () => {
  const pushes = buildEnvelope({ event: 'search', eventId: 'srch_1234567890', params: { search_term: 'saree' } })
  assert.equal(pushes.length, 1)
  assert.equal(pushes[0].search_term, 'saree')
})

test('emails and phone numbers never survive into a push', () => {
  assert.equal(redactPII('call 01712-345678 or rahima@example.com'), 'call [phone] or [email]')
  assert.equal(redactPII('+8801712345678'), '[phone]')
  const env = buildEnvelope({ event: 'search', eventId: 'srch_1234567890', params: { search_term: '01712345678', nested: { note: 'me@x.io' } } })[0]
  assert.equal(env.search_term, '[phone]')
  assert.equal(env.nested.note, '[email]')
})

test('a phone typed in Bengali digits is redacted too; other Bengali digits are kept', () => {
  assert.equal(redactPII('০১৭১২৩৪৫৬৭৮'), '[phone]')
  assert.equal(redactPII('কল ০১৭১২-৩৪৫৬৭৮ করুন'), 'কল [phone] করুন')
  assert.equal(redactPII('+৮৮০১৭১২৩৪৫৬৭৮'), '[phone]')
  assert.equal(redactPII('দাম ৫০০ টাকা'), 'দাম ৫০০ টাকা')
  const env = buildEnvelope({ event: 'search', eventId: 'srch_1234567890', params: { search_term: '০১৭১২৩৪৫৬৭৮' } })[0]
  assert.equal(env.search_term, '[phone]')
})

test('envelope fields cannot be overridden by params', () => {
  const env = buildEnvelope({ event: 'login', eventId: 'lgn_1234567890', params: { event: 'purchase', event_id: 'evil', dk: 1 } })[0]
  assert.equal(env.event, 'login')
  assert.equal(env.event_id, 'lgn_1234567890')
  assert.equal(env.dk.v, 1)
})

test('catalog text keeps its digits; shopper text is still redacted', () => {
  const pushes = buildEnvelope({
    event: 'view_item', eventId: 'vi_12345678',
    ecommerce: { currency: 'BDT', items: [{ item_id: 'p1', item_name: 'Spain Jersey Red 2008-2009', item_category: 'Kits 2024 2025 1999' }] },
    params: { search_term: 'jersey 01712345678' },
  })
  const env = pushes[pushes.length - 1]
  assert.equal(env.ecommerce.items[0].item_name, 'Spain Jersey Red 2008-2009')
  assert.equal(env.ecommerce.items[0].item_category, 'Kits 2024 2025 1999')
  assert.equal(env.search_term, 'jersey [phone]')
})
