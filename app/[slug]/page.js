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
  const slug = params.slug

  let storeData, products, categories
  try {
    ;[storeData, products, categories] = await Promise.all([
      getStoreBySlug(slug),
      getProducts(slug),
      getCategories(slug),
    ])
  } catch (err) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h2>Error loading store</h2>
        <pre>{String(err)}</pre>
        <p>Slug: {slug}</p>
      </div>
    )
  }

  if (!storeData?.store) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h2>Store not found</h2>
        <p>Slug: {slug}</p>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        <pre>{JSON.stringify(storeData, null, 2)}</pre>
      </div>
    )
  }

  return (
    <StorefrontClient
      store={storeData.store}
      products={products}
      categories={categories}
      slug={slug}
    />
  )
}
