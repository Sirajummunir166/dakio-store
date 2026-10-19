import { jsonLdString } from '../lib/seo'

// Any schema.org object as a JSON-LD script (nothing a visitor sees). Null renders nothing.
export default function JsonLd({ data }) {
  if (!data) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
}
