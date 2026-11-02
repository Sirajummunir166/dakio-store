// Builder guidance inside the Store Studio canvas (image-slot hints,
// placeholders, crop controls) in the merchant's UI language. The chrome sends
// its language with every state message; shoppers never see these strings
// (Store Studio audit SST-27: with the builder in Bangla they stayed English).
// English is the source text; unknown strings pass through unchanged. Digits
// stay Latin in Bangla, as everywhere in the merchant app.

const BN = {
  // empty-slot placeholders
  'Hero image — your best product shot': 'হিরো ছবি — আপনার সেরা পণ্যের ছবি',
  'Full-bleed hero image': 'পুরো চওড়া হিরো ছবি',
  'IG post': 'ইনস্টাগ্রাম পোস্ট',
  'Logo': 'লোগো',
  'Product photo — shared with your product page': 'পণ্যের ছবি — পণ্যের পেজেও এটিই দেখাবে',
  'Main product photo': 'পণ্যের মূল ছবি',
  'Alt view': 'অন্য দিক থেকে ছবি',
  'Story image — workshop, founder, fabric detail': 'গল্পের ছবি — কর্মশালা, প্রতিষ্ঠাতা বা পণ্যের খুঁটিনাটি',
  'Video poster frame': 'ভিডিওর পোস্টার ছবি',
  // size guides
  'Wide wordmark or icon, ~4:1 to 5:1, transparent PNG works best.': 'চওড়া লেখা বা আইকন, ~4:1 থেকে 5:1, স্বচ্ছ PNG সবচেয়ে ভালো।',
  'Portrait, ~1200×1500px (4:5 desktop, 4:3 mobile). Center the subject with margin on all sides.': 'লম্বালম্বি, ~1200×1500px (ডেস্কটপে 4:5, মোবাইলে 4:3)। বিষয়টি মাঝখানে রাখুন, চারপাশে জায়গা রেখে।',
  'Square, ~1080×1080px.': 'বর্গাকার, ~1080×1080px।',
  'Portrait, ~1200×1500px (4:5), shared with your product page.': 'লম্বালম্বি, ~1200×1500px (4:5), পণ্যের পেজেও এটিই দেখাবে।',
  'Portrait, ~1200×1500px (4:5). Center the product with margin on all sides.': 'লম্বালম্বি, ~1200×1500px (4:5)। পণ্যটি মাঝখানে রাখুন, চারপাশে জায়গা রেখে।',
  'Square, ~800×800px alt view.': 'বর্গাকার, ~800×800px — অন্য দিক থেকে ছবি।',
  'Square, ~800×800px.': 'বর্গাকার, ~800×800px।',
  'Landscape-ish, ~1200×1030px. Keep the subject centered.': 'প্রায় আড়াআড়ি, ~1200×1030px। বিষয়টি মাঝখানে রাখুন।',
  'Widescreen, ~1600×900px — the thumbnail shown before play.': 'চওড়া, ~1600×900px — ভিডিও চালুর আগে যে ছবি দেখায়।',
  'Wide, ~1600×1000px (16:10). Also used as this collection’s page banner — keep the subject centered with margin.': 'চওড়া, ~1600×1000px (16:10)। এই কালেকশনের পেজের ব্যানারেও এটি দেখাবে — বিষয়টি মাঝখানে, চারপাশে জায়গা রেখে।',
  'Portrait, ~1000×1250px (4:5). Also used as this collection’s page banner — keep the subject centered with margin.': 'লম্বালম্বি, ~1000×1250px (4:5)। এই কালেকশনের পেজের ব্যানারেও এটি দেখাবে — বিষয়টি মাঝখানে, চারপাশে জায়গা রেখে।',
  // crop controls
  'Click to swap image · double-click to set focus & crop': 'ছবি বদলাতে ক্লিক করুন · ফোকাস ও ক্রপ করতে ডাবল-ক্লিক',
  "This photo's shape doesn't match this frame — click to recenter": 'ছবির মাপ এই ফ্রেমের সাথে মিলছে না — মাঝখানে আনতে ক্লিক করুন',
  '⚠ Recenter photo': '⚠ ছবি মাঝখানে আনুন',
  'DRAG TO REFRAME · SCROLL TO ZOOM': 'টেনে ফ্রেম ঠিক করুন · স্ক্রল করে জুম',
  'Done': 'হয়েছে',
};

// The full-bleed hero's guide carries its height (mobile / desktop).
const BLEED = /^Wide landscape, at least 1800px wide, ~(\d+)px tall\. Center the subject — very wide screens crop the sides\.$/;

export function canvasCopy(text, lang) {
  if (lang !== 'bn' || typeof text !== 'string') return text;
  if (BN[text]) return BN[text];
  const m = BLEED.exec(text);
  if (m) return `চওড়া আড়াআড়ি, অন্তত 1800px চওড়া, ~${m[1]}px উঁচু। বিষয়টি মাঝখানে রাখুন — খুব চওড়া স্ক্রিনে দুই পাশ কেটে যায়।`;
  return text;
}
