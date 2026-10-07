import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createConsent, CONSENT_DEFAULTS } from './consent.js'

test('granted by default', () => {
  const c = createConsent()
  assert.deepEqual(c.get(), { ...CONSENT_DEFAULTS })
  assert.ok(c.allows('ad_storage'))
})

test('update notifies listeners and ignores unknown keys / values', () => {
  const c = createConsent()
  const seen = []
  const off = c.onChange((s) => seen.push(s.ad_storage))
  c.update({ ad_storage: 'denied', bogus: 'granted', analytics_storage: 'maybe' })
  assert.equal(c.allows('ad_storage'), false)
  assert.equal(c.get().analytics_storage, 'granted')
  assert.equal(c.get().bogus, undefined)
  off()
  c.update({ ad_storage: 'granted' })
  assert.deepEqual(seen, ['denied'])
})
