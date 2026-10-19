// Booking words that are not fixed strings (services website W2): a day and a
// time in the site's language, Dhaka time. The API speaks dates as
// YYYY-MM-DD and times as HH:MM, both already in Dhaka.

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bnDigits = (s) => String(s).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

const DAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_BN = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

const parts = (date) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (!m) return null;
  const y = Number(m[1]); const mo = Number(m[2]) - 1; const d = Number(m[3]);
  return { y, mo, d, wd: new Date(Date.UTC(y, mo, d)).getUTCDay() };
};

/** "Sat 24 Oct" / "শনি ২৪ অক্টো"; `today`/`tomorrow` (YYYY-MM-DD) give "Today"/"আজ" and "Tomorrow"/"কাল". */
export function dayWords(date, lang, { today = null, tomorrow = null } = {}) {
  const p = parts(date);
  if (!p) return '';
  const bn = lang === 'bn';
  if (date === today) return bn ? 'আজ' : 'Today';
  if (date === tomorrow) return bn ? 'আগামীকাল' : 'Tomorrow';
  return bn ? `${DAY_BN[p.wd]} ${bnDigits(p.d)} ${MON_BN[p.mo]}` : `${DAY_EN[p.wd]} ${p.d} ${MON_EN[p.mo]}`;
}

/** "3:30 PM" / "বিকাল ৩:৩০". */
export function timeWords(hhmm, lang) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(hhmm || ''));
  if (!m) return '';
  const h = Number(m[1]); const mm = m[2];
  if (h > 23 || Number(mm) > 59) return '';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  if (lang !== 'bn') return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
  const part = h < 4 ? 'রাত' : h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 18 ? 'বিকাল' : h < 20 ? 'সন্ধ্যা' : 'রাত';
  return `${part} ${bnDigits(h12)}:${bnDigits(mm)}`;
}

/** Today and tomorrow in Dhaka as YYYY-MM-DD. */
export function dhakaToday(now = new Date()) {
  const at = (ms) => new Date(ms + 6 * 3_600_000).toISOString().slice(0, 10);
  return { today: at(now.getTime()), tomorrow: at(now.getTime() + 86_400_000) };
}

/** The day after a YYYY-MM-DD. */
export function nextDate(date) {
  const p = parts(date);
  if (!p) return null;
  return new Date(Date.UTC(p.y, p.mo, p.d + 1)).toISOString().slice(0, 10);
}
