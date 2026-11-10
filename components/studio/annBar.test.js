import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annEnded, annFor } from './annBar.js';

const bar = (props = {}, extra = {}) => ({ id: 's1', type: 'ann', v: 'static', props: { msg: 'Cash on delivery', link: '', ...props }, ...extra });
const NOW = Date.parse('2026-11-10T12:00:00Z');

test('no bar, no strip', () => {
  assert.equal(annFor({}, { home: true }), null);
  assert.equal(annFor(null), null);
  assert.equal(annFor({ ann: { type: 'hero', props: {} } }, { home: true }), null);
});

test('every page by default, never on checkout', () => {
  const doc = { ann: bar() };
  assert.equal(annFor(doc, { home: true }), doc.ann);
  assert.equal(annFor(doc, { home: false }), doc.ann);
  assert.equal(annFor(doc, { home: false, checkout: true }), null);
});

test('home only stays off the other pages', () => {
  const doc = { ann: bar({ where: 'home' }) };
  assert.equal(annFor(doc, { home: true }), doc.ann);
  assert.equal(annFor(doc, { home: false }), null);
});

test('an end time hides it once passed, and only when the time is known', () => {
  const doc = { ann: bar({ until: '2026-11-10T11:00:00.000Z' }) };
  assert.equal(annEnded(doc.ann, NOW), true);
  assert.equal(annFor(doc, { home: true, now: NOW }), null);
  // First render (server and hydration) does not guess the time.
  assert.equal(annFor(doc, { home: true, now: null }), doc.ann);
  const later = { ann: bar({ until: '2026-11-11T00:00:00.000Z' }) };
  assert.equal(annFor(later, { home: true, now: NOW }), later.ann);
  // A broken date never hides the bar.
  assert.equal(annEnded(bar({ until: 'soon' }), NOW), false);
});

test('a hidden bar still comes back so the canvas can draw its strip', () => {
  const doc = { ann: bar({}, { hidden: true }) };
  assert.equal(annFor(doc, { home: true }), doc.ann);
});
