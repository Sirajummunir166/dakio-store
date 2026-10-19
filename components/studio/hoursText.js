// Opening hours in the site's words (services website W3), from the store's
// booking hours: { sat: [['10:00','20:00']], … } in Dhaka time.
import { timeWords } from './booking/bookingText.js';

const ORDER = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']; // the Bangladeshi week starts on Saturday

/** [{ days: ['sat','sun'], text }] — days with the same hours share a row. */
export function hoursRows(hours, tx, lang) {
  if (!hours || typeof hours !== 'object') return [];
  const rows = [];
  for (const d of ORDER) {
    const w = Array.isArray(hours[d]) ? hours[d] : [];
    const text = w.length ? w.map(([a, b]) => timeWords(a, lang) + ' – ' + timeWords(b, lang)).join(', ') : tx('hours.closed');
    const last = rows[rows.length - 1];
    if (last && last.text === text) last.days.push(d);
    else rows.push({ days: [d], text });
  }
  if (rows.length === 1 && rows[0].days.length === 7) return [{ label: tx('days.all'), text: rows[0].text }];
  return rows.map((r) => ({ label: r.days.length > 2 ? tx('days.' + r.days[0]) + ' – ' + tx('days.' + r.days[r.days.length - 1]) : r.days.map((d) => tx('days.' + d)).join(', '), text: r.text }));
}
