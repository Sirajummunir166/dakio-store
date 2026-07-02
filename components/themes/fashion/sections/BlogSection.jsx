import { IconArrowRight } from '../components/Icons.jsx'
import { useFashionTheme } from '../FashionThemeContext.jsx'
import { sanitizeThemeUrl } from '../../../../lib/theme/sanitizeThemeUrl.js'

export default function BlogSection({ settings }) {
  const { contract } = useFashionTheme()
  const products = contract.products

  // Blog images from contract.products by index (same pattern as Veluna)
  const blogImages = (settings.imageIndexes ?? []).map((i) => products[i]?.image).filter(Boolean)

  return (
    <section className="blog">
      <div className="container">
        <div className="section-head">
          <div>
            {settings.eyebrow && <span className="eyebrow">{settings.eyebrow}</span>}
            <h2>{settings.title}</h2>
          </div>
          <a href={sanitizeThemeUrl(settings.linkHref) ?? '#'} className="link-more link-with-icon">
            {settings.linkLabel}
            <IconArrowRight size={16} />
          </a>
        </div>
        <div className="blog__grid">
          {settings.posts?.map((post, index) => {
            const postHref = sanitizeThemeUrl(post.href ?? post.link ?? null)
            const img = blogImages[index]
            return (
              <article key={post.title} className="blog-card">
                <div className="blog-card__media">
                  {img && (postHref
                    ? <a href={postHref}><img src={img} alt={post.title} /></a>
                    : <img src={img} alt={post.title} />
                  )}
                </div>
                <div className="blog-card__body">
                  <span className="blog-card__meta">{post.category} · {post.date}</span>
                  <h3>{postHref ? <a href={postHref}>{post.title}</a> : post.title}</h3>
                  {postHref && (
                    <a href={postHref} className="link-more link-with-icon">
                      Read more
                      <IconArrowRight size={16} />
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
