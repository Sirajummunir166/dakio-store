/**
 * lib-products.js — storefront-compatible product helpers.
 * Adapted from veluna's lib/products.js.
 * In dakio-store, related products come from contract.products[1..n]
 * (set up by FashionPDPWrapper), not from products.json.
 */

export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export function isOnSale(product) {
  return Boolean(product?.compare && Number(product.compare) > Number(product.price))
}

export function getSaleSavings(product) {
  if (!isOnSale(product)) return 0
  return Number(product.compare) - Number(product.price)
}

export function getDiscount(product) {
  if (!product?.compare || !product?.price) return null
  return Math.round((1 - Number(product.price) / Number(product.compare)) * 100)
}

/**
 * getProductAvailableSizes — returns size array from product.variants or
 * product.availableSizes, falling back to PRODUCT_SIZES.
 */
export function getProductAvailableSizes(product) {
  if (!product) return [...PRODUCT_SIZES]
  if (Array.isArray(product.availableSizes) && product.availableSizes.length) {
    return product.availableSizes
  }
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.filter((v) => v.stock > 0).map((v) => v.name)
  }
  return [...PRODUCT_SIZES]
}

/**
 * getRelatedProducts — in the storefront, related products are pre-selected by
 * FashionPDPWrapper as contract.products[1..n]. Pass them directly here.
 */
export function getRelatedProducts(product, limit = 4, relatedProducts = []) {
  return relatedProducts.slice(0, limit)
}
