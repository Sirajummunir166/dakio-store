'use client';
import { useEffect } from 'react';

// The product photo gallery's speed and feel (product page + Product detail).
//
// A thumbnail is a small copy (360 px); the big frame shows a 1200 px copy.
// Before this, the big copy started downloading only on the click, so the
// first tap on each photo waited 2 to 3 seconds (owner, 2026-11-09). Now:
//  - every big copy is fetched quietly once the page has loaded (usePreload),
//    and again the moment a pointer rests on a thumbnail (warm);
//  - the big frame paints the already-loaded thumbnail at once, under the big
//    copy, so a tap always changes the picture now and sharpens when ready;
//  - the tile gives under the finger and the new photo fades in (GALLERY_CSS).

const warmed = new Set();

/** Start fetching one photo now (once per page). */
export function warm(url) {
  if (!url || typeof window === 'undefined' || warmed.has(url)) return;
  warmed.add(url);
  const im = new window.Image();
  im.decoding = 'async';
  im.src = url;
}

/** Fetch these photos after the page has loaded, when the browser is idle. */
export function usePreload(urls) {
  const key = (urls || []).filter(Boolean).join('|');
  useEffect(() => {
    if (!key || typeof window === 'undefined') return undefined;
    const list = key.split('|');
    let timer = null;
    let idleId = null;
    const go = () => list.forEach(warm);
    const later = () => {
      if (window.requestIdleCallback) idleId = window.requestIdleCallback(go, { timeout: 1500 });
      else timer = setTimeout(go, 300);
    };
    if (document.readyState === 'complete') later();
    else window.addEventListener('load', later, { once: true });
    return () => {
      window.removeEventListener('load', later);
      if (timer) clearTimeout(timer);
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
    };
  }, [key]);
}

/** CSS background that shows the small copy while the big one loads. */
export function underlay(url) {
  return url ? { backgroundImage: 'url(' + JSON.stringify(url) + ')', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {};
}

export const GALLERY_CSS = `
@keyframes dkGalIn{from{opacity:.6}to{opacity:1}}
.dk-gal-in{animation:dkGalIn .18s ease-out}
.dk-gal-thumb{transition:transform .12s ease,opacity .15s ease}
.dk-gal-thumb:hover{opacity:.9}
.dk-gal-thumb:active{transform:scale(.93)}
@media (prefers-reduced-motion:reduce){.dk-gal-in{animation:none}.dk-gal-thumb{transition:none}.dk-gal-thumb:active{transform:none}}
`;
