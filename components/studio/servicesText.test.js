import test from 'node:test';
import assert from 'node:assert/strict';
import { pickServices, serviceOf, groupServices } from './servicesText.js';

const S = [
  { id: 'a', slug: 'check-up', name: 'Check-up', category: 'Dental' },
  { id: 'b', slug: 'cleaning', name: 'Cleaning', category: 'Dental' },
  { id: 'c', slug: 'braces', name: 'Braces', category: 'Ortho' },
  { id: 'd', slug: 'whitening', name: 'Whitening', category: null },
];

test('pickServices: all by default, in the store order', () => {
  assert.deepEqual(pickServices(S, {}).map((s) => s.id), ['a', 'b', 'c', 'd']);
  assert.deepEqual(pickServices(S, { from: 'all' }).map((s) => s.id), ['a', 'b', 'c', 'd']);
  assert.deepEqual(pickServices(null, {}), []);
});

test('pickServices: one category, whatever its case', () => {
  assert.deepEqual(pickServices(S, { from: 'cat', cat: 'dental' }).map((s) => s.id), ['a', 'b']);
  assert.deepEqual(pickServices(S, { from: 'cat', cat: 'Nothing' }), []);
  // No category chosen yet reads as all, so a fresh switch never empties the section.
  assert.equal(pickServices(S, { from: 'cat' }).length, 4);
});

test('pickServices: hand-picked keeps the picked order and drops what is gone', () => {
  assert.deepEqual(pickServices(S, { from: 'picks', picks: ['c', 'a', 'zz'] }).map((s) => s.id), ['c', 'a']);
  assert.deepEqual(pickServices(S, { from: 'picks', picks: ['whitening'] }).map((s) => s.id), ['d']);
  assert.deepEqual(pickServices(S, { from: 'picks', picks: [] }), []);
  assert.deepEqual(pickServices(S, { from: 'picks' }), []);
});

test('pickServices: max cuts the list, 0 shows all', () => {
  assert.equal(pickServices(S, { max: 2 }).length, 2);
  assert.equal(pickServices(S, { max: 0 }).length, 4);
  assert.equal(pickServices(S, { max: 'x' }).length, 4);
  assert.equal(pickServices(S, { from: 'cat', cat: 'Dental', max: 1 }).length, 1);
});

test('serviceOf: by id or address; any and unknown are null', () => {
  assert.equal(serviceOf(S, 'b').name, 'Cleaning');
  assert.equal(serviceOf(S, 'braces').id, 'c');
  assert.equal(serviceOf(S, 'any'), null);
  assert.equal(serviceOf(S, 'nope'), null);
  assert.equal(serviceOf(S, null), null);
});

test('groupServices still groups what was picked', () => {
  const g = groupServices(pickServices(S, { from: 'picks', picks: ['a', 'c'] }));
  assert.deepEqual(g.map((x) => x.name), ['Dental', 'Ortho']);
});

test('ways to pay with their period, in English and Bangla, no dash (services page cut 3)', async () => {
  const { priceWords, includeWords } = await import('./servicesText.js');
  const { siteText } = await import('./siteText.js');
  const plan = { priceType: 'fixed', price: 2990, billEvery: 'month', options: [{ priceType: 'fixed', price: 2990, billEvery: 'month' }, { priceType: 'fixed', price: 23880, billEvery: 'year', commitmentMonths: 12 }] };
  assert.equal(priceWords(plan, siteText('en')), '৳2,990 a month or ৳23,880 a year, paid upfront');
  assert.equal(priceWords(plan, siteText('bn')), 'মাসে ৳2,990 অথবা বছরে ৳23,880, একসাথে');
  assert.equal(priceWords({ priceType: 'fixed', price: 15000, billEvery: 'month', commitmentMonths: 6, setupFee: 5000 }, siteText('en')), '৳15,000 a month for 6 months · ৳5,000 setup');
  assert.equal(priceWords({ priceType: 'range', price: 2000, priceMax: 5000 }, siteText('en')), '৳2,000 to ৳5,000');
  assert.equal(includeWords({ what: 'posts', qty: 12, per: 'month' }, siteText('en')), '12 × posts a month');
});
