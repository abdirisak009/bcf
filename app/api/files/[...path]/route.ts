import { Readable } from 'stream'

import { NextResponse } from 'next/server'

import { DASHBOARD_FOLDERS, getObjectStream } from '@/lib/upload'

type RouteCtx = { params: Promise<{ path: string[] }> }

function isAllowedKey(key: string): boolean {
  const first = key.split('/')[0]
  return (DASHBOARD_FOLDERS as readonly string[]).includes(first)
}

/**
 * GET /api/files/news/xxx.jpg — stream file from MinIO (public, same as old /uploads/...).
 */
export async function GET(_req: Request, ctx: RouteCtx) {
  const { path: segments } = await ctx.params
  if (!segments?.length) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const objectKey = segments.join('/')
  if (objectKey.includes('..') || objectKey.startsWith('/') || !isAllowedKey(objectKey)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  try {
    const { stream, contentType, size } = await getObjectStream(objectKey)

    const webBody =
      typeof Readable.toWeb === 'function'
        ? Readable.toWeb(stream)
        : (stream as unknown as ReadableStream)

    return new NextResponse(webBody as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        ...(size > 0 ? { 'Content-Length': String(size) } : {}),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('NotFound') || msg.includes('NoSuchKey') || msg.includes('not found')) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    console.error('[api/files]', e)
    return NextResponse.json({ success: false, error: 'File unavailable' }, { status: 502 })
  }
}
