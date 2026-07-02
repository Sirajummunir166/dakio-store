'use client'
import FashionProductPage from './templates/fashion/FashionProductPage'
import FashionPDPWrapper from './themes/fashion/FashionPDPWrapper'
import GenericProductDetail from './GenericProductDetail'

export default function ProductDetailClient(props) {
  if (props.store?.storeTemplate === 'fashion_v1') {
    return <FashionPDPWrapper {...props} />
  }
  if (props.store?.storeTemplate === 'fashion') {
    return (
      <FashionProductPage
        store={props.store}
        product={props.product}
        slug={props.slug}
        isCustomDomain={props.isCustomDomain}
        relatedProducts={props.relatedProducts}
        allProducts={props.allProducts}
        mode="page"
      />
    )
  }
  return <GenericProductDetail {...props} />
}
