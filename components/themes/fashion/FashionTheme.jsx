'use client'
import { FashionThemeProvider } from './FashionThemeContext.jsx'
import FashionStyleInjector from './styles/FashionStyleInjector.jsx'
import SectionRenderer from './sections/SectionRenderer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import CartToast from './components/CartToast.jsx'
import SiteHeaderLock from './components/SiteHeaderLock.jsx'
import ProductQuickView from './components/ProductQuickView.jsx'
import SizeGuideModal from './sections/SizeGuide/SizeGuideModal.jsx'
import { resolvePreset } from './defaults/presets.js'
import { getDefaultPageConfig } from './defaults/pageConfig.js'

export default function FashionTheme({ contract }) {
  const { sections: rawSections, dataPreset } = resolvePageSections(contract.pageConfig)
  const sections = patchStoreSections(rawSections, contract.store)

  const headerSections = sections.filter((s) => s.type === 'topbar' || s.type === 'header')
  const contentSections = sections.filter((s) => s.type !== 'topbar' && s.type !== 'header')

  return (
    <FashionThemeProvider contract={contract}>
      <FashionStyleInjector accentColor={contract.store.accentColor} />
      <div className="veluna" data-preset={dataPreset}>
        <SiteHeaderLock>
          {headerSections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </SiteHeaderLock>
        {contentSections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
      <CartDrawer />
      <CartToast />
      <ProductQuickView />
      {/* Global SizeGuideModal — mounted once, driven by sizeGuide context state */}
      <SizeGuideModal />
    </FashionThemeProvider>
  )
}

// Replace Veluna placeholder branding with the merchant's real store data
// and fix default product tab so all products show instead of badge-filtered "new"
function patchStoreSections(sections, store) {
  if (!store?.name || !Array.isArray(sections)) return sections
  return sections.map((s) => {
    if (s.type === 'header' && s.settings?.brandName === 'Veluna') {
      return {
        ...s,
        settings: {
          ...s.settings,
          brandName: store.name,
          brandMark: store.name.charAt(0).toUpperCase(),
          ...(store.logoUrl ? { logoUrl: store.logoUrl } : {}),
        },
      }
    }
    if (s.type === 'footer' && s.settings?.copyright?.includes('Veluna')) {
      return {
        ...s,
        settings: {
          ...s.settings,
          copyright: `© 2026 ${store.name}`,
        },
      }
    }
    // Default products tab 'new' filters by badge — most stores have no badges,
    // so switch to show all products instead
    if (s.type === 'products' && s.settings?.defaultTab === 'new') {
      return {
        ...s,
        settings: { ...s.settings, defaultTab: 'all' },
      }
    }
    return s
  })
}

function resolvePageSections(pageConfig) {
  // 1. Stored config has real sections — use them directly
  if (Array.isArray(pageConfig?.sections) && pageConfig.sections.length > 0) {
    return {
      sections: pageConfig.sections,
      dataPreset: pageConfig.preset ?? 'classic',
    }
  }

  // 2. Stored config names a preset — build from preset (any preset, including classic)
  if (pageConfig?.preset) {
    const preset = resolvePreset(pageConfig.preset)
    return { sections: preset.sections, dataPreset: preset.dataPreset }
  }

  // 3. No config at all — auto Classic preset (full 10-section experience)
  const classicPreset = resolvePreset('classic')
  return { sections: classicPreset.sections, dataPreset: 'classic' }
}
