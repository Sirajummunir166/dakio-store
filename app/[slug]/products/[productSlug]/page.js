import { getStoreBySlug, getProductBySlug, getProducts } from '../../../../lib/api'
import ProductDetailClient from '../../../../components/ProductDetailClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug, productSlug } = await params
  const product = await getProductBySlug(slug, productSlug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description || product.name,
    openGraph: { title: product.name, images: product.imageUrl ? [product.imageUrl] : [] },
  }
}

export default async function ProductPage({ params }) {
  const { slug, productSlug } = await params
  const [storeData, product, allProducts] = await Promise.all([
    getStoreBySlug(slug),
    getProductBySlug(slug, productSlug),
    getProducts(slug, { limit: 48 }),
  ])
  if (!storeData?.store || !product) notFound()

  const relatedProducts = product.category?.id
    ? allProducts.filter(x => x.category?.id === product.category.id && x.id !== product.id).slice(0, 8)
    : allProducts.filter(x => x.id !== product.id).slice(0, 8)

  const isFashionV1 = storeData.store?.storeTemplate === 'fashion_v1'

  return (
    <>
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
