import { NextResponse } from 'next/server'

const SKIP_DOMAINS = ['vercel.app', 'dakio.io', 'localhost']

function isCustomDomain(hostname) {
  return !SKIP_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))
}

export async function middleware(req) {
  const hostname = req.headers.get('host')?.split(':')[0] || ''
  const { pathname } = req.nextUrl

  if (isCustomDomain(hostname)) {
    const url = req.nextUrl.clone()
    url.pathname = pathname === '/' ? `/domain/${hostname}` : `/domain/${hostname}${pathname}`
    return NextResponse.rewrite(url)
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
