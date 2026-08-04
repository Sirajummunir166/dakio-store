/**
 * Minimal allowlist HTML sanitizer for legacy rich-text product descriptions
 * (WYSIWYG-pasted content: nested div/font/span wrappers with inline styles).
 * Pure string transform — no DOM dependency, so it runs identically during
 * SSR and on the client.
 *
 * Not a general-purpose HTML sanitizer — scoped to the tag/attribute shape
 * these descriptions actually use. Strips scripts, event handlers, and
 * javascript:/expression() payloads; drops anything not on the allowlist.
 */

const BLOCKED_CONTENT_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'noscript', 'form', 'svg', 'math']

const ALLOWED_TAGS = new Set([
  'div', 'span', 'p', 'br', 'b', 'strong', 'i', 'em', 'u',
  'ul', 'ol', 'li', 'a', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'sub', 'sup',
])

const ATTR_ALLOWLIST = {
  a: ['href'],
  font: ['color', 'face'],
}
const GLOBAL_ATTRS = ['style']

const SAFE_STYLE_PROP = /^(color|background-color|font-size|font-weight|font-style|font-family|text-decoration|text-align|letter-spacing|line-height)$/i

function sanitizeStyleValue(v) {
  if (/url\s*\(|expression\s*\(|javascript:|@import/i.test(v)) return null
  return v
}

function sanitizeStyleAttr(raw) {
  const kept = []
  for (const decl of String(raw).split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const prop = decl.slice(0, i).trim()
    const val = decl.slice(i + 1).trim()
    if (!prop || !val || !SAFE_STYLE_PROP.test(prop)) continue
    const safeVal = sanitizeStyleValue(val)
    if (safeVal == null) continue
    kept.push(prop + ':' + safeVal)
  }
  return kept.join('; ')
}

function sanitizeHref(raw) {
  const v = String(raw || '').trim()
  if (/^https?:\/\//i.test(v) || v.startsWith('/') || v.startsWith('#') || /^mailto:/i.test(v) || /^tel:/i.test(v)) return v
  return null
}

function sanitizeAttrs(tag, attrStr) {
  const allowed = new Set([...(ATTR_ALLOWLIST[tag] || []), ...GLOBAL_ATTRS])
  const out = []
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|[^\s"'>]+))?/g
  let m
  while ((m = re.exec(attrStr))) {
    const name = m[1].toLowerCase()
    if (!allowed.has(name) || /^on/i.test(name)) continue
    let val = m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : (m[2] || '')
    if (name === 'style') {
      val = sanitizeStyleAttr(val)
      if (!val) continue
    }
    if (name === 'href') {
      const h = sanitizeHref(val)
      if (!h) continue
      val = h
    }
    out.push(name + '="' + val.replace(/"/g, '&quot;') + '"')
  }
  return out.length ? ' ' + out.join(' ') : ''
}

export function sanitizeHtml(input) {
  let html = String(input || '')
  // Drop comments outright — can hide legacy conditional-comment tricks.
  html = html.replace(/<!--[\s\S]*?-->/g, '')
  // Strip blocked tags and everything between their open/close pair.
  for (const t of BLOCKED_CONTENT_TAGS) {
    html = html.replace(new RegExp('<' + t + '[^>]*>[\\s\\S]*?</' + t + '>', 'gi'), '')
    html = html.replace(new RegExp('<' + t + '[^>]*/?>', 'gi'), '')
  }
  // Walk remaining tags: keep allowlisted ones (attrs sanitized), drop the
  // rest but keep their inner text.
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)\s*(\/?)>/g, (full, name, attrStr) => {
    const tag = name.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''
    if (full.startsWith('</')) return '</' + tag + '>'
    return '<' + tag + sanitizeAttrs(tag, attrStr || '') + '>'
  })
  return html
}
