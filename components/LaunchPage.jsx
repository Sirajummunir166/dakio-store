'use client';
import { useEffect, useState } from 'react';
import { dayWords, timeWords } from './studio/booking/bookingText';

// What a store's address shows while it has no published website (the old
// theme pages are retired, owner 2026-11-09). The merchant picks the kind in
// Store Studio › Settings › Before you publish: "Under construction", or
// "Coming soon" with a countdown to the opening. Data: the API's
// /store/:slug/site answer for an unpublished store (dakio-api
// src/lib/launchPage.js) plus the store's public details for the contact row.

const WORDS = {
  en: {
    building: 'Our website is being built',
    buildingSub: 'We are getting everything ready. Please come back soon.',
    soon: 'Coming soon',
    soonSub: 'Our new website opens in',
    opens: 'Opening {date}',
    any: 'Opening any moment now',
    reach: 'Meanwhile, you can reach us here',
    call: 'Call us',
    email: 'Email',
    d: 'Days', h: 'Hours', m: 'Minutes', s: 'Seconds',
  },
  bn: {
    building: 'আমাদের ওয়েবসাইট তৈরি হচ্ছে',
    buildingSub: 'সবকিছু গুছিয়ে নিচ্ছি। কিছুদিন পর আবার আসুন।',
    soon: 'শীঘ্রই আসছে',
    soonSub: 'আমাদের নতুন ওয়েবসাইট খুলছে',
    opens: '{date} খুলছে',
    any: 'যেকোনো মুহূর্তে খুলছে',
    reach: 'এর মধ্যে এখানে যোগাযোগ করতে পারেন',
    call: 'কল করুন',
    email: 'ইমেইল',
    d: 'দিন', h: 'ঘণ্টা', m: 'মিনিট', s: 'সেকেন্ড',
  },
};

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const toBn = (s) => String(s).replace(/[0-9]/g, (d) => BN_DIGITS[d]);

// "Sat 14 Nov, 8:16 PM" / "শনি ১৪ নভে, রাত ৮:১৬", in Dhaka time (Dhaka is UTC+6).
function openingDate(iso, lang) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  const local = new Date(ms + 6 * 3_600_000).toISOString();
  return dayWords(local.slice(0, 10), lang) + ', ' + timeWords(local.slice(11, 16), lang);
}

function useCountdown(at) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!at) return undefined;
    const end = Date.parse(at);
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [at]);
  return left;
}

const waLink = (n) => {
  const d = String(n || '').replace(/[^0-9]/g, '');
  if (!d) return null;
  return 'https://wa.me/' + (d.startsWith('0') ? '88' + d : d);
};

