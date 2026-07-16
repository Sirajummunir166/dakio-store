# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

**Note on AGENTS.md**: it tells you to read `node_modules/next/dist/docs/` before writing code because this Next.js version (16.2.6) has breaking changes vs. training data. That path does not currently exist in this install — check for it after any `npm install`/version bump before relying on it, and otherwise verify App Router behavior against the actual code in this repo rather than assumptions from training data.

## What this is

Public multi-tenant storefront for Dakio merchants (Next.js 16, App Router). A pure frontend consuming the `dakio-api` backend — see `f:/Dakio Apps/CLAUDE.md` for the cross-repo picture.

## Commands

```bash
npm run dev
npm run build
npm test   # node --test, runs the 7 files listed in package.json's "test" script
```

Tests use Node's built-in test runner, not Jest. `*.test.js` files are colocated with source. `package.json`'s `test` script lists files explicitly — **new test files must be added there manually to run.**

## Architecture

### Multi-tenant routing

`middleware.js` rewrites requests by hostname: any host not in `SKIP_DOMAINS` (`vercel.app`, `dakio.io`, `localhost`) is rewritten from `/...` to `/domain/{hostname}/...`. So there are two parallel route trees under `app/`:
- `app/[slug]/` — path-based storefront (`dakio.io/some-slug`): `page.js`, `checkout/`, `track/`, `products/[productSlug]/`, `preview/[theme]/`
- `app/domain/[host]/` — same routes, reached via a merchant's custom domain

Pages are async server components fetching from `lib/api.js` (`NEXT_PUBLIC_API_URL`, defaults to the Railway `dakio-api` deployment's `/api`), and distinguish `notFound` from `unavailable` states deliberately — this distinction was added after a P0 incident, don't collapse it back into one case.

### Theme runtime (`lib/theme-runtime/`)

A contract-based layer that decouples raw API data from theme UI code. **Only import from `lib/theme-runtime/index.js`** — never reach into individual runtime modules from theme packages. Pipeline:

1. Raw API data (store/products/categories)
2. Normalizers (`normalizeStore`, `normalizeProduct(s)`, `normalizeCategories`)
3. Bridges (`CartBridge`, `CheckoutBridge`, `RoutingBridge`) encapsulate cart/checkout/routing behavior
4. `buildContract()` in `ThemeContract.js` assembles the final immutable `ThemeContract` (`_meta.schemaVersion`/`themeVersion`, store, products, categories, pageConfig, cart, checkout, routing) — **the only object a theme package receives**

`compatibility/CompatibilityLayer.js` and `migration/MigrationLayer.js` handle legacy template configs. Runtime `SCHEMA_VERSION` and per-theme `THEME_VERSIONS` (e.g. `fashion: '1.0.0'`) are versioned independently — bumping one doesn't imply bumping the other. `lib/theme-runtime/pipeline.test.js` is the reference integration test for the full data flow.

`lib/theme/` handles theme *selection*: `resolveTheme.js` currently hardcodes `fashion_v1` as the only active engine (all stores use it, unless preview mode overrides), plus `validateThemeConfig.js`, `previewGuard.js`, `sanitizeThemeUrl.js`, `fashionDefaults.js`.

### Components

`components/themes/fashion/` is the current, actively-developed theme package (context, error boundary, wrapper, compat shims for legacy hooks like `useCart`/`useProductStore`, CMS-driven `sections/`, `defaults/presets.js`). `components/templates/` (Beauty/Bold/Fashion/Minimal/Organic/Tech) is an older, largely legacy parallel structure — check which one a task actually targets before editing.

Top-level client components: `StorefrontClient`, `CheckoutClient`, `ProductDetailClient`, `TrackOrderClient`, `PreviewGate`/`PreviewBanner`, `StoreUnavailable`, `VisitorTracker`, `TrackingScripts`.

Other `lib/` files: `storefront.js` (`useStorefront` hook — cart, coupons, lead capture, order placement, FB Pixel/GTM tracking), `routes.js`, `mediaUtils.js`, `bd-locations.js` (Bangladesh location data).

Path alias: `@/*` → repo root (`jsconfig.json`).
