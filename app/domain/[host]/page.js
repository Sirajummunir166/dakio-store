import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../../lib/api'
import StorefrontClient from '../../../components/StorefrontClient'
import StoreUnavailable from '../../../components/StoreUnavailable'
import PublicSite from '../../../components/studio/PublicSite'
import { toStudioCatalog } from '../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Store Not Found' }
  const s = data.store
  const siteData = await getPublishedSite(s.slug)
  if (siteData?.site) {
    const home = siteData.site.pages.find((p) => p.id === 'home') || siteData.site.pages[0]
    return {
      title: home?.seo?.title || siteData.site.theme?.brandName || s.name,
      description: home?.seo?.desc || undefined,
      icons: s.faviconUrl ? { icon: s.faviconUrl, shortcut: s.faviconUrl } : undefined,
    }
  }
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
  const [siteData, products, categories] = await Promise.all([
    getPublishedSite(slug),
    getProducts(slug),
    getCategories(slug),
  ])

  // Published Store Studio site takes over; legacy theme engine is the fallback.
  // basePath is '' — on a custom domain the site lives at the root.
  if (siteData.site) {
    const catalog = toStudioCatalog(products, categories)
    return (
      <PublicSite
        doc={siteData.site}
        pageId="home"
        basePath=""
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
