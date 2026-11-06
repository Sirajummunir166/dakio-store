import { headers } from 'next/headers'
import { permanentRedirect } from 'next/navigation'
import { getStoreByDomain } from '../../../lib/api'
import StorePaused from '../../../components/StorePaused'
import TrackingBootstrap from '../../../components/tracking/TrackingBootstrap'
import TrackingRoot from '../../../components/tracking/TrackingRoot'
import WebChat from '../../../components/WebChat'
import { buildTrackingConfig } from '../../../lib/tracking/config'

// While the owner starts the store over (the API's `store.paused`), every
// page of the shop shows the "back soon" note instead — checkout included.
// The page below reads the same store URL, so this costs no extra call.
// Every other page gets the store's tracking (DAKIO_TRACKING_PLAN.md): one
// bootstrap script + the provider, here so it persists across soft navigations.
export default async function DomainStoreLayout({ children, params }) {
  const { host } = await params
  const data = await getStoreByDomain(host)
  // The store's plan no longer includes this custom domain and its 14 days are
  // over: the same page on the store's Dakio address, so no link breaks.
  if (typeof data?.movedTo === 'string' && /^https:\/\/[a-z0-9-]+\.dakio\.shop$/.test(data.movedTo)) {
    const path = (await headers()).get('x-dakio-path') || '/'
    permanentRedirect(`${data.movedTo}${path.startsWith('/') ? path : '/'}`)
  }
  if (data?.store?.paused) return <StorePaused store={data.store} />
  const tracking = buildTrackingConfig(data?.store, 'domain')
  // The chat bubble, when the owner switched it on (DAKIO_WEBCHAT_PLAN.md).
  const chat = <WebChat store={data?.store} scope="domain" />
  if (!tracking) return <>{children}{chat}</>
  return (
    <TrackingRoot config={tracking}>
      <TrackingBootstrap config={tracking} />
      {children}
      {chat}
    </TrackingRoot>
  )
}
