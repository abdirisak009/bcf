import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { proxyDashboardFetch } from '@/lib/dashboard-proxy'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const res = await proxyDashboardFetch(req, '/api/partners', 'POST', JSON.stringify(body))
  if (res instanceof NextResponse) return res

  const data = (await res.json().catch(() => ({ success: false, error: 'Bad response' }))) as Record<
    string,
    unknown
  >

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  revalidatePath('/')
  return NextResponse.json(data)
}
