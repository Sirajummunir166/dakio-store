import { getStoreBySlug } from '../../lib/api'
import StorePaused from '../../components/StorePaused'
import TrackingBootstrap from '../../components/tracking/TrackingBootstrap'
import TrackingRoot from '../../components/tracking/TrackingRoot'
import WebChat from '../../components/WebChat'
import { buildTrackingConfig } from '../../lib/tracking/config'

// While the owner starts the store over (the API's `store.paused`), every
// page of the shop shows the "back soon" note instead — checkout included.
// The page below reads the same store URL, so this costs no extra call.
// Every other page gets the store's tracking (DAKIO_TRACKING_PLAN.md): one
// bootstrap script + the provider, here so it persists across soft navigations.
export default async function StoreLayout({ children, params }) {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (data?.store?.paused) return <StorePaused store={data.store} />
  const tracking = buildTrackingConfig(data?.store, 'path')
  // The chat bubble, when the owner switched it on (DAKIO_WEBCHAT_PLAN.md).
  const chat = <WebChat store={data?.store} scope="path" />
  if (!tracking) return <>{children}{chat}</>
  return (
    <TrackingRoot config={tracking}>
      <TrackingBootstrap config={tracking} />
      {children}
      {chat}
    </TrackingRoot>
  )
}
