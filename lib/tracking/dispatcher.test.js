import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createDispatcher } from './dispatcher.js'
import { createMetaAdapter } from './adapters/meta.js'
import { itemFromStudio } from './items.js'
import { isExcludedLocation } from './url.js'

function memStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)) }, removeItem: (k) => { m.delete(k) } }
}
// A tab: its own location, document, dataLayer and sessionStorage; localStorage can be shared.
function fakeWin({ path = '/glameen/p/shirt', search = '', local = memStorage() } = {}) {
  return {
    location: { pathname: path, search, href: 'https://store.dakio.io' + path + search },
    document: { title: 'Linen Shirt — Glameen', referrer: 'https://m.facebook.com/' },
    localStorage: local,
    sessionStorage: memStorage(),
  }
}
const shirt = { id: 'p1', n: 'Linen Shirt', sku: 'LS', pr: 850, vars: [] }
const ecom = (items) => ({ ecommerce: { currency: 'BDT', value: 850, items } })
const PHONE = /(?:\+?88)?01[3-9]\d{8}/
const EMAIL = /[^\s@"]+@[^\s@"]+\.[a-z]{2,}/i

test('events tracked before init are queued; init sends page_view first', () => {
  const win = fakeWin()
  const d = createDispatcher({ win, slug: 'glameen', scope: 'path' })
  d.track('view_item', ecom([itemFromStudio(shirt)]))
  assert.equal(win.dataLayer, undefined, 'nothing pushed before init')
  d.init()
  const events = win.dataLayer.filter((p) => p.event).map((p) => p.event)
  assert.deepEqual(events, ['page_view', 'view_item'])
  const pv = win.dataLayer.find((p) => p.event === 'page_view')
  assert.match(pv.event_id, /^pv_/)
  assert.equal(pv.dk.page_type, 'product')
  assert.equal(pv.dk.store, 'glameen')
  assert.equal(pv.page_referrer, 'https://m.facebook.com/')
})

test('a soft navigation: the new page\'s view_item still comes after its page_view', () => {
  const win = fakeWin({ path: '/glameen' })
  const d = createDispatcher({ win, slug: 'glameen', scope: 'path' })
  d.init()
  win.location.pathname = '/glameen/p/shirt'
  win.location.href = 'https://store.dakio.io/glameen/p/shirt'
  d.track('view_item', ecom([itemFromStudio(shirt)])) // child effect, before the provider's
  d.ensurePageView('/glameen/p/shirt') // the provider's pathname effect — no second page view
  d.ensurePageView('/glameen/p/shirt')
  const events = win.dataLayer.filter((p) => p.event).map((p) => p.event)
  assert.deepEqual(events, ['page_view', 'page_view', 'view_item'])
  assert.equal(win.dataLayer.filter((p) => p.event === 'page_view')[1].page_referrer, undefined, 'referrer only on the landing page view')
})

test('ecommerce pushes are preceded by {ecommerce:null}', () => {
  const win = fakeWin()
  const d = createDispatcher({ win, slug: 's' })
  d.init()
  d.track('add_to_cart', ecom([itemFromStudio(shirt)]))
  const i = win.dataLayer.findIndex((p) => p.event === 'add_to_cart')
  assert.deepEqual(win.dataLayer[i - 1], { ecommerce: null })
  assert.equal(win.dataLayer[i].value, 850, 'legacy mirror')
})

test('no PII ever reaches the dataLayer', () => {
  const win = fakeWin({ path: '/glameen/shop', search: '?q=01712345678&utm_source=fb&e=rahima%40example.com' })
  win.document.title = 'Results for 01712345678'
  const d = createDispatcher({ win, slug: 'glameen', scope: 'path' })
  d.init()
  d.track('search', { search_term: 'rahima@example.com 01712345678' })
  d.track('whatsapp_click', { link_url: 'https://wa.me/8801712345678' })
  d.track('add_to_cart', ecom([{ ...itemFromStudio(shirt), item_name: 'Gift for 01812345678' }]))
  d.track('login', { method: 'phone_otp', phone: '+8801912345678', email: 'x@y.com' })
  const text = JSON.stringify(win.dataLayer)
  assert.ok(!PHONE.test(text), 'a phone number leaked: ' + text.match(PHONE))
  assert.ok(!EMAIL.test(text), 'an email leaked: ' + text.match(EMAIL))
  assert.ok(text.includes('utm_source=fb'), 'campaign params are kept')
})

