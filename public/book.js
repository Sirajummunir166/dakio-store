/*
 * Dakio booking widget (DAKIO_BOOKING_LINK_PLAN.md, cut 2).
 *
 * Paste on any website:
 *   <script src="https://<store>.dakio.shop/book.js" async></script>
 *
 * Options (attributes on the script tag):
 *   data-service="free-demo-call"  open on one service
 *   data-label="Book a free demo"  the button's words
 *   data-lang="en" | "bn"          the booking page's language
 *   data-mode="inline"             show the booking in the page instead of a button
 *   data-target="#booking"         where the inline booking (or the button) goes
 *   data-color="#1A1D12"           the button's colour
 *   data-button="none"             no button: open it from your own links
 *   data-store="<slug>"            only for store.dakio.io/<slug> addresses
 *
 * Any element with data-dakio-book opens the popup (its value picks a service),
 * and window.DakioBook.open({ service }) does the same from code.
 */
(function () {
  var script = document.currentScript;
  if (!script) {
    var all = document.querySelectorAll('script[src*="book.js"]');
    script = all[all.length - 1];
  }
  if (!script) return;

  var src;
  try { src = new URL(script.src, window.location.href); } catch (e) { return; }
  var d = script.dataset || {};
  var origin = src.origin;
  var store = (d.store || '').replace(/[^a-z0-9-]/gi, '');
  var base = origin + (store ? '/' + store : '') + '/book';
  var lang = d.lang === 'en' || d.lang === 'bn' ? d.lang : '';
  var mode = d.mode === 'inline' ? 'inline' : 'popup';
  var color = /^#[0-9a-f]{3,8}$/i.test(d.color || '') ? d.color : '#1A1D12';
  var label = d.label || (lang === 'en' ? 'Book now' : 'বুক করুন');

  function urlFor(service) {
    var q = ['embed=1'];
    var sv = service || d.service;
    if (sv) q.push('service=' + encodeURIComponent(String(sv).slice(0, 80)));
    if (lang) q.push('lang=' + lang);
    return base + '?' + q.join('&');
  }

  function frame(url, h) {
    var f = document.createElement('iframe');
    f.src = url;
    f.title = 'Booking';
    f.setAttribute('allow', 'clipboard-write');
    f.style.cssText = 'display:block;width:100%;border:0;background:transparent;height:' + h + ';';
    return f;
  }

  // The booking page tells us its height, so an inline booking never scrolls inside itself.
  var sized = [];
  window.addEventListener('message', function (e) {
    if (e.origin !== origin || !e.data || e.data.type !== 'dakio-book-height') return;
    for (var i = 0; i < sized.length; i++) {
      if (sized[i].contentWindow === e.source) {
        var h = Math.max(320, Math.min(4000, Number(e.data.height) || 0));
        sized[i].style.height = h + 'px';
      }
    }
  });

  var overlay = null;
  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.documentElement.style.overflow = '';
  }
  function open(opts) {
    close();
    var service = opts && opts.service;
    var phone = window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(15,18,10,.55);display:flex;align-items:center;justify-content:center;padding:' + (phone ? '0' : '20px') + ';';
    var box = document.createElement('div');
    box.style.cssText = 'position:relative;width:' + (phone ? '100%' : 'min(560px,100%)') + ';height:' + (phone ? '100%' : 'min(820px,100%)') + ';background:#fff;border-radius:' + (phone ? '0' : '18px') + ';overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.28);';
    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.innerHTML = '&#x2715;';
    x.style.cssText = 'position:absolute;top:10px;right:10px;z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:rgba(0,0,0,.06);color:#222;font:600 16px/36px system-ui,sans-serif;cursor:pointer;';
    x.onclick = close;
    var f = frame(urlFor(service), '100%');
    f.style.overflow = 'auto';
    box.appendChild(f);
    box.appendChild(x);
    overlay.appendChild(box);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    x.focus();
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // Your own links and buttons: <a href="#" data-dakio-book="free-demo-call">Book</a>
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-dakio-book]') : null;
    if (!el) return;
    e.preventDefault();
    open({ service: el.getAttribute('data-dakio-book') || undefined });
  });

  window.DakioBook = { open: open, close: close };

  function place(node) {
    var target = d.target ? document.querySelector(d.target) : null;
    if (target) target.appendChild(node);
    else script.parentNode.insertBefore(node, script.nextSibling);
  }

  function mount() {
    if (mode === 'inline') {
      var f = frame(urlFor(), '720px');
      sized.push(f);
      place(f);
      return;
    }
    if (d.button === 'none') return;
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border:0;border-radius:999px;background:' + color + ';color:#fff;font:700 15px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.14);';
    b.onclick = function () { open(); };
    place(b);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
