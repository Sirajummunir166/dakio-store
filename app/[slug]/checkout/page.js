import { getStoreBySlug } from '../../../lib/api'
import CheckoutClient from '../../../components/CheckoutClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data?.store) return { title: 'Checkout' }
  return { title: `Checkout — ${data.store.name}` }
}

export default async function CheckoutPage({ params }) {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data?.store) notFound()
  return <CheckoutClient store={data.store} slug={slug} />
}
