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
  const { sections, dataPreset } = resolvePageSections(contract.pageConfig)

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
