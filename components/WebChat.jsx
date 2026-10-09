import Script from 'next/script'

// Website chat (DAKIO_WEBCHAT_PLAN.md): the store's chat bubble, on every page
// of a store whose owner switched it on in Add-ons. The bubble is one script
// dakio-api serves; it reads the store's look itself, draws in a shadow root,
// and skips the pages tracking skips (preview, canvas, ?token).
const API_ORIGIN = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_API_URL || 'https://dakio-api-production.up.railway.app/api').origin } catch { return null }
})()

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}$/i

export default function WebChat({ store, scope }) {
  if (!store?.webchat || !API_ORIGIN || !SLUG_RE.test(String(store.slug ?? ''))) return null
  return (
    <Script
      id="dakio-webchat"
      src={`${API_ORIGIN}/webchat/v1/widget.js`}
      strategy="lazyOnload"
      data-store={store.slug}
      data-scope={scope}
    />
  )
}
