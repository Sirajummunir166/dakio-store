import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveProductTabs } from './productTabs.js'

const pp = {
  tabSpecs: 'Add specifications in the Catalog tab — material, origin, weight, or anything else worth listing.',
  tabGuide: 'Add sizing notes here — how this fits, and tips for choosing between sizes.',
  tabShip: '2–4 days inside Dhaka, 4–7 days nationwide. Cash on delivery everywhere. Easy 7-day exchange if it doesn’t fit — just reach out.',
  tabs: [{ k: 'ship', title: 'Delivery', html: '<p>Store-wide shipping.</p>' }],
}

test('public page: product content, then template default, else the tab is dropped', () => {
  const bp = {
    desc: '<p>Long.</p>',
    tabs: [
      { key: 'specs', title: 'Fabric & Care', html: '<table><tr><td>Cotton</td></tr></table>' },
      { key: 'guide', html: '<p></p>' },
      { key: 'c_box', title: "What's in the box", html: '<ul><li>1 shirt</li></ul>' },
    ],
  }
  const tabs = resolveProductTabs(bp, pp)
  assert.deepEqual(tabs.map((t) => [t.key, t.title, t.source]), [
    ['desc', 'Description', 'product'],
    ['specs', 'Fabric & Care', 'product'],
    ['ship', 'Delivery', 'template'],
    ['c_box', "What's in the box", 'product'],
  ])
  assert.equal(tabs.find((t) => t.key === 'ship').html, '<p>Store-wide shipping.</p>')
})

test('placeholder template copy never shows; customised legacy text does', () => {
  assert.deepEqual(resolveProductTabs({ desc: '' }, { tabSpecs: pp.tabSpecs, tabGuide: pp.tabGuide, tabShip: pp.tabShip }), [])
  const tabs = resolveProductTabs({ desc: '' }, { tabGuide: 'Runs small — size up.' })
  assert.deepEqual(tabs.map((t) => [t.key, t.source]), [['guide', 'template']])
  assert.equal(tabs[0].html, 'Runs small — size up.')
})

test('builder keeps empty tabs (with source none) so the merchant sees them', () => {
  const tabs = resolveProductTabs({ desc: '' }, {}, { builder: true })
  assert.deepEqual(tabs.map((t) => [t.key, t.source]), [['desc', 'none'], ['specs', 'none'], ['guide', 'none'], ['ship', 'none']])
})

test('a product can rename a standard tab without giving it content', () => {
  const tabs = resolveProductTabs({ desc: '<p>x</p>', tabs: [{ key: 'ship', title: 'Delivery & exchange', html: '' }] }, pp)
  assert.deepEqual(tabs.map((t) => [t.key, t.title, t.source]), [['desc', 'Description', 'product'], ['ship', 'Delivery & exchange', 'template']])
})
