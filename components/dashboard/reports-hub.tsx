'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  CalendarRange,
  FileSpreadsheet,
  FolderKanban,
  Loader2,
  Receipt,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getBrowserApiUrl, type ApiEnvelope } from '@/lib/api'
import { downloadExcelFile, formatMoneyCell, type ExcelSheet } from '@/lib/excel-export'
import { getAuthHeaders } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { OFFICE_ADDRESS } from '@/lib/site-config'
import type { FinancialReportData } from '@/components/dashboard/financial-reports-panel'

type Props = {
  loading: boolean
  projects: Record<string, unknown>[]
  expenses: Record<string, unknown>[]
  clients: Record<string, unknown>[]
}

const BRAND = 'Baraarug Consulting'

function clientLabel(clients: Record<string, unknown>[], id: string): string {
  const c = clients.find((x) => String(x.id) === id)
  return c ? String(c.name ?? id) : '—'
}

function expenseCategoryLabel(row: Record<string, unknown>): string {
  const cat = String(row.category ?? '').toLowerCase()
  const desc = String(row.description ?? '')
  if (cat !== 'other') return cat || '—'
  const idx = desc.indexOf('\n\n')
  const label = idx === -1 ? desc : desc.slice(0, idx)
  return label.trim() ? `Other — ${label.trim()}` : 'Other'
}

function expenseDate(row: Record<string, unknown>): string {
  const ed = row.expense_date
  if (typeof ed === 'string' && ed.length >= 10) return ed.slice(0, 10)
  const ca = row.created_at
  if (typeof ca === 'string') return ca.slice(0, 10)
  return '—'
}

function projectNameById(projects: Record<string, unknown>[], pid: string): string {
  const p = projects.find((x) => String(x.id) === pid)
  return p ? String(p.name ?? pid) : '—'
}

function buildProjectExcelSheets(projects: Record<string, unknown>[], clients: Record<string, unknown>[]): ExcelSheet[] {
  const header = [
    'Project name',
    'Client',
    'Status',
    'Milestone %',
    'Contract value',
    'Currency',
    'Spent',
    'Balance',
    'Start date',
    'End date',
    'Description',
  ]
  const dataRows = projects.map((row) => {
    const cid = row.client_id ? String(row.client_id) : ''
    const cv = row.contract_value
    const contractNum = cv != null && cv !== '' ? Number(cv) : null
    const sp = row.expense_total
    const spentNum = sp != null && sp !== '' ? Number(sp) : null
    const bal = row.balance
    const balNum = bal != null && bal !== '' ? Number(bal) : null
    const cur = String(row.contract_currency ?? 'USD').trim() || 'USD'
    const cs = row.contract_start
    const ce = row.contract_end
    const mp = row.milestone_pct
    if (typeof mp === 'number' && !Number.isNaN(mp)) {
      // ok
    }
    return [
      String(row.name ?? ''),
      clientLabel(clients, cid),
      String(row.status ?? ''),
      row.milestone_pct != null && row.milestone_pct !== '' ? String(row.milestone_pct) : '—',
      contractNum != null && Number.isFinite(contractNum) ? contractNum : '—',
      cur,
      spentNum != null && Number.isFinite(spentNum) ? spentNum : '—',
      balNum != null && Number.isFinite(balNum) ? balNum : '—',
      typeof cs === 'string' && cs.length >= 10 ? cs.slice(0, 10) : '—',
      typeof ce === 'string' && ce.length >= 10 ? ce.slice(0, 10) : '—',
      String(row.description ?? '').slice(0, 500),
    ]
  })
  const cover: ExcelSheet = {
    name: 'Cover',
    rows: [
      [BRAND],
      ['Project report'],
      ['Office', OFFICE_ADDRESS],
      ['Generated', new Date().toLocaleString()],
      [],
      header,
      ...dataRows,
    ],
  }
  const dataOnly: ExcelSheet = {
    name: 'Projects data',
    rows: [header, ...dataRows],
  }
  return [cover, dataOnly]
}

