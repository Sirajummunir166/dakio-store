export default function PromoBannerSection({ settings }) {
  const isCampaign = settings.variant === 'campaign'
  const isBrandStory = settings.variant === 'brand-story'
  const isEditorial = isCampaign || isBrandStory
  const eyebrow = settings.eyebrow?.trim()
  const ctaLabel = settings.ctaLabel?.trim()

  const floatImageSrc = settings.floatImage ?? null
  const floatIsTransparent = Boolean(settings.floatImage && settings.floatTransparent !== false)

  if (isCampaign) {
    return (
      <section className="campaign-editorial">
        <div className="campaign-editorial__media">
          <img src={settings.mainImage} alt={settings.mainImageAlt} />
        </div>
        <div className="container campaign-editorial__inner">
          <div className="campaign-editorial__copy">
            {eyebrow && <span className="eyebrow eyebrow--editorial">{eyebrow}</span>}
            <h2>{settings.title}</h2>
            <p>{settings.description}</p>
            {ctaLabel && (
              <button type="button" className="btn btn--premium campaign-editorial__cta">{ctaLabel}</button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={isBrandStory ? 'brand-story' : 'promo-banner'}>
      <div className={`container ${isBrandStory ? 'brand-story__inner' : 'promo-banner__inner'}`}>
        <div className={isBrandStory ? 'brand-story__copy' : 'promo-banner__copy'}>
          {eyebrow && (
            <span className={`eyebrow ${isBrandStory ? 'eyebrow--editorial' : 'eyebrow--light'}`}>{eyebrow}</span>
          )}
          <h2>{settings.title}</h2>
          <p>{settings.description}</p>
          {!isBrandStory && ctaLabel && (
            <button type="button" className="btn btn--light">{ctaLabel}</button>
          )}
        </div>
        <div className={isBrandStory ? 'brand-story__media' : 'promo-banner__media'}>
          {settings.mainImage && (
            <img src={settings.mainImage} alt={settings.mainImageAlt ?? settings.title} />
          )}
          {floatImageSrc && (
            <img
              src={floatImageSrc}
              alt={settings.floatImageAlt ?? settings.title ?? 'Featured product'}
              className={`promo-banner__float${floatIsTransparent ? ' promo-banner__float--transparent' : ''}`}
            />
          )}
        </div>
      </div>
    </section>
  )
}
