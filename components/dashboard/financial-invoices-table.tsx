'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Eye, FileDown, FileSpreadsheet, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  dashboardFormInputClass,
  dashboardFormTextareaClass,
  dashboardSheetBody,
  dashboardSheetDescription,
  dashboardSheetFooter,
  dashboardSheetForm,
  dashboardSheetHeader,
  dashboardSheetTitle,
  dashboardSheetWide,
} from '@/lib/dashboard-ui'
import { dashboardAuthHeaders } from '@/lib/dashboard-client'
import { openDashboardInvoicePdf } from '@/lib/invoice-pdf'
import { cn } from '@/lib/utils'

type Props = {
  rows: Record<string, unknown>[]
  clients: Record<string, unknown>[]
  trainings: Record<string, unknown>[]
  projects: Record<string, unknown>[]
  loading: boolean
  empty: string
  onRefresh: () => void
}

function formatCell(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

/** Parse invoice date fields from API (ISO or YYYY-MM-DD). */
function parseInvoiceDay(v: unknown): Date | null {
  if (v == null || v === '') return null
  const s = String(v).trim()
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDueDate(v: unknown): string {
  const d = parseInvoiceDay(v)
  if (!d) return '—'
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function clientName(row: Record<string, unknown>, clients: Record<string, unknown>[]): string {
  const c = row.client as { name?: string } | undefined
  if (c?.name) return c.name
  const id = String(row.client_id ?? '')
  const found = clients.find((x) => String(x.id) === id)
  return found ? String(found.name) : id || '—'
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'paid') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900'
  if (s === 'partial') return 'border-amber-500/40 bg-amber-500/10 text-amber-950'
  if (s === 'overdue') return 'border-red-500/40 bg-red-500/10 text-red-900'
  return 'border-slate-300 bg-slate-50 text-slate-800'
}

export function InvoicesTable({ rows, clients, trainings, projects, loading, empty, onRefresh }: Props) {
  const [search, setSearch] = useState('')
  const [dueFrom, setDueFrom] = useState('')
  const [dueTo, setDueTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [trainingId, setTrainingId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [del, setDel] = useState<{ id: string; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    let r = rows
    const q = search.trim().toLowerCase()
    if (q) {
      r = r.filter((x) => {
        const inv = String(x.invoice_number ?? '').toLowerCase()
        const name = clientName(x, clients).toLowerCase()
        return inv.includes(q) || name.includes(q)
      })
    }
    if (statusFilter) r = r.filter((x) => String(x.status ?? '') === statusFilter)
    if (clientFilter) r = r.filter((x) => String(x.client_id ?? '') === clientFilter)

    const fromDay = dueFrom ? new Date(`${dueFrom}T00:00:00`) : null
    const toDay = dueTo ? new Date(`${dueTo}T23:59:59.999`) : null
    if (fromDay && !Number.isNaN(fromDay.getTime())) {
      r = r.filter((x) => {
        const d = parseInvoiceDay(x.due_date)
        return d != null && d >= fromDay
      })
    }
    if (toDay && !Number.isNaN(toDay.getTime())) {
      r = r.filter((x) => {
        const d = parseInvoiceDay(x.due_date)
        return d != null && d <= toDay
      })
    }
    return r
  }, [rows, search, statusFilter, clientFilter, dueFrom, dueTo, clients])

  function openNew() {
    setEditId(null)
    setClientId('')
    setProjectId('')
    setTrainingId('')
    setAmount('')
    setCurrency('USD')
    const t = new Date()
    setIssueDate(t.toISOString().slice(0, 10))
    const d = new Date(t)
    d.setDate(d.getDate() + 30)
    setDueDate(d.toISOString().slice(0, 10))
    setNotes('')
    setErr(null)
    setOpen(true)
  }

  function openEdit(row: Record<string, unknown>) {
    setEditId(String(row.id ?? ''))
    setClientId(String(row.client_id ?? ''))
    setProjectId(row.project_id ? String(row.project_id) : '')
    setTrainingId(row.training_id ? String(row.training_id) : '')
    setAmount(String(row.amount ?? ''))
    setCurrency(String(row.currency ?? 'USD'))
    setIssueDate(String(row.issue_date ?? '').slice(0, 10))
    setDueDate(String(row.due_date ?? '').slice(0, 10))
    setNotes(String(row.notes ?? ''))
    setErr(null)
    setOpen(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const a = Number.parseFloat(amount)
    if (!Number.isFinite(a) || a < 0 || !clientId) {
      setErr('Client and valid amount are required.')
      return
    }
    setPending(true)
    setErr(null)
    try {
      const payload: Record<string, unknown> = {
        client_id: clientId,
        amount: a,
        currency: currency.trim() || 'USD',
        issue_date: issueDate,
        due_date: dueDate,
      }
      if (notes.trim()) payload.notes = notes.trim()
      if (projectId) payload.project_id = projectId
      else payload.project_id = null
      if (trainingId) payload.training_id = trainingId
      else payload.training_id = null

      const url = editId ? `/api/invoices/${editId}` : '/api/invoices'
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await res.json()) as { success?: boolean; data?: { id?: string }; error?: string }
      if (!res.ok) {
        setErr(json.error ?? 'Save failed')
        return
      }
      setOpen(false)
      onRefresh()
      if (!editId && json.data?.id) {
        void openDashboardInvoicePdf(json.data.id, 'preview')
      }
    } finally {
      setPending(false)
    }
  }

  async function confirmDelete() {
    if (!del) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/invoices/${del.id}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Delete failed')
        return
      }
      setDel(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  function onTrainingChange(v: string) {
    setTrainingId(v)
    if (v) setProjectId('')
  }
  function onProjectChange(v: string) {
    setProjectId(v)
    if (v) setTrainingId('')
  }

  return (
    <>
      <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
        <div className="h-1 bg-brand-teal" />
        <CardHeader className="flex flex-col gap-4 border-b border-brand-navy/8 bg-brand-mint/25 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-lg text-brand-navy">Invoices</CardTitle>
              <CardDescription className="text-slate-600">Auto-numbered · link to training or project · payments update status.</CardDescription>
            </div>
            <Button type="button" className="bg-brand-navy text-white hover:brightness-110 sm:shrink-0" onClick={openNew}>
              <Plus className="mr-2 size-4" />
              New invoice
            </Button>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="relative min-w-[min(100%,16rem)] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-brand-navy/40" aria-hidden />
              <Input
                type="search"
                placeholder="Search invoice # or client…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-brand-navy/15 bg-white pl-9 text-sm text-brand-navy placeholder:text-slate-400"
                aria-label="Search invoices"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="sr-only" htmlFor="inv-due-from">
                  Due from
                </label>
                <Input
                  id="inv-due-from"
                  type="date"
                  value={dueFrom}
                  onChange={(e) => setDueFrom(e.target.value)}
                  className="h-9 w-[min(100%,10.5rem)] border-brand-navy/15 bg-white text-sm text-brand-navy"
                  title="Due from"
                />
                <span className="text-xs text-slate-500">–</span>
                <label className="sr-only" htmlFor="inv-due-to">
                  Due to
                </label>
                <Input
                  id="inv-due-to"
                  type="date"
                  value={dueTo}
                  onChange={(e) => setDueTo(e.target.value)}
                  className="h-9 w-[min(100%,10.5rem)] border-brand-navy/15 bg-white text-sm text-brand-navy"
                  title="Due to"
                />
              </div>
              {(dueFrom || dueTo || search) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 border-brand-navy/20 text-brand-navy"
                  onClick={() => {
                    setDueFrom('')
                    setDueTo('')
                    setSearch('')
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-brand-navy/15 bg-white px-2 text-sm text-brand-navy"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="h-9 min-w-[8rem] rounded-md border border-brand-navy/15 bg-white px-2 text-sm text-brand-navy"
                aria-label="Filter by client"
              >
                <option value="">All clients</option>
                {clients.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {String(c.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : (
            <ScrollArea className="max-h-[min(520px,calc(100dvh-18rem))] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                    <TableHead className="font-semibold text-white">Invoice</TableHead>
                    <TableHead className="font-semibold text-white">Client</TableHead>
                    <TableHead className="font-semibold text-white">Amount</TableHead>
                    <TableHead className="font-semibold text-white">Status</TableHead>
                    <TableHead className="hidden font-semibold text-white lg:table-cell">Due</TableHead>
                    <TableHead className="w-[150px] pr-4 text-right font-semibold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => {
                    const id = String(row.id ?? '')
                    const st = String(row.status ?? '')
                    return (
                      <TableRow key={id} className="odd:bg-white even:bg-brand-mint/15">
                        <TableCell className="font-mono text-sm font-medium text-brand-navy">{formatCell(row.invoice_number)}</TableCell>
                        <TableCell className="text-sm">{clientName(row, clients)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatCell(row.amount)} {String(row.currency ?? '')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('capitalize', statusBadgeClass(st))}>
                            {st}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm text-slate-700 lg:table-cell">{formatDueDate(row.due_date)}</TableCell>
                        <TableCell className="pr-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-brand-navy/80"
                            title="Preview invoice"
                            onClick={() => void openDashboardInvoicePdf(id, 'preview')}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-brand-teal"
                            title="Download PDF"
                            onClick={() => void openDashboardInvoicePdf(id, 'download')}
                          >
                            <FileDown className="size-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => openEdit(row)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive size-8"
                            onClick={() => setDel({ id, label: String(row.invoice_number ?? id) })}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>{editId ? 'Edit invoice' : 'New invoice'}</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
              Link to one training or one project (optional).
            </SheetDescription>
          </div>
          <form onSubmit={submit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Client" htmlFor="inv-cl" icon={FileSpreadsheet}>
                <select
                  id="inv-cl"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {String(c.name)}
                    </option>
                  ))}
                </select>
              </DashboardFormField>
              <DashboardFormField label="Training (optional)" htmlFor="inv-tr" icon={FileSpreadsheet}>
                <select id="inv-tr" value={trainingId} onChange={(e) => onTrainingChange(e.target.value)} className={dashboardFormInputClass}>
                  <option value="">—</option>
                  {trainings.map((t) => (
                    <option key={String(t.id)} value={String(t.id)}>
                      {String(t.title ?? t.id)}
                    </option>
                  ))}
                </select>
              </DashboardFormField>
              <DashboardFormField label="Project (optional)" htmlFor="inv-pj" icon={FileSpreadsheet}>
                <select id="inv-pj" value={projectId} onChange={(e) => onProjectChange(e.target.value)} className={dashboardFormInputClass}>
                  <option value="">—</option>
                  {projects.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {String(p.name ?? p.id)}
                    </option>
                  ))}
                </select>
              </DashboardFormField>
              <DashboardFormField label="Amount" htmlFor="inv-amt" icon={FileSpreadsheet}>
                <Input
                  id="inv-amt"
                  type="number"
                  step="0.01"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                />
              </DashboardFormField>
              <DashboardFormField label="Currency" htmlFor="inv-cur" icon={FileSpreadsheet}>
                <Input id="inv-cur" value={currency} onChange={(e) => setCurrency(e.target.value)} className={dashboardFormInputClass} />
              </DashboardFormField>
              <DashboardFormField label="Issue date" htmlFor="inv-is" icon={FileSpreadsheet}>
                <Input id="inv-is" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={dashboardFormInputClass} required />
              </DashboardFormField>
              <DashboardFormField label="Due date" htmlFor="inv-du" icon={FileSpreadsheet}>
                <Input id="inv-du" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={dashboardFormInputClass} required />
              </DashboardFormField>
              <DashboardFormField label="Notes (optional)" htmlFor="inv-n" icon={FileSpreadsheet}>
                <Textarea id="inv-n" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={cn(dashboardFormTextareaClass, 'resize-y')} />
              </DashboardFormField>
              {err ? <p className="text-destructive text-sm">{err}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="bg-brand-navy">
                {pending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={del !== null} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Only allowed if no payments are recorded. Invoice {del?.label}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
