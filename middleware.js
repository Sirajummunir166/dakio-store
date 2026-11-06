import { NextResponse } from 'next/server'
import { isCustomDomain } from './lib/hosts'

export async function middleware(req) {
  const hostname = req.headers.get('host')?.split(':')[0] || ''
  const { pathname } = req.nextUrl

  if (isCustomDomain(hostname)) {
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
  matcher: ['/((?!_next|favicon\\.ico|api|_vercel|.*\\..*).*)'],
}
