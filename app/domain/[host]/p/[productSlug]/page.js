import { getStoreByDomain, getProducts, getCategories, getPublishedSite, getProductBySlug, getProductReviews } from '../../../../../lib/api'
import StoreUnavailable from '../../../../../components/StoreUnavailable'
import PublicSite from '../../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'
import ProductJsonLd from '../../../../../components/ProductJsonLd'
import { htmlToText } from '../../../../../lib/theme/sanitizeHtml'
import { canonicalHostOf, canonicalMeta, productPath } from '../../../../../lib/seo'

// /p/<product-slug> on a custom domain — mirrors app/[slug]/p/[productSlug].

export async function generateMetadata({ params }) {
  const { host, productSlug } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Not Found' }
  const siteData = await getPublishedSite(data.store.slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const products = await getProducts(data.store.slug)
  const p = (products || []).find((x) => x.slug === productSlug)
  const brand = siteData.site.theme?.brandName || 'Store'
  const img = p && ((Array.isArray(p.images) && p.images[0]) || p.imageUrl)
  return {
    ...studioMetadata(siteData.site, null),
    title: p ? `${p.name} — ${brand}` : 'Not Found',
    ...(p ? { description: htmlToText(p.shortDescription || p.description).slice(0, 160) || undefined, openGraph: { title: `${p.name} — ${brand}`, ...(img ? { images: [img] } : {}) } } : {}),
    ...(p ? canonicalMeta(canonicalHostOf(data, data.store.slug), productPath(productSlug, true)) : {}),
  }
}

export default async function DomainProductRoute({ params }) {
  const { host, productSlug } = await params

  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />
  const slug = storeData.store.slug

  const siteData = await getPublishedSite(slug)
  if (!siteData.site) notFound()

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
        url={`https://${canonicalHostOf(storeData, slug)}${productPath(productSlug, true)}`}
        currency={storeData.store.currency}
        storeName={siteData.site.theme?.brandName || storeData.store.name}
      />
      <PublicSite storeSlug={slug} doc={siteData.site} pageId="home" basePath="" products={catalog.products} collections={catalog.collections} extra={catalog.extra} system={{ kind: 'prod', product }} />
    </>
  )
}
