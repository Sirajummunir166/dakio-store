import test from 'node:test';
import assert from 'node:assert/strict';
import { businessJsonLd, serviceJsonLd, faqJsonLd, storeUrls, robotsTxt } from './seo.js';
import { priceWords, durationWords, groupServices } from '../components/studio/servicesText.js';
import { siteText } from '../components/studio/siteText.js';

const svcs = [
  { id: '1', slug: 'bridal-makeup', name: 'Bridal makeup', priceType: 'from', price: 15000, durationMin: 180, category: 'Makeup' },
  { id: '2', slug: 'gold-facial', name: 'Gold facial', priceType: 'fixed', price: 2500, durationMin: 60, category: 'Skin' },
  { id: '3', slug: 'home-service', name: 'Home service', priceType: 'quote', category: 'Makeup' },
];

test('a services store is a business of its kind, with hours and its services; a shop is not', () => {
  const store = { name: 'Glow', phone: '01711000000', address: 'Road 7', city: 'Dhaka', business: { kind: 'beauty_parlour', shape: 'appointment', hours: { sun: [['10:00', '20:00']], fri: [] } } };
  const ld = businessJsonLd(store, { url: 'https://glow.dakio.shop/', services: svcs });
  assert.equal(ld['@type'], 'BeautySalon');
  assert.deepEqual(ld.openingHoursSpecification, [{ '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/Sunday', opens: '10:00', closes: '20:00' }]);
  assert.equal(ld.address.addressCountry, 'BD');
  const offers = ld.hasOfferCatalog.itemListElement;
  assert.equal(offers.length, 3);
  assert.equal(offers[1].price, '2500.00');
  assert.equal(offers[0].priceSpecification.minPrice, '15000.00');
  assert.equal(offers[2].price, undefined, 'on quote states no price');
  assert.equal(businessJsonLd({ name: 'Shop', business: { shape: null } }), null);
  assert.equal(businessJsonLd({ name: 'X', business: { kind: 'other', shape: 'quote' } })['@type'], 'LocalBusiness');
});

test('a service page and the FAQ', () => {
  const s = serviceJsonLd(svcs[1], { url: 'https://g.shop/s/gold-facial', storeName: 'Glow' });
  assert.equal(s['@type'], 'Service'); assert.equal(s.provider.name, 'Glow'); assert.equal(s.offers.price, '2500.00');
  assert.equal(serviceJsonLd(svcs[2]).offers, undefined);
  const faq = faqJsonLd({ sections: [{ type: 'faq', props: { items: [{ q: 'Advance?', a: '<p>30% by bKash</p>' }, { q: '', a: 'x' }] } }, { type: 'faq', hidden: true, props: { items: [{ q: 'Hidden', a: 'no' }] } }] });
  assert.deepEqual(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), [['Advance?', '30% by bKash']]);
  assert.equal(faqJsonLd({ sections: [] }), null);
});

test('the sitemap lists /services and each service on a store with a site', () => {
  const locs = storeUrls({ origin: 'https://g.shop', site: { pages: [] }, services: svcs }).map((e) => e.loc);
  assert.ok(locs.includes('https://g.shop/services'));
  assert.ok(locs.includes('https://g.shop/s/gold-facial'));
  assert.ok(!storeUrls({ origin: 'https://g.shop', site: null, services: svcs }).some((e) => e.loc.includes('/s/')));
});

test('prices and times in the site\'s language; groups keep their order', () => {
  const en = siteText('en'); const bn = siteText('bn');
  assert.equal(priceWords(svcs[0], en), 'from ৳15,000');
  assert.equal(priceWords(svcs[0], bn), '৳15,000 থেকে');
  assert.equal(priceWords(svcs[2], bn), 'আলোচনা সাপেক্ষে');
  assert.equal(durationWords(90, en), '1 h 30 min');
  assert.equal(durationWords(180, bn), '3 ঘণ্টা');
  assert.equal(durationWords(null, en), null);
  assert.deepEqual(groupServices(svcs).map((g) => [g.name, g.items.length]), [['Makeup', 2], ['Skin', 1]]);
});

test('the sitemap lists /book once the business books online, never the private status pages', () => {
  const site = { pages: [{ id: 'home', slug: '/' }] }
  const services = [{ slug: 'bridal-makeup' }]
  const on = storeUrls({ origin: 'https://x.test', site, services, booking: true }).map((u) => u.loc)
  assert.ok(on.includes('https://x.test/book'))
  const off = storeUrls({ origin: 'https://x.test', site, services }).map((u) => u.loc)
  assert.ok(!off.includes('https://x.test/book'))
  assert.match(robotsTxt(), /Disallow: \/b\//)
})
