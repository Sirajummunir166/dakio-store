'use client'

export default function FashionHero({ config, heroImage, fallbackTitle, fallbackSubtitle }) {
  const hero = config.hero
  if (hero.enabled === false) return null

  const headline = hero.headline || fallbackTitle || 'Style That Moves With You'
  const subtitle = hero.subtitle || fallbackSubtitle || 'Curated fashion for every moment. Premium quality, delivered across Bangladesh.'

  const scrollTo = (anchor) => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="ft-hero" aria-label="Hero">
      <div className="ft-hero-bg">
        {heroImage && <img src={heroImage} alt="" loading="eager" fetchPriority="high" />}
      </div>
      <div className="ft-hero-overlay" />
      <div className="ft-hero-content">
        <h1>{headline}</h1>
        <p>{subtitle}</p>
        <div className="ft-hero-btns">
          <button type="button" className="ft-btn ft-btn-primary" onClick={() => scrollTo(hero.primaryCta?.anchor || 'new-arrivals')}>
            {hero.primaryCta?.text || 'Shop New Arrivals'}
          </button>
          <button type="button" className="ft-btn ft-btn-outline" style={{ color: '#fff', borderColor: '#fff' }} onClick={() => scrollTo(hero.secondaryCta?.anchor || 'categories')}>
            {hero.secondaryCta?.text || 'Explore Collection'}
          </button>
        </div>
      </div>
    </section>
  )
}
