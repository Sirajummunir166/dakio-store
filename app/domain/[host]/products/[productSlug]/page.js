import { getStoreByDomain, getProductBySlug, getProducts } from '../../../../../lib/api'
import ProductDetailClient from '../../../../../components/ProductDetailClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { host, productSlug } = await params
  const storeData = await getStoreByDomain(host)
  if (!storeData?.store) return { title: 'Product Not Found' }
  const product = await getProductBySlug(storeData.store.slug, productSlug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description || product.name,
    openGraph: { title: product.name, images: product.imageUrl ? [product.imageUrl] : [] },
  }
}

export default async function DomainProductPage({ params }) {
  const { host, productSlug } = await params
  const storeData = await getStoreByDomain(host)
  if (!storeData?.store) notFound()
  const slug = storeData.store.slug
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
