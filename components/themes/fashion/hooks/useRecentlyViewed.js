'use client'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dakio_rv'
const MAX_ITEMS = 8

function safeRead() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function safeWrite(items) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // sessionStorage unavailable (private mode, storage full) — silent
  }
}

/**
 * Track and retrieve recently viewed products within the current browser session.
 *
 * Usage:
 *   const { recentlyViewed, track } = useRecentlyViewed(currentProductId)
 *
 * - Call track(product) when a product is viewed.
 * - recentlyViewed excludes the current product and is capped at MAX_ITEMS.
 * - Session-based only — clears when the tab is closed.
 */
export function useRecentlyViewed(currentProductId = null) {
  const [items, setItems] = useState([])

  // Load from sessionStorage on mount (client-only)
  useEffect(() => {
    setItems(safeRead())
  }, [])

  const track = (product) => {
    if (!product?.id) return
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id)
      const next = [{ id: product.id, name: product.name, slug: product.slug, image: product.image, price: product.price, comparePrice: product.comparePrice }, ...filtered].slice(0, MAX_ITEMS)
      safeWrite(next)
      return next
    })
  }

  const recentlyViewed = items.filter((p) => p.id !== currentProductId)

  return { recentlyViewed, track }
}
