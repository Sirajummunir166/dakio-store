# Multi-Tenant Hostname Routing — Design Proposal

Status: proposal, not yet implemented · 2026-07-25

## Why

Today a merchant's store is only reachable via `store.dakio.io/{slug}` (path-based) or a fully-verified custom domain (`app/domain/[host]/**`). There's no way to preview a store on its own hostname before a custom domain is set up, and no local-dev environment that mirrors that experience. This adds:

1. A wildcard preview tier on `*.dakio.shop` — every tenant slug is automatically reachable at `{slug}.dakio.shop`, no per-merchant setup.
2. A local-dev equivalent (`{slug}.localhost:3000`) with the same behavior.
3. Continued support for merchants pointing their own (sub)domain at their store — already works today, confirmed unaffected.
4. A new root page (`app/page.js`) — currently a static marketing splash — that behaves correctly across all of the above tiers instead of just being a static page.

## 1. Recommended architecture

Four hostname tiers, resolved in this order:

| Tier | Example | Tree | Notes |
|---|---|---|---|
| (a) First-party / platform | `store.dakio.io`, `*.vercel.app` previews, bare `localhost` | `app/[slug]/**` (path-based) | Unchanged |
| (b) Wildcard preview | `myshop.dakio.shop` | `app/domain/[host]/**` | New |
| (c) Local-dev wildcard | `demo2.localhost:3000` | `app/domain/[host]/**` | New, dev-only mirror of (b) |
| (d) Custom domain | `shop.merchantbrand.com` | `app/domain/[host]/**` | Already works, no change |

**Core decision:** `*.dakio.shop` does **not** rewrite into the `/[slug]` tree. Every page under `app/[slug]/**` hardcodes `basePath='/'+slug`, so rewriting `myshop.dakio.shop → /myshop` would still emit `/myshop/...` links — the browser would request those against `myshop.dakio.shop`, and middleware would double-prefix into `/myshop/myshop/...` → 404.

`app/domain/[host]/**` already hardcodes `basePath=""`, which is exactly correct for any host where the tenant is implied by the Host header instead of a URL segment — true for custom domains today, equally true for `*.dakio.shop`/`*.localhost` tomorrow. So: route tiers (b), (c), and (d) through the **existing domain tree, unmodified**, and teach `dakio-api`'s existing `GET /by-domain/:domain` to resolve platform-wildcard hostnames by **slug** instead of by `customDomain` string match.

Net diff: **zero page-file changes** in `dakio-store`, a simpler `middleware.js`, one bug fix in `lib/routes.js`, one new branch in an existing `dakio-api` route handler, **no Prisma migration**.

## 2. Decisions that are genuinely a judgment call

**Q1 — Vercel plan tier for wildcard domains.** ~~Wildcard domains require DNS-01 cert validation, typically gated above the base plan~~ — **already resolved**: verified 2026-07-25 that `*.dakio.shop` has a live wildcard Let's Encrypt cert on Vercel and DNS already routes arbitrary subdomains to the deployment. This gate is done; no plan/cost decision is blocking anymore.

**Q2 — `.localhost` vs `.local` for the dev tier.** Recommend **`.localhost`**: RFC 6761-reserved, Chromium/Firefox auto-resolve any `*.localhost` to `127.0.0.1` with zero `/etc/hosts` edits. `.local` collides with macOS mDNS/Bonjour (real source of intermittent resolution failures) and has no wildcard syntax in `/etc/hosts` — every demo tenant would need its own manually-added line. If the team wants `.local` anyway, it's a one-line env var change (`PLATFORM_WILDCARD_SUFFIXES`), not a code change.

**Q3 — 200-with-helpful-page vs hard 404 for an unresolved host.** Keeping HTTP 200 + a "find your store" page is friendlier but semantically loose. Paired with an explicit `noindex` (below), the SEO angle is covered either way — this is a UX call, not a technical one. Default: keep 200.

## 2a. Verified live bug: static theme assets 404 on any custom-domain host

