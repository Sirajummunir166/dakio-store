'use client'
import { useLayoutEffect, useRef } from 'react'

export default function SiteHeaderLock({ children }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const syncOffset = () => {
      document.documentElement.style.setProperty('--site-header-offset', `${node.offsetHeight}px`)
    }

    syncOffset()

    const observer = new ResizeObserver(syncOffset)
    observer.observe(node)
    window.addEventListener('resize', syncOffset)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncOffset)
    }
  }, [])

  return (
    <div ref={ref} className="site-header-lock">
      {children}
    </div>
  )
}
