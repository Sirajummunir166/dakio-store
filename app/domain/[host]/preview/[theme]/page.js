import { getStoreByDomain, getStoreBySlug, getProducts, getCategories } from '../../../../../lib/api'
import { validatePreviewToken } from '../../../../../lib/theme/previewGuard'
import StorefrontClient from '../../../../../components/StorefrontClient'
import PreviewGate from '../../../../../components/PreviewGate'
import StoreUnavailable from '../../../../../components/StoreUnavailable'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { theme } = await params
  return {
    title: `Preview — ${theme} theme`,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  }
}

export default async function DomainThemePreviewPage({ params, searchParams }) {
  const { host, theme } = await params
  const { token } = await searchParams

  const storeData = await getStoreByDomain(host)
  if (storeData.notFound) notFound()
  if (storeData.unavailable) return <StoreUnavailable />

  const slug = storeData.store.slug
  const validation = validatePreviewToken(token, { slug, theme })
  if (!validation.ok) {
    return <PreviewGate error={validation.error} />
  }

  const [storeWithDraft, products, categories] = await Promise.all([
    getStoreBySlug(slug, { previewToken: token }),
    getProducts(slug),
    getCategories(slug),
  ])

  if (storeWithDraft.notFound) notFound()
  if (storeWithDraft.unavailable) return <StoreUnavailable />

  const isFashionV1 = theme === 'fashion_v1' || storeWithDraft.store?.storeTemplate === 'fashion_v1'

  return (
    <>
      {isFashionV1 && <link rel="stylesheet" href="/fashion-theme.css" />}
      {isFashionV1 && <link rel="stylesheet" href="/fashion-additions.css" />}
      <StorefrontClient
        store={storeWithDraft.store}
        products={products}
        categories={categories}
        slug={slug}
        previewMode
        previewTheme={theme}
      />
    </>
  )
}
