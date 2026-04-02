import { NextResponse } from 'next/server'

import {
  isAllowedDashboardObjectKey,
  streamMinioFileToNextResponse,
} from '@/lib/upload'

type RouteCtx = { params: Promise<{ path: string[] }> }

/**
 * GET /files/news/... — legacy path; new uploads use Cloudinary HTTPS URLs (see lib/upload.ts).
 */
export async function GET(_req: Request, ctx: RouteCtx) {
  const { path: segments } = await ctx.params
  if (!segments?.length) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const objectKey = segments.join('/')
  if (objectKey.includes('..') || objectKey.startsWith('/') || !isAllowedDashboardObjectKey(objectKey)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  try {
    return await streamMinioFileToNextResponse(objectKey)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('NotFound') || msg.includes('NoSuchKey') || msg.includes('not found')) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    console.error('[files]', e)
    return NextResponse.json({ success: false, error: 'File unavailable' }, { status: 502 })
  }
}