function buildExpenseExcelSheets(
  expenses: Record<string, unknown>[],
  projects: Record<string, unknown>[],
  clients: Record<string, unknown>[],
): ExcelSheet[] {
  const sorted = [...expenses].sort((a, b) => expenseDate(b).localeCompare(expenseDate(a)))
  const header = ['Date', 'Category', 'Amount', 'Currency', 'Project', 'Paid by', 'Description', 'Receipt URL']
  const dataRows = sorted.map((row) => {
    const pid = row.project_id ? String(row.project_id) : ''
    return [
      expenseDate(row),
      expenseCategoryLabel(row),
      typeof row.amount === 'number' ? row.amount : Number(row.amount ?? 0),
      String(row.currency ?? 'USD'),
      pid ? projectNameById(projects, pid) : '—',
      row.paid_by != null && String(row.paid_by).trim() !== '' ? String(row.paid_by) : '—',
      String(row.description ?? '').slice(0, 800),
      typeof row.receipt_url === 'string' ? row.receipt_url : '',
    ]
  })
  const cover: ExcelSheet = {
    name: 'Cover',
    rows: [
      [BRAND],
      ['Expense report'],
      ['Office', OFFICE_ADDRESS],
      ['Generated', new Date().toLocaleString()],
      ['Records', String(expenses.length)],
      [],
      header,
      ...dataRows,
    ],
  }
  const dataOnly: ExcelSheet = {
    name: 'Expenses data',
    rows: [header, ...dataRows],
  }
  return [cover, dataOnly]
}

function buildFinancialExcelSheets(data: FinancialReportData): ExcelSheet[] {
  const { period, profit_loss, revenue_by_type, expenses_by_category, cash_flow, pending_invoices, series } = data
  const cover: ExcelSheet = {
    name: 'Cover',
    rows: [
      [BRAND],
      ['Financial summary'],
      ['Period', `${period.from} → ${period.to}`],
      ['Office', OFFICE_ADDRESS],
      ['Generated', new Date().toLocaleString()],
    ],
  }
  const pl: ExcelSheet = {
    name: 'P and L',
    rows: [
      ['Metric', 'Amount (USD)'],
      ['Total revenue', profit_loss.revenue],
      ['Total expenses', profit_loss.expenses],
      ['Net profit', profit_loss.net],
      [''],
      ['Cash flow — incoming', cash_flow.incoming],
      ['Cash flow — outgoing', cash_flow.outgoing],
      ['Cash flow — net', cash_flow.net],
      [''],
      ['Pending invoices — count', pending_invoices.count],
      ['Pending invoices — amount', pending_invoices.amount],
    ],
  }
  const rev: ExcelSheet = {
    name: 'Revenue by type',
    rows: [['Type', 'Amount (USD)'], ...Object.entries(revenue_by_type).map(([k, v]) => [k, v])],
  }
  const exp: ExcelSheet = {
    name: 'Expenses by category',
    rows: [['Category', 'Amount (USD)'], ...Object.entries(expenses_by_category).map(([k, v]) => [k, v])],
  }
  const monthly: ExcelSheet = {
    name: 'Monthly series',
    rows: [['Period', 'Incoming', 'Outgoing'], ...series.map((s) => [s.period, s.incoming, s.outgoing])],
  }
  return [cover, pl, rev, exp, monthly]
}

