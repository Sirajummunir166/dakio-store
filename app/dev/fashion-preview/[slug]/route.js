import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

/** Local dev only — redirects to fashion preview with a signed token (no dashboard needed). */
export async function GET(request, { params }) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 })
  }

  const { slug } = await params
  const secret = process.env.PREVIEW_JWT_SECRET || process.env.JWT_SECRET
  if (!secret) {
    return new NextResponse('Add JWT_SECRET to dakio-store/.env.local (same as dakio-api).', { status: 500 })
  }

  const cleanSecret = String(secret).replace(/^["']|["']$/g, '')
  const token = jwt.sign(
    { type: 'theme-preview', theme: 'fashion', slug, tenantId: 'dev-preview' },
    cleanSecret,
    { expiresIn: '4h' },
  )

  const url = new URL(`/${slug}/preview/fashion`, request.url)
  url.searchParams.set('token', token)
  return NextResponse.redirect(url)
}
