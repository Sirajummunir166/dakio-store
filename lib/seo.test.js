import { test } from 'node:test'
import assert from 'node:assert/strict'
import { productJsonLd, jsonLdString, sitemapXml, storeUrls, robotsTxt } from './seo.js'
import { isCustomDomain } from './hosts.js'

const POLO = {
  name: 'Classic Polo', slug: 'classic-polo', sku: 'POLO-1',
  description: '<p>Cotton blend, <strong>regular fit</strong>.</p>', shortDescription: null,
  imageUrl: 'https://res.cloudinary.com/demo/polo.jpg',
  images: ['https://res.cloudinary.com/demo/polo.jpg', 'https://res.cloudinary.com/demo/polo-2.jpg', '/relative.jpg'],
  sellingPrice: 650, compareAtPrice: 750, campaign: null,
  category: { id: 'c1', name: 'Polo' }, totalStock: 12,
  variants: [{ name: 'M', price: null, stock: 5 }, { name: 'L', price: null, stock: 7 }],
}
const URL_ = 'https://glameen.dakio.shop/p/classic-polo'

test('a product becomes schema.org Product with one Offer, in the shop\'s currency', () => {
  const d = productJsonLd(POLO, { url: URL_, currency: 'BDT', storeName: 'Glameen' })
  assert.equal(d['@type'], 'Product')
  assert.equal(d.description, 'Cotton blend, regular fit.')
  assert.deepEqual(d.image, ['https://res.cloudinary.com/demo/polo.jpg', 'https://res.cloudinary.com/demo/polo-2.jpg'])
  assert.equal(d.sku, 'POLO-1')
  assert.equal(d.category, 'Polo')
  assert.deepEqual(d.offers, {
    '@type': 'Offer', priceCurrency: 'BDT', price: '650.00',
    availability: 'https://schema.org/InStock', url: URL_, seller: { '@type': 'Organization', name: 'Glameen' },
  })
})

test('no stock count, no brand claim, no ratings — only what the shop shows', () => {
  const json = JSON.stringify(productJsonLd(POLO, { url: URL_ }))
  assert.doesNotMatch(json, /"12"|totalStock|brand|aggregateRating|review/i)
})

test('variants that cost different amounts give the real price range', () => {
  const d = productJsonLd({ ...POLO, variants: [{ name: 'M', price: null }, { name: 'XXL', price: 720 }] }, { url: URL_ })
  assert.equal(d.offers['@type'], 'AggregateOffer')
  assert.equal(d.offers.lowPrice, '650.00')
  assert.equal(d.offers.highPrice, '720.00')
  assert.equal(d.offers.offerCount, 2)
})

test('during a sale only the sale price is claimed (list variant prices are pre-sale)', () => {
  const d = productJsonLd({ ...POLO, sellingPrice: 520, campaign: { percent: 20 }, variants: [{ name: 'XXL', price: 720 }] }, { url: URL_ })
  assert.equal(d.offers['@type'], 'Offer')
  assert.equal(d.offers.price, '520.00')
})

test('out of stock and unknown stock read differently', () => {
  assert.equal(productJsonLd({ ...POLO, totalStock: 0 }).offers.availability, 'https://schema.org/OutOfStock')
  assert.equal('availability' in productJsonLd({ ...POLO, totalStock: undefined }).offers, false)
})

test('no product, no markup; a bad price, no offer', () => {
  assert.equal(productJsonLd(null), null)
  assert.equal('offers' in productJsonLd({ ...POLO, sellingPrice: 'abc' }), false)
})

test('a product name cannot close the script tag', () => {
  const s = jsonLdString(productJsonLd({ ...POLO, name: 'Polo</script><script>alert(1)</script>' }))
  assert.doesNotMatch(s, /<\/script>/i)
  assert.equal(JSON.parse(s).name, 'Polo</script><script>alert(1)</script>')
})

test('storeUrls: home, shop, collections, published pages, products — never a private page', () => {
  const site = { pages: [{ slug: '/' }, { slug: '/about' }, { slug: '/checkout' }, { slug: '/cart-help' }, { slug: '/faq' }, { id: 'sys' }] }
  const urls = storeUrls({ origin: 'https://shop.com', site, products: [POLO, { slug: 'a b' }, {}], categories: [{ slug: 'polo' }] }).map((u) => u.loc)
  assert.deepEqual(urls, [
    'https://shop.com/', 'https://shop.com/shop', 'https://shop.com/shop/polo',
    'https://shop.com/about', 'https://shop.com/faq',
    'https://shop.com/p/classic-polo', 'https://shop.com/p/a%20b',
  ])
})

test('storeUrls: a store without a Studio site lists its legacy /products/ pages', () => {
  const urls = storeUrls({ origin: 'https://shop.com', products: [POLO] }).map((u) => u.loc)
  assert.deepEqual(urls, ['https://shop.com/', 'https://shop.com/products/classic-polo'])
})

test('sitemapXml escapes and wraps', () => {
  const xml = sitemapXml([{ loc: 'https://shop.com/?a=1&b=2' }])
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/)
  assert.match(xml, /<loc>https:\/\/shop.com\/\?a=1&amp;b=2<\/loc>/)
})

test('robotsTxt: private paths closed, sitemap only when given', () => {
  const withMap = robotsTxt({ sitemapUrl: 'https://shop.com/sitemap.xml' })
  assert.match(withMap, /^User-agent: \*\nAllow: \//)
  assert.match(withMap, /Disallow: \/checkout\n/)
  assert.match(withMap, /Sitemap: https:\/\/shop.com\/sitemap.xml\n$/)
  assert.doesNotMatch(robotsTxt(), /Sitemap/)
})

test('hosts: a store subdomain and a custom domain are store hosts; Dakio\'s are not', () => {
  assert.equal(isCustomDomain('glameen.dakio.shop'), true)
  assert.equal(isCustomDomain('shop.com'), true)
  assert.equal(isCustomDomain('dakio.io'), false)
  assert.equal(isCustomDomain('dakio-store.vercel.app'), false)
  assert.equal(isCustomDomain('localhost'), false)
})
