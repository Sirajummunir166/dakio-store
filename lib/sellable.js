// "Continue selling when out of stock" (merchant product editor): checkout
// takes the order past zero, so the store must not show the product — or its
// sizes — as sold out. Every product the API hands the store goes through
// here once, so each template reads the same answer.
const OPEN_STOCK = 99

export function sellable(product) {
  if (!product || product.continueSelling !== true) return product
  return {
    ...product,
    totalStock: Math.max(Number(product.totalStock) || 0, OPEN_STOCK),
    variants: Array.isArray(product.variants)
      ? product.variants.map((v) => ({ ...v, stock: Math.max(Number(v.stock) || 0, OPEN_STOCK) }))
      : product.variants,
  }
}

export const sellableList = (products) => (Array.isArray(products) ? products.map(sellable) : products)
