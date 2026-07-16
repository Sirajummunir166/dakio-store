import { getStoreBySlug, getProducts, getCategories, getPublishedSite } from '../../lib/api'
import StorefrontClient from '../../components/StorefrontClient'
import StoreUnavailable from '../../components/StoreUnavailable'
import PublicSite from '../../components/studio/PublicSite'
import { toStudioCatalog } from '../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const siteData = await getPublishedSite(slug)
  if (siteData?.site) {
    const home = siteData.site.pages.find((p) => p.id === 'home') || siteData.site.pages[0]
    return {
      title: home?.seo?.title || siteData.site.theme?.brandName || 'Store',
      description: home?.seo?.desc || undefined,
    }
  }
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

  const [storeData, siteData, products, categories] = await Promise.all([
    getStoreBySlug(slug),
    getPublishedSite(slug),
    getProducts(slug),
    getCategories(slug),
  ])

  if (storeData.notFound) notFound()

  if (storeData.unavailable) {
    console.error(`[storefront] API unavailable for slug="${slug}" — upstream 5xx or network failure`)
    return <StoreUnavailable />
  }

  // Published Store Studio site takes over the storefront; the legacy theme
  // engine below stays the fallback for tenants that never published one.
  if (siteData.site) {
    const catalog = toStudioCatalog(products, categories)
    return (
      <PublicSite
        doc={siteData.site}
        pageId="home"
        basePath={`/${slug}`}
        products={catalog.products}
        collections={catalog.collections}
      />
    )
  }

  const isFashionV1 = true // Fashion V1 is now the universal theme engine

  return (
    <>
      {isFashionV1 && <link rel="stylesheet" href="/fashion-theme.css" />}
      {isFashionV1 && <link rel="stylesheet" href="/fashion-additions.css" />}
      <StorefrontClient
        store={storeData.store}
        products={products}
        categories={categories}
        slug={slug}
      />
    </>
  )
}
