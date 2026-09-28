// The machine-readable layer: what search engines and AI shopping assistants
// read about a store, without changing a pixel of what a shopper sees.
//
//   productJsonLd  — schema.org Product for one product page (price, currency,
//                    availability, images, SKU, category, the shop's own text)
//   sitemapXml     — every page worth indexing on one store host
//   robotsTxt      — what crawlers may read, and where the sitemap is
//
// Built only from what the storefront already renders. No stock counts (the
// availability class is enough), no brand claim the shop never made, no
// rating or review data Dakio does not have.
import { htmlToText } from './theme/sanitizeHtml.js'

// Google reads up to 5,000 characters of a product description.
const DESCRIPTION_MAX = 5000
const IMAGES_MAX = 10

// Paths no crawler needs: carts, checkout, a customer's own orders, previews,
// the builder canvas, and one-off funnel pages (already noindex).
export const PRIVATE_PATHS = ['/checkout', '/cart', '/account', '/track', '/preview', '/studio-preview', '/studio-canvas', '/f/', '/api/', '/dev/']

const money = (n) => {
  const v = Number(n)
  return Number.isFinite(v) && v >= 0 ? v.toFixed(2) : null
}

/** schema.org availability from the storefront's resolved stock, or null when unknown. */
function availabilityOf(totalStock) {
  if (!Number.isFinite(Number(totalStock))) return null
  return Number(totalStock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
}

/**
 * One product as schema.org JSON-LD. `product` is the public API's product
 * shape (list or detail); `url` is the page's absolute URL.
 *
 * Price: `sellingPrice` is already the price after a running sale. A product
 * whose variants cost different amounts gets an AggregateOffer with the real
 * range — except during a sale, where the list read's variant prices are the
 * pre-sale ones, so the one sale price is the only honest figure.
 */
export function productJsonLd(product, { url, currency = 'BDT', storeName } = {}) {
  if (!product?.name) return null
  const price = money(product.sellingPrice)
  const images = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.imageUrl,
  ].filter((u) => typeof u === 'string' && /^https?:\/\//.test(u))
  const uniqueImages = [...new Set(images)].slice(0, IMAGES_MAX)
  const description = htmlToText(product.description || product.shortDescription)
    .replace(/\s+([.,!?;:।])/g, '$1') // a closing tag left a space before the punctuation
    .slice(0, DESCRIPTION_MAX)
  const availability = availabilityOf(product.totalStock)
  const seller = storeName ? { '@type': 'Organization', name: storeName } : undefined

  let offers
  if (price) {
    const variantPrices = product.campaign
      ? []
      : (Array.isArray(product.variants) ? product.variants : []).map((v) => money(v?.price ?? product.sellingPrice)).filter(Boolean)
    const all = [price, ...variantPrices].map(Number)
    const low = Math.min(...all)
    const high = Math.max(...all)
    offers = low !== high
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: currency,
          lowPrice: low.toFixed(2),
          highPrice: high.toFixed(2),
          offerCount: variantPrices.length,
          ...(availability ? { availability } : {}),
          ...(url ? { url } : {}),
          ...(seller ? { seller } : {}),
        }
      : {
          '@type': 'Offer',
          priceCurrency: currency,
          price,
          ...(availability ? { availability } : {}),
          ...(url ? { url } : {}),
          ...(seller ? { seller } : {}),
        }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(description ? { description } : {}),
    ...(uniqueImages.length ? { image: uniqueImages } : {}),
    ...(product.sku ? { sku: String(product.sku) } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    ...(url ? { url } : {}),
    ...(offers ? { offers } : {}),
  }
}

/**
 * JSON for a <script type="application/ld+json"> body. `<` is escaped so a
 * product name or description can never close the script tag.
 */
export function jsonLdString(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const xmlEscape = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** A sitemap from [{ loc, lastmod? }]. */
export function sitemapXml(entries) {
  const rows = entries.map((e) => `  <url><loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `<lastmod>${xmlEscape(e.lastmod)}</lastmod>` : ''}</url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`
}

const encodeSegment = (s) => encodeURIComponent(String(s))

/**
 * Every indexable URL of one store at `origin` (e.g. https://shop.com):
 * home, the shop, each collection, each product, and the Store Studio pages
 * the merchant published. Without a published Studio site the store runs the
 * legacy theme, whose product pages live at /products/<slug>.
 */
export function storeUrls({ origin, site = null, products = [], categories = [] }) {
  const out = [{ loc: `${origin}/` }]
  const seen = new Set(out.map((e) => e.loc))
  const add = (path) => {
    const loc = `${origin}${path}`
    if (!seen.has(loc)) { seen.add(loc); out.push({ loc }) }
  }
  if (site) {
    add('/shop')
    for (const c of categories) if (c?.slug) add(`/shop/${encodeSegment(c.slug)}`)
    for (const page of Array.isArray(site.pages) ? site.pages : []) {
      const slug = typeof page?.slug === 'string' ? page.slug : ''
      if (!/^\/[a-z0-9][a-z0-9-]*$/i.test(slug)) continue // home is "/", system pages have no slug
      // Same prefix rule robots.txt applies, so the sitemap never lists a page robots forbids.
      if (PRIVATE_PATHS.some((p) => slug.startsWith(p) || `${slug}/`.startsWith(p))) continue
      add(slug)
    }
  }
  const productBase = site ? '/p/' : '/products/'
  for (const p of products) if (p?.slug) add(`${productBase}${encodeSegment(p.slug)}`)
  return out
}

/** robots.txt: everything but the private paths, and the sitemap when there is one. */
export function robotsTxt({ sitemapUrl = null } = {}) {
  const lines = ['User-agent: *', 'Allow: /', ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`)]
  if (sitemapUrl) lines.push('', `Sitemap: ${sitemapUrl}`)
  return `${lines.join('\n')}\n`
}
