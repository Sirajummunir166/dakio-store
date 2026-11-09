// The old theme pages are retired (owner, 2026-11-09): a store with no
// published Store Studio website shows its launch page (components/LaunchPage)
// at its address, and its old product and checkout links lead there. A store
// that took storefront orders on the old pages keeps them until `legacyUntil`
// (dakio-api src/lib/launchPage.js).

// True when this store's address shows the launch page instead of a website.
export function showsLaunchPage(siteData) {
  return !!siteData && !siteData.site && !!siteData.launch && !siteData.legacyUntil
}

const TITLE = { building: { en: 'Website under construction', bn: 'ওয়েবসাইট তৈরি হচ্ছে' }, soon: { en: 'Coming soon', bn: 'শীঘ্রই আসছে' } }

// Page metadata for the launch page: the store's name, never indexed.
export function launchMetadata(launch, store) {
  const lang = launch?.lang === 'bn' ? 'bn' : 'en'
  const what = (TITLE[launch?.mode] || TITLE.building)[lang]
  const name = launch?.brand || store?.name || ''
  const icon = store?.faviconUrl || null
  return {
    title: name ? `${name} · ${what}` : what,
    robots: { index: false, follow: false },
    ...(icon ? { icons: { icon, shortcut: icon } } : {}),
  }
}
