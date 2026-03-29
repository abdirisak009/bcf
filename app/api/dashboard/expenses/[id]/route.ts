import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { proxyDashboardFetch } from '@/lib/dashboard-proxy'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const res = await proxyDashboardFetch(req, `/api/expenses/${id}`, 'PATCH', JSON.stringify(body))
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

export async function DELETE(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params

  const res = await proxyDashboardFetch(req, `/api/expenses/${id}`, 'DELETE')
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
