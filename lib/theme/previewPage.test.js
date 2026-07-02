// Tests for preview page correctness (P0 + P2 fixes)
//
// These tests verify:
//   1. domain/[host]/preview/[theme]/page.js imports getStoreBySlug (P0 fix)
//   2. Both preview pages handle { unavailable: true } without false-404 (P2 fix)
//   3. sanitizeThemeUrl correctly sanitizes section hrefs

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { sanitizeThemeUrl } from './sanitizeThemeUrl.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const storeRoot = join(__dirname, '../..')

// ─────────────────────────────────────────────────────────────────────────────
// P0 fix: domain preview page must import getStoreBySlug
// ─────────────────────────────────────────────────────────────────────────────

describe('domain preview page — import correctness (P0)', () => {
  const domainPreviewPath = join(storeRoot, 'app/domain/[host]/preview/[theme]/page.js')
  let content

  test('can read the domain preview page file', () => {
    content = readFileSync(domainPreviewPath, 'utf8')
    assert.ok(content.length > 0, 'file must not be empty')
  })

  test('imports getStoreBySlug (P0 — was missing, caused ReferenceError)', () => {
    content = content ?? readFileSync(domainPreviewPath, 'utf8')
    assert.ok(
      content.includes('getStoreBySlug'),
      'domain preview page must import getStoreBySlug — it is called to fetch the draft-swapped store'
    )
  })

  test('getStoreBySlug appears in the import statement (not just in a comment)', () => {
    content = content ?? readFileSync(domainPreviewPath, 'utf8')
    // Check it is imported from lib/api, not just mentioned in a comment
    const importLine = content.split('\n').find(l => l.startsWith('import') && l.includes('lib/api'))
    assert.ok(importLine, 'There must be an import line for lib/api')
    assert.ok(
      importLine.includes('getStoreBySlug'),
      `getStoreBySlug must be in the import statement, got: ${importLine}`
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P2 fix: preview pages must not false-404 on API 500
// ─────────────────────────────────────────────────────────────────────────────

describe('preview pages — unavailable vs notFound handling (P2)', () => {
  test('domain preview page checks .unavailable separately from .notFound', () => {
    const content = readFileSync(
      join(storeRoot, 'app/domain/[host]/preview/[theme]/page.js'),
      'utf8'
    )
    assert.ok(
      content.includes('.unavailable'),
      'domain preview page must check storeData.unavailable to render StoreUnavailable, not call notFound()'
    )
    assert.ok(
      content.includes('.notFound'),
      'domain preview page must check storeData.notFound before calling notFound()'
    )
    assert.ok(
      content.includes('StoreUnavailable'),
      'domain preview page must render <StoreUnavailable /> for unavailable responses'
    )
  })

  test('slug preview page checks .unavailable separately from .notFound', () => {
    const content = readFileSync(
      join(storeRoot, 'app/[slug]/preview/[theme]/page.js'),
      'utf8'
    )
    assert.ok(
      content.includes('.unavailable'),
      'slug preview page must check storeData.unavailable to render StoreUnavailable'
    )
    assert.ok(
      content.includes('.notFound'),
      'slug preview page must check storeData.notFound'
    )
    assert.ok(
      content.includes('StoreUnavailable'),
      'slug preview page must render <StoreUnavailable /> for unavailable responses'
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// sanitizeThemeUrl — storefront rendering sanitizer
// ─────────────────────────────────────────────────────────────────────────────

describe('sanitizeThemeUrl — storefront rendering (P1b)', () => {
  test('https:// link is returned as-is', () => {
    assert.equal(sanitizeThemeUrl('https://example.com'), 'https://example.com')
  })

  test('relative /collection link is returned as-is', () => {
    assert.equal(sanitizeThemeUrl('/collection/women'), '/collection/women')
  })

  test('javascript: link returns null', () => {
    assert.equal(sanitizeThemeUrl('javascript:alert(1)'), null)
  })

  test('data: URI returns null', () => {
    assert.equal(sanitizeThemeUrl('data:text/html,<script>alert(1)</script>'), null)
  })

  test('protocol-relative //evil.com returns null', () => {
    assert.equal(sanitizeThemeUrl('//evil.com'), null)
  })

  test('null input returns null', () => {
    assert.equal(sanitizeThemeUrl(null), null)
  })

  test('empty string returns null', () => {
    assert.equal(sanitizeThemeUrl(''), null)
  })

  test('# anchor returns #', () => {
    assert.equal(sanitizeThemeUrl('#'), '#')
  })

  test('#section anchor is returned as-is', () => {
    assert.equal(sanitizeThemeUrl('#featured'), '#featured')
  })

  test('mailto: is returned as-is', () => {
    assert.equal(sanitizeThemeUrl('mailto:hi@store.com'), 'mailto:hi@store.com')
  })

  test('tel: is returned as-is', () => {
    assert.equal(sanitizeThemeUrl('tel:+8801700000000'), 'tel:+8801700000000')
  })

  test('http:// (insecure) returns null', () => {
    assert.equal(sanitizeThemeUrl('http://example.com'), null)
  })

  test('callers can safely fall back to # for null result', () => {
    const unsafe = 'javascript:void(0)'
    const href = sanitizeThemeUrl(unsafe) ?? '#'
    assert.equal(href, '#', 'null result with ?? "#" gives safe fallback')
  })
})
