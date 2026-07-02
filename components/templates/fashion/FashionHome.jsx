'use client'
import { useMemo, useState } from 'react'
import { resolveFashionConfig } from '../../../lib/theme/fashionDefaults'
import { fashionCss } from './tokens'
import { DEMO } from '../demoData'
import { resolveMedia } from '../../../lib/mediaUtils'
import FashionAnnouncement from './FashionAnnouncement'
import FashionHeader from './FashionHeader'
import FashionHero from './FashionHero'
import FashionCategoryGrid from './FashionCategoryGrid'
import FashionProductSection from './FashionProductSection'
import FashionStoryBanner from './FashionStoryBanner'
import FashionShopByStyle from './FashionShopByStyle'
import FashionTrustBar, { FashionFlashSale } from './FashionTrustBar'
import FashionReviews from './FashionReviews'
import FashionInstagram from './FashionInstagram'
import FashionNewsletter from './FashionNewsletter'
import FashionFooter from './FashionFooter'
import FashionCollection from './FashionCollection'
import { useWishlist } from './useWishlist'

function sortProducts(list, sort) {
  const arr = [...list]
  if (sort === 'price-asc')  return arr.sort((a, b) => a.sellingPrice - b.sellingPrice)
  if (sort === 'price-desc') return arr.sort((a, b) => b.sellingPrice - a.sellingPrice)
  return arr
}

