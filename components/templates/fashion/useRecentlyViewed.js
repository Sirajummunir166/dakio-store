'use client'
import { useState, useEffect } from 'react'

const MAX = 8
function key(slug) { return `dk_recent_${slug}` }

export function useRecentlyViewed(slug, productId) {
  const [recent, setRecent] = useState([])

  useEffect(() => {
    if (!slug || !productId) return
    try {
      const list = JSON.parse(localStorage.getItem(key(slug)) || '[]').filter(id => id !== productId)
      const next = [productId, ...list].slice(0, MAX)
      localStorage.setItem(key(slug), JSON.stringify(next))
      setRecent(next)
    } catch {
      setRecent([])
    }
  }, [slug, productId])

  return recent
}

export function getRecentlyViewedIds(slug) {
  try { return JSON.parse(localStorage.getItem(key(slug)) || '[]') } catch { return [] }
}
