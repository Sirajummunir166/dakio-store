// The Video section's link → an embeddable player URL (DAKIO_SERVICES_WEBSITE_PLAN.md W0).
// YouTube (watch, youtu.be, shorts, embed), Vimeo and Facebook videos. Anything
// else is not embedded: the section opens it in a new tab instead.

/** `{ src, provider }` for an iframe, or null when the link is not a video we can embed. */
export function videoEmbed(url) {
  let u
  try { u = new URL(String(url || '').trim()) } catch { return null }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  const host = u.hostname.replace(/^www\.|^m\./, '')
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0]
    return ytId(id) ? yt(id) : null
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id = u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1]
    return ytId(id) ? yt(id) : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.match(/(\d{6,})/)?.[1]
    return id ? { src: `https://player.vimeo.com/video/${id}?autoplay=1`, provider: 'vimeo' } : null
  }
  if (host === 'facebook.com' || host === 'fb.watch') {
    return { src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.toString())}&show_text=false&autoplay=true`, provider: 'facebook' }
  }
  return null
}

const ytId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{6,20}$/.test(id)
const yt = (id) => ({ src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`, provider: 'youtube' })
