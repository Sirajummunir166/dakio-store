import test from 'node:test';
import assert from 'node:assert/strict';
import { dayWords, timeWords, dhakaToday, nextDate } from './bookingText.js';

test('a day in English and Bangla, today and tomorrow by name', () => {
  assert.equal(dayWords('2026-10-24', 'en'), 'Sat 24 Oct');
  assert.equal(dayWords('2026-10-24', 'bn'), 'শনি ২৪ অক্টো');
  assert.equal(dayWords('2026-10-24', 'en', { today: '2026-10-24' }), 'Today');
  assert.equal(dayWords('2026-10-25', 'bn', { tomorrow: '2026-10-25' }), 'আগামীকাল');
  assert.equal(dayWords('nonsense', 'en'), '');
});

test('a time in 12-hour English and Bangla with the part of day', () => {
  assert.equal(timeWords('09:00', 'en'), '9:00 AM');
  assert.equal(timeWords('12:30', 'en'), '12:30 PM');
  assert.equal(timeWords('00:15', 'en'), '12:15 AM');
  assert.equal(timeWords('15:30', 'bn'), 'বিকাল ৩:৩০');
  assert.equal(timeWords('10:00', 'bn'), 'সকাল ১০:০০');
  assert.equal(timeWords('19:00', 'bn'), 'সন্ধ্যা ৭:০০');
  assert.equal(timeWords('25:00', 'en'), '');
});

test('Dhaka today rolls over at 18:00 UTC; the next date crosses months', () => {
  assert.deepEqual(dhakaToday(new Date('2026-10-24T17:59:00Z')), { today: '2026-10-24', tomorrow: '2026-10-25' });
  assert.deepEqual(dhakaToday(new Date('2026-10-24T18:00:00Z')), { today: '2026-10-25', tomorrow: '2026-10-26' });
  assert.equal(nextDate('2026-10-31'), '2026-11-01');
  assert.equal(nextDate('2026-12-31'), '2027-01-01');
});

test('every reason the booking API refuses a time with has its words in Bangla and English (SB-80)', async () => {
  const { SITE_TEXT } = await import('../siteText.js');
  for (const key of ['book.taken', 'book.past', 'book.closed', 'book.tooMany']) {
    assert.ok(SITE_TEXT.en[key], key);
    assert.ok(SITE_TEXT.bn[key] && SITE_TEXT.bn[key] !== SITE_TEXT.en[key], `${key} in Bangla`);
  }
});
