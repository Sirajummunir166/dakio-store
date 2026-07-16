import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

// Publish webhook target — dakio-api calls this after a Store Studio publish so the
// published-site cache purges instantly instead of waiting out the revalidate window.
export async function POST(req) {
  const secret = process.env.STORE_REVALIDATE_SECRET
  if (!secret) return NextResponse.json({ error: 'Revalidation not configured' }, { status: 503 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (body?.secret !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (typeof body.slug !== 'string' || !body.slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  // { expire: 0 } = hard expiry — next request refetches instead of serving stale
  revalidateTag(`studio-site:${body.slug}`, { expire: 0 })
  return NextResponse.json({ ok: true })
}
