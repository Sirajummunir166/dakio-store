'use client'

export default function Stars({ rating }) {
  const full = Math.floor(Number(rating))
  return (
    <span className="stars" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
    </span>
  )
}
