const LEGACY_TEMPLATES = new Set(['minimal', 'fashion', 'tech', 'organic', 'beauty', 'bold'])

export function resolveTheme({ store, previewTheme, isPreviewMode }) {
  if (isPreviewMode && previewTheme) return previewTheme
  const t = store?.storeTemplate
  // Legacy templates and unset → fashion_v1 is the active theme engine
  if (!t || LEGACY_TEMPLATES.has(t)) return 'fashion_v1'
  return t
}
