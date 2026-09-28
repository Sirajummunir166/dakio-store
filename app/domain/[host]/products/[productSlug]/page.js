import { getStoreByDomain, getProductBySlug, getProducts, getPublishedSite } from '../../../../../lib/api'
import ProductDetailClient from '../../../../../components/ProductDetailClient'
import { notFound, permanentRedirect } from 'next/navigation'
import { htmlToText } from '../../../../../lib/theme/sanitizeHtml'
import ProductJsonLd from '../../../../../components/ProductJsonLd'
import { canonicalHostOf, canonicalMeta, productPath } from '../../../../../lib/seo'

export async function generateMetadata({ params }) {
  const { host, productSlug } = await params
  const storeData = await getStoreByDomain(host)
  if (!storeData?.store) return { title: 'Product Not Found' }
  const product = await getProductBySlug(storeData.store.slug, productSlug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: htmlToText(product.description).slice(0, 160) || product.name,
    openGraph: { title: product.name, images: product.imageUrl ? [product.imageUrl] : [] },
    ...canonicalMeta(canonicalHostOf(storeData, storeData.store.slug), productPath(productSlug, false)),
  }
}

export default async function DomainProductPage({ params }) {
  const { host, productSlug } = await params
  const storeData = await getStoreByDomain(host)
  if (!storeData?.store) notFound()
  const slug = storeData.store.slug
  // A store on Store Studio shows products at /p/<slug>. The legacy URL keeps
  // working for old links (Facebook posts, bookmarks) and hands its ranking on.
  const siteData = await getPublishedSite(slug)
  if (siteData?.site) permanentRedirect(productPath(productSlug, true))
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug, productSlug),
    getProducts(slug, { limit: 48 }),
  ])
  if (!product) notFound()

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
        isCustomDomain={true}
        relatedProducts={relatedProducts}
        allProducts={allProducts}
      />
    </>
  )
}
