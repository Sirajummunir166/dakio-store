/**
 * lib-products.js — storefront-compatible product helpers.
 * Adapted from veluna's lib/products.js.
 * In dakio-store, related products come from contract.products[1..n]
 * (set up by FashionPDPWrapper), not from products.json.
 */

export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export function isOnSale(product) {
  return Boolean(product?.comparePrice && Number(product.comparePrice) > Number(product.price))
}

export function getSaleSavings(product) {
  if (!isOnSale(product)) return 0
  return Number(product.comparePrice) - Number(product.price)
}

export function getDiscount(product) {
  if (!product?.comparePrice || !product?.price) return null
  return Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
}

/**
 * getProductAvailableSizes — in-stock variant names, or product.availableSizes.
 * A product without variants has NO sizes: offering made-up ones put a fake
 * variant in the cart and failed checkout.
 */
export function getProductAvailableSizes(product) {
  if (!product) return []
  if (Array.isArray(product.availableSizes) && product.availableSizes.length) {
    return product.availableSizes
  }
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.filter((v) => v.stock > 0).map((v) => v.name)
  }
  return []
}

/**
 * getRelatedProducts — in the storefront, related products are pre-selected by
 * FashionPDPWrapper as contract.products[1..n]. Pass them directly here.
 */
export function getRelatedProducts(product, limit = 4, relatedProducts = []) {
  return relatedProducts.slice(0, limit)
}
