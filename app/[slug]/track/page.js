import { getStoreBySlug } from '../../../lib/api'
import TrackOrderClient from '../../../components/TrackOrderClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data?.store) return { title: 'Track Order' }
  return { title: `Track Order — ${data.store.name}` }
}

export default async function TrackPage({ params }) {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (!data?.store) notFound()
  return <TrackOrderClient store={data.store} slug={slug} />
}
