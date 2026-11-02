import { getStoreByDomain } from '../../../../../lib/api'
import TrackOrderDirect from '../../../../../components/TrackOrderDirect'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { host, code } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) return { title: 'Track Order', robots: { index: false, follow: false } }
  return { title: `Order #${code} — ${data.store.name}`, robots: { index: false, follow: false } }
}

export default async function TrackCodePage({ params }) {
  const { host, code } = await params
  const data = await getStoreByDomain(host)
  if (!data?.store) notFound()
  return <TrackOrderDirect store={data.store} slug={data.store.slug} code={code} />
}
