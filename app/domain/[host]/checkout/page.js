import { getStoreByDomain, getProducts, getCategories, getPublishedSite } from '../../../../lib/api'
import CheckoutClient from '../../../../components/CheckoutClient'
import PublicSite from '../../../../components/studio/PublicSite'
import { toStudioCatalog, studioMetadata } from '../../../../components/studio/publicCatalog'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Checkout' }
  const siteData = await getPublishedSite(data.store.slug)
  if (siteData?.site) {
    const brand = siteData.site.theme?.brandName || 'Store'
    return { ...studioMetadata(siteData.site, null), title: 'Checkout — ' + brand, robots: { index: false, follow: false } }
  }
  return { title: `Checkout — ${data.store.name}` }
}

export default async function DomainCheckoutPage({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) notFound()
  const slug = data.store.slug

  // Published Store Studio site takes over checkout (Phase 10)
  const siteData = await getPublishedSite(slug)
  if (siteData?.site) {
    const [products, categories] = await Promise.all([getProducts(slug), getCategories(slug)])
    const catalog = toStudioCatalog(products, categories)
    return (
      <PublicSite storeSlug={slug} doc={siteData.site} pageId="home" basePath="" products={catalog.products} collections={catalog.collections} system={{ kind: 'checkout' }} />
    )
  }

  return <CheckoutClient store={data.store} slug={slug} />
}
