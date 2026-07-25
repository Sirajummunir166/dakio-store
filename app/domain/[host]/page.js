import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../../lib/api'
import StorefrontClient from '../../../components/StorefrontClient'
import StoreUnavailable from '../../../components/StoreUnavailable'
import StoreNotFound from '../../../components/StoreNotFound'
import PublicSite from '../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../components/studio/publicCatalog'
import { getCanonicalUrl } from '../../../lib/routes'

export async function generateMetadata({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Store Not Found' }
  const s = data.store

  // The same tenant is now reachable via up to three origins (path URL, a
  // *.dakio.shop preview subdomain, a verified custom domain) — converge
  // search engines on one canonical URL, and keep the preview tier out of
  // the index entirely rather than let it compete with the real one.
  const seo = {
    alternates: { canonical: getCanonicalUrl({ host, slug: s.slug }) },
    robots: host.endsWith('.dakio.shop') ? { index: false, follow: true } : undefined,
  }

  const siteData = await getPublishedSite(s.slug)
  if (siteData?.site) {
    const home = siteData.site.pages.find((p) => p.id === 'home') || siteData.site.pages[0]
    return { ...studioMetadata(siteData.site, home), ...seo }
  }
  return {
    title: s.name,
    description: s.description || `Shop at ${s.name}`,
    icons: s.faviconUrl ? { icon: s.faviconUrl, shortcut: s.faviconUrl } : undefined,
    openGraph: { title: s.name, images: s.logoUrl ? [s.logoUrl] : [] },
    ...seo,
  }
}

export default async function DomainStorePage({ params }) {
  const { host } = await params

  const storeData = await getStoreByDomain(host)

  if (storeData.notFound) return <StoreNotFound variant="domain" hostname={host} />

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
      storeSlug={slug}
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
