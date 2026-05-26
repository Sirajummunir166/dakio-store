import { NextResponse } from 'next/server'

const VERCEL_DOMAINS = ['vercel.app', 'dakio.io', 'localhost']

function isCustomDomain(hostname) {
  return !VERCEL_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))
}

export async function middleware(req) {
  const hostname = req.headers.get('host')?.split(':')[0] || ''
  const { pathname } = req.nextUrl

  // Only intercept root path on custom domains
  if (isCustomDomain(hostname) && pathname === '/') {
    return NextResponse.rewrite(new URL(`/domain/${hostname}`, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/((?!_next|favicon.ico|api).*)'],
}
