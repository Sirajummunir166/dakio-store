import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canvasCopy } from './canvasCopy.js'

// Store Studio audit SST-27: canvas guidance follows the builder's UI language.
test('Bangla UI gets Bangla image hints and controls; English passes through', () => {
  assert.equal(canvasCopy('Hero image — your best product shot', 'bn'), 'হিরো ছবি — আপনার সেরা পণ্যের ছবি')
  assert.equal(canvasCopy('Square, ~1080×1080px.', 'bn'), 'বর্গাকার, ~1080×1080px।')
  assert.match(canvasCopy('Wide landscape, at least 1800px wide, ~460px tall. Center the subject — very wide screens crop the sides.', 'bn'), /~460px উঁচু/)
  assert.equal(canvasCopy('Done', 'bn'), 'হয়েছে')
  assert.equal(canvasCopy('Hero image — your best product shot', 'en'), 'Hero image — your best product shot')
  assert.equal(canvasCopy('Something new', 'bn'), 'Something new')
  assert.equal(canvasCopy(undefined, 'bn'), undefined)
})
