import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PREFIX, metaEventFor, contactEventFor, pageTypeOf, ECOMMERCE_EVENTS } from './events.js'

test('every contract prefix is mapped', () => {
  assert.deepEqual(
    [...new Set(Object.values(PREFIX))].sort(),
    ['api', 'asi', 'atc', 'bc', 'ct', 'lead', 'lgn', 'pur', 'pv', 'rfc', 'si', 'srch', 'vc', 'vi', 'vil'],
  )
})

const ec = {
  currency: 'BDT', value: 1700, transaction_id: '#ABC-DEFG',
  items: [{ item_id: 'p1', item_name: 'Shirt', price: 850, quantity: 2 }],
}

test('Meta mapping follows contract item 5', () => {
  assert.equal(metaEventFor('page_view').name, 'PageView')
  assert.equal(metaEventFor('view_item', { ecommerce: ec }).name, 'ViewContent')
  assert.equal(metaEventFor('add_to_cart', { ecommerce: ec }).name, 'AddToCart')
  assert.equal(metaEventFor('begin_checkout', { ecommerce: ec }).name, 'InitiateCheckout')
  const asi = metaEventFor('add_shipping_info', { ecommerce: ec })
  assert.deepEqual([asi.name, asi.custom], ['AddShippingInfo', true])
  assert.equal(metaEventFor('add_payment_info', { ecommerce: ec }).name, 'AddPaymentInfo')
  assert.equal(metaEventFor('search', { params: { search_term: 'saree' } }).data.search_string, 'saree')
  for (const n of ['whatsapp_click', 'phone_call_click', 'email_click']) assert.equal(metaEventFor(n).name, 'Contact')
  assert.equal(metaEventFor('generate_lead').name, 'Lead')
  for (const n of ['view_item_list', 'select_item', 'view_cart', 'remove_from_cart', 'login']) assert.equal(metaEventFor(n), null)
})

test('Purchase carries value, currency, order_id, contents, num_items', () => {
  const m = metaEventFor('purchase', { ecommerce: ec })
  assert.equal(m.name, 'Purchase')
  assert.equal(m.custom, false)
  assert.deepEqual(m.data, {
    content_ids: ['p1'],
    contents: [{ id: 'p1', quantity: 2, item_price: 850 }],
    content_type: 'product',
    num_items: 2,
    order_id: '#ABC-DEFG',
    value: 1700,
    currency: 'BDT',
  })
})

test('contact links are recognised and their number masked', () => {
  const wa = contactEventFor('https://wa.me/8801712345678?text=hi')
  assert.equal(wa.name, 'whatsapp_click')
  assert.ok(!/\d/.test(wa.params.link_url))
  assert.equal(contactEventFor('tel:+8801712345678').params.link_url, 'tel:[phone]')
  assert.equal(contactEventFor('mailto:rahima@example.com').params.link_url, 'mailto:[email]')
  assert.equal(contactEventFor('https://api.whatsapp.com/send?phone=8801712345678').name, 'whatsapp_click')
  assert.equal(contactEventFor('https://example.com'), null)
})

test('page types for both route trees', () => {
  assert.equal(pageTypeOf('/glameen', 'path'), 'home')
  assert.equal(pageTypeOf('/glameen/p/shirt', 'path'), 'product')
  assert.equal(pageTypeOf('/products/shirt'), 'product')
  assert.equal(pageTypeOf('/shop'), 'shop')
  assert.equal(pageTypeOf('/shop/sarees'), 'collection')
  assert.equal(pageTypeOf('/checkout'), 'checkout')
  assert.equal(pageTypeOf('/f/eid-offer'), 'funnel')
  assert.equal(pageTypeOf('/about-us'), 'page')
  assert.ok(ECOMMERCE_EVENTS.has('purchase'))
})
