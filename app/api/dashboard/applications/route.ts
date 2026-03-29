import { NextResponse } from 'next/server'

import { proxyDashboardFetch } from '@/lib/dashboard-proxy'

/** Dashboard: create a training application manually (same rules as public apply, with optional status). */
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const res = await proxyDashboardFetch(req, '/api/applications', 'POST', JSON.stringify(body))
  if (res instanceof NextResponse) return res

  const data = (await res.json().catch(() => ({ success: false, error: 'Bad response' }))) as Record<
    string,
    unknown
  >

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  return NextResponse.json(data)
}
