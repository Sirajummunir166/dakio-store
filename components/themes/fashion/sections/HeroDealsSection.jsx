'use client'
import { useFashionTheme } from '../FashionThemeContext.jsx'

function EditorialHero({ settings }) {
  const { navigate } = useFashionTheme()
  const deal = settings.deals?.[0] ?? {}
  const eyebrow = settings.eyebrow?.trim()

  return (
    <section className="hero-editorial">
      <div className="hero-editorial__media">
        <img src={settings.heroImage} alt={settings.heroImageAlt ?? deal.title ?? 'Collection'} />
      </div>
      <div className="container hero-editorial__inner">
        <div className="hero-editorial__copy">
          {eyebrow && <span className="eyebrow eyebrow--editorial">{eyebrow}</span>}
          <h1>{deal.title}</h1>
          <p>{deal.subtitle}</p>
          <button type="button" className="btn btn--premium hero-editorial__cta" onClick={navigate.toHome}>
            {deal.cta ?? 'Explore collection'}
          </button>
        </div>
      </div>
    </section>
  )
}

function HeroDealCard({ deal, dealIndex, settings }) {
  const { contract, navigate } = useFashionTheme()
  const products = contract.products
  const dealProducts = (settings.productIndexes ?? [])
    .slice(dealIndex * 2, dealIndex * 2 + 2)
    .map((i) => products[i])
    .filter(Boolean)

  return (
    <article className={`hero-deal hero-deal--${deal.tone ?? 'dark'}`}>
      <div className="hero-deal__content">
        {settings.eyebrow?.trim() && <span className="hero-deal__eyebrow">{settings.eyebrow}</span>}
        <h2>{deal.title}</h2>
        <p>{deal.subtitle}</p>
        <button type="button" className="btn btn--light" onClick={navigate.toHome}>
          {deal.cta}
        </button>
      </div>
      {deal.cardImage ? (
        <div className="hero-deal__model">
          <img src={deal.cardImage} alt={deal.title} loading="lazy" />
        </div>
      ) : (
        <div className="hero-deal__products">
          {dealProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              className="hero-deal__thumb"
              onClick={() => navigate.toProduct(product.slug)}
            >
              <img src={product.image} alt={product.name} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </article>
  )
}

export default function HeroDealsSection({ settings }) {
  if (settings.layout === 'editorial') {
    return <EditorialHero settings={settings} />
  }

  const deals = settings.deals ?? []
  const gridClass =
    deals.length === 1
      ? 'hero-deals__grid hero-deals__grid--1'
      : deals.length === 2
        ? 'hero-deals__grid hero-deals__grid--2'
        : 'hero-deals__grid'

  return (
    <section className="hero-deals">
      <div className={`container ${gridClass}`}>
        {deals.map((deal, i) => (
          <HeroDealCard key={`${deal.title}-${i}`} deal={deal} dealIndex={i} settings={settings} />
        ))}
      </div>
    </section>
  )
}
