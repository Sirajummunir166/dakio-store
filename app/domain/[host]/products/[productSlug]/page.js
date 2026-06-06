import { getStoreByDomain, getProductBySlug } from '../../../../../lib/api'
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
  const slug    = storeData.store.slug
  const product = await getProductBySlug(slug, productSlug)
  if (!product) notFound()
  return <ProductDetailClient store={storeData.store} product={product} slug={slug} isCustomDomain={true} />
}
