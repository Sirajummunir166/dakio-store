import { getStoreByDomain } from '../../../../lib/api'
import CheckoutClient from '../../../../components/CheckoutClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Checkout' }
  return { title: `Checkout — ${data.store.name}` }
}

export default async function DomainCheckoutPage({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) notFound()
  return <CheckoutClient store={data.store} slug={data.store.slug} />
}
