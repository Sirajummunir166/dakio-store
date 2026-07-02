/**
 * Pure validation + diff utilities for fashion_v1 theme configs.
 * No React, no browser APIs — safe to import from tests, server components, and API routes.
 */

const KNOWN_SECTION_TYPES = new Set([
  'topbar', 'header', 'hero-deals', 'categories', 'products',
  'lookbook', 'shop-by-style', 'promo-banner', 'size-guide',
  'fabric-care', 'blog', 'features', 'footer',
])

const REQUIRED_SECTION_TYPES = new Set(['header', 'footer'])
const KNOWN_PRESETS = new Set(['classic', 'editorial', 'campaign'])

/**
 * Validate a fashion_v1 pageConfig object.
 * Returns { ok: boolean, errors: string[] }.
 */
export function validateV1Config(config) {
  const errors = []

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { ok: false, errors: ['Config must be a plain object'] }
  }

  if (config.version !== 1) {
    errors.push(`version must be 1, got ${JSON.stringify(config.version)}`)
  }

  if (config.preset !== undefined && !KNOWN_PRESETS.has(config.preset)) {
    errors.push(`preset must be classic|editorial|campaign, got "${config.preset}"`)
  }

  if (!Array.isArray(config.sections)) {
    errors.push('sections must be an array')
    return { ok: false, errors }
  }

  config.sections.forEach((s, i) => {
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      errors.push(`sections[${i}] must be an object`)
      return
    }
    if (typeof s.id !== 'string' || !s.id) {
      errors.push(`sections[${i}].id must be a non-empty string`)
    }
    if (typeof s.type !== 'string' || !s.type) {
      errors.push(`sections[${i}].type must be a non-empty string`)
    } else if (!KNOWN_SECTION_TYPES.has(s.type)) {
      errors.push(`sections[${i}].type "${s.type}" is not a recognised fashion_v1 section type`)
    }
    if (typeof s.enabled !== 'boolean') {
      errors.push(`sections[${i}].enabled must be a boolean`)
    }
    if (s.settings !== undefined && (typeof s.settings !== 'object' || Array.isArray(s.settings))) {
      errors.push(`sections[${i}].settings must be a plain object`)
    }
  })

  for (const req of REQUIRED_SECTION_TYPES) {
    if (!config.sections.some(s => s.type === req)) {
      errors.push(`Required section type "${req}" is missing from sections`)
    }
  }

  return { ok: errors.length === 0, errors }
}

/**
 * Diff two configs (draft vs live).
 * Returns a descriptor of what changed so a summary dialog can render it.
 */
export function diffConfigs(draft, live) {
  if (!live) {
    return {
      hasChanges: true, identical: false, noLive: true,
      added: [], removed: [], reordered: false, presetChanged: false,
    }
  }

  const draftTypes = (draft?.sections ?? []).map(s => s.type)
  const liveTypes  = (live?.sections  ?? []).map(s => s.type)
  const draftSet   = new Set(draftTypes)
  const liveSet    = new Set(liveTypes)

  const added   = draftTypes.filter(t => !liveSet.has(t))
  const removed = liveTypes.filter(t => !draftSet.has(t))

  const commonDraft = draftTypes.filter(t => liveSet.has(t))
  const commonLive  = liveTypes.filter(t => draftSet.has(t))
  const reordered   = commonDraft.join(',') !== commonLive.join(',')

  const presetChanged = draft?.preset !== live?.preset

  const identical = added.length === 0 && removed.length === 0 && !reordered && !presetChanged

  return {
    hasChanges: !identical,
    identical,
    noLive: false,
    added,
    removed,
    reordered,
    presetChanged,
    draftPreset: draft?.preset ?? null,
    livePreset:  live?.preset  ?? null,
    draftSectionCount: draftTypes.length,
    liveSectionCount:  liveTypes.length,
  }
}
