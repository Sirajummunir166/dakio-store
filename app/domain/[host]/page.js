import { getStoreByDomain, getProducts, getCategories } from '../../../lib/api'
import StorefrontClient from '../../../components/StorefrontClient'
import StoreUnavailable from '../../../components/StoreUnavailable'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Store Not Found' }
  const s = data.store
  return {
    title: s.name,
    description: s.description || `Shop at ${s.name}`,
    icons: s.faviconUrl ? { icon: s.faviconUrl, shortcut: s.faviconUrl } : undefined,
    openGraph: { title: s.name, images: s.logoUrl ? [s.logoUrl] : [] },
  }
}

export default async function DomainStorePage({ params }) {
  const { host } = await params

  const storeData = await getStoreByDomain(host)

  if (storeData.notFound) notFound()

  if (storeData.unavailable) {
    console.error(`[storefront] API unavailable for domain="${host}" — upstream 5xx or network failure`)
    return <StoreUnavailable />
  }

  const slug = storeData.store.slug
  const [products, categories] = await Promise.all([
    getProducts(slug),
    getCategories(slug),
  ])

  return (
    <StorefrontClient
      store={storeData.store}
      products={products}
      categories={categories}
      slug={slug}
    />
  )
}
