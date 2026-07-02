'use client'
import { trackPath } from '../../../lib/routes'

export default function FashionFooter({ store, config, slug, categories, onCategory }) {
  const about = config.footer?.aboutText || store?.description || 'Premium fashion for the modern wardrobe. Quality you can trust, delivered across Bangladesh.'

  return (
    <footer className="ft-footer">
      <div className="ft-container">
        <div className="ft-footer-grid">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{store?.name}</div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, maxWidth: 280 }}>{about}</p>
          </div>
          <div>
            <h4>Shop</h4>
            {categories.slice(0, 6).map(c => (
              <button key={c.id} type="button" className="ft-link" onClick={() => onCategory(c.id)}>{c.name}</button>
            ))}
          </div>
          <div>
            <h4>Support</h4>
            {store?.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
            {store?.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
            <a href={trackPath(slug)}>Track Order</a>
          </div>
          <div>
            <h4>Connect</h4>
            {store?.instagramUrl && <a href={store.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>}
            {store?.facebookUrl && <a href={store.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>}
            {store?.whatsappNumber && <a href={`https://wa.me/${store.whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          </div>
        </div>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #E8E6E1', fontSize: 12, color: '#9CA3AF', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>© {new Date().getFullYear()} {store?.name}. All rights reserved.</span>
          {config.footer?.showPolicies !== false && (
            <span style={{ display: 'flex', gap: 16 }}>
              {['Refund policy', 'Privacy', 'Terms'].map(p => <span key={p}>{p}</span>)}
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