Confirmed against production (2026-07-25): `dakio.shop` (apex, assigned as a real tenant's `customDomain`) renders correctly, but `demo.dakio.shop` — reachable because DNS + a Vercel wildcard cert for `*.dakio.shop` are **already provisioned** (`CN=*.dakio.shop`, Let's Encrypt, verifies fine) and some test tenant already has `customDomain = 'demo.dakio.shop'` set — loads with broken styling. Root cause: its two stylesheets, `/fashion-theme.css` and `/fashion-additions.css` (static files in `dakio-store/public/`), both 404 on that host (verified: 200 on `store.dakio.io`, 404 — Next's own 404 page, not a missing-file error — on `demo.dakio.shop`).

The old `middleware.js` matcher (`'/((?!_next|favicon\.ico|api|_vercel).*)'`) only excludes `_next`/`favicon.ico`/`api`/`_vercel`. Every other `public/` asset gets rewritten to `/domain/{host}/{asset-path}` on a custom-domain host, which has no matching route → 404 → the CSS never loads. **This isn't specific to the new wildcard tier — it already affects any real, live custom-domain tenant using the "fashion" theme today.** The tenant on the `dakio.shop` apex happens to be on the older legacy `components/templates/` system, which doesn't depend on these static files, so it never surfaced the bug. Applied as an immediate, isolated fix (independent of the rest of this proposal): broaden the matcher to exclude anything that looks like a static file, not just a fixed name list — the `.*\..*` exclusion is the standard Next.js idiom for this. The full-replacement `middleware.js` below carries this forward.

**Also worth deciding:** the `dakio.shop` apex is currently assigned as one specific tenant's `customDomain`. Once `*.dakio.shop` becomes the platform's own wildcard preview base, decide whether that tenant should keep squatting on the bare apex, or whether `dakio.shop` (no subdomain) should be freed up for a platform page (e.g. a redirect to `dakio.io`, or a "create your preview store" landing page) instead — otherwise the platform's own shared domain and one merchant's storefront are the same URL, which will confuse anyone who's seen the `{slug}.dakio.shop` pattern.

## 3. `middleware.js` — full replacement

```js
import { NextResponse } from 'next/server'

// Dakio's own first-party surfaces — any request here (bare host, a dotted
// subdomain like store.dakio.io, or a Vercel preview build) keeps the existing
// path-based routing, e.g. store.dakio.io/myshop or a *.vercel.app preview at /myshop.
const SKIP_SUFFIXES = ['dakio.io', 'vercel.app']

// Bare localhost/127.0.0.1 (no subdomain) is also path-based, for developers who
// just want http://localhost:3000/<slug> with no hostname routing involved.
const BARE_LOCAL_HOSTS = ['localhost', '127.0.0.1']

function isFirstPartyHost(hostname) {
  return (
    BARE_LOCAL_HOSTS.includes(hostname) ||
    SKIP_SUFFIXES.some(d => hostname === d || hostname.endsWith(`.${d}`))
  )
}

export async function middleware(req) {
  // Lowercase before any comparison/rewrite — without this, MyShop.Dakio.Shop and
  // myshop.dakio.shop become distinct Next.js route/cache entries for the same tenant.
  const hostname = (req.headers.get('host')?.split(':')[0] || '').toLowerCase()
  const { pathname } = req.nextUrl

  if (isFirstPartyHost(hostname)) {
    return NextResponse.next()
  }

  // Everything else funnels through the domain tree: *.dakio.shop wildcard preview
  // subdomains, *.localhost wildcard dev subdomains, and merchants' own custom
  // (sub)domains. dakio-api's /store/by-domain is what tells a platform-wildcard
  // host (resolve by slug) apart from a real custom domain (resolve by customDomain)
  // — dakio-store itself doesn't need to know which.
  //
  // Scope note: app/domain/[host]/** has no studio-preview route today. A request
  // to {slug}.dakio.shop/studio-preview or customdomain.com/studio-preview will 404
  // until that route is added to the domain tree — not addressed by this change.
  const url = req.nextUrl.clone()
  url.pathname = pathname === '/' ? `/domain/${hostname}` : `/domain/${hostname}${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Exclude anything that looks like a static file (has a dot in the last
  // segment, e.g. /fashion-theme.css, /dakio-logo-white.svg) in addition to
  // _next/api/_vercel — otherwise public/ assets get rewritten to
  // /domain/{host}/... on any custom-domain host, 404, and theme CSS
  // silently never loads (confirmed live on demo.dakio.shop, see §2a).
  matcher: ['/((?!_next|favicon\\.ico|api|_vercel|.*\\..*).*)'],
}
```

**Behavior change vs. today:** previously any `X.localhost` matched `endsWith('.localhost')` in the old skip list and stayed path-based. Now only *bare* `localhost`/`127.0.0.1` does; any `X.localhost` goes through the domain tree. Intentional — it's what makes tier (c) work — but a real behavior change for anyone relying on the old passthrough.

## 4. `app/page.js` / new `StoreNotFound` component

**Scope correction:** don't assume this Vercel project owns the bare `dakio.io` apex — per the monorepo's top-level `CLAUDE.md`, `dakio.io` is `dakio-landing`'s deploy target, a separate repo/project. Confirm actual domain bindings on the `dakio-store` Vercel project before treating this as affecting bare-`dakio.io` inbound links. Scope the "inbound link" risk to `store.dakio.io` (and whatever other host is actually bound to this project) only.

```jsx
// components/StoreNotFound.jsx
'use client'

import { useState } from 'react'

const MARKETING_URL = 'https://dakio.io'
const APP_URL = 'https://app.dakio.io'
const PREVIEW_SUFFIX = 'dakio.shop'

export default function StoreNotFound({ hostname, variant = 'root' }) {
  const [slug, setSlug] = useState('')

  const handleFind = (e) => {
    e.preventDefault()
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!s) return
    if (variant === 'domain') {
      // No store connected to this custom/wildcard host — the natural next
      // step for a typed slug is the wildcard preview tier.
      window.location.href = `https://${s}.${PREVIEW_SUFFIX}`
    } else {
      // root variant: stay on whatever first-party origin actually served this
      // page (store.dakio.io, a vercel.app preview, localhost) rather than
      // assuming a specific host.
      window.location.href = `${window.location.origin}/${s}`
    }
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
        {variant === 'domain' ? `No Dakio store is connected to ${hostname} yet` : 'Find your Dakio store'}
      </h1>
      <form onSubmit={handleFind} style={{ display: 'flex', gap: '0.5rem' }}>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="your-store-name" style={{ padding: '0.6rem 0.8rem', border: '1px solid #ccc', borderRadius: 6, minWidth: 220 }} />
        <button type="submit" style={{ padding: '0.6rem 1rem', borderRadius: 6, background: '#111', color: '#fff' }}>Go →</button>
      </form>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
        Have a merchant account? <a href={APP_URL}>Log in at app.dakio.io</a>
        {' · '}
        Curious about Dakio? <a href={MARKETING_URL}>Visit dakio.io</a>
      </p>
    </main>
  )
}
```

```jsx
// app/page.js — full replacement
import StoreNotFound from '@/components/StoreNotFound'

export default function RootPage() {
  return <StoreNotFound variant="root" />
}
```

Drops `'use client'` from the page itself — the interactive bit is isolated in `StoreNotFound`, so `app/page.js` is a plain server component.

```jsx
// app/domain/[host]/page.js — not-found branch (adapt to actual current shape)
import StoreNotFound from '@/components/StoreNotFound'
// ...
const storeData = await getStoreByDomain(host)
if (storeData.notFound || storeData.unavailable) {
  return <StoreNotFound variant="domain" hostname={host} />
}
```

**Canonical / noindex.** The same tenant is now reachable at up to three origins: path URL, `{slug}.dakio.shop`, custom domain. Add metadata so search engines converge on one canonical URL and don't index the preview tier:

```jsx
// app/domain/[host]/layout.js — add generateMetadata
import { getStoreByDomain } from '@/lib/api'
import { getCanonicalUrl } from '@/lib/routes'

export async function generateMetadata({ params }) {
  const { host } = params
  const storeData = await getStoreByDomain(host)
  if (storeData.notFound || storeData.unavailable) return {}

  const isPreviewTier = host.endsWith('.dakio.shop')
  return {
    alternates: { canonical: getCanonicalUrl(storeData) },
    robots: isPreviewTier ? { index: false, follow: true } : undefined,
  }
}
```

**Cart/session continuity — accepted tradeoff.** Auth is JWT+localStorage, origin-scoped; cart state is the same. A shopper who follows a `{slug}.dakio.shop` preview link and later the tenant's connected custom domain loses cart/session at that hop. "Share the preview now, connect a real domain later" is the stated purpose of this tier, so this is an accepted tradeoff, not a bug — a follow-up (a one-time signed cart-handoff token consumed when a merchant connects a custom domain) is worth scoping separately if it matters in practice.

## 5. `lib/api.js` / `lib/routes.js`

**`lib/api.js`: no changes.** Every domain-tree page already resolves `host → store.slug` via `getStoreByDomain` and reuses the existing slug-keyed functions for everything else. Tiers (b) and (c) flow through that same tree for free.

**`lib/routes.js`: bug fix + one new helper:**

```js
// lib/routes.js
// Mirrors middleware.js isFirstPartyHost — never modify these two in isolation
const SKIP_SUFFIXES = ['vercel.app', 'dakio.io']
const BARE_LOCAL_HOSTS = ['localhost', '127.0.0.1']

export function isCustomDomain() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return !(BARE_LOCAL_HOSTS.includes(h) || SKIP_SUFFIXES.some(d => h === d || h.endsWith(`.${d}`)))
}

