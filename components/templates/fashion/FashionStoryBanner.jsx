'use client'

export default function FashionStoryBanner({ config }) {
  const story = config.sections?.story
  if (!story?.enabled) return null

  const scrollTo = () => document.getElementById(story.ctaAnchor || 'best-sellers')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="story" className="ft-story">
      <div className="ft-story-img">
        {story.image
          ? <img src={story.image} alt="" loading="lazy" />
          : <div style={{ width: '100%', height: '100%', background: '#EFEDE8', minHeight: 280 }} />}
      </div>
      <div className="ft-story-copy">
        <h2 className="ft-section-title">{story.title || 'The Collection'}</h2>
        <p className="ft-section-sub">{story.subtitle || 'Effortless pieces designed for modern life — from weekday office to weekend escape.'}</p>
        <button type="button" className="ft-btn ft-btn-primary" onClick={scrollTo}>{story.ctaText || 'Discover the Collection'}</button>
      </div>
    </section>
  )
}
