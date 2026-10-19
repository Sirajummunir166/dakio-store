// The site's built-in words in Bangla and English (DAKIO_SERVICES_WEBSITE_PLAN.md W0).
// The owner's own text is content; these are the words Dakio writes around it.
// `theme.lang` picks the language; English is the fallback for any missing key.

const EN = {
  'form.name': 'Your name',
  'form.phone': 'Mobile number',
  'form.message': 'How can we help?',
  'form.sending': 'Sending…',
  'form.sent': 'Thank you — we got your message and will get back to you soon.',
  'form.needName': 'Please write your name.',
  'form.needReach': 'Please give your mobile number so we can reach you.',
  'form.badPhone': 'Please check the mobile number (01XXXXXXXXX).',
  'form.error': 'Something went wrong. Please try again.',
  'form.whatsapp': 'Chat on WhatsApp',
  'form.visit': 'VISIT',
  'form.callWa': 'CALL / WHATSAPP',
  'form.hours': 'HOURS',
  'mail.placeholder': 'Email or mobile number',
  'mail.done': 'You are on the list — thank you!',
  'mail.bad': 'Please give an email or a mobile number (01XXXXXXXXX).',
  'video.poster': 'Video poster frame',
  'video.play': 'Play the video',
};

const BN = {
  'form.name': 'আপনার নাম',
  'form.phone': 'মোবাইল নম্বর',
  'form.message': 'আমরা কীভাবে সাহায্য করতে পারি?',
  'form.sending': 'পাঠানো হচ্ছে…',
  'form.sent': 'ধন্যবাদ — আপনার বার্তা পেয়েছি, শিগগিরই যোগাযোগ করব।',
  'form.needName': 'অনুগ্রহ করে আপনার নাম লিখুন।',
  'form.needReach': 'যোগাযোগের জন্য আপনার মোবাইল নম্বর দিন।',
  'form.badPhone': 'মোবাইল নম্বরটি দেখে নিন (01XXXXXXXXX)।',
  'form.error': 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  'form.whatsapp': 'হোয়াটসঅ্যাপে কথা বলুন',
  'form.visit': 'ঠিকানা',
  'form.callWa': 'কল / হোয়াটসঅ্যাপ',
  'form.hours': 'সময়',
  'mail.placeholder': 'ইমেইল বা মোবাইল নম্বর',
  'mail.done': 'আপনি তালিকায় যুক্ত হয়েছেন — ধন্যবাদ!',
  'mail.bad': 'একটি ইমেইল বা মোবাইল নম্বর দিন (01XXXXXXXXX)।',
  'video.poster': 'ভিডিওর পোস্টার ছবি',
  'video.play': 'ভিডিও চালান',
};

/** `tx(lang)` → `(key) => words`, English for a missing key or language. */
export function siteText(lang) {
  const d = lang === 'bn' ? BN : EN;
  return (key) => d[key] ?? EN[key] ?? key;
}

export const SITE_TEXT = { en: EN, bn: BN };
