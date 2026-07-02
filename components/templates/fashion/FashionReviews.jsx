'use client'
import { Star } from 'lucide-react'

export default function FashionReviews({ config }) {
  const sec = config.sections?.reviews
  if (!sec?.enabled) return null
  const items = sec.items || []

  return (
    <section id="reviews" className="ft-section">
      <div className="ft-container">
        <h2 className="ft-section-title">{sec.title || 'What Customers Say'}</h2>
        <div className="ft-review-grid">
          {items.map((r, i) => (
            <div key={i} className="ft-review-card">
              <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                {Array.from({ length: r.rating || 5 }).map((_, j) => <Star key={j} size={12} fill="#111" stroke="#111" />)}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#374151', margin: '0 0 12px' }}>&ldquo;{r.text}&rdquo;</p>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{r.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
