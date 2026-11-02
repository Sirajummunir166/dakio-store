import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getProducts, getProductsByIds, CATALOG_MAX } from './api.js'

// Store Studio audit SST-28: the storefront read one page of 48 products, so a
// 110-product store showed 48 and everything older did not exist to it.

let savedFetch
const calls = []
// A fake public catalogue of `total` products served 100 at a time, like the API.
function catalogue(total, { paging = true } = {}) {
  calls.length = 0
  globalThis.fetch = async (url) => {
    calls.push(url)
    const q = new URL(url).searchParams
    if (q.get('ids')) {
      const ids = q.get('ids').split(',')
      return { ok: true, status: 200, json: async () => ({ products: ids.filter((id) => Number(id.slice(1)) < total).map((id) => ({ id })) }) }
    }
    const limit = Math.min(100, Number(q.get('limit')) || 60)
    const offset = paging ? Number(q.get('offset')) || 0 : 0
    const products = Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, i) => ({ id: 'p' + (offset + i) }))
    const body = paging ? { products, hasMore: offset + products.length < total && products.length === limit, nextOffset: offset + products.length } : { products }
    return { ok: true, status: 200, json: async () => body }
  }
}
beforeEach(() => { savedFetch = globalThis.fetch })
afterEach(() => { globalThis.fetch = savedFetch })

test('getProducts walks every page: 110 products → 110', async () => {
  catalogue(110)
  const list = await getProducts('store-l', { limit: CATALOG_MAX })
  assert.equal(list.length, 110)
  assert.equal(new Set(list.map((p) => p.id)).size, 110)
  assert.equal(calls.length, 2)
  assert.match(calls[1], /offset=100/)
})

test('getProducts honours a total limit and the overall ceiling', async () => {
  catalogue(500)
  assert.equal((await getProducts('s', { limit: 48 })).length, 48)
  assert.equal(calls.length, 1)
  catalogue(CATALOG_MAX + 300)
  assert.equal((await getProducts('s', { limit: CATALOG_MAX })).length, CATALOG_MAX)
})

test('RV-SST-04: without a limit, one call for the newest 48 (as on main) — only studio catalogue routes walk the pages', async () => {
  catalogue(110)
  assert.equal((await getProducts('s')).length, 48)
  assert.equal(calls.length, 1)
  assert.match(calls[0], /limit=48/)
})

test('an API without paging answers one page, as before', async () => {
  catalogue(250, { paging: false })
  assert.equal((await getProducts('s', { limit: CATALOG_MAX })).length, 100)
  assert.equal(calls.length, 1)
})

test('getProductsByIds asks for exactly those ids and never throws', async () => {
  catalogue(10)
  const got = await getProductsByIds('s', ['p3', 'p3', 'p9', null])
  assert.deepEqual(got.map((p) => p.id), ['p3', 'p9'])
  assert.match(calls[0], /ids=p3%2Cp9/)
  globalThis.fetch = async () => { throw new Error('offline') }
  assert.deepEqual(await getProductsByIds('s', ['p1']), [])
  assert.deepEqual(await getProductsByIds('s', []), [])
})
