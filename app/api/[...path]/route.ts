import { type NextRequest } from 'next/server'

import { getApiInternalBase } from '@/lib/api'

/**
 * Proxies unmatched `/api/*` requests to the Go API. Lets the browser use same-origin URLs
 * (no NEXT_PUBLIC_API_URL) while Next reaches Go via API_INTERNAL_URL in Docker.
 */
async function forward(req: NextRequest, segments: string[]): Promise<Response> {
  if (!segments.length) {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 })
  }
  const base = getApiInternalBase()
  const target = `${base}/api/${segments.join('/')}${req.nextUrl.search}`

  const headers = new Headers()
  const doNotForward = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'upgrade',
    'host',
    // Let fetch set Content-Length for the new body; copying can mismatch or confuse some runtimes.
    'content-length',
    'transfer-encoding',
  ])
  req.headers.forEach((value, key) => {
    if (!doNotForward.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.arrayBuffer()
    if (body.byteLength > 0) {
      init.body = body
    }
  }

  try {
    return await fetch(target, init)
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api proxy] upstream fetch failed', { target, detail })
    return Response.json(
      {
        success: false,
        error:
          'Cannot reach the Go API from Next.js. Set API_INTERNAL_URL to the backend base URL ' +
          '(e.g. http://127.0.0.1:8080 on the same host, or your Docker service name). ' +
          `(${detail})`,
      },
      { status: 502 },
    )
  }
}

type RouteCtx = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return forward(req, path)
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return forward(req, path)
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return forward(req, path)
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return forward(req, path)
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  return forward(req, path)
}
