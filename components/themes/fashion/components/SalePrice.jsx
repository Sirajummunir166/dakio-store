function formatPrice(amount) {
  if (amount == null) return '৳0'
  return `৳${Number(amount).toLocaleString('en-BD')}`
}

function isOnSale(product) {
  return product.comparePrice != null && product.comparePrice > product.price
}

function getDiscount(product) {
  if (!isOnSale(product)) return 0
  return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
}

function getSaleSavings(product) {
  if (!isOnSale(product)) return 0
  return product.comparePrice - product.price
}

export default function SalePrice({ product, variant = 'page', className = '', showDetails = true }) {
  const onSale = isOnSale(product)
  const discount = getDiscount(product)
  const savings = getSaleSavings(product)
  const showMeta = onSale && showDetails && (variant === 'page' || variant === 'quick')
  const useCents = variant === 'page' || variant === 'quick'

  const rootClass = ['sale-price', `sale-price--${variant}`, onSale ? 'is-on-sale' : '', className]
    .filter(Boolean)
    .join(' ')

  if (!onSale) {
    return (
      <div className={rootClass}>
        <strong className="sale-price__current">{formatPrice(product.price)}</strong>
      </div>
    )
  }

  if (!showDetails) {
    return (
      <div className={rootClass}>
        <strong className="sale-price__current sale-price__current--sale">{formatPrice(product.price)}</strong>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={rootClass}>
        <div className="sale-price__amounts">
          <strong className="sale-price__current">{formatPrice(product.price)}</strong>
          <del className="sale-price__compare">{formatPrice(product.comparePrice)}</del>
          <span className="sale-price__footer sale-price__footer--card">
            <span className="sale-price__save">Save {formatPrice(savings)}</span>
            <span className="sale-price__pipe" aria-hidden="true">|</span>
            <span className="sale-price__badge">{discount}% OFF</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={rootClass}>
      <div className="sale-price__amounts">
        <strong className="sale-price__current">{formatPrice(product.price)}</strong>
        <del className="sale-price__compare">{formatPrice(product.comparePrice)}</del>
      </div>
      {showMeta && (
        <div className="sale-price__footer">
          <span className="sale-price__save">Save {formatPrice(savings)}</span>
          <span className="sale-price__pipe" aria-hidden="true">|</span>
          <span className="sale-price__badge">{discount}% OFF</span>
        </div>
      )}
    </div>
  )
}
