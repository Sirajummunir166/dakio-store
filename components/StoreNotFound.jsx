'use client'

import { useState } from 'react'

const MARKETING_URL = 'https://dakio.io'
const APP_URL = 'https://app.dakio.io'
const PREVIEW_SUFFIX = 'dakio.shop'

export default function StoreNotFound({ hostname, variant = 'root' }) {
  const [slug, setSlug] = useState('')

  const handleFind = (e) => {
    e.preventDefault()
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!s) return
    if (variant === 'domain') {
      // No store connected to this custom/wildcard host — the natural next
      // step for a typed slug is the wildcard preview tier.
      window.location.href = `https://${s}.${PREVIEW_SUFFIX}`
    } else {
      // root variant: stay on whatever first-party origin actually served this
      // page (store.dakio.io, a vercel.app preview, localhost) rather than
      // assuming a specific host.
      window.location.href = `${window.location.origin}/${s}`
    }
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
        {variant === 'domain' ? `No Dakio store is connected to ${hostname} yet` : 'Find your Dakio store'}
      </h1>
      <form onSubmit={handleFind} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="your-store-name"
          style={{ padding: '0.6rem 0.8rem', border: '1px solid #ccc', borderRadius: 6, minWidth: 220 }}
        />
        <button type="submit" style={{ padding: '0.6rem 1rem', borderRadius: 6, background: '#111', color: '#fff' }}>
          Go →
        </button>
      </form>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
        Have a merchant account? <a href={APP_URL}>Log in at app.dakio.io</a>
        {' · '}
        Curious about Dakio? <a href={MARKETING_URL}>Visit dakio.io</a>
      </p>
    </main>
  )
}
