import TopbarSection from './TopbarSection.jsx'
import HeaderSection from './HeaderSection.jsx'
import HeroDealsSection from './HeroDealsSection.jsx'
import CategoriesSection from './CategoriesSection.jsx'
import ProductsSection from './ProductsSection.jsx'
import PromoBannerSection from './PromoBannerSection.jsx'
import FeaturesSection from './FeaturesSection.jsx'
import BlogSection from './BlogSection.jsx'
import FooterSection from './FooterSection.jsx'
import LookbookSection from './Lookbook/index.jsx'
import ShopByStyleSection from './ShopByStyle/index.jsx'
import SizeGuideSection from './SizeGuide/index.jsx'
import FabricCareSection from './FabricCare/index.jsx'

const SECTION_COMPONENTS = {
  topbar: TopbarSection,
  header: HeaderSection,
  'hero-deals': HeroDealsSection,
  categories: CategoriesSection,
  products: ProductsSection,
  'promo-banner': PromoBannerSection,
  features: FeaturesSection,
  blog: BlogSection,
  footer: FooterSection,
  lookbook: LookbookSection,
  'shop-by-style': ShopByStyleSection,
  'size-guide': SizeGuideSection,
  'fabric-care': FabricCareSection,
}

export default function SectionRenderer({ section }) {
  if (!section.enabled) return null
  const Component = SECTION_COMPONENTS[section.type]
  if (!Component) return null
  return <Component settings={section.settings} />
}
