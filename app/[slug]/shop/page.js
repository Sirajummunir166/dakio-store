import { getProducts, getCategories, getPublishedSite } from '../../../lib/api'
import StoreUnavailable from '../../../components/StoreUnavailable'
import PublicSite from '../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// /shop — the store system page (Phase 8): every live product with curated
// filters + sort. Search lands here too (/shop?q=…). Template-driven — the
// merchant edits doc.sys.shop once in Store Studio.

export async function generateMetadata({ params }) {
  const { slug } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const brand = siteData.site.theme?.brandName || 'Store'
  return { ...studioMetadata(siteData.site, null), title: `Shop — ${brand}` }
}

export default async function ShopRoute({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams
  const q = typeof sp?.q === 'string' && sp.q.trim() ? sp.q.trim().slice(0, 80) : null

  const siteData = await getPublishedSite(slug)
  if (siteData.notFound || !siteData.site) notFound()
  if (siteData.unavailable) {
    console.error(`[storefront] API unavailable for slug="${slug}" /shop`)
    return <StoreUnavailable />
  }

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)

  return (
    <PublicSite
      doc={siteData.site}
      pageId="home"
      basePath={`/${slug}`}
      products={catalog.products}
      collections={catalog.collections}
      system={{ kind: 'shop', q }}
    />
  )
}
