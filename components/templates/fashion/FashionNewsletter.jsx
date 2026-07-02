'use client'
import { useState } from 'react'

export default function FashionNewsletter({ config, email, setEmail, subscribed, setSubscribed }) {
  const sec = config.sections?.newsletter
  if (!sec?.enabled) return null

  function submit(e) {
    e.preventDefault()
    if (email.trim()) setSubscribed(true)
  }

  return (
    <section id="newsletter" className="ft-newsletter">
      <h2 className="ft-section-title">{sec.title || 'Join Our List'}</h2>
      <p className="ft-section-sub" style={{ margin: '0 auto', maxWidth: 400 }}>{sec.subtitle || 'Be first to know about new drops and exclusive offers.'}</p>
      {subscribed ? (
        <p style={{ fontSize: 14, color: '#166534', fontWeight: 600 }}>Thank you for subscribing.</p>
      ) : (
        <form className="ft-nl-form" onSubmit={submit}>
          <input className="ft-nl-input" type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button type="submit" className="ft-btn ft-btn-primary" style={{ borderRadius: 0 }}>Subscribe</button>
        </form>
      )}
    </section>
  )
}
