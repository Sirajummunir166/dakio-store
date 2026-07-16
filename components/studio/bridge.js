'use client';
// Canvas-side (iframe child) postMessage bridge to the Store Studio chrome (dakio-merchant).
// Protocol (child → parent):
//   ready | editStart | prop {id,key,val} | brand {val} | sel {id} | act {a,id}
//   lib {at} | navMenus {label?} | goPage {id} | img {slotId,dataUrl} | height {px}
//   secOffset {id,top} | undo | redo
// Parent → child: state {doc,curPage,device,preview,sel,building} | scrollToSec {id}

const MARK = 'dakio-studio';

export function send(t, payload = {}) {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage({ mark: MARK, t, ...payload }, '*');
}

export function listen(handler) {
  const fn = (ev) => {
    const d = ev.data;
    if (!d || d.mark !== MARK) return;
    handler(d);
  };
  window.addEventListener('message', fn);
  return () => window.removeEventListener('message', fn);
}
