import { getStoreBySlug, getProducts, getCategories, getPublishedSite } from '../../../lib/api'
import CheckoutClient from '../../../components/CheckoutClient'
import PublicSite from '../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const siteData = await getPublishedSite(slug)
  if (siteData?.site) {
    const brand = siteData.site.theme?.brandName || 'Store'
    return { ...studioMetadata(siteData.site, null), title: 'Checkout — ' + brand, robots: { index: false, follow: false } }
  }
  const data = await getStoreBySlug(slug)
  if (!data?.store) return { title: 'Checkout' }
  return { title: `Checkout — ${data.store.name}` }
}

export default async function CheckoutPage({ params }) {
  const { slug } = await params

  // Published Store Studio site takes over checkout (Phase 10); the legacy
  // theme's checkout stays the fallback.
  const siteData = await getPublishedSite(slug)
  if (siteData?.site) {
    const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
    const catalog = toStudioCatalog(products, categories)
    return (
      <PublicSite storeSlug={slug} doc={siteData.site} pageId="home" basePath={'/' + slug} products={catalog.products} collections={catalog.collections} system={{ kind: 'checkout' }} />
    )
  }

  const data = await getStoreBySlug(slug)
  if (!data?.store) notFound()
  return <CheckoutClient store={data.store} slug={slug} />
}
