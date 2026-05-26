import { NextResponse } from 'next/server'

const SKIP_DOMAINS = ['vercel.app', 'dakio.io', 'localhost']

function isCustomDomain(hostname) {
  return !SKIP_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))
}

export async function middleware(req) {
  const hostname = req.headers.get('host')?.split(':')[0] || ''
  const { pathname } = req.nextUrl

  if (isCustomDomain(hostname)) {
    // Rewrite all paths: /track → /domain/sharqee.xyz/track, / → /domain/sharqee.xyz
    const rewritePath = pathname === '/' ? `/domain/${hostname}` : `/domain/${hostname}${pathname}`
    return NextResponse.rewrite(new URL(rewritePath, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon\\.ico|api|_vercel).*)'],
}
