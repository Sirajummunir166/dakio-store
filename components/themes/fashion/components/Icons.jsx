'use client'

export function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  )
}

export function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6h15l-1.5 9H7.5L6 6z" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M6 6L5 3H2" />
    </svg>
  )
}

export function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconClose({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconCheck({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function IconPlus({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconMinus({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
    </svg>
  )
}

export function IconArrowRight({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconBag({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 7h12l-1 14H7L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export function IconBagAddPlus({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5,7H17a5.0071,5.0071,0,0,0-5-5A5.0059,5.0059,0,0,0,7,7H6.5A2.5026,2.5026,0,0,0,4,9.5v10A2.5026,2.5026,0,0,0,6.5,22h6a.5.5,0,0,0,0-1h-6A1.5017,1.5017,0,0,1,5,19.5V9.5A1.5017,1.5017,0,0,1,6.5,8h11A1.5017,1.5017,0,0,1,19,9.5v5a.5.5,0,0,0,1,0v-5A2.5026,2.5026,0,0,0,17.5,7ZM12,3a4.0078,4.0078,0,0,1,4,4H8A4.0042,4.0042,0,0,1,12,3Z" />
      <path d="M20,19.5a.5.5,0,0,1-.5.5H18v1.5a.5.5,0,0,1-1,0V20H15.5a.5.5,0,0,1,0-1H17V17.5a.5.5,0,0,1,1,0V19h1.5A.5.5,0,0,1,20,19.5Z" />
    </svg>
  )
}

export function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 6-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

export function IconBagPlus({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 7h12l-1 14H7L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      <circle cx="17.5" cy="13" r="3.25" />
      <path d="M17.5 11.7v2.6" />
      <path d="M16.2 13h2.6" />
    </svg>
  )
}

export function AddedLabel({ label = 'Added' }) {
  return (
    <span className="btn-label-with-icon">
      <IconCheck size={14} />
      {label}
    </span>
  )
}

const FEATURE_ICONS = {
  truck: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7V10z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
    </svg>
  ),
  return: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 7h12a4 4 0 0 1 4 4v6H8a4 4 0 0 1-4-4V7z" />
      <path d="M8 11l-4-4M8 11l-4 4" />
    </svg>
  ),
  shield: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  support: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 10a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1l-2 3H9l-2-3H6a2 2 0 0 1-2-2v-4z" />
    </svg>
  ),
}

export function FeatureIcon({ name }) {
  return FEATURE_ICONS[name] ?? FEATURE_ICONS.support
}
