import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getStoreBySlug, getStoreByDomain } from './api.js'

// These tests verify the contract that callers depend on:
//   200 → { store: {...} }
//   404 → { notFound: true }
//   5xx → { unavailable: true }
//   network failure → { unavailable: true }
//
// The distinction matters because a false 404 (upstream 5xx treated as notFound)
// caused the 2026-07-01 P0 incident where a working store showed a 404 page.

let savedFetch

function mockFetch(statusOrThrow, body) {
  globalThis.fetch = typeof statusOrThrow === 'number'
    ? async () => ({
        ok: statusOrThrow >= 200 && statusOrThrow < 300,
        status: statusOrThrow,
        json: async () => body,
      })
    : async () => { throw statusOrThrow }
}

describe('getStoreBySlug', () => {
  beforeEach(() => { savedFetch = globalThis.fetch })
  afterEach(() => { globalThis.fetch = savedFetch })

  test('200 — returns full store data object', async () => {
    const payload = { store: { id: 'abc', name: 'Test Store', slug: 'test-abc' } }
    mockFetch(200, payload)
    const result = await getStoreBySlug('test-abc')
    assert.deepEqual(result, payload)
  })

  test('404 — returns { notFound: true } (slug does not exist)', async () => {
    mockFetch(404, { error: 'Store not found' })
    const result = await getStoreBySlug('does-not-exist')
    assert.deepEqual(result, { notFound: true })
  })

  test('500 — returns { unavailable: true } (must NOT become a false 404)', async () => {
    mockFetch(500, { error: 'Server error' })
    const result = await getStoreBySlug('real-store-slug')
    assert.deepEqual(result, { unavailable: true })
    assert.ok(!result.notFound, '500 must not be treated as notFound')
  })

  test('503 — returns { unavailable: true }', async () => {
    mockFetch(503, { error: 'Service unavailable' })
    const result = await getStoreBySlug('real-store-slug')
    assert.deepEqual(result, { unavailable: true })
  })

  test('network failure — returns { unavailable: true }', async () => {
    mockFetch(new Error('ECONNREFUSED'))
    const result = await getStoreBySlug('real-store-slug')
    assert.deepEqual(result, { unavailable: true })
    assert.ok(!result.notFound, 'network failure must not be treated as notFound')
  })

  test('200 with previewToken — passes token in query string', async () => {
    let capturedUrl
    globalThis.fetch = async (url) => {
      capturedUrl = url
      return { ok: true, status: 200, json: async () => ({ store: { slug: 'test' } }) }
    }
    await getStoreBySlug('test', { previewToken: 'tok123' })
    assert.ok(capturedUrl.includes('previewToken=tok123'), 'previewToken must be in URL')
  })
})

describe('getStoreByDomain', () => {
  beforeEach(() => { savedFetch = globalThis.fetch })
  afterEach(() => { globalThis.fetch = savedFetch })

  test('200 — returns full store data object', async () => {
    const payload = { store: { id: 'xyz', name: 'Custom Domain Store', slug: 'my-store' } }
    mockFetch(200, payload)
    const result = await getStoreByDomain('mystore.example.com')
    assert.deepEqual(result, payload)
  })

  test('404 — returns { notFound: true }', async () => {
    mockFetch(404, { error: 'Store not found' })
    const result = await getStoreByDomain('unknown.example.com')
    assert.deepEqual(result, { notFound: true })
  })

  test('500 — returns { unavailable: true } (must NOT become a false 404)', async () => {
    mockFetch(500, { error: 'Server error' })
    const result = await getStoreByDomain('mystore.example.com')
    assert.deepEqual(result, { unavailable: true })
    assert.ok(!result.notFound, '500 must not be treated as notFound')
  })

  test('network failure — returns { unavailable: true }', async () => {
    mockFetch(new TypeError('fetch failed'))
    const result = await getStoreByDomain('mystore.example.com')
    assert.deepEqual(result, { unavailable: true })
  })
})
