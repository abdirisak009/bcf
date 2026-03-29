import { proxyDashboardPdf } from '@/lib/dashboard-proxy'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params
  const qs = new URL(req.url).searchParams.toString()
  const backendUrl = `/api/invoices/${id}/pdf${qs ? `?${qs}` : ''}`
  return proxyDashboardPdf(req, backendUrl)
}
