import { productJsonLd, jsonLdString } from '../lib/seo'

// schema.org Product for search engines and AI shopping assistants. Renders
// nothing a shopper sees; see lib/seo.js for what goes in and what never does.
export default function ProductJsonLd({ product, url, currency, storeName }) {
  const data = productJsonLd(product, { url, currency: currency || 'BDT', storeName })
  if (!data) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
}
