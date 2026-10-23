// "Continue selling when out of stock" (merchant product editor): checkout
// takes the order past zero, so the store must not show the product — or its
// sizes — as sold out. Every product the API hands the store goes through
// here once, so each template reads the same answer. Its "Goes well with"
// add-ons (`pairings`) are products too and get the same treatment.
const OPEN_STOCK = 99

export function sellable(product) {
  if (!product) return product
  const pairings = Array.isArray(product.pairings) && product.pairings.some((a) => a && a.continueSelling === true)
    ? product.pairings.map(sellable)
    : product.pairings
  if (product.continueSelling !== true) return pairings === product.pairings ? product : { ...product, pairings }
  return {
    ...product,
    ...(pairings !== product.pairings ? { pairings } : {}),
    totalStock: Math.max(Number(product.totalStock) || 0, OPEN_STOCK),
    variants: Array.isArray(product.variants)
      ? product.variants.map((v) => ({ ...v, stock: Math.max(Number(v.stock) || 0, OPEN_STOCK) }))
      : product.variants,
  }
}

export const sellableList = (products) => (Array.isArray(products) ? products.map(sellable) : products)
