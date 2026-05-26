'use client'
import { useStorefront } from '../lib/storefront'
import MinimalTemplate from './templates/MinimalTemplate'
import FashionTemplate from './templates/FashionTemplate'
import TechTemplate    from './templates/TechTemplate'
import OrganicTemplate from './templates/OrganicTemplate'
import BeautyTemplate  from './templates/BeautyTemplate'
import BoldTemplate    from './templates/BoldTemplate'

const TEMPLATES = {
  minimal: MinimalTemplate,
  fashion: FashionTemplate,
  tech:    TechTemplate,
  organic: OrganicTemplate,
  beauty:  BeautyTemplate,
  bold:    BoldTemplate,
}

export default function StorefrontClient({ store, products, categories, slug }) {
  const sf = useStorefront({ store, products, categories, slug })
  const Template = TEMPLATES[store?.storeTemplate] || MinimalTemplate
  return <Template {...sf} />
}
