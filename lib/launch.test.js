import { test } from 'node:test'
import assert from 'node:assert/strict'
import { showsLaunchPage, launchMetadata } from './launch.js'

test('the launch page shows for a store with no website and no grace', () => {
  assert.equal(showsLaunchPage({ notFound: true, launch: { mode: 'building' }, legacyUntil: null }), true)
  assert.equal(showsLaunchPage({ notFound: true, launch: { mode: 'soon' }, legacyUntil: '2026-11-23T18:00:00.000Z' }), false, 'still on the old pages')
  assert.equal(showsLaunchPage({ site: { pages: [] } }), false, 'a published website')
  assert.equal(showsLaunchPage({ notFound: true }), false, 'no such store')
  assert.equal(showsLaunchPage({ unavailable: true }), false, 'API down')
})

test('metadata names the store, in its language, and is never indexed', () => {
  assert.deepEqual(launchMetadata({ mode: 'soon', lang: 'bn', brand: 'Salt' }, { name: 'Salt Avenue' }), { title: 'Salt · শীঘ্রই আসছে', robots: { index: false, follow: false } })
  const m = launchMetadata({ mode: 'building' }, { name: 'Glameen', faviconUrl: 'https://x/f.png' })
  assert.equal(m.title, 'Glameen · Website under construction')
  assert.equal(m.icons.icon, 'https://x/f.png')
})
