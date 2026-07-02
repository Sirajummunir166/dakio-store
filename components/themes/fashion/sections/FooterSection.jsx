'use client'
import { useState } from 'react'
import { useFashionTheme } from '../FashionThemeContext.jsx'
import { sanitizeThemeUrl } from '../../../../lib/theme/sanitizeThemeUrl.js'

export default function FooterSection({ settings }) {
  const { contract, navigate } = useFashionTheme()
  const store = contract.store
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const brandName = settings.brandName ?? store.name
  const brandMark = settings.brandMark ?? store.name?.[0] ?? '◆'
  const copyright = settings.copyright ?? `© ${new Date().getFullYear()} ${brandName}`

  const socialLinks = settings.socialLinks?.length > 0
    ? settings.socialLinks
    : [
        store.instagramUrl && { label: 'Instagram', href: store.instagramUrl },
        store.facebookUrl && { label: 'Facebook', href: store.facebookUrl },
      ].filter(Boolean)

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="footer footer--flagship">
      <div className="container footer__grid">
        <div className="footer__brand">
          <a href={navigate.toHome()} className="logo logo--footer" onClick={(e) => { e.preventDefault(); navigate.toHome() }}>
            <span className="logo__mark">{brandMark}</span>
            <span className="logo__text">{brandName}</span>
          </a>
          <p>{settings.description}</p>
          {socialLinks.length > 0 && (
            <div className="footer__social">
              {socialLinks.map((link) => (
                <a key={link.label} href={sanitizeThemeUrl(link.href) ?? '#'}>{link.label}</a>
              ))}
            </div>
          )}
        </div>
        {settings.shopLinks?.length > 0 && (
          <div>
            <h4>Shop</h4>
            <ul>
              {settings.shopLinks.map((link) => (
                <li key={link.label}><a href={sanitizeThemeUrl(link.href) ?? '#'}>{link.label}</a></li>
              ))}
            </ul>
          </div>
        )}
        {settings.supportLinks?.length > 0 && (
          <div>
            <h4>Support</h4>
            <ul>
              {settings.supportLinks.map((link) => (
                <li key={link.label}><a href={sanitizeThemeUrl(link.href) ?? '#'}>{link.label}</a></li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h4>{settings.newsletterTitle}</h4>
          <p>{settings.newsletterDescription}</p>
          {subscribed ? (
            <p className="newsletter__success">Thanks, we'll keep you updated.</p>
          ) : (
            <form className="newsletter" onSubmit={handleNewsletter}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={settings.newsletterPlaceholder}
                aria-label="Email"
              />
              <button type="submit" className="btn btn--accent">
                {settings.newsletterButton}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>{copyright}</span>
          <span className="footer__trust">Free delivery ৳2,500+ · bKash · Nagad · COD · 7-day returns</span>
        </div>
      </div>
    </footer>
  )
}
