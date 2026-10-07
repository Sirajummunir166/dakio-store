import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildTrackingConfig, configJson, BOOTSTRAP_SCRIPT } from './config.js'

test('ids are validated before they reach the page', () => {
  const c = buildTrackingConfig({ id: 't1', slug: 'glameen', name: 'Glameen', currency: 'bdt', metaPixelId: '123456789012345', gtmContainerId: 'GTM-ABC123' }, 'path')
  assert.deepEqual(c, { slug: 'glameen', storeId: 't1', name: 'Glameen', currency: 'BDT', metaPixelId: '123456789012345', gtmId: 'GTM-ABC123', scope: 'path' })
  const bad = buildTrackingConfig({ slug: 's', metaPixelId: "1');alert(1)//", gtmContainerId: "GTM-X');alert(1)//", currency: '<b>' })
  assert.equal(bad.metaPixelId, null)
  assert.equal(bad.gtmId, null)
  assert.equal(bad.currency, 'BDT')
  assert.equal(bad.scope, 'domain')
  assert.equal(buildTrackingConfig(null), null)
})

test('the JSON can never close its script tag', () => {
  const j = configJson({ name: '</script><script>alert(1)</script>' })
  assert.ok(!j.includes('<'))
  assert.equal(JSON.parse(j).name, '</script><script>alert(1)</script>')
})

// Run the constant bootstrap against a fake page.
function runBoot({ path, search = '', config }) {
  const appended = []
  const el = { textContent: configJson(config) }
  const w = {
    location: { pathname: path, search },
    document: {
      getElementById: (id) => (id === 'dk-tc' ? el : null),
      createElement: () => ({}),
      head: { appendChild: (s) => appended.push(s) },
    },
    URLSearchParams,
  }
  new Function('window', 'document', 'URLSearchParams', BOOTSTRAP_SCRIPT)(w, w.document, URLSearchParams)
  return { w, appended }
}

test('bootstrap: creates the dataLayer, consent default, and loads a valid GTM once', () => {
  const { w, appended } = runBoot({ path: '/glameen/shop', config: { slug: 'glameen', scope: 'path', gtmId: 'GTM-ABC123' } })
  assert.equal(w.__dkOff, false)
  assert.equal(w.dataLayer[0][0], 'consent')
  assert.equal(w.dataLayer[1].event, 'gtm.js')
  assert.equal(appended.length, 1)
  assert.equal(appended[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-ABC123')
})

test('bootstrap: an invalid GTM id loads nothing', () => {
  const { w, appended } = runBoot({ path: '/', config: { slug: 's', scope: 'domain', gtmId: 'GTM-x"><script>' } })
  assert.equal(appended.length, 0)
  assert.ok(Array.isArray(w.dataLayer))
})

test('bootstrap: excluded pages are switched off before anything loads', () => {
  for (const [path, search, scope] of [
    ['/glameen/preview/fashion', '', 'path'],
    ['/glameen/studio-preview', '', 'path'],
    ['/track/ABC', '', 'domain'],
    ['/', '?token=abc', 'domain'],
    ['/glameen/p/x', '?previewToken=abc', 'path'],
  ]) {
    const { w, appended } = runBoot({ path, search, config: { slug: 'glameen', scope, gtmId: 'GTM-ABC123' } })
    assert.equal(w.__dkOff, true, path + search)
    assert.equal(w.dataLayer, undefined)
    assert.equal(appended.length, 0)
  }
})
