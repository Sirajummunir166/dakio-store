'use client'
import { useState, useEffect, useCallback } from 'react'

function key(slug) { return `dk_wish_${slug}` }

export function useWishlist(slug) {
  const [ids, setIds] = useState([])

  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(key(slug)) || '[]')) } catch { setIds([]) }
  }, [slug])

  const toggle = useCallback((productId) => {
    setIds(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      try { localStorage.setItem(key(slug), JSON.stringify(next)) } catch {}
      return next
    })
  }, [slug])

  const has = useCallback((productId) => ids.includes(productId), [ids])

  return { wishCount: ids.length, toggle, has }
}
