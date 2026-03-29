import { NextResponse } from 'next/server'

import { backendBase, proxyDashboardFetch } from '@/lib/dashboard-proxy'

export async function GET() {
  const res = await fetch(`${backendBase()}/api/news/categories`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  })
  const data = (await res.json().catch(() => ({ success: false }))) as Record<string, unknown>
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const res = await proxyDashboardFetch(req, '/api/news/categories', 'POST', JSON.stringify(body))
  if (res instanceof NextResponse) return res

  const data = (await res.json().catch(() => ({ success: false, error: 'Bad response' }))) as Record<
    string,
    unknown
  >

  return NextResponse.json(data, { status: res.status })
}