export function ReportsHub({ loading, projects, expenses, clients }: Props) {
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 90)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [finLoading, setFinLoading] = useState(false)
  const [finData, setFinData] = useState<FinancialReportData | null>(null)
  const [finErr, setFinErr] = useState<string | null>(null)

  const loadFinancial = useCallback(async () => {
    setFinLoading(true)
    setFinErr(null)
    try {
      const q = new URLSearchParams({ from, to })
      const res = await fetch(`${getBrowserApiUrl('/api/financial/reports/summary')}?${q}`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      })
      const json = (await res.json()) as ApiEnvelope<FinancialReportData>
      if (!json.success || !json.data) {
        setFinErr(json.error ?? 'Failed to load financial data')
        setFinData(null)
        return
      }
      setFinData(json.data)
    } catch {
      setFinErr('Network error')
      setFinData(null)
    } finally {
      setFinLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void loadFinancial()
  }, [loadFinancial])

  const projectPreview = useMemo(() => projects.slice(0, 8), [projects])
  const expensePreview = useMemo(() => {
    const s = [...expenses].sort((a, b) => expenseDate(b).localeCompare(expenseDate(a)))
    return s.slice(0, 10)
  }, [expenses])

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-brand-navy/10 bg-gradient-to-br from-brand-navy via-[#1a4d66] to-brand-navy p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-teal/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-brand-green/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-mint">
              <Sparkles className="size-3.5 text-brand-green" aria-hidden />
              Export suite
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Reports</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
              Download polished Excel workbooks for projects, expenses, and consolidated financials. Ideal for audits,
              board packs, and donors.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="rounded-lg bg-white/10 px-2 py-1">{OFFICE_ADDRESS}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="projects" className="gap-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-xl border border-brand-navy/10 bg-white p-2 shadow-sm">
          <TabsTrigger
            value="projects"
            className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:bg-brand-navy data-[state=active]:text-white"
          >
            <FolderKanban className="size-4" />
            Project report
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:bg-brand-navy data-[state=active]:text-white"
          >
            <Receipt className="size-4" />
            Expense report
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:bg-brand-navy data-[state=active]:text-white"
          >
            <FileSpreadsheet className="size-4" />
            Financial sheet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-0 space-y-4 outline-none">
          <Card className="overflow-hidden border-brand-navy/12 shadow-md">
            <CardHeader className="border-b border-brand-navy/8 bg-brand-mint/25">
              <CardTitle className="flex items-center gap-2 text-brand-navy">
                <FolderKanban className="size-5 text-brand-teal" />
                Project report
              </CardTitle>
              <CardDescription>
                All engagements with contract value, spend, balance, and dates — two sheets (cover + clean data).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  className="bg-brand-navy text-white shadow-sm hover:brightness-110"
                  disabled={loading || projects.length === 0}
                  onClick={() => {
                    const sheets = buildProjectExcelSheets(projects, clients)
                    downloadExcelFile(`Baraarug_Project_Report_${new Date().toISOString().slice(0, 10)}.xlsx`, sheets)
                  }}
                >
                  <ArrowDownToLine className="mr-2 size-4" />
                  Download Excel
                </Button>
                <span className="text-sm text-slate-600">{projects.length} project(s) in dataset</span>
              </div>
              <Separator />
              <ScrollArea className="h-[min(360px,50vh)] rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-brand-navy hover:bg-brand-navy">
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Client</TableHead>
                      <TableHead className="text-white">Spent</TableHead>
                      <TableHead className="text-white">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                          <Loader2 className="mx-auto size-6 animate-spin text-brand-teal" />
                        </TableCell>
                      </TableRow>
                    ) : projectPreview.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                          No projects yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      projectPreview.map((row) => {
                        const id = String(row.id ?? '')
                        const cid = row.client_id ? String(row.client_id) : ''
                        const sp = row.expense_total
                        const bal = row.balance
                        const cur = String(row.contract_currency ?? 'USD').trim() || 'USD'
                        const sn = typeof sp === 'number' ? sp : parseFloat(String(sp ?? ''))
                        const bn = typeof bal === 'number' ? bal : parseFloat(String(bal ?? ''))
                        return (
                          <TableRow key={id} className="hover:bg-brand-mint/20">
                            <TableCell className="font-medium text-brand-navy">{String(row.name ?? '')}</TableCell>
                            <TableCell className="text-slate-700">{clientLabel(clients, cid)}</TableCell>
                            <TableCell className="font-mono text-sm">{Number.isFinite(sn) ? formatMoneyCell(sn, cur) : '—'}</TableCell>
                            <TableCell
                              className={cn(
                                'font-mono text-sm font-semibold',
                                Number.isFinite(bn) && bn < 0 ? 'text-red-600' : 'text-brand-navy',
                              )}
                            >
                              {Number.isFinite(bn) ? formatMoneyCell(bn, cur) : '—'}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-0 space-y-4 outline-none">
          <Card className="overflow-hidden border-brand-navy/12 shadow-md">
            <CardHeader className="border-b border-brand-navy/8 bg-brand-mint/25">
              <CardTitle className="flex items-center gap-2 text-brand-navy">
                <Receipt className="size-5 text-brand-teal" />
                Expense report
              </CardTitle>
              <CardDescription>
                Ledger-style rows with category, project, payer, and receipt links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  className="bg-brand-navy text-white shadow-sm hover:brightness-110"
                  disabled={loading || expenses.length === 0}
                  onClick={() => {
                    const sheets = buildExpenseExcelSheets(expenses, projects, clients)
                    downloadExcelFile(`Baraarug_Expense_Report_${new Date().toISOString().slice(0, 10)}.xlsx`, sheets)
                  }}
                >
                  <ArrowDownToLine className="mr-2 size-4" />
                  Download Excel
                </Button>
                <span className="text-sm text-slate-600">{expenses.length} expense record(s)</span>
              </div>
              <Separator />
              <ScrollArea className="h-[min(360px,50vh)] rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-brand-navy hover:bg-brand-navy">
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Category</TableHead>
                      <TableHead className="text-right text-white">Amount</TableHead>
                      <TableHead className="text-white">Project</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                          <Loader2 className="mx-auto size-6 animate-spin text-brand-teal" />
                        </TableCell>
                      </TableRow>
                    ) : expensePreview.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                          No expenses yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expensePreview.map((row) => {
                        const id = String(row.id ?? '')
                        const pid = row.project_id ? String(row.project_id) : ''
                        const amt = typeof row.amount === 'number' ? row.amount : Number(row.amount ?? 0)
                        const cur = String(row.currency ?? 'USD')
                        return (
                          <TableRow key={id} className="hover:bg-brand-mint/20">
                            <TableCell className="font-mono text-xs">{expenseDate(row)}</TableCell>
                            <TableCell className="capitalize text-slate-700">{expenseCategoryLabel(row)}</TableCell>
                            <TableCell className="text-right font-mono text-sm font-medium">
                              {formatMoneyCell(amt, cur)}
                            </TableCell>
                            <TableCell className="text-slate-600">{pid ? projectNameById(projects, pid) : '—'}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-0 space-y-4 outline-none">
          <Card className="overflow-hidden border-brand-navy/12 shadow-md">
            <CardHeader className="border-b border-brand-navy/8 bg-brand-mint/25">
              <CardTitle className="flex items-center gap-2 text-brand-navy">
                <FileSpreadsheet className="size-5 text-brand-teal" />
                Financial sheet
              </CardTitle>
              <CardDescription>
                Multi-sheet workbook: P&amp;L, revenue &amp; expense breakdowns, and monthly cash movement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">From</p>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[11rem] bg-white" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">To</p>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[11rem] bg-white" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-brand-navy/20"
                  onClick={() => void loadFinancial()}
                  disabled={finLoading}
                >
                  {finLoading ? <Loader2 className="size-4 animate-spin" /> : <CalendarRange className="mr-2 size-4" />}
                  Refresh data
                </Button>
              </div>
              {finErr ? <p className="text-destructive text-sm">{finErr}</p> : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  className="bg-brand-navy text-white shadow-sm hover:brightness-110"
                  disabled={finLoading || !finData}
                  onClick={() => {
                    if (!finData) return
                    const sheets = buildFinancialExcelSheets(finData)
                    downloadExcelFile(
                      `Baraarug_Financial_Sheet_${finData.period.from}_${finData.period.to}.xlsx`,
                      sheets,
                    )
                  }}
                >
                  <ArrowDownToLine className="mr-2 size-4" />
                  Download Excel
                </Button>
              </div>
              {finData ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-brand-teal/20 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardDescription>Revenue</CardDescription>
                      <CardTitle className="text-lg text-brand-navy">
                        {formatMoneyCell(finData.profit_loss.revenue, 'USD')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-brand-teal/20 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardDescription>Expenses</CardDescription>
                      <CardTitle className="text-lg text-brand-navy">
                        {formatMoneyCell(finData.profit_loss.expenses, 'USD')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-brand-teal/20 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardDescription>Net profit</CardDescription>
                      <CardTitle className="text-lg text-emerald-800">
                        {formatMoneyCell(finData.profit_loss.net, 'USD')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-brand-teal/20 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardDescription>Pending invoices</CardDescription>
                      <CardTitle className="text-lg text-brand-navy">{finData.pending_invoices.count}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              ) : finLoading ? (
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="size-4 animate-spin text-brand-teal" /> Loading financial summary…
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
