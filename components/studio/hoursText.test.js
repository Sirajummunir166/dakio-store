import test from 'node:test';
import assert from 'node:assert/strict';
import { hoursRows } from './hoursText.js';
import { itemsOf, linesOf } from './sections/kit.js';
import { siteText } from './siteText.js';

const week = (w) => Object.fromEntries(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'].map((d) => [d, w]));

test('hours: same hours share a row, from Saturday; a closed Friday is said so', () => {
  const tx = siteText('en');
  const rows = hoursRows({ ...week([['10:00', '20:00']]), fri: [] }, tx, 'en');
  assert.deepEqual(rows, [
    { label: 'Sat – Thu', text: '10:00 AM – 8:00 PM' },
    { label: 'Fri', text: 'Closed' },
  ]);
});

test('hours in Bangla, split days, and nothing when the store has no hours', () => {
  const tx = siteText('bn');
  const rows = hoursRows({ ...week([]), sat: [['09:00', '13:00'], ['15:00', '19:00']], sun: [['09:00', '13:00'], ['15:00', '19:00']] }, tx, 'bn');
  assert.equal(rows[0].label, 'শনি, রবি');
  assert.equal(rows[0].text, 'সকাল ৯:০০ – দুপুর ১:০০, বিকাল ৩:০০ – সন্ধ্যা ৭:০০');
  assert.equal(rows[1].text, 'বন্ধ');
  assert.deepEqual(hoursRows(null, tx, 'bn'), []);
  assert.deepEqual(hoursRows(week([['10:00', '20:00']]), tx, 'bn'), [{ label: 'প্রতিদিন', text: 'সকাল ১০:০০ – রাত ৮:০০' }]);
});

test('list items keep their key (or get one by place); lines and comma lists', () => {
  assert.deepEqual(itemsOf({ items: [{ k: 'a1', n: 'x' }, { n: 'y' }] }).map((i) => i.k), ['a1', 'i1']);
  assert.deepEqual(itemsOf({}), []);
  assert.deepEqual(linesOf('Dhanmondi, Gulshan\nMirpur ,, ', { commas: true }), ['Dhanmondi', 'Gulshan', 'Mirpur']);
  assert.deepEqual(linesOf('HD makeup\n\nSaree draping'), ['HD makeup', 'Saree draping']);
});
