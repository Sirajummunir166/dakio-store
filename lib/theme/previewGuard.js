import jwt from 'jsonwebtoken'

const ALLOWED_THEMES = new Set(['fashion', 'fashion_v1'])

export function validatePreviewToken(token, { slug, theme }) {
  if (!token) return { ok: false, error: 'missing_token' }
  if (!ALLOWED_THEMES.has(theme)) return { ok: false, error: 'invalid_theme' }

  const secret = process.env.PREVIEW_JWT_SECRET || process.env.JWT_SECRET
  if (!secret) return { ok: false, error: 'server_misconfigured' }

  try {
    const payload = jwt.verify(token, secret)
    if (payload.type !== 'theme-preview') return { ok: false, error: 'invalid_token' }
    if (payload.theme !== theme) return { ok: false, error: 'theme_mismatch' }
    if (payload.slug !== slug) return { ok: false, error: 'slug_mismatch' }
    return { ok: true, payload }
  } catch (err) {
    // TokenExpiredError and JsonWebTokenError are expected — log anything else
    const name = err?.name
    if (name !== 'TokenExpiredError' && name !== 'JsonWebTokenError' && name !== 'NotBeforeError') {
      console.error('[previewGuard] unexpected JWT verification error:', err)
    }
    return { ok: false, error: 'invalid_or_expired' }
  }
}
