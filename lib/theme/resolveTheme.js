export function resolveTheme({ store, previewTheme, isPreviewMode }) {
  if (isPreviewMode && previewTheme) return previewTheme
  // fashion_v1 is the only active theme engine — all stores use it
  return 'fashion_v1'
}
