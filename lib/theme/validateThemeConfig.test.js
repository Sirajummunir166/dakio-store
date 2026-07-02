import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { validateV1Config, diffConfigs } from './validateThemeConfig.js'

// ─────────────────────────────────────────────────────────────────────────────
// validateV1Config
// ─────────────────────────────────────────────────────────────────────────────

const MIN_VALID = {
  version: 1,
  preset: 'classic',
  sections: [
    { id: 'header', type: 'header', enabled: true, settings: {} },
    { id: 'footer', type: 'footer', enabled: true, settings: {} },
  ],
}

describe('validateV1Config', () => {
  test('accepts minimal valid config', () => {
    const r = validateV1Config(MIN_VALID)
    assert.equal(r.ok, true)
    assert.deepEqual(r.errors, [])
  })

  test('accepts config without preset (preset is optional)', () => {
    const { preset: _, ...noPreset } = MIN_VALID
    const r = validateV1Config(noPreset)
    assert.equal(r.ok, true)
  })

  test('accepts all known section types', () => {
    const types = [
      'topbar', 'header', 'hero-deals', 'categories', 'products',
      'lookbook', 'shop-by-style', 'promo-banner', 'size-guide',
      'fabric-care', 'blog', 'features', 'footer',
    ]
    const sections = types.map(t => ({ id: t, type: t, enabled: true, settings: {} }))
    const r = validateV1Config({ version: 1, preset: 'classic', sections })
    assert.equal(r.ok, true)
  })

  test('rejects null', () => {
    const r = validateV1Config(null)
    assert.equal(r.ok, false)
    assert.ok(r.errors.length > 0)
  })

  test('rejects array', () => {
    const r = validateV1Config([])
    assert.equal(r.ok, false)
  })

  test('rejects version !== 1', () => {
    const r = validateV1Config({ ...MIN_VALID, version: 2 })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some(e => e.includes('version')))
  })

  test('rejects string version', () => {
    const r = validateV1Config({ ...MIN_VALID, version: '1' })
    assert.equal(r.ok, false)
  })

  test('rejects unknown preset', () => {
    const r = validateV1Config({ ...MIN_VALID, preset: 'luxury' })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some(e => e.includes('preset')))
  })

  test('rejects non-array sections', () => {
    const r = validateV1Config({ ...MIN_VALID, sections: 'oops' })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some(e => e.includes('sections')))
  })

  test('rejects unknown section type', () => {
    const r = validateV1Config({
      ...MIN_VALID,
      sections: [
        ...MIN_VALID.sections,
        { id: 'x', type: 'super-custom-unknown', enabled: true, settings: {} },
      ],
    })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some(e => e.includes('super-custom-unknown')))
  })

  test('rejects missing required section: header', () => {
    const r = validateV1Config({
      ...MIN_VALID,
      sections: MIN_VALID.sections.filter(s => s.type !== 'header'),
    })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some(e => e.includes('"header"')))
  })

  test('rejects missing required section: footer', () => {
    const r = validateV1Config({
      ...MIN_VALID,
      sections: MIN_VALID.sections.filter(s => s.type !== 'footer'),
    })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some(e => e.includes('"footer"')))
  })

  test('rejects section with non-boolean enabled', () => {
    const r = validateV1Config({
      ...MIN_VALID,
      sections: [
        { id: 'header', type: 'header', enabled: 'yes', settings: {} },
        { id: 'footer', type: 'footer', enabled: true, settings: {} },
      ],
    })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some(e => e.includes('enabled')))
  })

  test('rejects section with empty string id', () => {
    const r = validateV1Config({
      ...MIN_VALID,
      sections: [
        { id: '', type: 'header', enabled: true, settings: {} },
        { id: 'footer', type: 'footer', enabled: true, settings: {} },
      ],
    })
    assert.equal(r.ok, false)
  })

  test('rejects section with array settings', () => {
    const r = validateV1Config({
      ...MIN_VALID,
      sections: [
        { id: 'header', type: 'header', enabled: true, settings: ['bad'] },
        { id: 'footer', type: 'footer', enabled: true, settings: {} },
      ],
    })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some(e => e.includes('settings')))
  })

  test('allows section without settings field (optional)', () => {
    const r = validateV1Config({
      ...MIN_VALID,
      sections: [
        { id: 'header', type: 'header', enabled: true },
        { id: 'footer', type: 'footer', enabled: true },
      ],
    })
    assert.equal(r.ok, true)
  })

  test('reports multiple errors at once', () => {
    const r = validateV1Config({
      version: 2,
      preset: 'bad',
      sections: [
        { id: '', type: 'unknown-type', enabled: 'maybe' },
      ],
    })
    assert.equal(r.ok, false)
    assert.ok(r.errors.length >= 4)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// diffConfigs
// ─────────────────────────────────────────────────────────────────────────────

const BASE = {
  preset: 'classic',
  sections: [
    { type: 'header' }, { type: 'products' }, { type: 'footer' },
  ],
}

describe('diffConfigs', () => {
  test('identical configs report no changes', () => {
    const r = diffConfigs(BASE, BASE)
    assert.equal(r.identical, true)
    assert.equal(r.hasChanges, false)
    assert.deepEqual(r.added, [])
    assert.deepEqual(r.removed, [])
    assert.equal(r.reordered, false)
    assert.equal(r.presetChanged, false)
  })

  test('detects section added to draft', () => {
    const draft = { ...BASE, sections: [...BASE.sections, { type: 'lookbook' }] }
    const r = diffConfigs(draft, BASE)
    assert.equal(r.hasChanges, true)
    assert.ok(r.added.includes('lookbook'))
    assert.deepEqual(r.removed, [])
  })

  test('detects section removed from draft', () => {
    const draft = { ...BASE, sections: BASE.sections.filter(s => s.type !== 'products') }
    const r = diffConfigs(draft, BASE)
    assert.equal(r.hasChanges, true)
    assert.ok(r.removed.includes('products'))
    assert.deepEqual(r.added, [])
  })

  test('detects reorder without add or remove', () => {
    const draft = { ...BASE, sections: [{ type: 'footer' }, { type: 'products' }, { type: 'header' }] }
    const r = diffConfigs(draft, BASE)
    assert.equal(r.reordered, true)
    assert.equal(r.hasChanges, true)
    assert.deepEqual(r.added, [])
    assert.deepEqual(r.removed, [])
  })

  test('detects preset change', () => {
    const draft = { ...BASE, preset: 'editorial' }
    const r = diffConfigs(draft, BASE)
    assert.equal(r.presetChanged, true)
    assert.equal(r.hasChanges, true)
    assert.equal(r.draftPreset, 'editorial')
    assert.equal(r.livePreset, 'classic')
  })

  test('null live config returns noLive=true and hasChanges=true', () => {
    const r = diffConfigs(BASE, null)
    assert.equal(r.noLive, true)
    assert.equal(r.hasChanges, true)
    assert.equal(r.identical, false)
  })

  test('reports correct section counts', () => {
    const r = diffConfigs(BASE, BASE)
    assert.equal(r.draftSectionCount, 3)
    assert.equal(r.liveSectionCount, 3)
  })

  test('add + remove does not count as reorder', () => {
    const draft = {
      ...BASE,
      sections: [{ type: 'header' }, { type: 'lookbook' }, { type: 'footer' }],
    }
    const r = diffConfigs(draft, BASE)
    assert.ok(r.added.includes('lookbook'))
    assert.ok(r.removed.includes('products'))
    assert.equal(r.reordered, false)
  })
})
