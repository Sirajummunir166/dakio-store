import { getStoreBySlug, getProductBySlug, getProducts, getPublishedSite } from '../../../../lib/api'
import ProductDetailClient from '../../../../components/ProductDetailClient'
import { notFound, permanentRedirect } from 'next/navigation'
import { htmlToText } from '../../../../lib/theme/sanitizeHtml'
import ProductJsonLd from '../../../../components/ProductJsonLd'
import { canonicalHostOf, canonicalMeta, productPath } from '../../../../lib/seo'

export async function generateMetadata({ params }) {
  const { slug, productSlug } = await params
  const [product, storeData] = await Promise.all([getProductBySlug(slug, productSlug), getStoreBySlug(slug)])
  if (!product) return { title: 'Product Not Found' }
  return {
    ...canonicalMeta(canonicalHostOf(storeData, slug), productPath(productSlug, false)),
    title: product.name,
    description: htmlToText(product.description).slice(0, 160) || product.name,
    openGraph: { title: product.name, images: product.imageUrl ? [product.imageUrl] : [] },
  }
}

export default async function ProductPage({ params }) {
  const { slug, productSlug } = await params
  // Store Studio stores show products at /p/<slug>; the legacy URL redirects there.
  const siteData = await getPublishedSite(slug)
  if (siteData?.site) permanentRedirect(`/${slug}${productPath(productSlug, true)}`)
  const [storeData, product, allProducts] = await Promise.all([
    getStoreBySlug(slug),
    getProductBySlug(slug, productSlug),
    getProducts(slug, { limit: 48 }),
  ])
  if (!storeData?.store || !product) notFound()

  const relatedProducts = product.category?.id
    ? allProducts.filter(x => x.category?.id === product.category.id && x.id !== product.id).slice(0, 8)
    : allProducts.filter(x => x.id !== product.id).slice(0, 8)

  const isFashionV1 = true // Fashion V1 is now the universal theme engine

  return (
    <>
      <ProductJsonLd
        product={product}
        url={`https://${canonicalHostOf(storeData, slug)}${productPath(productSlug, false)}`}
        currency={storeData.store.currency}
        storeName={storeData.store.name}
      />
      {isFashionV1 && <link rel="stylesheet" href="/fashion-theme.css" />}
      {isFashionV1 && <link rel="stylesheet" href="/fashion-additions.css" />}
      <ProductDetailClient
        store={storeData.store}
        product={product}
        slug={slug}
        isCustomDomain={false}
        relatedProducts={relatedProducts}
        allProducts={allProducts}
      />
    </>
  )
}
