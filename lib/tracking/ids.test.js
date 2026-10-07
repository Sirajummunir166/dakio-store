import { test } from 'node:test'
import assert from 'node:assert/strict'
import { newEventId, EVENT_ID_RE } from './ids.js'

test('newEventId is `${prefix}_${uuid}` and passes the server pattern', () => {
  const id = newEventId('pur')
  assert.match(id, /^pur_[0-9a-f-]{36}$/)
  assert.ok(EVENT_ID_RE.test(id))
  assert.notEqual(newEventId('pur'), newEventId('pur'))
})

test('a junk prefix is cleaned, an empty one falls back to ev', () => {
  assert.match(newEventId('a b!c'), /^abc_/)
  assert.match(newEventId(''), /^ev_/)
})

test('without crypto.randomUUID it still makes a valid id', () => {
  const orig = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true })
  try {
    const id = newEventId('bc')
    assert.match(id, /^bc_/)
    assert.ok(EVENT_ID_RE.test(id))
  } finally {
    Object.defineProperty(globalThis, 'crypto', orig)
  }
})
