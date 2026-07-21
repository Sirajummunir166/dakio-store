import { getProducts, getCategories, getPublishedSite } from '../../../../lib/api'
import StoreUnavailable from '../../../../components/StoreUnavailable'
import PublicSite from '../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

// /p/<product-slug> — one product template behind every product (Phase 8).
// Gallery, price, sizes and stock come from the live catalog; the template
// (doc.sys.prod) is edited once in Store Studio.

export async function generateMetadata({ params }) {
  const { slug, productSlug } = await params
  const siteData = await getPublishedSite(slug)
  if (!siteData?.site) return { title: 'Not Found' }
  const products = await getProducts(slug)
  const p = (products || []).find((x) => x.slug === productSlug)
  const brand = siteData.site.theme?.brandName || 'Store'
  const img = p && ((Array.isArray(p.images) && p.images[0]) || p.imageUrl)
  return {
    ...studioMetadata(siteData.site, null),
    title: p ? `${p.name} — ${brand}` : 'Not Found',
    ...(p ? { description: (p.description || '').slice(0, 160) || undefined, openGraph: { title: `${p.name} — ${brand}`, ...(img ? { images: [img] } : {}) } } : {}),
  }
}

export default async function ProductRoute({ params }) {
  const { slug, productSlug } = await params

  const siteData = await getPublishedSite(slug)
  if (siteData.notFound || !siteData.site) notFound()
  if (siteData.unavailable) {
    console.error(`[storefront] API unavailable for slug="${slug}" /p/${productSlug}`)
    return <StoreUnavailable />
  }

  const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
  const catalog = toStudioCatalog(products, categories)
  const product = catalog.products.find((p) => p.slug === productSlug)
  if (!product) notFound()

  return (
    <PublicSite
      doc={siteData.site}
      pageId="home"
      basePath={`/${slug}`}
      products={catalog.products}
      collections={catalog.collections}
      system={{ kind: 'prod', product }}
    />
  )
}
