/**
 * Client-side URL sanitizer for fashion_v1 theme section links.
 *
 * Returns the URL as-is if safe, or null if the protocol is dangerous.
 * Callers should fall back to '#' or omit the href entirely when null is returned.
 *
 * Allowed: relative paths (/path), anchors (#section), https://, mailto:, tel:
 * Rejected: javascript:, data:, vbscript:, file:, protocol-relative (//)
 */

const SAFE_PROTOCOLS = new Set(['https:', 'mailto:', 'tel:'])

export function sanitizeThemeUrl(value) {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null
  if (trimmed === '#') return '#'
  if (trimmed.startsWith('#')) return trimmed
  // Relative paths: allow /path but not //evil.com
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed
  try {
    const parsed = new URL(trimmed)
    return SAFE_PROTOCOLS.has(parsed.protocol) ? trimmed : null
  } catch {
    return null // malformed URL
  }
}
