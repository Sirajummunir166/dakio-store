import { NextResponse } from 'next/server'
import { isCustomDomain } from './lib/hosts'
import { hostedOrigin, mayBeHosted } from './lib/hosted'

export async function middleware(req) {
  const hostname = req.headers.get('host')?.split(':')[0] || ''
  const { pathname } = req.nextUrl

  // A store on a hosted design: forward every path (pages, _next assets, the
  // design's api and files) to the design's host deployment, as the store's own
  // address. The host deployment reads the address from x-forwarded-host.
  if (mayBeHosted(hostname, !isCustomDomain(hostname))) {
    const origin = await hostedOrigin(hostname)
    if (origin) {
      const to = new URL(`${pathname}${req.nextUrl.search || ''}`, origin)
      const headers = new Headers(req.headers)
      headers.set('x-forwarded-host', hostname)
      return NextResponse.rewrite(to, { request: { headers } })
    }
  }

  // The old rewrite only ever covered page paths: keep it that way now the matcher is wider.
  const isPagePath = !/^\/(_next|api|_vercel)(\/|$)|^\/favicon\.ico$|\.[^/]*$/.test(pathname)
  if (isPagePath && isCustomDomain(hostname)) {
    const url = req.nextUrl.clone()
    url.pathname = pathname === '/' ? `/domain/${hostname}` : `/domain/${hostname}${pathname}`
    // The address the visitor asked for, so the domain layout can send them to
    // the same page on the store's Dakio address once the custom domain moved
    // (the API's `movedTo`, growth system §6.1).
    const headers = new Headers(req.headers)
    headers.set('x-dakio-path', `${pathname}${req.nextUrl.search || ''}`)
    return NextResponse.rewrite(url, { request: { headers } })
  }

  return NextResponse.next()
}

export const config = {
  // Exclude anything that looks like a static file (has a dot in the last
  // segment, e.g. /fashion-theme.css, /dakio-logo-white.svg) in addition to
  // _next/api/_vercel — otherwise those public/ assets get rewritten to
  // /domain/{host}/... on any custom-domain host, 404, and the theme CSS
  // silently never loads (confirmed live on demo.dakio.shop).
  matcher: ['/((?!_next|favicon\\.ico|api|_vercel|.*\\..*).*)', '/_next/:path*', '/api/:path*', '/(.*\\..*)'],
}
