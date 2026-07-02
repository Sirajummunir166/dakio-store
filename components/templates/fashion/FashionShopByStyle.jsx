'use client'

export default function FashionShopByStyle({ config, onStyleSelect, demoImages }) {
  const sec = config.sections?.shopByStyle
  if (!sec?.enabled) return null

  return (
    <section id="shopByStyle" className="ft-section" style={{ background: '#F7F6F3' }}>
      <div className="ft-container">
        <h2 className="ft-section-title">{sec.title || 'Shop by Style'}</h2>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {(sec.items || []).map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => onStyleSelect(item.tag || item.title)}
              style={{ flex: '0 0 140px', border: 'none', padding: 0, cursor: 'pointer', background: 'none', textAlign: 'left' }}
            >
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', marginBottom: 8, background: '#EFEDE8' }}>
                {(item.image || demoImages?.[item.id]) && (
                  <img src={item.image || demoImages[item.id]} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