export default function LaunchPage({ launch, store }) {
  const lang = launch?.lang === 'bn' ? 'bn' : 'en';
  const w = WORDS[lang];
  const num = (n) => (lang === 'bn' ? toBn(n) : String(n));
  const name = launch?.brand || store?.name || '';
  const logo = launch?.logo || store?.logoUrl || null;
  const soon = launch?.mode === 'soon';
  const left = useCountdown(soon ? launch?.at : null);

  const contacts = [
    store?.whatsappNumber && { label: 'WhatsApp', href: waLink(store.whatsappNumber) },
    store?.phone && { label: w.call, href: 'tel:' + String(store.phone).replace(/[^0-9+]/g, '') },
    store?.facebookUrl && { label: 'Facebook', href: store.facebookUrl },
    store?.instagramUrl && { label: 'Instagram', href: store.instagramUrl },
    store?.email && { label: w.email, href: 'mailto:' + store.email },
  ].filter((c) => c && c.href);

  const parts = left == null ? null : [
    [Math.floor(left / 864e5), w.d],
    [Math.floor(left / 36e5) % 24, w.h],
    [Math.floor(left / 6e4) % 60, w.m],
    [Math.floor(left / 1e3) % 60, w.s],
  ];

  return (
    <main className="dk-launch" lang={lang}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;800&family=Hind+Siliguri:wght@400;600;700&display=swap" precedence="default" />
      <style>{CSS}</style>
      <div className="dk-launch-card">
        {logo
          ? <img className="dk-launch-logo" src={logo} alt={name} />
          : name ? <div className="dk-launch-name">{name}</div> : null}
        {logo && name ? <div className="dk-launch-brand">{name}</div> : null}

        <h1 className="dk-launch-h">{soon ? w.soon : w.building}</h1>
        {launch?.msg
          ? <p className="dk-launch-sub">{launch.msg}</p>
          : <p className="dk-launch-sub">{soon ? (launch?.at ? w.soonSub : '') : w.buildingSub}</p>}

        {soon && launch?.at && (
          left === 0
            ? <div className="dk-launch-when">{w.any}</div>
            : (
              <>
                <div className="dk-launch-count" aria-live="off">
                  {(parts || [[null, w.d], [null, w.h], [null, w.m], [null, w.s]]).map(([v, label]) => (
                    <div key={label} className="dk-launch-unit">
                      <div className="dk-launch-num">{v == null ? '··' : num(String(v).padStart(2, '0'))}</div>
                      <div className="dk-launch-lbl">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="dk-launch-when">{w.opens.replace('{date}', openingDate(launch.at, lang))}</div>
              </>
            )
        )}

        {contacts.length > 0 && (
          <div className="dk-launch-reach">
            <div className="dk-launch-reach-t">{w.reach}</div>
            <div className="dk-launch-links">
              {contacts.map((c) => (
                <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{c.label}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const CSS = `
.dk-launch{--ink:#17181a;--sub:#5f625a;--line:rgba(23,24,26,.12);--bg:#f5f4ef;--card:#fff;min-height:100vh;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg);color:var(--ink);font-family:'Hanken Grotesk','Hind Siliguri',system-ui,sans-serif}
.dk-launch[lang=bn]{font-family:'Hind Siliguri','Hanken Grotesk',system-ui,sans-serif}
.dk-launch-card{width:100%;max-width:560px;text-align:center}
.dk-launch-logo{max-width:160px;max-height:72px;object-fit:contain;display:block;margin:0 auto 14px}
.dk-launch-name{font-size:22px;font-weight:800;letter-spacing:-.2px;margin-bottom:6px}
.dk-launch-brand{font-size:13px;font-weight:600;color:var(--sub);margin-bottom:6px}
.dk-launch-h{margin:28px 0 0;font-size:clamp(30px,7vw,48px);line-height:1.08;font-weight:800;letter-spacing:-.8px}
.dk-launch[lang=bn] .dk-launch-h{letter-spacing:0;line-height:1.25}
.dk-launch-sub{margin:14px auto 0;max-width:440px;font-size:16px;line-height:1.6;color:var(--sub);white-space:pre-line}
.dk-launch-count{display:flex;justify-content:center;gap:10px;margin-top:28px}
.dk-launch-unit{width:76px;padding:14px 0 10px;border-radius:14px;background:var(--card);border:1px solid var(--line)}
.dk-launch-num{font-size:30px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1}
.dk-launch-lbl{margin-top:6px;font-size:11.5px;font-weight:600;color:var(--sub)}
.dk-launch-when{margin-top:14px;font-size:14px;font-weight:600;color:var(--sub)}
.dk-launch-reach{margin-top:40px;padding-top:22px;border-top:1px solid var(--line)}
.dk-launch-reach-t{font-size:13px;color:var(--sub)}
.dk-launch-links{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:12px}
.dk-launch-links a{padding:9px 16px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:14px;font-weight:600;text-decoration:none}
.dk-launch-links a:hover{border-color:var(--ink)}
@media (max-width:420px){.dk-launch-unit{width:66px}.dk-launch-num{font-size:26px}.dk-launch-count{gap:8px}}
`;