// New: single source of truth for the canonical URL of a resolved store.
export function getCanonicalUrl(storeData) {
  if (storeData.customDomain) return `https://${storeData.customDomain}`
  return `https://store.dakio.io/${storeData.slug}`
}

// storeHome / productPath / checkoutPath / trackPath unchanged — already branch
// on isCustomDomain(), which now correctly covers *.dakio.shop and *.localhost too.
```

The bug: today's `FALLBACK_DOMAINS` classifies bare `localhost` as first-party via `endsWith('.localhost')`, which would wrongly include `demo2.localhost` too post-§3 — client-side link-building would use slug-prefixed paths even though the page was rendered via the domain tree (`basePath=""`). The `BARE_LOCAL_HOSTS`/`SKIP_SUFFIXES` split fixes it by construction, matching `middleware.js` exactly.

## 6. `dakio-api` changes

**No Prisma schema changes, no migrations.** `Tenant.slug` (unique) and `Tenant.customDomain` (unique, nullable) already cover everything below — confirmed in `prisma/schema.prisma`.

**(1) `src/routes/store.js` — extend the existing `GET /by-domain/:domain` (line 96), no new route:**

```js
const PLATFORM_WILDCARD_SUFFIXES = (process.env.PLATFORM_WILDCARD_SUFFIXES || 'dakio.shop,localhost')
  .split(',').map(s => s.trim()).filter(Boolean)

