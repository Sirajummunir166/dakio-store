import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

// Cache-purge webhook target — dakio-api calls this so storefront caches update
// instantly instead of waiting out the revalidate window.
//   scope 'site' (default): after a Store Studio publish → published-site doc
//   scope 'catalog': after a builder catalog edit → products/categories, which
//   is what makes catalog changes go live with no republish
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
  if (body.scope === 'catalog') {
    revalidateTag(`store-products:${body.slug}`, { expire: 0 })
    revalidateTag(`store-categories:${body.slug}`, { expire: 0 })
  } else {
    revalidateTag(`studio-site:${body.slug}`, { expire: 0 })
  }
  return NextResponse.json({ ok: true })
}