export default function FashionHome(props) {
  const {
    store, products, categories, activeCat, setActiveCat, searchQ, setSearchQ,
    searchOpen, setSearchOpen, mobileNav, setMobileNav,
    cartCount, setCartOpen, setQuickView, setDetail, addToCart,
    email, setEmail, subscribed, setSubscribed, isFiltered, slug,
  } = props

  const config = resolveFashionConfig(store)
  const { wishCount, toggle, has } = useWishlist(slug)
  const [announceDismissed, setAnnounceDismissed] = useState(false)
  const [bestSort, setBestSort] = useState('newest')
  const [styleFilter, setStyleFilter] = useState('')

  const demoMode = products.length === 0 && !isFiltered && !styleFilter
  const allProds = demoMode ? DEMO.fashion.products : products

  const newArrivalsSource = config.sections.newArrivals.categoryId
    ? allProds.filter(p => p.category?.id === config.sections.newArrivals.categoryId)
    : allProds
  const newArrivals = useMemo(() => newArrivalsSource.slice(0, config.sections.newArrivals.limit || 8), [newArrivalsSource, config.sections.newArrivals.limit])
  const bestSellersSource = config.sections.bestSellers.categoryId
    ? allProds.filter(p => p.category?.id === config.sections.bestSellers.categoryId)
    : allProds
  const bestSellers = useMemo(() => {
    const start = config.sections.newArrivals.categoryId ? 0 : (config.sections.newArrivals.limit || 8)
    return sortProducts(bestSellersSource.slice(start, start + (config.sections.bestSellers.limit || 8)), bestSort)
  }, [bestSellersSource, config, bestSort])

  const heroImage = config.hero.image || DEMO.fashion.hero
  const demoCatImages = DEMO.fashion.categoryImages || {}
  const demoStyleImages = DEMO.fashion.styleImages || {}
  const igFallback = (DEMO.fashion.products || []).slice(0, 6).map(p => resolveMedia(p).primary).filter(Boolean)

  const onHome = () => { setActiveCat('all'); setSearchQ(''); setStyleFilter(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const onView = (p) => setDetail(p)
  const onQuickAdd = (p) => { addToCart(p, 1); setQuickView(null) }

  const sectionMap = {
    categories: (
      <FashionCategoryGrid
        key="categories"
        config={config}
        categories={categories.length ? categories : DEMO.fashion.categoriesList || []}
        products={allProds}
        demoTiles={demoCatImages}
        onSelectCategory={id => { setActiveCat(id); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }) }}
      />
    ),
    newArrivals: config.sections.newArrivals.enabled !== false && (
      <FashionProductSection
        key="newArrivals"
        id="new-arrivals"
        title={config.sections.newArrivals.title || 'New Arrivals'}
        products={newArrivals}
        currency={store?.currency}
        primary={config.primary}
        onView={onView}
        onQuickAdd={onQuickAdd}
        wishHas={has}
        onToggleWish={toggle}
      />
    ),
    story: <FashionStoryBanner key="story" config={config} />,
    bestSellers: config.sections.bestSellers.enabled !== false && (
      <FashionProductSection
        key="bestSellers"
        id="best-sellers"
        title={config.sections.bestSellers.title || 'Best Sellers'}
        products={bestSellers}
        currency={store?.currency}
        primary={config.primary}
        onView={onView}
        onQuickAdd={onQuickAdd}
        wishHas={has}
        onToggleWish={toggle}
        sort={bestSort}
        onSort={setBestSort}
        sortOptions={[
          { value: 'newest', label: 'Newest' },
          { value: 'price-asc', label: 'Price: Low to High' },
          { value: 'price-desc', label: 'Price: High to Low' },
        ]}
      />
    ),
    shopByStyle: (
      <FashionShopByStyle
        key="shopByStyle"
        config={config}
        demoImages={demoStyleImages}
        onStyleSelect={tag => { setStyleFilter(tag); setSearchQ(tag); setActiveCat('all') }}
      />
    ),
    flashSale: <FashionFlashSale key="flashSale" config={config} />,
    reviews: <FashionReviews key="reviews" config={config} />,
    instagram: <FashionInstagram key="instagram" config={config} fallbackImages={igFallback} />,
    newsletter: <FashionNewsletter key="newsletter" config={config} email={email} setEmail={setEmail} subscribed={subscribed} setSubscribed={setSubscribed} />,
  }

  const showCollection = isFiltered || searchQ || styleFilter
  const collectionTitle = searchQ
    ? `Results for "${searchQ}"`
    : styleFilter
      ? styleFilter
      : activeCat !== 'all'
        ? (categories.find(c => c.id === activeCat)?.name || 'Collection')
        : 'Collection'

  const collectionProducts = showCollection
    ? (styleFilter
      ? allProds.filter(p => `${p.name} ${p.category?.name || ''}`.toLowerCase().includes(styleFilter.toLowerCase()))
      : activeCat !== 'all'
        ? allProds.filter(p => p.category?.id === activeCat)
        : searchQ
          ? allProds.filter(p => `${p.name} ${p.category?.name || ''}`.toLowerCase().includes(searchQ.toLowerCase()))
          : allProds)
    : []

  return (
    <div className="ft-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{fashionCss(config.primary)}</style>

      {!announceDismissed && (
        <FashionAnnouncement config={config} storeMessage={store?.announcementBar} onDismiss={() => setAnnounceDismissed(true)} />
      )}

      <FashionHeader
        store={store}
        config={config}
        categories={categories.length ? categories : DEMO.fashion.categoriesList || []}
        activeCat={activeCat}
        setActiveCat={setActiveCat}
        searchQ={searchQ}
        setSearchQ={setSearchQ}
        cartCount={cartCount}
        wishCount={wishCount}
        setCartOpen={setCartOpen}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        onHome={onHome}
      />

      {!isFiltered && !searchQ && !styleFilter && (
        <>
          <FashionHero
            config={config}
            heroImage={heroImage}
            fallbackTitle={DEMO.fashion.heroTitle}
            fallbackSubtitle={DEMO.fashion.heroSub}
          />
          <FashionTrustBar config={config} store={store} />
          {(config.sections.order || []).map(id => sectionMap[id]).filter(Boolean)}
        </>
      )}

      {showCollection && (
        <FashionCollection
          products={collectionProducts}
          categories={categories.length ? categories : DEMO.fashion.categoriesList || []}
          currency={store?.currency}
          primary={config.primary}
          title={collectionTitle}
          subtitle={collectionProducts.length ? `${collectionProducts.length} pieces` : undefined}
          onView={onView}
          onQuickAdd={onQuickAdd}
          wishHas={has}
          onToggleWish={toggle}
          onClear={onHome}
        />
      )}

      <FashionFooter
        store={store}
        config={config}
        slug={slug}
        categories={categories.length ? categories : DEMO.fashion.categoriesList || []}
        onCategory={id => { setActiveCat(id); setSearchQ('') }}
      />
    </div>
  )
}
