'use client'

import { useMemo, useState, type FormEvent } from 'react'
import {
  Building2,
  CalendarRange,
  DollarSign,
  Flag,
  Loader2,
  MessageSquare,
  Pencil,
  Percent,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
import { cn } from '@/lib/utils'

type BaseProps = {
  rows: Record<string, unknown>[]
  clients: Record<string, unknown>[]
  /** Expense rows (same list as Expenses tab) — used for Spent detail popup. */
  expenses?: Record<string, unknown>[]
  loading: boolean
  empty: string
  onRefresh: () => void
}

function formatCell(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function isoDateInput(v: unknown): string {
  if (v == null || v === '') return ''
  const s = String(v)
  if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  return ''
}

function formatContractValue(row: Record<string, unknown>): string {
  const v = row.contract_value
  if (v == null || v === '') return '—'
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  if (Number.isNaN(n)) return '—'
  const cur = String(row.contract_currency ?? 'USD').trim() || 'USD'
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${cur}`
}

function projectCurrency(row: Record<string, unknown>): string {
  return String(row.contract_currency ?? 'USD').trim() || 'USD'
}

/** Sum of expenses assigned to this project (same currency label as contract). */
function formatProjectExpenseTotal(row: Record<string, unknown>): string {
  const v = row.expense_total
  if (v == null || v === '') return '—'
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  if (Number.isNaN(n)) return '—'
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${projectCurrency(row)}`
}

/** Contract value − spent (only when contract value exists). */
function formatProjectBalance(row: Record<string, unknown>): string {
  const v = row.balance
  if (v == null || v === '') return '—'
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  if (Number.isNaN(n)) return '—'
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${projectCurrency(row)}`
}

function projectBalanceIsNegative(row: Record<string, unknown>): boolean {
  const v = row.balance
  if (v == null || v === '') return false
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) && n < 0
}

function parseISODate(s: string): Date | null {
  if (!s || s.length < 10) return null
  const m = s.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
}

/** Table cell: localized medium date from YYYY-MM-DD */
function formatDateForTable(iso: string): string {
  if (!iso?.trim()) return '—'
  const d = parseISODate(iso)
  if (!d) return '—'
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

/** Years, months, days between contract dates + total days */
function formatContractDuration(row: Record<string, unknown>): string {
  const a = isoDateInput(row.contract_start)
  const b = isoDateInput(row.contract_end)
  if (!a || !b) return '—'
  const d0 = parseISODate(a)
  const d1 = parseISODate(b)
  if (!d0 || !d1) return '—'
  if (d1 < d0) return '—'
  const totalDays = Math.round((d1.getTime() - d0.getTime()) / (24 * 60 * 60 * 1000))

  let y = d1.getUTCFullYear() - d0.getUTCFullYear()
  let mo = d1.getUTCMonth() - d0.getUTCMonth()
  let day = d1.getUTCDate() - d0.getUTCDate()
  if (day < 0) {
    mo -= 1
    const dim = new Date(Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), 0)).getUTCDate()
    day += dim
  }
  if (mo < 0) {
    y -= 1
    mo += 12
  }

  const parts: string[] = []
  if (y > 0) parts.push(`${y} year${y === 1 ? '' : 's'}`)
  if (mo > 0) parts.push(`${mo} month${mo === 1 ? '' : 's'}`)
  if (day > 0) parts.push(`${day} day${day === 1 ? '' : 's'}`)
  if (parts.length === 0) {
    return totalDays === 0 ? '0 days' : `${totalDays} day${totalDays === 1 ? '' : 's'}`
  }
  return `${parts.join(', ')} (${totalDays} days)`
}

const PROJECT_STATUSES: { value: string; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

/** Full PATCH body from a table row (API expects a complete project). */
function buildProjectPayloadFromRow(
  row: Record<string, unknown>,
  description: string,
): Record<string, unknown> | null {
  const n = String(row.name ?? '').trim()
  if (!n) return null
  const cv = row.contract_value
  let contractValNum: number | null = null
  if (cv != null && cv !== '') {
    const v = typeof cv === 'number' ? cv : parseFloat(String(cv))
    contractValNum = Number.isNaN(v) ? null : v
  }
  const mp = row.milestone_pct
  let milestoneNum: number | null = null
  if (mp != null && mp !== '') {
    const m = typeof mp === 'number' ? mp : parseFloat(String(mp))
    milestoneNum = Number.isNaN(m) ? null : Math.min(100, Math.max(0, m))
  }
  const st = String(row.status ?? 'active').toLowerCase()
  const status = PROJECT_STATUSES.some((x) => x.value === st) ? st : 'active'
  return {
    name: n,
    description: description.trim() || null,
    client_id: row.client_id ? String(row.client_id) : null,
    contract_currency: String(row.contract_currency ?? 'USD').trim().toUpperCase() || 'USD',
    contract_value: contractValNum,
    contract_start: isoDateInput(row.contract_start) || null,
    contract_end: isoDateInput(row.contract_end) || null,
    status,
    milestone_pct: milestoneNum,
  }
}

function formatStatusLabel(raw: unknown): string {
  const s = String(raw ?? 'active').toLowerCase()
  const f = PROJECT_STATUSES.find((x) => x.value === s)
  return f ? f.label : s
}

function statusBadgeClass(s: string): string {
  switch (s.toLowerCase()) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200/80'
    case 'cancelled':
      return 'bg-slate-200 text-slate-800 ring-1 ring-slate-300'
    case 'on_hold':
      return 'bg-amber-100 text-amber-950 ring-1 ring-amber-200/80'
    case 'planning':
      return 'bg-sky-100 text-sky-950 ring-1 ring-sky-200/80'
    default:
      return 'bg-brand-teal/20 text-brand-navy ring-1 ring-brand-teal/30'
  }
}

function formatMilestonePct(row: Record<string, unknown>): string {
  const v = row.milestone_pct
  if (v == null || v === '') return '—'
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  if (Number.isNaN(n)) return '—'
  return `${n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1)}%`
}

function projectCommentText(row: Record<string, unknown>): string {
  return String(row.description ?? '').trim()
}

function parseExpenseOtherDescription(row: Record<string, unknown>): { otherLabel: string; notes: string } {
  const cat = String(row.category ?? '').toLowerCase()
  if (cat !== 'other') return { otherLabel: '', notes: String(row.description ?? '') }
  const desc = String(row.description ?? '')
  const idx = desc.indexOf('\n\n')
  if (idx === -1) return { otherLabel: desc, notes: '' }
  return { otherLabel: desc.slice(0, idx), notes: desc.slice(idx + 2) }
}

function expenseCategoryLabel(row: Record<string, unknown>): string {
  const cat = String(row.category ?? '').toLowerCase()
  if (cat !== 'other') return formatCell(row.category)
  const { otherLabel } = parseExpenseOtherDescription(row)
  const label = otherLabel.trim()
  if (!label) return 'Other'
  return `Other — ${label}`
}

function expenseNarrationShort(row: Record<string, unknown>): string {
  const cat = String(row.category ?? '').toLowerCase()
  if (cat === 'other') {
    const { notes } = parseExpenseOtherDescription(row)
    return notes.trim() || '—'
  }
  const d = String(row.description ?? '').trim()
  return d || '—'
}

function expenseRowSortTime(row: Record<string, unknown>): number {
  const ed = row.expense_date
  if (typeof ed === 'string' && ed.length > 0) {
    const t = Date.parse(ed)
    if (!Number.isNaN(t)) return t
  }
  const ca = row.created_at
  if (typeof ca === 'string') {
    const t = Date.parse(ca)
    if (!Number.isNaN(t)) return t
  }
  return 0
}

function expensesForProject(projectId: string, expenses: Record<string, unknown>[]): Record<string, unknown>[] {
  return expenses
    .filter((e) => e.project_id != null && String(e.project_id) === projectId)
    .sort((a, b) => expenseRowSortTime(b) - expenseRowSortTime(a))
}

export function ProjectsTable({ rows, clients, expenses = [], loading, empty, onRefresh }: BaseProps) {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [contractValue, setContractValue] = useState('')
  const [contractCurrency, setContractCurrency] = useState('USD')
  const [contractStart, setContractStart] = useState('')
  const [contractEnd, setContractEnd] = useState('')
  const [status, setStatus] = useState('active')
  const [milestonePct, setMilestonePct] = useState('')
  const [del, setDel] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [commentRow, setCommentRow] = useState<Record<string, unknown> | null>(null)
  const [commentText, setCommentText] = useState('')
  const [commentPending, setCommentPending] = useState(false)
  const [commentErr, setCommentErr] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterClient, setFilterClient] = useState<string>('all')
  const [spentProject, setSpentProject] = useState<Record<string, unknown> | null>(null)

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return rows.filter((row) => {
      const st = String(row.status ?? 'active').toLowerCase()
      if (filterStatus !== 'all' && st !== filterStatus) return false
      const cid = row.client_id ? String(row.client_id) : ''
      if (filterClient !== 'all' && cid !== filterClient) return false
      if (!q) return true
      const name = String(row.name ?? '').toLowerCase()
      const c = clients.find((x) => String(x.id) === cid) as Record<string, unknown> | undefined
      const clientStr = c ? String(c.name ?? '').toLowerCase() : ''
      return name.includes(q) || clientStr.includes(q)
    })
  }, [rows, searchQuery, filterStatus, filterClient, clients])

  const spentLines = useMemo(() => {
    if (!spentProject) return []
    return expensesForProject(String(spentProject.id ?? ''), expenses)
  }, [spentProject, expenses])

  const hasActiveFilters = filterStatus !== 'all' || filterClient !== 'all' || searchQuery.trim() !== ''

  function openNew() {
    setEditId(null)
    setName('')
    setDescription('')
    setClientId('')
    setContractValue('')
    setContractCurrency('USD')
    setContractStart('')
    setContractEnd('')
    setStatus('active')
    setMilestonePct('')
    setErr(null)
    setOpen(true)
  }

  function openEdit(row: Record<string, unknown>) {
    setEditId(String(row.id ?? ''))
    setName(String(row.name ?? ''))
    setDescription(String(row.description ?? ''))
    setClientId(row.client_id ? String(row.client_id) : '')
    const cv = row.contract_value
    if (cv != null && cv !== '') {
      const n = typeof cv === 'number' ? cv : parseFloat(String(cv))
      setContractValue(Number.isNaN(n) ? '' : String(n))
    } else {
      setContractValue('')
    }
    setContractCurrency(String(row.contract_currency ?? 'USD').trim() || 'USD')
    setContractStart(isoDateInput(row.contract_start))
    setContractEnd(isoDateInput(row.contract_end))
    const st = String(row.status ?? 'active').toLowerCase()
    setStatus(PROJECT_STATUSES.some((x) => x.value === st) ? st : 'active')
    const mp = row.milestone_pct
    if (mp != null && mp !== '') {
      const n = typeof mp === 'number' ? mp : parseFloat(String(mp))
      setMilestonePct(Number.isNaN(n) ? '' : String(n))
    } else {
      setMilestonePct('')
    }
    setErr(null)
    setOpen(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) {
      setErr('Name is required.')
      return
    }
    setPending(true)
    setErr(null)
    try {
      const rawVal = contractValue.trim().replace(/,/g, '')
      let contractValNum: number | null = null
      if (rawVal) {
        const v = parseFloat(rawVal)
        contractValNum = Number.isNaN(v) ? null : v
      }
      const rawMs = milestonePct.trim().replace(/%/g, '')
      let milestoneNum: number | null = null
      if (rawMs) {
        const m = parseFloat(rawMs)
        milestoneNum = Number.isNaN(m) ? null : Math.min(100, Math.max(0, m))
      }
      const payload: Record<string, unknown> = {
        name: n,
        description: description.trim() || null,
        client_id: clientId || null,
        contract_currency: (contractCurrency.trim() || 'USD').toUpperCase(),
        contract_value: contractValNum,
        contract_start: contractStart.trim() || null,
        contract_end: contractEnd.trim() || null,
        status: status || 'active',
        milestone_pct: milestoneNum,
      }

      const url = editId ? `/api/dashboard/projects/${editId}` : '/api/dashboard/projects'
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErr(data.error ?? 'Save failed')
        return
      }
      setOpen(false)
      onRefresh()
    } finally {
      setPending(false)
    }
  }

  function openComment(row: Record<string, unknown>) {
    setCommentRow(row)
    setCommentText(String(row.description ?? ''))
    setCommentErr(null)
  }

  async function saveComment() {
    if (!commentRow) return
    const payload = buildProjectPayloadFromRow(commentRow, commentText)
    if (!payload) {
      setCommentErr('Could not build update.')
      return
    }
    const id = String(commentRow.id ?? '')
    setCommentPending(true)
    setCommentErr(null)
    try {
      const res = await fetch(`/api/dashboard/projects/${id}`, {
        method: 'PATCH',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setCommentErr(data.error ?? 'Save failed')
        return
      }
      setCommentRow(null)
      onRefresh()
    } finally {
      setCommentPending(false)
    }
  }

  async function confirmDelete() {
    if (!del) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/projects/${del.id}`, {
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

  function clientLabel(id: string): string {
    const c = clients.find((x) => String(x.id) === id)
    return c ? String(c.name ?? id) : '—'
  }

  return (
    <>
      <Card className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-md ring-1 ring-slate-900/5">
        <div className="h-1.5 bg-gradient-to-r from-brand-teal via-brand-navy to-brand-teal" />
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-brand-navy/10 bg-gradient-to-br from-brand-mint/35 via-white to-brand-mint/20 py-5">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight text-brand-navy">Projects</CardTitle>
            <CardDescription className="mt-1 max-w-xl text-slate-600">
              Search and filter engagements. Click <span className="font-medium text-brand-teal">Spent</span> to see linked
              expenses.
            </CardDescription>
          </div>
          <Button type="button" className="bg-brand-navy text-white shadow-sm hover:brightness-110" onClick={openNew}>
            <Plus className="mr-2 size-4" />
            Add project
          </Button>
        </CardHeader>
        {!loading && rows.length > 0 ? (
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/90 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="relative min-w-[200px] max-w-md flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or client…"
                className={cn(dashboardFormInputClass, 'h-10 border-slate-200 bg-white pl-9 shadow-sm')}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={cn(dashboardFormInputClass, 'h-10 w-full min-w-[9rem] border-slate-200 bg-white shadow-sm sm:w-auto')}
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className={cn(dashboardFormInputClass, 'h-10 w-full min-w-[10rem] border-slate-200 bg-white shadow-sm sm:w-auto')}
                aria-label="Filter by client"
              >
                <option value="all">All clients</option>
                {clients.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {String(c.name ?? c.id)}
                  </option>
                ))}
              </select>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 border-slate-200"
                  onClick={() => {
                    setSearchQuery('')
                    setFilterStatus('all')
                    setFilterClient('all')
                  }}
                >
                  <X className="mr-1 size-4" />
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 py-8 text-sm">{empty}</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground px-6 py-8 text-sm">{empty}</p>
          ) : filteredRows.length === 0 ? (
            <p className="text-muted-foreground px-6 py-8 text-sm">No projects match your search or filters.</p>
          ) : (
            <ScrollArea className="max-h-[min(520px,calc(100dvh-16rem))] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                    <TableHead className="font-semibold text-white">Name</TableHead>
                    <TableHead className="hidden font-semibold text-white md:table-cell">Client</TableHead>
                    <TableHead className="hidden font-semibold text-white sm:table-cell">Status</TableHead>
                    <TableHead className="hidden font-semibold text-white md:table-cell">Milestone</TableHead>
                    <TableHead className="hidden font-semibold text-white lg:table-cell">Contract value</TableHead>
                    <TableHead className="hidden font-semibold text-white lg:table-cell">Spent</TableHead>
                    <TableHead className="hidden font-semibold text-white lg:table-cell">Balance</TableHead>
                    <TableHead className="hidden font-semibold text-white lg:table-cell">Start date</TableHead>
                    <TableHead className="hidden font-semibold text-white lg:table-cell">End date</TableHead>
                    <TableHead className="hidden min-w-[10rem] font-semibold text-white xl:table-cell">Duration</TableHead>
                    <TableHead className="min-w-[7.5rem] pr-4 text-right font-semibold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => {
                    const id = String(row.id ?? '')
                    const cid = row.client_id ? String(row.client_id) : ''
                    const commentPreview = projectCommentText(row)
                    return (
                      <TableRow
                        key={id}
                        className="border-b border-slate-100 transition-colors odd:bg-white even:bg-brand-mint/[0.12] hover:bg-brand-mint/35"
                      >
                        <TableCell className="font-medium text-brand-navy">{formatCell(row.name)}</TableCell>
                        <TableCell className="hidden text-sm md:table-cell">{clientLabel(cid)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                              statusBadgeClass(String(row.status ?? 'active')),
                            )}
                          >
                            {formatStatusLabel(row.status)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden text-sm font-medium text-brand-navy md:table-cell">
                          {formatMilestonePct(row)}
                        </TableCell>
                        <TableCell className="hidden text-sm text-slate-700 lg:table-cell">
                          {formatContractValue(row)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <button
                            type="button"
                            className="text-sm font-semibold text-brand-teal underline decoration-brand-teal/50 underline-offset-2 transition hover:text-brand-navy hover:decoration-brand-navy"
                            onClick={() => setSpentProject(row)}
                          >
                            {formatProjectExpenseTotal(row)}
                          </button>
                        </TableCell>
                        <TableCell
                          className={cn(
                            'hidden text-sm font-medium lg:table-cell',
                            projectBalanceIsNegative(row) ? 'text-red-600' : 'text-brand-navy',
                          )}
                        >
                          {formatProjectBalance(row)}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-xs text-slate-700 lg:table-cell">
                          {formatDateForTable(isoDateInput(row.contract_start))}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-xs text-slate-700 lg:table-cell">
                          {formatDateForTable(isoDateInput(row.contract_end))}
                        </TableCell>
                        <TableCell className="hidden max-w-[min(18rem,28vw)] text-xs leading-snug text-slate-600 xl:table-cell">
                          {formatContractDuration(row)}
                        </TableCell>
                        <TableCell className="pr-2 text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label="Comment"
                                onClick={() => openComment(row)}
                              >
                                <MessageSquare className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="bottom"
                              sideOffset={6}
                              className="max-h-48 max-w-[min(20rem,85vw)] overflow-y-auto px-3 py-2 text-left text-xs font-normal break-words whitespace-pre-wrap"
                            >
                              {commentPreview ? (
                                commentPreview
                              ) : (
                                <span className="text-background/80 italic">No comment yet — click to add</span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Edit" onClick={() => openEdit(row)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive size-8"
                            aria-label="Delete"
                            onClick={() => setDel({ id, name: String(row.name ?? '') })}
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

      <Dialog open={spentProject !== null} onOpenChange={(o) => !o && setSpentProject(null)}>
        <DialogContent className="max-h-[min(520px,85vh)] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-navy">
              Expense details — {spentProject ? formatCell(spentProject.name) : ''}
            </DialogTitle>
            <DialogDescription>
              {spentProject ? (
                <>
                  Reported spent on project:{' '}
                  <span className="font-semibold text-foreground">{formatProjectExpenseTotal(spentProject)}</span>
                  {spentLines.length > 0 ? (
                    <> · {spentLines.length} linked record{spentLines.length === 1 ? '' : 's'}</>
                  ) : null}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {spentLines.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-600">
              No expenses linked to this project. Open <strong>Expenses</strong>, add an expense, and choose this project.
            </p>
          ) : (
            <div className="rounded-lg border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-brand-navy/95 hover:bg-brand-navy/95">
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white">Category</TableHead>
                    <TableHead className="text-right text-white">Amount</TableHead>
                    <TableHead className="hidden text-white sm:table-cell">Paid by</TableHead>
                    <TableHead className="hidden min-w-[8rem] text-white md:table-cell">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spentLines.map((ex) => {
                    const eid = String(ex.id ?? '')
                    const amt = typeof ex.amount === 'number' ? ex.amount : parseFloat(String(ex.amount))
                    const cur = String(ex.currency ?? 'USD').trim() || 'USD'
                    return (
                      <TableRow key={eid} className="border-slate-100">
                        <TableCell className="whitespace-nowrap text-xs">
                          {formatDateForTable(isoDateInput(ex.expense_date))}
                        </TableCell>
                        <TableCell className="max-w-[10rem] text-xs capitalize">{expenseCategoryLabel(ex)}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-medium">
                          {!Number.isNaN(amt) ? amt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '—'}{' '}
                          {cur}
                        </TableCell>
                        <TableCell className="hidden text-xs text-slate-600 sm:table-cell">
                          {ex.paid_by != null && String(ex.paid_by).trim() !== '' ? String(ex.paid_by) : '—'}
                        </TableCell>
                        <TableCell className="hidden max-w-[14rem] text-xs text-slate-600 md:table-cell">{expenseNarrationShort(ex)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSpentProject(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>{editId ? 'Edit project' : 'New project'}</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>Use for project-based invoices.</SheetDescription>
          </div>
          <form onSubmit={submit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Name" htmlFor="pj-name" icon={Building2}>
                <Input id="pj-name" value={name} onChange={(e) => setName(e.target.value)} className={dashboardFormInputClass} required />
              </DashboardFormField>
              <DashboardFormField label="Client (optional)" htmlFor="pj-cl" icon={Building2}>
                <select
                  id="pj-cl"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={dashboardFormInputClass}
                >
                  <option value="">—</option>
                  {clients.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {String(c.name ?? c.id)}
                    </option>
                  ))}
                </select>
              </DashboardFormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <DashboardFormField label="Contract value (optional)" htmlFor="pj-cv" icon={DollarSign}>
                  <Input
                    id="pj-cv"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 50000"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className={dashboardFormInputClass}
                  />
                </DashboardFormField>
                <DashboardFormField label="Currency" htmlFor="pj-cc" icon={DollarSign} hint="Applies to contract value">
                  <Input
                    id="pj-cc"
                    value={contractCurrency}
                    onChange={(e) => setContractCurrency(e.target.value)}
                    className={dashboardFormInputClass}
                    placeholder="USD"
                    maxLength={10}
                  />
                </DashboardFormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DashboardFormField label="Status" htmlFor="pj-st" icon={Flag}>
                  <select
                    id="pj-st"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={dashboardFormInputClass}
                  >
                    {PROJECT_STATUSES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </DashboardFormField>
                <DashboardFormField label="Milestone % (optional)" htmlFor="pj-ms" icon={Percent} hint="0–100">
                  <Input
                    id="pj-ms"
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    placeholder="e.g. 35"
                    value={milestonePct}
                    onChange={(e) => setMilestonePct(e.target.value)}
                    className={dashboardFormInputClass}
                  />
                </DashboardFormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DashboardFormField label="Contract start (optional)" htmlFor="pj-cs" icon={CalendarRange}>
                  <Input
                    id="pj-cs"
                    type="date"
                    value={contractStart}
                    onChange={(e) => setContractStart(e.target.value)}
                    className={dashboardFormInputClass}
                  />
                </DashboardFormField>
                <DashboardFormField label="Contract end (optional)" htmlFor="pj-ce" icon={CalendarRange}>
                  <Input
                    id="pj-ce"
                    type="date"
                    value={contractEnd}
                    onChange={(e) => setContractEnd(e.target.value)}
                    className={dashboardFormInputClass}
                  />
                </DashboardFormField>
              </div>
              <DashboardFormField label="Description (optional)" htmlFor="pj-d" icon={Building2}>
                <Textarea
                  id="pj-d"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={cn(dashboardFormTextareaClass, 'resize-y')}
                />
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

      <Dialog
        open={commentRow !== null}
        onOpenChange={(o) => {
          if (!o) {
            setCommentRow(null)
            setCommentErr(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-navy">Project comment</DialogTitle>
            <DialogDescription>
              Notes for {commentRow ? String(commentRow.name ?? 'this project') : 'this project'}. Same field as Description in the edit form.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={5}
            className={cn(dashboardFormTextareaClass, 'resize-y')}
            placeholder="Add a comment…"
          />
          {commentErr ? <p className="text-destructive text-sm">{commentErr}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCommentRow(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={commentPending} className="bg-brand-navy" onClick={() => void saveComment()}>
              {commentPending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={del !== null} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>Remove {del?.name}.</AlertDialogDescription>
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
