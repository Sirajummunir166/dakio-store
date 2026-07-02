'use client'

export default function FashionInstagram({ config, fallbackImages }) {
  const sec = config.sections?.instagram
  if (!sec?.enabled) return null
  const images = (sec.images?.length ? sec.images : fallbackImages || []).slice(0, 6)
  if (!images.length) return null

  return (
    <section id="instagram" className="ft-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div className="ft-container">
        <h2 className="ft-section-title" style={{ textAlign: 'center' }}>{sec.title || 'Follow Us'}</h2>
        <div className="ft-ig-grid">
          {images.map((src, i) => (
            <div key={i} style={{ overflow: 'hidden' }}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
