'use client'
import { useEffect, useState } from 'react'
import { isOnSale } from '../compat/lib-products.js'

export default function ProductGallery({ product }) {
  const images = product.images?.length ? product.images : [{ src: product.image, alt: product.name }]
  const [activeIndex, setActiveIndex] = useState(0)
  const onSale = isOnSale(product)

  useEffect(() => {
    setActiveIndex(0)
  }, [product.id])

  const active = images[activeIndex] ?? images[0]

  return (
    <div className={`product-page__gallery ${images.length > 1 ? 'product-page__gallery--multi' : ''}`}>
      {onSale && <span className="product-page__sale-tag">Price drop</span>}
      {!onSale && product.badge && <span className="product-page__badge">{product.badge}</span>}

      {images.length > 1 && (
        <div className="product-page__thumbs" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              className={activeIndex === index ? 'product-page__thumb active' : 'product-page__thumb'}
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={activeIndex === index}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="product-page__main-image">
        <img key={active.src} src={active.src} alt={active.alt} />
        {images.length > 1 && (
          <span className="product-page__image-count">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  )
}
