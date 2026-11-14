// Every service section, drawn in every layout and with every option, on a
// computer and a phone, as a visitor and in the editor (DAKIO_SERVICE_KINDS_PLAN.md
// K0). The sections are JSX, so they are bundled with esbuild first (it ships
// with Next); without it the suite is skipped rather than failed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
let esbuild = null;
try { esbuild = await import('esbuild'); } catch { /* skipped below */ }

const SERVICES = [
  { id: 'sv1', slug: 'check-up', name: 'Dental check-up', category: 'General', priceType: 'fixed', price: 800, durationMin: 30, description: 'A look at your teeth and gums.', imageUrl: 'https://example.com/a.jpg' },
  { id: 'sv2', slug: 'scaling', name: 'Scaling and polishing', category: 'General', priceType: 'from', price: 1500, durationMin: 45, description: '', imageUrl: null },
  { id: 'sv3', slug: 'braces', name: 'Braces consultation', category: 'Orthodontics', priceType: 'quote', price: null, durationMin: 20, description: 'Options and the steps.', imageUrl: null },
  { id: 'sv4', slug: 'whitening', name: 'Teeth whitening', category: 'Cosmetic', priceType: 'range', price: 6000, priceMax: 9000, durationMin: 60, description: '', imageUrl: 'https://example.com/b.jpg' },
];

// What each section can be set to: its layouts, and the options that change what it draws.
const MATRIX = {
  svc: {
    vars: ['cards', 'tiles', 'list', 'menu'],
    props: { head: 'Services', sub: 'Prices', btn: 'Book' },
    opts: [{}, { from: 'cat', cat: 'General' }, { from: 'picks', picks: ['sv4', 'sv1'] }, { from: 'picks', picks: [] }, { max: 2 }, { price: false, time: false, desc: false, img: false, cats: false }, { act: 'page' }, { act: 'none' }, { cols: 2 }, { cols: 4, card: 'line' }, { card: 'plain' }],
  },
  book: {
    vars: ['std', 'split', 'card'],
    props: { head: 'Book a time', sub: 'Pick a time', svc: 'any' },
    opts: [{}, { svc: 'sv2' }, { from: 'cat', cat: 'Cosmetic' }, { from: 'picks', picks: ['sv1', 'sv3'], svc: 'sv3' }, { note: 'Bring your old reports.' }, { note: 'x', noteOn: false }],
  },
  enq: {
    vars: ['std', 'split', 'card'],
    props: { head: 'Ask us', sub: 'Tell us', btn: 'Send', svc: 'any' },
    opts: [{}, { svc: 'sv1' }, { ask: false }, { from: 'picks', picks: ['sv2'] }, { points: 'We call back the same day\nNo charge to ask' }],
  },
  pack: {
    vars: ['cards', 'rows'],
    props: { head: 'Packages', sub: '', btn: 'Book this', items: [{ k: 'p1', n: 'Basic', price: '৳2,000', inc: 'One\nTwo' }, { k: 'p2', n: 'Full', price: '৳5,000', inc: 'One\nTwo\nThree', hi: true, svc: 'sv4' }, { k: 'p3', n: 'Gone', price: '৳9,000', inc: 'One', svc: 'deleted' }] },
    opts: [{}, { hiLook: 'fill' }, { ticks: false }],
  },
  course: {
    vars: ['cards', 'list'],
    props: { head: 'Courses', sub: '', btn: 'Enrol', items: [{ k: 'c1', n: 'IELTS', fee: '৳12,000', dur: '2 months', time: 'Morning', note: 'Mock tests' }] },
    opts: [{}, { from: 'all' }, { from: 'cat', cat: 'General' }, { from: 'picks', picks: ['sv3'] }, { from: 'picks', picks: [] }, { cols: 2, card: 'line' }, { card: 'plain' }],
  },
  team: {
    vars: ['grid', 'round', 'list'],
    props: { head: 'Team', sub: '', items: [{ k: 't1', n: 'Dr. A', r: 'Dentist', x: 'Braces' }, { k: 't2', n: 'Dr. B', r: 'Dentist', x: '' }] },
    opts: [{}, { role: false }, { bio: false }, { cols: 4 }],
  },
  gal: {
    vars: ['grid', 'ba', 'proj'],
    props: { head: 'Work', sub: '', items: [{ k: 'g1', t: 'One', m: 'Dhanmondi' }, { k: 'g2', t: '', m: '' }, { k: 'g3', t: '', m: '' }] },
    opts: [{}, { cols: 2 }, { cols: 4, shape: 'tall' }, { shape: 'wide', caps: false }],
  },
  how: {
    vars: ['row', 'list', 'cards'],
    props: { head: 'How it works', sub: '', items: [{ k: 's1', t: 'Ask', d: 'Message us.' }, { k: 's2', t: 'Visit', d: 'We look.' }, { k: 's3', t: 'Done', d: 'We finish.' }] },
    opts: [{}, { mark: 'dot' }, { mark: 'none' }],
  },
  hours: {
    vars: ['split', 'stack', 'card'],
    props: { head: 'Visit us', sub: '', addr: 'House 12, Road 27, Dhanmondi, Dhaka', phone: '01711000111', hoursText: 'Every day', map: true },
    opts: [{}, { map: false }, { callOn: false }, { dirOn: false }, { callOn: false, dirOn: false }, { addr: '', phone: '' }],
  },
  areas: {
    vars: ['chips', 'cols'],
    props: { head: 'Areas', sub: '', list: 'Dhanmondi\nGulshan, Banani', note: 'Not in your area?', btn: 'Ask us' },
    opts: [{}, { pin: false }, { list: '' }],
  },
  trust: {
    vars: ['line', 'cards', 'centre'],
    props: { head: 'In numbers', items: [{ k: 'n1', v: '8 years', l: 'in Dhanmondi' }, { k: 'n2', v: '2,400+', l: 'patients' }], certs: 'BMDC registered' },
    opts: [{}, { head: '', certs: '' }],
  },
  band: {
    vars: ['row', 'centre', 'card'],
    props: { head: 'Ready when you are', sub: 'Pick a time.', btn: 'Book now', bg: 'accent' },
    opts: [{}, { btn2On: true, btn2: 'WhatsApp us', to2: { t: 'wa', ref: '' } }, { sub: '' }],
  },
};

