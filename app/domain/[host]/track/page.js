import { getStoreByDomain } from '../../../../lib/api'
import TrackOrderClient from '../../../../components/TrackOrderClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  // An order lookup, like the cart: never in search results (Store Studio audit SST-51)
  if (!data?.store) return { title: 'Track Order', robots: { index: false, follow: false } }
  return { title: `Track Order — ${data.store.name}`, robots: { index: false, follow: false } }
}

export default async function TrackPage({ params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) notFound()
  return <TrackOrderClient store={data.store} slug={data.store.slug} />
}
