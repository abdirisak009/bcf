import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Proxy that streams publication PDFs from Cloudinary through the site origin.
 *
 * Why a proxy?
 *  - PDFs uploaded with `resource_type: "auto"` land under `/image/upload/`
 *    in Cloudinary, which returns a rasterised image preview — not the PDF.
 *  - Changing the path to `/raw/upload/` gives 404 (wrong resource namespace).
 *  - Adding the `fl_attachment` flag tells Cloudinary to serve the original
 *    file bytes but sets `Content-Disposition: attachment` (triggers download).
 *  - This proxy fetches with `fl_attachment`, then re-serves the bytes with
 *    `Content-Disposition: inline` so the browser renders the PDF in the
 *    iframe instead of downloading it.
 *
 * Route lives at `/pdf-stream` (not `/api/*`) because in production Nginx
 * forwards `/api/*` to the Go backend.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw?.trim()) {
    return jsonError('Missing url', 400)
  }

  let target: URL
  try {
    target = new URL(raw.trim())
  } catch {
    return jsonError('Invalid url', 400)
  }

  if (target.protocol === 'http:') target.protocol = 'https:'
  if (target.protocol !== 'https:') return jsonError('Invalid protocol', 400)

  const host = target.hostname.toLowerCase()
  if (!host.endsWith('cloudinary.com')) return jsonError('Forbidden', 403)

  // Build the fetch URL with fl_attachment to get original file bytes
  const fetchUrl = withAttachmentFlag(target.toString())

  let upstream: Response | null = null
  try {
    upstream = await fetch(fetchUrl, {
      headers: { Accept: 'application/pdf,application/octet-stream,*/*' },
      cache: 'no-store',
      redirect: 'follow',
    })
  } catch (e) {
    console.error('[pdf-stream] primary fetch failed:', e instanceof Error ? e.message : e)
  }

  // Fallback: if fl_attachment failed, try /raw/upload/ path (works for
  // files that were uploaded with resource_type: "raw")
  if (!upstream || !upstream.ok) {
    try {
      const rawUrl = target.toString().replace(
        /\/(image|video)\/upload\//,
        '/raw/upload/',
      )
      const fallback = await fetch(rawUrl, {
        headers: { Accept: 'application/pdf,application/octet-stream,*/*' },
        cache: 'no-store',
        redirect: 'follow',
      })
      if (fallback.ok) upstream = fallback
    } catch {
      // ignore — we'll return an error below
    }
  }

  if (!upstream || !upstream.ok) {
    const status = upstream?.status ?? 502
    return jsonError('Document not found', status === 404 ? 404 : 502)
  }

  const headers = new Headers()
  headers.set('Content-Type', 'application/pdf')
  headers.set('Content-Disposition', 'inline')
  headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400')
  headers.set('X-Content-Type-Options', 'nosniff')

  return new Response(upstream.body, { status: 200, headers })
}

/* ------------------------------------------------------------------ */

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function withAttachmentFlag(url: string): string {
  try {
    const u = new URL(url)
    if (!u.hostname.toLowerCase().endsWith('cloudinary.com')) return url
    if (u.pathname.includes('/fl_attachment')) return url
    // Insert fl_attachment right after /upload/ to get the original file
    u.pathname = u.pathname.replace(
      /\/(image|video)\/upload\//,
      '/$1/upload/fl_attachment/',
    )
    return u.toString()
  } catch {
    return url
  }
}
