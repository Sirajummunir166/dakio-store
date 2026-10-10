import { getProducts, getCategories, getPublishedSite, getProductBySlug, getProductReviews } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import PublicSite from '../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'
import { htmlToText } from '../../../../lib/theme/sanitizeHtml'
import ProductJsonLd from '../../../../components/ProductJsonLd'
import { canonicalHostOf, canonicalMeta, productPath } from '../../../../lib/seo'

// /p/<product-slug> — one product template behind every product (Phase 8).
// Gallery, price, sizes and stock come from the live catalog; the template
// (doc.sys.prod) is edited once in Store Studio.

export async function generateMetadata({ params }) {
  const { slug, productSlug } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const products = await getProducts(slug)
  const p = (products || []).find((x) => x.slug === productSlug)
  const brand = siteData.site.theme?.brandName || 'Store'
  const img = p && ((Array.isArray(p.images) && p.images[0]) || p.imageUrl)
  return {
    ...studioMetadata(siteData.site, null),
    title: p ? `${p.name} — ${brand}` : 'Not Found',
    ...(p ? { description: htmlToText(p.shortDescription || p.description).slice(0, 160) || undefined, openGraph: { title: `${p.name} — ${brand}`, ...(img ? { images: [img] } : {}) } } : {}),
    ...(p ? canonicalMeta(canonicalHostOf(siteData, slug), productPath(productSlug, true)) : {}),
  }
}

export default async function ProductRoute({ params }) {
  const { slug, productSlug } = await params

  const siteData = await getPublishedSite(slug)
  if (siteData.notFound || !siteData.site) notFound()
  if (siteData.unavailable) {
    console.error(`[storefront] API unavailable for slug="${slug}" /p/${productSlug}`)
    return <StoreUnavailable />
  }

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)
  let product = catalog.products.find((p) => p.slug === productSlug)
  let raw = products.find((p) => p.slug === productSlug)
  if (!product) {
    // Not among the newest 48 (e.g. an add-on from a Goes well with block):
    // the product's own read, mapped the same way.
    const one = await getProductBySlug(slug, productSlug)
    if (one && one.slug === productSlug) {
      product = toStudioCatalog([one], categories).products[0]
      raw = one
    }
  }
  if (!product) notFound()
  // Approved reviews (review after delivery), drawn under the product's tabs.
  const reviews = await getProductReviews(slug, productSlug)
  if (reviews.length) product = { ...product, reviews }

  return (
    <>
      <ProductJsonLd
        product={raw}
        url={`https://${canonicalHostOf(siteData, slug)}${productPath(productSlug, true)}`}
        storeName={siteData.site.theme?.brandName}
      />
      <PublicSite
        storeSlug={slug}
        doc={siteData.site}
        pageId="home"
        basePath={`/${slug}`}
        products={catalog.products}
        collections={catalog.collections} extra={catalog.extra}
        system={{ kind: 'prod', product }}
      />
    </>
  )
}
