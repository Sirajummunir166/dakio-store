import { getStoreBySlug, getProducts, getCategories } from '../../lib/api'
import StorefrontClient from '../../components/StorefrontClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const data = await getStoreBySlug(params.slug)
  if (!data?.store) return { title: 'Store Not Found' }
  const s = data.store
  return {
    title: s.name,
    description: s.description || `Shop at ${s.name}`,
    openGraph: { title: s.name, description: s.description, images: s.logoUrl ? [s.logoUrl] : [] },
  }
}

export default async function StorePage({ params }) {
  const [storeData, products, categories] = await Promise.all([
    getStoreBySlug(params.slug),
    getProducts(params.slug),
    getCategories(params.slug),
  ])

  if (!storeData?.store) notFound()

  return (
    <StorefrontClient
      store={storeData.store}
      products={products}
      categories={categories}
      slug={params.slug}
    />
  )
}