router.get('/by-domain/:domain', async (req, res) => {
  let domain = req.params.domain.toLowerCase()
  if (domain.startsWith('www.')) domain = domain.slice(4)

  const wildcardSuffix = PLATFORM_WILDCARD_SUFFIXES.find(s => domain.endsWith(`.${s}`))
  let tenant

  if (wildcardSuffix) {
    const slug = domain.slice(0, -(wildcardSuffix.length + 1))
    if (!slug || slug.includes('.')) {
      return res.status(404).json({ notFound: true })
    }
    tenant = await prisma.tenant.findUnique({ where: { slug } })
  } else {
    tenant = await prisma.tenant.findUnique({ where: { customDomain: domain } })
  }

  if (!tenant) return res.status(404).json({ notFound: true })
  if (!tenant.isActive) return res.status(200).json({ unavailable: true })

  // ...unchanged: build and return the existing store payload
})
```

Preserves the existing `notFound`/`unavailable`/success contract exactly.

**(2) `src/lib/slug.js` — add a reserved-slug guard to the *existing* file** (it already holds `slugifyStoreName`/`resolveAvailableSlug`/`slugTaken` — this is a modification, not a new file):

```js
const RESERVED_SLUGS = new Set([
  'www', 'api', 'app', 'admin', 'store', 'ops', 'mail', 'email', 'ftp',
  'ns1', 'ns2', 'smtp', 'imap', 'pop', 'webmail', 'cdn', 'assets', 'static',
  'staging', 'stage', 'dev', 'test', 'blog', 'help', 'support', 'status',
  'docs', 'dashboard', 'portal', 'billing', 'dakio', 'shop', 'localhost',
])

