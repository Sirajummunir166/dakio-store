import { getStoreBySlug, getProducts, getCategories } from '../../lib/api'
import StorefrontClient from '../../components/StorefrontClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data?.store) return { title: 'Store Not Found' }
  const s = data.store
  return {
    title: s.name,
    description: s.description || `Shop at ${s.name}`,
    icons: s.faviconUrl ? { icon: s.faviconUrl, shortcut: s.faviconUrl } : undefined,
    openGraph: { title: s.name, description: s.description, images: s.logoUrl ? [s.logoUrl] : [] },
  }
}

export default async function StorePage({ params }) {
  const { slug } = await params

  const [storeData, products, categories] = await Promise.all([
    getStoreBySlug(slug),
    getProducts(slug),
    getCategories(slug),
  ])

  if (!storeData?.store) notFound()

  return (
    <StorefrontClient
      store={storeData.store}
      products={products}
      categories={categories}
      slug={slug}
    />
  )
}