test('once(): memory, then sessionStorage across reloads', () => {
  const win = fakeWin()
  const d = createDispatcher({ win, slug: 's' })
  assert.equal(d.once('a'), true)
  assert.equal(d.once('a'), false)
  assert.equal(d.once('bc:1', { storage: 'session' }), true)
  const reloaded = createDispatcher({ win, slug: 's' })
  assert.equal(reloaded.once('bc:1', { storage: 'session' }), false, 'same tab, after a reload')
  assert.equal(reloaded.once('a'), true, 'memory keys do not survive a reload')
  assert.ok(win.sessionStorage.getItem('dk:s:bc:1'))
})

test('the purchase guard dk:{slug}:tx:<orderId> holds across two tabs', () => {
  const local = memStorage()
  const tab1 = createDispatcher({ win: fakeWin({ local }), slug: 'glameen' })
  const tab2 = createDispatcher({ win: fakeWin({ local }), slug: 'glameen' })
  assert.equal(tab1.once('tx:ord_1', { storage: 'local' }), true)
  assert.equal(tab2.once('tx:ord_1', { storage: 'local' }), false)
  assert.ok(local.getItem('dk:glameen:tx:ord_1'))
  assert.equal(tab2.once('tx:ord_2', { storage: 'local' }), true)
})

test('begin_checkout id: reused while the cart is the same, new when it changes', () => {
  const win = fakeWin()
  const d = createDispatcher({ win, slug: 's' })
  const a = d.checkoutEventId('p1::1')
  assert.match(a, /^bc_/)
  assert.equal(d.checkoutEventId('p1::1'), a)
  assert.equal(createDispatcher({ win, slug: 's' }).checkoutEventId('p1::1'), a, 'survives a reload')
  assert.notEqual(d.checkoutEventId('p1::2'), a)
})

test('disabled (excluded page) and paused: nothing is pushed', () => {
  const win = fakeWin()
  const d = createDispatcher({ win, slug: 's' })
  d.track('view_item', ecom([]))
  d.disable()
  d.init()
  d.track('purchase', ecom([]))
  assert.equal(win.dataLayer, undefined)

  // soft navigation onto an excluded page: silent at once, back on after
  const win2 = fakeWin({ path: '/s' })
  const d2 = createDispatcher({ win: win2, slug: 's', scope: 'path', excluded: (loc) => isExcludedLocation(loc, 'path') })
  d2.init()
  win2.location.pathname = '/s/track'
  d2.track('add_to_cart', ecom([]))
  d2.ensurePageView('/s/track')
  win2.location.pathname = '/s/checkout'
  d2.track('begin_checkout', ecom([]))
  const evs = win2.dataLayer.filter((p) => p.event)
  assert.deepEqual(evs.map((p) => p.event), ['page_view', 'page_view', 'begin_checkout'])
  assert.equal(evs[1].dk.page_type, 'checkout')
})

test('adapters get the scrubbed event with its event id', () => {
  const win = fakeWin()
  const seen = []
  const d = createDispatcher({ win, slug: 's' })
  d.addAdapter({ handle: (name, p) => seen.push([name, p]) })
  d.init()
  d.track('search', { search_term: 'call 01712345678' }, { eventId: 'srch_abcdefgh' })
  assert.equal(seen[1][0], 'search')
  assert.equal(seen[1][1].eventId, 'srch_abcdefgh')
  assert.equal(seen[1][1].params.search_term, 'call [phone]')
})

test('end to end with the Meta adapter: every pixel call carries {eventID}', () => {
  const win = fakeWin()
  win.document.createElement = () => ({})
  win.document.head = { appendChild() {} }
  const meta = createMetaAdapter({ win })
  const d = createDispatcher({ win, slug: 's' })
  d.addAdapter(meta)
  meta.addPixel('1234567890123')
  const calls = []
  const realQueue = win.fbq.queue
  d.init()
  d.track('purchase', { ecommerce: { currency: 'BDT', value: 850, transaction_id: '#A-1', items: [itemFromStudio(shirt)] } }, { eventId: 'pur_abcdefgh' })
  for (const args of realQueue) calls.push([...args])
  const tracked = calls.filter((c) => c[0] === 'trackSingle')
  assert.deepEqual(tracked.map((c) => c[2]), ['PageView', 'Purchase'])
  assert.ok(tracked.every((c) => c[1] === '1234567890123' && c[4] && /^(pv|pur)_/.test(c[4].eventID)))
  assert.equal(tracked[1][4].eventID, 'pur_abcdefgh')
})