export function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(String(slug).toLowerCase())
}
```

Wire into `resolveAvailableSlug` (skip reserved candidates the same way taken ones are skipped) and into `/auth/register` + `/check-slug` — this matters more once the tier ships, since every slug becomes a live public hostname the moment a tenant is created, with no separate opt-in gate.

**Retroactive collision audit — required before going live, not optional.** The blocklist only protects *future* tenants. Run this against production before the wildcard DNS/cert goes live:

```sql
SELECT id, slug, name FROM "Tenant" WHERE lower(slug) IN (
  'www','api','app','admin','store','ops','mail','email','ftp','ns1','ns2',
  'smtp','imap','pop','webmail','cdn','assets','static','staging','stage','dev',
  'test','blog','help','support','status','docs','dashboard','portal','billing',
  'dakio','shop','localhost'
);
```

If this returns rows, resolve each one (rename with merchant coordination, or an explicit manual override) before the DNS/cert step in §7.

**(3) CORS — no change needed.** Verified `src/index.js` (~line 135-152): every route under `/api/store/*`, `/api/public/*`, and `/api/visitors/ping` already sets `Access-Control-Allow-Origin: *` unconditionally, before the origin allowlist is even consulted. `dakio-store` never sends `credentials`/cookies (verified — no `withCredentials`/`credentials` usage anywhere in `lib/api.js` or `lib/storefront.js`). So `*.dakio.shop` and `*.localhost` are already permitted; no CORS change is required for this feature.

**(4) `PUT /api/auth/tenant` (`src/routes/auth.js`, custom-domain assignment at ~line 779-800 and ~line 1382-1393) — reject `customDomain` collisions with platform hosts, case-insensitively:**

```js
const PLATFORM_SUFFIXES = ['dakio.shop', 'dakio.io', 'vercel.app', 'localhost']
const normalizedDomain = String(customDomain).toLowerCase()
if (PLATFORM_SUFFIXES.some(s => normalizedDomain === s || normalizedDomain.endsWith(`.${s}`))) {
  return res.status(400).json({ error: 'This domain is reserved by the platform.' })
}
```

Note: the second call site (~1382-1393) already lowercases and strips `https://`/`www.` from the incoming value before this check would run — reuse that same normalized value rather than re-normalizing.

**Requirement (d) — merchant custom subdomains (`shop.theirbrand.com`) — no backend change needed.** `customDomain` is already an arbitrary unique string, not apex-restricted, and the existing `www.`-stripping doesn't touch other subdomains. Confirm the merchant-facing domain-setup UI (in `dakio-merchant`, not covered here) actually accepts a subdomain hostname rather than validating apex-only — a UI check, not an API change.

**Follow-up, not blocking:** `isActive` conflates billing/account status with public-storefront visibility. A brand-new, still-onboarding tenant becomes instantly live at a guessable `{slug}.dakio.shop` the moment `isActive` flips true. If that gap matters, it needs a separate `storefrontVisible`/`published` boolean independent of `isActive` — a real migration (`ALTER TABLE "Tenant" ADD COLUMN "storefrontVisible" BOOLEAN NOT NULL DEFAULT true`, new-tenant flows setting it `false` until onboarding completes). Scope as its own ticket.

## 7. Vercel / DNS setup

0. ~~Gate check: confirm plan supports wildcard domains + DNS-01 certs~~ — **already done**: confirmed 2026-07-25 that `dakio.shop` apex and `*.dakio.shop` wildcard are both live on Vercel with a valid Let's Encrypt wildcard cert, and DNS already resolves arbitrary subdomains to the deployment.
1. ~~Add `dakio.shop` as a domain, then add wildcard domain `*.dakio.shop`~~ — done.
2. ~~Add apex + wildcard `CNAME` DNS records~~ — done (confirmed via `dig`).
3. ~~Complete DNS-01 TXT validation~~ — done (cert is issued and verifies).
4. No per-tenant action needed once the wildcard domain + cert are live — true today; the remaining gap is purely the `by-domain` slug-resolution code in §6, which is why `demo.dakio.shop` currently only works for tenants that happen to have that exact string as their `customDomain`.
5. Existing custom-domain automation (`vercelDomain.js`, `addDomainToVercel`) is unaffected — still per-merchant, still handles subdomains fine.
6. **New, from §2a:** decide what the bare `dakio.shop` apex should show once the wildcard tier ships, and whether the tenant currently squatting on it should be moved off.

## 8. Local dev setup

1. Run `dakio-api` locally (`PORT=5001`); default `PLATFORM_WILDCARD_SUFFIXES=dakio.shop,localhost` already covers this — no `.env` change needed unless adding `.local`.
2. `dakio-store`'s `.env.local` already has `NEXT_PUBLIC_API_URL=http://localhost:5001/api` — unchanged.
3. Seed/create a tenant with slug `demo2` via the existing seed flow.
4. Run `npm run dev` in `dakio-store`.
5. Visit `http://demo2.localhost:3000` in Chrome or Firefox — no `/etc/hosts` edit needed. Middleware sees host `demo2.localhost`, rewrites to `/domain/demo2.localhost`, dakio-store calls `getStoreByDomain('demo2.localhost')` against local `dakio-api`, which strips `.localhost` and looks up slug `demo2` — full parity with production `demo2.dakio.shop`.
6. Keep the port in the URL — no local TLS/port-80, so always `http://demo2.localhost:3000`.

If the team picks `.local` instead: add `127.0.0.1 demo2.local` to `/etc/hosts` per demo tenant (no wildcard support in hosts files), add `local` to `PLATFORM_WILDCARD_SUFFIXES`, and test on actual team Macs first — `.local` `/etc/hosts` entries are an intermittent-failure risk specifically on macOS (mDNSResponder/Bonjour).

## 9. Implementation order

1. ~~[Blocking, external] Verify Vercel plan tier supports wildcard domains + DNS-01 certs~~ — **done, confirmed 2026-07-25**.
2. **[Cheap, external, no code]** Confirm actual domain bindings on the `dakio-store` Vercel project, and decide the apex-collision question (§2a/§7.6) — is the tenant on bare `dakio.shop` staying there?
3. **[Data cleanup, no code]** Run the reserved-slug collision audit against production; resolve any hits.
4. **[Code, reversible anytime, do now]** Fix the `middleware.js` static-asset matcher bug (§2a) — this is a live bug affecting real custom-domain tenants today, independent of the rest of this feature. Already applied to the working tree as of 2026-07-25; not yet committed.
5. **[Code, reversible anytime]** Ship `dakio-api` changes: `by-domain` wildcard branch, reserved-slug guard, custom-domain collision guard.
6. **[Code, reversible anytime]** Ship the rest of the `dakio-store` changes: `StoreNotFound` + `app/page.js`, canonical/noindex metadata, `lib/routes.js` fix.
7. ~~[External, coordinate with registrar] Add wildcard + DNS + cert~~ — **already live**; nothing left to do here except the apex decision in step 2.
8. **[Verification]** Smoke-test one real tenant slug end-to-end at `{slug}.dakio.shop` — including confirming theme CSS actually loads now — before any broad announcement.
9. **[Deferred, not blocking]** `storefrontVisible`/`published` schema addition (§6), cart-handoff redirect token (§4), `studio-preview` parity in the domain tree (§3).

---

**Files touched:** `dakio-store/middleware.js` (full replacement), `dakio-store/app/page.js` (full replacement), `dakio-store/components/StoreNotFound.jsx` (new), `dakio-store/app/domain/[host]/page.js` (not-found branch), `dakio-store/app/domain/[host]/layout.js` (new `generateMetadata`), `dakio-store/lib/routes.js` (bug fix + new `getCanonicalUrl` export), `dakio-api/src/routes/store.js` (`by-domain` branch), `dakio-api/src/lib/slug.js` (modified — add reserved-slug guard), `dakio-api/src/routes/auth.js` (custom-domain collision guard, ~line 779-800 and ~1382-1393). No Prisma schema/migration changes required for MVP; one optional follow-up migration noted in §6.
