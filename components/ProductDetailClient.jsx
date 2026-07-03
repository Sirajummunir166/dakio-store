'use client'
import { resolveTheme } from '../lib/theme/resolveTheme'
import FashionPDPWrapper from './themes/fashion/FashionPDPWrapper'
import GenericProductDetail from './GenericProductDetail'

// P0: Use the same theme-selection rule as StorefrontClient.
// resolveTheme is the single source of truth — PDP must agree with the homepage.
export default function ProductDetailClient(props) {
  const templateKey = resolveTheme({ store: props.store })
  if (templateKey === 'fashion_v1') {
    return <FashionPDPWrapper {...props} />
  }
  return <GenericProductDetail {...props} />
}
