export function resolveTheme({ store, previewTheme, isPreviewMode }) {
  if (isPreviewMode && previewTheme) return previewTheme
  return store?.storeTemplate || 'minimal'
}
