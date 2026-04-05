import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
/** Query string varies per document; always run on the server. */
export const dynamic = 'force-dynamic'

/**
 * Streams a publication PDF from Cloudinary through the site origin so the in-page reader iframe
 * works on HTTPS (avoids mixed content when `file_url` was saved as `http://...`) and improves
 * embedding behaviour. Only `https://*.cloudinary.com` URLs are allowed (SSRF-safe).
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw?.trim()) {
    return new Response(JSON.stringify({ success: false, error: 'Missing url' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let target: URL
  try {
    target = new URL(raw.trim())
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid url' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (target.protocol !== 'https:') {
    return new Response(JSON.stringify({ success: false, error: 'Invalid protocol' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const host = target.hostname.toLowerCase()
  if (!host.endsWith('cloudinary.com')) {
    return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let upstream: Response
  try {
    upstream = await fetch(target.toString(), {
      headers: { Accept: 'application/pdf,application/octet-stream,*/*' },
      cache: 'no-store',
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch failed'
    console.error('[pdf-proxy]', msg)
    return new Response(JSON.stringify({ success: false, error: 'Upstream unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!upstream.ok) {
    return new Response(JSON.stringify({ success: false, error: 'Document not found' }), {
      status: upstream.status === 404 ? 404 : 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const headers = new Headers()
  const ct = upstream.headers.get('content-type')
  if (ct) headers.set('Content-Type', ct)
  else headers.set('Content-Type', 'application/pdf')
  headers.set('Content-Disposition', 'inline')
  headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400')
  headers.set('X-Content-Type-Options', 'nosniff')

  return new Response(upstream.body, { status: 200, headers })
}
