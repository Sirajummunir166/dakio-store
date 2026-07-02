// CSS file is loaded server-side via <link> in page.js for fashion_v1 stores.
// This component only injects the accent-color CSS variable override from store settings.

export default function FashionStyleInjector({ accentColor }) {
  const accent = accentColor || '#111111'
  const dark = accent === '#111111' ? '#000000' : accent

  return (
    <style>{`
      .veluna { --accent: ${accent}; --accent-dark: ${dark}; }
    `}</style>
  )
}
