import { getStoreBySlug, getProductBySlug } from '../../../../lib/api'
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
  const [storeData, product] = await Promise.all([
    getStoreBySlug(slug),
    getProductBySlug(slug, productSlug),
  ])
  if (!storeData?.store || !product) notFound()
  return <ProductDetailClient store={storeData.store} product={product} slug={slug} isCustomDomain={false} />
}
