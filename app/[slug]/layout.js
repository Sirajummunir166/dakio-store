import { getStoreBySlug } from '../../lib/api'
import StorePaused from '../../components/StorePaused'

// While the owner starts the store over (the API's `store.paused`), every
// page of the shop shows the "back soon" note instead — checkout included.
// The page below reads the same store URL, so this costs no extra call.
export default async function StoreLayout({ children, params }) {
  const { slug } = await params
  const data = await getStoreBySlug(slug)
  if (data?.store?.paused) return <StorePaused store={data.store} />
  return children
}