test('service sections render in every layout and option', { skip: esbuild ? false : 'esbuild is not installed' }, async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'dakio-sections-'));
  const entry = join(dir, 'entry.jsx');
  const out = join(dir, 'bundle.mjs');
  writeFileSync(entry, [
    `export { SECTION_COMPONENTS } from ${JSON.stringify(join(here, 'index.js'))};`,
    `export { resolveTheme } from ${JSON.stringify(join(here, '..', 'theme.js'))};`,
    `export { renderToStaticMarkup } from 'react-dom/server';`,
    `export { createElement } from 'react';`,
  ].join('\n'));
  try {
    await esbuild.build({
      entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'silent',
      jsx: 'automatic', loader: { '.js': 'jsx' }, nodePaths: [join(here, '..', '..', '..', 'node_modules')],
      banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
    });
    const { SECTION_COMPONENTS, resolveTheme, renderToStaticMarkup, createElement } = await import(pathToFileURL(out).href);

    const ctxOf = ({ mob, preview, lang, services = SERVICES, palette = 'sage' }) => ({
      ...resolveTheme({ p: palette, f: lang === 'bn' ? 'banglam' : 'clean', c: 'soft' }),
      mob, padX: mob ? 20 : 40, preview, isPublic: preview, assets: {}, theme: { lang },
      cat: { services, products: [], collections: [] },
      business: { sells: 'services', shape: 'appointment', mainAction: 'book', booking: { on: true, autoConfirm: true }, hours: null },
    });
    const draw = (type, v, props, ctx) => renderToStaticMarkup(createElement(SECTION_COMPONENTS[type], { sec: { id: 'x1', type, v, props: { bg: 'base', sp: 'normal', ...props } }, ctx }));

    let drawn = 0;
    for (const [type, m] of Object.entries(MATRIX)) {
      await t.test(type, () => {
        for (const v of [...m.vars, undefined, 'not-a-layout']) {
          for (const o of m.opts) {
            for (const mob of [false, true]) {
              for (const preview of [true, false]) {
                for (const lang of ['en', 'bn']) {
                  const html = draw(type, v, { ...m.props, ...o }, ctxOf({ mob, preview, lang }));
                  assert.equal(typeof html, 'string', `${type}/${v}`);
                  drawn++;
                }
              }
            }
          }
        }
        // With no services at all a visitor's page still draws (or leaves the section out).
        for (const v of m.vars) draw(type, v, m.props, ctxOf({ mob: true, preview: true, lang: 'bn', services: [] }));
        // On every section colour.
        for (const bg of ['base', 'card', 'tint', 'ink', 'accent']) draw(type, m.vars[0], { ...m.props, bg }, ctxOf({ mob: false, preview: true, lang: 'en', palette: 'noir' }));
      });
    }
    assert.ok(drawn > 1500, 'the matrix ran: ' + drawn);

    const pub = ctxOf({ mob: false, preview: true, lang: 'en' });
    const count = (html, mark) => html.split(mark).length - 1;

    await t.test('Services: which services, and what each shows', () => {
      assert.equal(count(draw('svc', 'cards', { ...MATRIX.svc.props }, pub), 'data-service='), 4);
      assert.equal(count(draw('svc', 'cards', { ...MATRIX.svc.props, from: 'cat', cat: 'general' }, pub), 'data-service='), 2);
      const picked = draw('svc', 'list', { ...MATRIX.svc.props, from: 'picks', picks: ['sv4', 'sv1'] }, pub);
      assert.ok(picked.indexOf('Teeth whitening') < picked.indexOf('Dental check-up'), 'picked order is kept');
      assert.equal(count(draw('svc', 'menu', { ...MATRIX.svc.props, max: 3 }, pub), 'data-service='), 3);
      // A visitor never sees an empty frame; the editor says why it is empty.
      assert.equal(draw('svc', 'cards', { ...MATRIX.svc.props, from: 'picks', picks: [] }, pub), '');
      assert.match(draw('svc', 'cards', { ...MATRIX.svc.props, from: 'picks', picks: [] }, { ...pub, preview: false, isPublic: false }), /data-svc-empty/);
      const bare = draw('svc', 'cards', { ...MATRIX.svc.props, price: false, time: false, desc: false, img: false, act: 'none' }, pub);
      assert.ok(!bare.includes('৳') && !bare.includes('<img') && !bare.includes('data-svc-btn') && !bare.includes('A look at your teeth'));
      assert.equal(count(draw('svc', 'cards', MATRIX.svc.props, pub), 'data-svc-btn'), 4);
      assert.match(draw('svc', 'cards', { ...MATRIX.svc.props, cols: 4 }, pub), /repeat\(4, minmax/);
      assert.match(draw('svc', 'tiles', { ...MATRIX.svc.props }, { ...pub, mob: true }), /repeat\(2, minmax/);
    });

    await t.test('Booking and Enquiry: only the chosen services are offered', () => {
      const all = draw('book', 'std', MATRIX.book.props, pub);
      assert.equal(count(all, 'data-book-service='), 4);
      const some = draw('book', 'split', { ...MATRIX.book.props, from: 'picks', picks: ['sv1', 'sv3'] }, pub);
      assert.equal(count(some, 'data-book-service='), 2);
      assert.match(some, /data-book-layout="split"/);
      // Started on one service: the list is replaced by that service.
      const one = draw('book', 'card', { ...MATRIX.book.props, svc: 'sv2' }, pub);
      assert.equal(count(one, 'data-book-service='), 0);
      assert.ok(one.includes('Scaling and polishing'));
      const enq = draw('enq', 'std', { ...MATRIX.enq.props, from: 'cat', cat: 'Cosmetic' }, pub);
      assert.equal(count(enq, '<option'), 2, 'something else + the one cosmetic service');
      assert.equal(count(draw('enq', 'card', { ...MATRIX.enq.props, ask: false }, pub), '<select'), 0);
      assert.match(draw('enq', 'split', { ...MATRIX.enq.props, points: 'We call back\nFree to ask' }, pub), /We call back/);
    });

    await t.test('Packages and Courses read the live service', () => {
      const html = draw('pack', 'cards', MATRIX.pack.props, pub);
      assert.equal(count(html, 'data-pack-live'), 1, 'only the package tied to a service that still exists');
      assert.ok(html.includes('৳6,000–৳9,000') && html.includes('৳2,000') && html.includes('৳9,000'));
      assert.match(draw('pack', 'rows', MATRIX.pack.props, pub), /data-pack-layout="rows"/);
      const live = draw('course', 'cards', { ...MATRIX.course.props, from: 'cat', cat: 'General' }, pub);
      assert.match(live, /data-course-from="services"/);
      assert.equal(count(live, 'data-course='), 2);
      assert.ok(live.includes('Dental check-up') && !live.includes('IELTS'));
      const own = draw('course', 'list', MATRIX.course.props, pub);
      assert.ok(own.includes('IELTS') && own.includes('data-course-from="own"'));
    });

    await t.test('Layouts and switches of the other sections', () => {
      for (const v of ['grid', 'round', 'list']) assert.match(draw('team', v, MATRIX.team.props, pub), new RegExp(`data-team-layout="${v}"`));
      assert.ok(!draw('team', 'grid', { ...MATRIX.team.props, role: false, bio: false }, pub).includes('Dentist'));
      assert.match(draw('gal', 'grid', { ...MATRIX.gal.props, cols: 4 }, pub), /data-gal-cols="4"/);
      assert.ok(!draw('gal', 'proj', { ...MATRIX.gal.props, caps: false }, pub).includes('Dhanmondi'));
      for (const v of ['row', 'list', 'cards']) assert.match(draw('how', v, MATRIX.how.props, pub), new RegExp(`data-how-layout="${v}"`));
      for (const v of ['line', 'cards', 'centre']) assert.match(draw('trust', v, MATRIX.trust.props, pub), new RegExp(`data-trust-layout="${v}"`));
      assert.match(draw('areas', 'cols', MATRIX.areas.props, pub), /data-areas="cols"/);
      assert.equal(count(draw('areas', 'chips', MATRIX.areas.props, pub), 'Banani'), 1, 'commas split areas too');
      for (const v of ['row', 'centre', 'card']) assert.match(draw('band', v, MATRIX.band.props, pub), new RegExp(`data-band-layout="${v}"`));
      assert.equal(count(draw('band', 'row', MATRIX.band.props, pub), 'data-band-btn2'), 0);
      assert.equal(count(draw('band', 'row', { ...MATRIX.band.props, btn2On: true, btn2: 'WhatsApp us' }, pub), 'data-band-btn2'), 1);
      const hours = draw('hours', 'split', MATRIX.hours.props, pub);
      assert.ok(hours.includes('tel:+8801711000111') && hours.includes('<iframe'));
      const quiet = draw('hours', 'stack', { ...MATRIX.hours.props, callOn: false, dirOn: false, map: false }, pub);
      assert.ok(!quiet.includes('tel:') && !quiet.includes('maps/search') && !quiet.includes('<iframe'));
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
