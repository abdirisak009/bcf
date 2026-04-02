'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getBrowserApiUrl, type ApiEnvelope } from '@/lib/api'
import { getAuthHeaders } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

export type FinancialReportData = {
  period: { from: string; to: string }
  profit_loss: { revenue: number; expenses: number; net: number }
  revenue_by_type: Record<string, number>
  expenses_by_category: Record<string, number>
  cash_flow: { incoming: number; outgoing: number; net: number }
  pending_invoices: { count: number; amount: number }
  series: { period: string; incoming: number; outgoing: number }[]
}

function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function FinancialReportsPanel() {
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 90)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FinancialReportData | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const q = new URLSearchParams({ from, to })
      const res = await fetch(`${getBrowserApiUrl('/api/financial/reports/summary')}?${q}`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      })
      const json = (await res.json()) as ApiEnvelope<FinancialReportData>
      if (!json.success || !json.data) {
        setErr(json.error ?? 'Failed to load report')
        setData(null)
        return
      }
      setData(json.data)
    } catch {
      setErr('Network error')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void load()
  }, [load])

  const chartData =
    data?.series?.map((s) => ({
      name: s.period,
      Incoming: s.incoming,
      Outgoing: s.outgoing,
    })) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-600">From</p>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[11rem]" />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-slate-600">To</p>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[11rem]" />
        </div>
        <Button type="button" className="bg-brand-navy text-white hover:brightness-110" onClick={() => void load()}>
          Apply
        </Button>
      </div>

      {err ? <p className="text-destructive text-sm">{err}</p> : null}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading report…</p>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportCard title="Total revenue" value={formatMoney(data.profit_loss.revenue)} hint="Payments in period" />
            <ReportCard title="Total expenses" value={formatMoney(data.profit_loss.expenses)} hint="Recorded spend" />
            <ReportCard title="Net profit" value={formatMoney(data.profit_loss.net)} hint="Revenue − expenses" accent />
            <ReportCard
              title="Pending invoices"
              value={String(data.pending_invoices.count)}
              hint={formatMoney(data.pending_invoices.amount) + ' outstanding'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-brand-navy/12 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-brand-navy">Revenue by type</CardTitle>
                <CardDescription>training · project · consulting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {Object.entries(data.revenue_by_type).length === 0 ? (
                  <p className="text-muted-foreground">No payments in range.</p>
                ) : (
                  Object.entries(data.revenue_by_type).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-brand-navy/8 py-1">
                      <span className="capitalize text-brand-navy">{k}</span>
                      <span className="font-mono tabular-nums">{formatMoney(v)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-brand-navy/12 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-brand-navy">Expenses by category</CardTitle>
                <CardDescription>salary · transport · office · marketing · other</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {Object.entries(data.expenses_by_category).length === 0 ? (
                  <p className="text-muted-foreground">No expenses in range.</p>
                ) : (
                  Object.entries(data.expenses_by_category).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-brand-navy/8 py-1">
                      <span className="capitalize text-brand-navy">{k}</span>
                      <span className="font-mono tabular-nums">{formatMoney(v)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-brand-navy/12 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-brand-navy">Cash flow by month</CardTitle>
              <CardDescription>Incoming (payments) vs outgoing (expenses)</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] w-full pt-2">
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-sm">No data for chart.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-brand-navy/10" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => String(v)} />
                    <Tooltip formatter={(v: number) => formatMoney(v)} />
                    <Legend />
                    <Bar dataKey="Incoming" fill="rgb(45 166 165)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Outgoing" fill="rgb(33 73 137)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

function ReportCard({
  title,
  value,
  hint,
  accent,
}: {
  title: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 shadow-sm sm:p-5',
        accent ? 'border-brand-teal/40 bg-brand-teal/10' : 'border-brand-navy/12 bg-brand-mint/35',
      )}
    >
      <p className="text-sm font-medium text-brand-navy/80">{title}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-brand-navy">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{hint}</p>
    </div>
  )
}
