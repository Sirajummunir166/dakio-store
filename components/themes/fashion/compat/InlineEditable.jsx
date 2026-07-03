'use client'

/**
 * InlineEditable — storefront no-op.
 * In the veluna editor this wraps text with a click-to-edit overlay.
 * In dakio-store (read-only storefront) it just renders the value as plain text.
 */
export default function InlineEditable({ value, children }) {
  return children ?? value ?? null
}
