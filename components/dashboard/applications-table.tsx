'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Ban,
  CheckCircle2,
  FileText,
  Loader2,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import { DashboardTablePaginationBar } from '@/components/dashboard/dashboard-table-pagination'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { cn } from '@/lib/utils'

function trainingTitle(row: Record<string, unknown>): string {
  const t = row.training as Record<string, unknown> | undefined
  if (t && typeof t.title === 'string') return t.title
  return '—'
}

function academyNameFromRow(row: Record<string, unknown>): string {
  const t = row.training as Record<string, unknown> | undefined
  const ac = t?.academy as Record<string, unknown> | undefined
  if (ac && typeof ac.name === 'string' && ac.name.trim()) return ac.name.trim()
  return '—'
}

function applicantTypeLabel(row: Record<string, unknown>): 'individual' | 'organization' {
  const t = String(row.applicant_type ?? 'individual').toLowerCase()
  return t === 'organization' ? 'organization' : 'individual'
}

function formatParticipantBandLabel(band: string, custom: string): string {
  const b = band.trim()
  const c = custom.trim()
  switch (b) {
    case '1_10':
      return '1–10'
    case '11_50':
      return '11–50'
    case '51_200':
      return '51–200'
    case '200_plus':
      return '200+'
    case 'custom':
      return c ? `Custom (${c})` : 'Custom'
    default:
      return b || '—'
  }
}

function formatTrainingFormatLabelUi(s: string): string {
  switch (s.trim().toLowerCase()) {
    case 'online':
      return 'Online'
    case 'in_person':
      return 'In-person'
    case 'hybrid':
      return 'Hybrid'
    default:
      return s.trim() || '—'
  }
}

const ROLE_LABELS: Record<string, string> = {
  executives: 'Executives',
  managers: 'Managers',
  team_leads: 'Team leads',
  staff: 'Staff',
}

function formatParticipantRolesList(row: Record<string, unknown>): string {
  const raw = row.participant_roles
  if (raw == null) return '—'
  let arr: unknown[] = []
  if (Array.isArray(raw)) {
    arr = raw
  } else if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw) as unknown
      if (Array.isArray(p)) arr = p
      else return raw.trim() || '—'
    } catch {
      return raw.trim() || '—'
    }
  } else {
    return '—'
  }
  const labels = arr
    .filter((x): x is string => typeof x === 'string' && x.trim() !== '')
    .map((x) => ROLE_LABELS[x] ?? x)
  return labels.length ? labels.join(', ') : '—'
}

function participantCountLabel(row: Record<string, unknown>): string {
  const n = row.participant_count
  if (typeof n === 'number' && n > 0) return String(n)
  if (typeof n === 'string' && n.trim() && !Number.isNaN(Number(n))) return String(Number(n))
  return '—'
}

type ReviewFieldProps = { label: string; value: string; mono?: boolean }

function ReviewField({ label, value, mono }: ReviewFieldProps) {
  const empty = !value || value === '—'
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-teal">{label}</p>
      <p
        className={cn(
          'mt-0.5 break-words text-sm text-brand-navy',
          mono && 'font-mono text-[13px]',
          empty && 'text-slate-400',
        )}
      >
        {empty ? '—' : value}
      </p>
    </div>
  )
}

function formatDate(v: unknown): string {
  if (v == null || !String(v).trim()) return '—'
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function rawStatus(row: Record<string, unknown>): string {
  return String(row.status ?? 'pending').toLowerCase()
}

/** Approved / accepted participants land in the Approved tab. */
export function isApprovedStatus(row: Record<string, unknown>): boolean {
  const s = rawStatus(row)
  return s === 'approved' || s === 'accepted'
}

function statusLabel(row: Record<string, unknown>): string {
  const s = rawStatus(row)
  const map: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    accepted: 'Approved',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    reviewed: 'Reviewed',
    rejected: 'Rejected',
  }
  return map[s] ?? (row.status != null ? String(row.status) : '—')
}

function statusBadgeClass(row: Record<string, unknown>): string {
  const s = rawStatus(row)
  if (s === 'pending') return 'bg-amber-100 text-amber-950 ring-1 ring-amber-200/80'
  if (s === 'approved' || s === 'accepted') return 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200/80'
  if (s === 'cancelled' || s === 'canceled') return 'bg-slate-200 text-slate-800 ring-1 ring-slate-300'
  if (s === 'rejected') return 'bg-red-100 text-red-950 ring-1 ring-red-200/80'
  if (s === 'reviewed') return 'bg-brand-navy/10 text-brand-navy ring-1 ring-brand-navy/25'
  return 'bg-brand-teal/15 text-brand-navy ring-1 ring-brand-teal/25'
}

type Props = {
  rows: Record<string, unknown>[]
  /** Trainings from GET /api/trainings — required to pick a course when adding manually. */
  trainings: Record<string, unknown>[]
  loading: boolean
  empty: string
  onRefresh: () => void
}

function trainingOptionLabel(t: Record<string, unknown>): string {
  const title = String(t.title ?? 'Training')
  const ac = t.academy as Record<string, unknown> | undefined
  const an = ac && typeof ac.name === 'string' ? ac.name : ''
  return an ? `${title} · ${an}` : title
}

const EDIT_STATUS_OPTIONS = ['pending', 'approved', 'cancelled', 'reviewed', 'rejected']

type QueueStatusFilter = 'all' | 'pending' | 'cancelled' | 'other'

function bodyForPatch(row: Record<string, unknown>, status: string) {
  return {
    email: String(row.email ?? '').trim(),
    status: status.trim(),
    first_name: String(row.first_name ?? ''),
    last_name: String(row.last_name ?? ''),
    phone: String(row.phone ?? ''),
    company: String(row.company ?? ''),
    message: String(row.message ?? ''),
  }
}

function parseCreatedAt(row: Record<string, unknown>): Date | null {
  const v = row.created_at
  if (v == null) return null
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) return null
  return d
}

/** Date filter runs on the full dataset before queue/search/pagination. */
export type DatePreset = 'all' | 'lastDay' | 'lastMonth' | 'lastYear' | 'custom'

function rowMatchesDatePreset(
  row: Record<string, unknown>,
  preset: DatePreset,
  dateFrom: string,
  dateTo: string,
): boolean {
  const t = parseCreatedAt(row)
  if (!t) return false

  const now = Date.now()
  if (preset === 'all') return true
  if (preset === 'lastDay') {
    return t.getTime() >= now - 24 * 60 * 60 * 1000
  }
  if (preset === 'lastMonth') {
    return t.getTime() >= now - 30 * 24 * 60 * 60 * 1000
  }
  if (preset === 'lastYear') {
    return t.getTime() >= now - 365 * 24 * 60 * 60 * 1000
  }
  if (preset === 'custom') {
    const fromStr = dateFrom.trim()
    const toStr = dateTo.trim()
    if (!fromStr && !toStr) return true
    if (fromStr && !toStr) {
      const from = new Date(fromStr)
      from.setHours(0, 0, 0, 0)
      return t >= from
    }
    if (!fromStr && toStr) {
      const end = new Date(toStr)
      end.setHours(23, 59, 59, 999)
      return t <= end
    }
    const d0 = new Date(fromStr)
    d0.setHours(0, 0, 0, 0)
    const d1 = new Date(toStr)
    d1.setHours(0, 0, 0, 0)
    const minMs = Math.min(d0.getTime(), d1.getTime())
    const maxMs = Math.max(d0.getTime(), d1.getTime())
    const start = new Date(minMs)
    const end = new Date(maxMs)
    end.setHours(23, 59, 59, 999)
    return t >= start && t <= end
  }
  return true
}

export function ApplicationsTable({ rows, trainings, loading, empty, onRefresh }: Props) {
  const [tab, setTab] = useState<'queue' | 'approved'>('queue')

  const [newOpen, setNewOpen] = useState(false)
  const [newPending, setNewPending] = useState(false)
  const [newErr, setNewErr] = useState<string | null>(null)
  const [newTrainingId, setNewTrainingId] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [newStatus, setNewStatus] = useState('pending')

  const [datePreset, setDatePreset] = useState<DatePreset>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [queueSearch, setQueueSearch] = useState('')
  const [queueStatusFilter, setQueueStatusFilter] = useState<QueueStatusFilter>('all')
  const [queuePage, setQueuePage] = useState(1)
  const [queuePageSize, setQueuePageSize] = useState(10)

  const [approvedSearch, setApprovedSearch] = useState('')
  const [approvedPage, setApprovedPage] = useState(1)
  const [approvedPageSize, setApprovedPageSize] = useState(10)

  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLabel, setDeleteLabel] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [pending, setPending] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRow, setReviewRow] = useState<Record<string, unknown> | null>(null)
  const [reviewWaMsg, setReviewWaMsg] = useState('')
  const [reviewBusy, setReviewBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('pending')

  const dateFilteredRows = useMemo(() => {
    if (datePreset === 'all') return rows
    return rows.filter((r) => rowMatchesDatePreset(r, datePreset, dateFrom, dateTo))
  }, [rows, datePreset, dateFrom, dateTo])

  const queueRows = useMemo(
    () => dateFilteredRows.filter((r) => !isApprovedStatus(r)),
    [dateFilteredRows],
  )
  const approvedRows = useMemo(
    () => dateFilteredRows.filter((r) => isApprovedStatus(r)),
    [dateFilteredRows],
  )

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase()
    return queueRows.filter((row) => {
      const s = rawStatus(row)
      if (queueStatusFilter === 'pending') {
        if (s !== 'pending') return false
      } else if (queueStatusFilter === 'cancelled') {
        if (s !== 'cancelled' && s !== 'canceled') return false
      } else if (queueStatusFilter === 'other') {
        if (['pending', 'cancelled', 'canceled', 'approved', 'accepted'].includes(s)) return false
      }
      if (!q) return true
      const em = String(row.email ?? '').toLowerCase()
      const tr = trainingTitle(row).toLowerCase()
      const fn = String(row.first_name ?? '').toLowerCase()
      const ln = String(row.last_name ?? '').toLowerCase()
      return em.includes(q) || tr.includes(q) || fn.includes(q) || ln.includes(q)
    })
  }, [queueRows, queueSearch, queueStatusFilter])

  const filteredApproved = useMemo(() => {
    const q = approvedSearch.trim().toLowerCase()
    if (!q) return approvedRows
    return approvedRows.filter((row) => {
      const em = String(row.email ?? '').toLowerCase()
      const tr = trainingTitle(row).toLowerCase()
      const fn = String(row.first_name ?? '').toLowerCase()
      const ln = String(row.last_name ?? '').toLowerCase()
      return em.includes(q) || tr.includes(q) || fn.includes(q) || ln.includes(q)
    })
  }, [approvedRows, approvedSearch])

  const queueTotalPages = Math.max(1, Math.ceil(filteredQueue.length / queuePageSize))
  const queuePageSafe = Math.min(queuePage, queueTotalPages)
  const pagedQueue = useMemo(() => {
    const start = (queuePageSafe - 1) * queuePageSize
    return filteredQueue.slice(start, start + queuePageSize)
  }, [filteredQueue, queuePageSafe, queuePageSize])

  const approvedTotalPages = Math.max(1, Math.ceil(filteredApproved.length / approvedPageSize))
  const approvedPageSafe = Math.min(approvedPage, approvedTotalPages)
  const pagedApproved = useMemo(() => {
    const start = (approvedPageSafe - 1) * approvedPageSize
    return filteredApproved.slice(start, start + approvedPageSize)
  }, [filteredApproved, approvedPageSafe, approvedPageSize])

  useEffect(() => {
    setQueuePage(1)
  }, [queueSearch, queueStatusFilter])

  useEffect(() => {
    setQueuePage((p) => Math.min(p, queueTotalPages))
  }, [queueTotalPages])

  useEffect(() => {
    setApprovedPage(1)
  }, [approvedSearch])

  useEffect(() => {
    setApprovedPage((p) => Math.min(p, approvedTotalPages))
  }, [approvedTotalPages])

  useEffect(() => {
    setQueuePage(1)
    setApprovedPage(1)
  }, [datePreset, dateFrom, dateTo])

  const editing = editId ? rows.find((r) => String(r.id) === editId) : null

  function openEdit(row: Record<string, unknown>) {
    const id = String(row.id ?? '')
    setEditId(id)
    setEmail(String(row.email ?? ''))
    setFirstName(String(row.first_name ?? ''))
    setLastName(String(row.last_name ?? ''))
    setPhone(String(row.phone ?? ''))
    setCompany(String(row.company ?? ''))
    setMessage(String(row.message ?? ''))
    setStatus(String(row.status ?? 'pending'))
    setErr(null)
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editId) return
    const em = email.trim()
    if (!em) {
      setErr('Email is required')
      return
    }
    setPending(true)
    setErr(null)
    try {
      const payload = {
        email: em,
        status: status.trim() || 'pending',
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        company: company,
        message: message,
      }

      const res = await fetch(`/api/applications/${editId}`, {
        method: 'PATCH',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErr(data.error ?? 'Save failed')
        return
      }
      setEditId(null)
      onRefresh()
    } finally {
      setPending(false)
    }
  }

  function defaultApprovalWhatsAppText(row: Record<string, unknown>): string {
    const title = trainingTitle(row)
    const fn = String(row.first_name ?? '').trim()
    const ln = String(row.last_name ?? '').trim()
    const org = String(row.company ?? '').trim()
    let greet = ''
    if (fn || ln) {
      greet = [fn, ln].filter(Boolean).join(' ')
    } else if (org) {
      greet = org
    } else {
      greet = 'there'
    }
    return `Hello ${greet},

Good news: your application for *${title}* has been *approved*.

We will share the next steps with you shortly.

— Baraarug Consulting Firm`
  }

  function openReview(row: Record<string, unknown>) {
    setReviewRow(row)
    setReviewWaMsg(defaultApprovalWhatsAppText(row))
    setReviewOpen(true)
  }

  async function submitReviewApprove() {
    if (!reviewRow) return
    const id = String(reviewRow.id ?? '')
    const em = String(reviewRow.email ?? '').trim()
    if (!id || !em) return
    setReviewBusy(true)
    setActionId(id)
    try {
      const payload: Record<string, unknown> = {
        ...bodyForPatch(reviewRow, 'approved'),
        approval_whatsapp_message: reviewWaMsg.trim(),
      }
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Update failed')
        return
      }
      setReviewOpen(false)
      setReviewRow(null)
      onRefresh()
      setTab('approved')
    } finally {
      setReviewBusy(false)
      setActionId(null)
    }
  }

  async function quickSetStatus(row: Record<string, unknown>, next: 'cancelled') {
    const id = String(row.id ?? '')
    const em = String(row.email ?? '').trim()
    if (!id || !em) return
    setActionId(id)
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyForPatch(row, next)),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Update failed')
        return
      }
      onRefresh()
    } finally {
      setActionId(null)
    }
  }

  function openNewApplication() {
    setNewErr(null)
    setNewEmail('')
    setNewFirstName('')
    setNewLastName('')
    setNewPhone('')
    setNewCompany('')
    setNewMessage('')
    setNewStatus('pending')
    const first = trainings[0]
    setNewTrainingId(first ? String(first.id ?? '') : '')
    setNewOpen(true)
  }

  async function submitNewApplication(e: FormEvent) {
    e.preventDefault()
    const em = newEmail.trim().toLowerCase()
    if (!em) {
      setNewErr('Email is required.')
      return
    }
    if (!newTrainingId.trim()) {
      setNewErr('Select a training.')
      return
    }
    setNewPending(true)
    setNewErr(null)
    try {
      const payload: Record<string, unknown> = {
        training_id: newTrainingId.trim(),
        email: em,
        status: newStatus.trim() || 'pending',
      }
      if (newFirstName.trim()) payload.first_name = newFirstName.trim()
      if (newLastName.trim()) payload.last_name = newLastName.trim()
      if (newPhone.trim()) payload.phone = newPhone.trim()
      if (newCompany.trim()) payload.company = newCompany.trim()
      if (newMessage.trim()) payload.message = newMessage.trim()

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string; success?: boolean }
      if (!res.ok) {
        setNewErr(data.error ?? `Save failed (${res.status})`)
        return
      }
      setNewOpen(false)
      onRefresh()
    } catch {
      setNewErr('Network error — try again.')
    } finally {
      setNewPending(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/applications/${deleteId}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Delete failed')
        return
      }
      setDeleteId(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  function renderTableRows(
    slice: Record<string, unknown>[],
    opts: { showQuickActions: boolean },
  ) {
    return slice.map((row) => {
      const id = String(row.id ?? '')
      const busy = actionId === id
      const st = rawStatus(row)
      const canQuick = opts.showQuickActions && st === 'pending'

      return (
        <TableRow key={id} className="odd:bg-white even:bg-brand-mint/15 hover:bg-brand-mint/35">
          <TableCell className="max-w-[200px] truncate text-sm font-medium text-brand-navy">
            {String(row.email ?? '—')}
          </TableCell>
          <TableCell className="hidden max-w-[220px] truncate text-xs lg:table-cell">
            {trainingTitle(row)}
          </TableCell>
          <TableCell>
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                statusBadgeClass(row),
              )}
            >
              {statusLabel(row)}
            </span>
          </TableCell>
          <TableCell className="hidden text-xs text-slate-600 md:table-cell">
            {formatDate(row.created_at)}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex flex-wrap items-center justify-end gap-1">
              {canQuick ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                    disabled={busy}
                    onClick={() => openReview(row)}
                  >
                    {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                    <span className="ml-1 hidden sm:inline">Review</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    disabled={busy}
                    onClick={() => void quickSetStatus(row, 'cancelled')}
                  >
                    {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Ban className="size-3.5" />}
                    <span className="ml-1 hidden sm:inline">Cancel</span>
                  </Button>
                </>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => openEdit(row)}
                aria-label="Edit application"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive size-8"
                onClick={() => {
                  setDeleteId(id)
                  setDeleteLabel(String(row.email ?? id))
                }}
                aria-label="Delete application"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    })
  }

  const tableToolbar = (
    variant: 'queue' | 'approved',
  ) => (
    <div className="flex flex-col gap-2 border-b border-brand-navy/8 bg-white px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder={variant === 'queue' ? 'Search email, training, name…' : 'Search approved…'}
          value={variant === 'queue' ? queueSearch : approvedSearch}
          onChange={(e) =>
            variant === 'queue' ? setQueueSearch(e.target.value) : setApprovedSearch(e.target.value)
          }
          className="h-10 border-brand-navy/15 bg-brand-mint/20 pl-9 text-brand-navy placeholder:text-slate-400"
          aria-label={variant === 'queue' ? 'Search applications' : 'Search approved'}
        />
      </div>
      {variant === 'queue' ? (
        <Select
          value={queueStatusFilter}
          onValueChange={(v) => setQueueStatusFilter(v as QueueStatusFilter)}
        >
          <SelectTrigger className="h-10 w-full border-brand-navy/15 bg-white sm:w-[min(100%,200px)]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="other">Other (reviewed, rejected, …)</SelectItem>
          </SelectContent>
        </Select>
      ) : null}
    </div>
  )

  return (
    <>
      <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
        <div className="h-1 bg-brand-teal" />
        <CardHeader className="flex flex-col gap-3 border-b border-brand-navy/8 bg-brand-mint/25 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-lg text-brand-navy">Training applications</CardTitle>
            <CardDescription className="text-slate-600">
              {loading
                ? 'Loading…'
                : `${dateFilteredRows.length} total · ${queueRows.length} in queue · ${approvedRows.length} approved${
                    datePreset !== 'all' && rows.length !== dateFilteredRows.length
                      ? ` · ${rows.length} in database before date filter`
                      : ''
                  }`}
            </CardDescription>
          </div>
          <Button
            type="button"
            className="shrink-0 border-0 bg-brand-navy text-white shadow-md hover:brightness-110"
            disabled={loading || trainings.length === 0}
            onClick={openNewApplication}
            title={trainings.length === 0 ? 'Add at least one training under Trainings first' : undefined}
          >
            <Plus className="mr-2 size-4" />
            Add new
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : rows.length === 0 ? (
            <div className="px-6 py-8">
              <p className="text-center text-sm text-slate-600">{empty}</p>
              {trainings.length === 0 ? (
                <p className="mt-3 text-center text-xs text-amber-800">
                  Create an academy and training first in the Trainings tab, then you can add applications here.
                </p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="border-b border-brand-navy/8 bg-white px-4 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-navy">Date (applies to all rows)</p>
                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                  <div className="w-full min-w-0 lg:w-[220px]">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">Period</label>
                    <Select
                      value={datePreset}
                      onValueChange={(v) => {
                        setDatePreset(v as DatePreset)
                        if (v !== 'custom') {
                          setDateFrom('')
                          setDateTo('')
                        }
                      }}
                    >
                      <SelectTrigger className="h-10 border-brand-navy/15 bg-brand-mint/20 text-brand-navy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All dates</SelectItem>
                        <SelectItem value="lastDay">Last day (24 hours)</SelectItem>
                        <SelectItem value="lastMonth">Last month (30 days)</SelectItem>
                        <SelectItem value="lastYear">Last year (365 days)</SelectItem>
                        <SelectItem value="custom">Custom range (from – to)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {datePreset === 'custom' ? (
                    <>
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-600">From</label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="h-10 border-brand-navy/15 bg-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-600">To</label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="h-10 border-brand-navy/15 bg-white"
                        />
                      </div>
                    </>
                  ) : null}
                  {datePreset !== 'all' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 border-brand-navy/20"
                      onClick={() => {
                        setDatePreset('all')
                        setDateFrom('')
                        setDateTo('')
                      }}
                    >
                      Clear dates
                    </Button>
                  ) : null}
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Search, status, and pagination run on the filtered list above.
                </p>
              </div>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as 'queue' | 'approved')}
              className="gap-0"
            >
              <div className="border-b border-brand-navy/8 bg-brand-mint/25 px-4 pt-2">
                <TabsList className="h-auto w-full justify-start gap-1 rounded-lg bg-white/80 p-1 sm:w-auto">
                  <TabsTrigger
                    value="queue"
                    className="group data-[state=active]:bg-brand-navy data-[state=active]:text-white"
                  >
                    Applications
                    <span className="ml-1.5 rounded-full bg-brand-teal/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-navy group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                      {queueRows.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="approved"
                    className="group data-[state=active]:bg-brand-navy data-[state=active]:text-white"
                  >
                    Approved
                    <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                      {approvedRows.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="queue" className="mt-0">
                {tableToolbar('queue')}
                {filteredQueue.length === 0 ? (
                  <p className="text-muted-foreground px-6 py-8 text-center text-sm">No applications match this filter.</p>
                ) : (
                  <>
                    <div className="max-h-[min(520px,calc(100dvh-18rem))] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                            <TableHead className="sticky top-0 z-10 bg-brand-navy font-semibold text-white shadow-sm">
                              Email
                            </TableHead>
                            <TableHead className="sticky top-0 z-10 hidden bg-brand-navy font-semibold text-white shadow-sm lg:table-cell">
                              Training
                            </TableHead>
                            <TableHead className="sticky top-0 z-10 bg-brand-navy font-semibold text-white shadow-sm">
                              Status
                            </TableHead>
                            <TableHead className="sticky top-0 z-10 hidden bg-brand-navy font-semibold text-white shadow-sm md:table-cell">
                              Created
                            </TableHead>
                            <TableHead className="sticky top-0 z-10 min-w-[140px] bg-brand-navy pr-4 text-right font-semibold text-white shadow-sm">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>{renderTableRows(pagedQueue, { showQuickActions: true })}</TableBody>
                      </Table>
                    </div>
                    <DashboardTablePaginationBar
                      page={queuePageSafe}
                      totalPages={queueTotalPages}
                      pageSize={queuePageSize}
                      totalRows={filteredQueue.length}
                      onPageChange={setQueuePage}
                      onPageSizeChange={(n) => {
                        setQueuePageSize(n)
                        setQueuePage(1)
                      }}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-0">
                {tableToolbar('approved')}
                {filteredApproved.length === 0 ? (
                  <p className="text-muted-foreground px-6 py-8 text-center text-sm">
                    No approved applications yet. Use Review on the Applications tab to approve.
                  </p>
                ) : (
                  <>
                    <div className="max-h-[min(520px,calc(100dvh-18rem))] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                            <TableHead className="sticky top-0 z-10 bg-brand-navy font-semibold text-white shadow-sm">
                              Email
                            </TableHead>
                            <TableHead className="sticky top-0 z-10 hidden bg-brand-navy font-semibold text-white shadow-sm lg:table-cell">
                              Training
                            </TableHead>
                            <TableHead className="sticky top-0 z-10 bg-brand-navy font-semibold text-white shadow-sm">
                              Status
                            </TableHead>
                            <TableHead className="sticky top-0 z-10 hidden bg-brand-navy font-semibold text-white shadow-sm md:table-cell">
                              Created
                            </TableHead>
                            <TableHead className="sticky top-0 z-10 w-[88px] bg-brand-navy pr-4 text-right font-semibold text-white shadow-sm">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>{renderTableRows(pagedApproved, { showQuickActions: false })}</TableBody>
                      </Table>
                    </div>
                    <DashboardTablePaginationBar
                      page={approvedPageSafe}
                      totalPages={approvedTotalPages}
                      pageSize={approvedPageSize}
                      totalRows={filteredApproved.length}
                      onPageChange={setApprovedPage}
                      onPageSizeChange={(n) => {
                        setApprovedPageSize(n)
                        setApprovedPage(1)
                      }}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={editId !== null} onOpenChange={(o) => !o && setEditId(null)}>
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>Edit application</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
              {editing ? (
                <>
                  Training: <span className="font-medium text-brand-navy">{trainingTitle(editing)}</span>
                </>
              ) : null}
            </SheetDescription>
          </div>
          <form onSubmit={saveEdit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Status" htmlFor="app-st" icon={FileText}>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="app-st" className={dashboardFormInputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDIT_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DashboardFormField>
              <DashboardFormField label="Email" htmlFor="app-em" icon={FileText}>
                <Input
                  id="app-em"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                />
              </DashboardFormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <DashboardFormField label="First name" htmlFor="app-fn" icon={FileText}>
                  <Input id="app-fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={dashboardFormInputClass} />
                </DashboardFormField>
                <DashboardFormField label="Last name" htmlFor="app-ln" icon={FileText}>
                  <Input id="app-ln" value={lastName} onChange={(e) => setLastName(e.target.value)} className={dashboardFormInputClass} />
                </DashboardFormField>
              </div>
              <DashboardFormField label="Phone" htmlFor="app-ph" icon={FileText}>
                <Input id="app-ph" value={phone} onChange={(e) => setPhone(e.target.value)} className={dashboardFormInputClass} />
              </DashboardFormField>
              <DashboardFormField label="Organization" htmlFor="app-co" icon={FileText}>
                <Input id="app-co" value={company} onChange={(e) => setCompany(e.target.value)} className={dashboardFormInputClass} />
              </DashboardFormField>
              <DashboardFormField label="Message" htmlFor="app-msg" icon={FileText}>
                <Textarea
                  id="app-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className={cn(dashboardFormTextareaClass, 'resize-y')}
                />
              </DashboardFormField>
              {err ? <p className="text-destructive text-sm">{err}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setEditId(null)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="bg-brand-navy">
                {pending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={newOpen}
        onOpenChange={(o) => {
          setNewOpen(o)
          if (!o) setNewErr(null)
        }}
      >
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>New application</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
              Register someone who applied by phone, email, or in person — same as the public form, stored in the
              database.
            </SheetDescription>
          </div>
          <form onSubmit={submitNewApplication} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Training" htmlFor="new-tr" icon={FileText}>
                <Select value={newTrainingId} onValueChange={setNewTrainingId} required>
                  <SelectTrigger id="new-tr" className={dashboardFormInputClass}>
                    <SelectValue placeholder="Select training" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainings.map((t) => {
                      const id = String(t.id ?? '')
                      if (!id) return null
                      return (
                        <SelectItem key={id} value={id}>
                          {trainingOptionLabel(t)}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </DashboardFormField>
              <DashboardFormField label="Status" htmlFor="new-st" icon={FileText}>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="new-st" className={dashboardFormInputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDIT_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DashboardFormField>
              <DashboardFormField label="Email" htmlFor="new-em" icon={FileText}>
                <Input
                  id="new-em"
                  type="email"
                  autoComplete="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                />
              </DashboardFormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <DashboardFormField label="First name" htmlFor="new-fn" icon={FileText}>
                  <Input id="new-fn" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className={dashboardFormInputClass} />
                </DashboardFormField>
                <DashboardFormField label="Last name" htmlFor="new-ln" icon={FileText}>
                  <Input id="new-ln" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} className={dashboardFormInputClass} />
                </DashboardFormField>
              </div>
              <DashboardFormField label="Phone" htmlFor="new-ph" icon={FileText}>
                <Input id="new-ph" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className={dashboardFormInputClass} />
              </DashboardFormField>
              <DashboardFormField label="Organization" htmlFor="new-co" icon={FileText}>
                <Input id="new-co" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className={dashboardFormInputClass} />
              </DashboardFormField>
              <DashboardFormField label="Message" htmlFor="new-msg" icon={FileText}>
                <Textarea
                  id="new-msg"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className={cn(dashboardFormTextareaClass, 'resize-y')}
                  placeholder="Optional notes"
                />
              </DashboardFormField>
              {newErr ? <p className="text-destructive text-sm">{newErr}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)} disabled={newPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={newPending} className="bg-brand-navy">
                {newPending ? <Loader2 className="size-4 animate-spin" /> : 'Save application'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog
        open={reviewOpen}
        onOpenChange={(o) => {
          setReviewOpen(o)
          if (!o) {
            setReviewRow(null)
            setReviewWaMsg('')
          }
        }}
      >
        <DialogContent className="max-h-[min(90dvh,800px)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <div className="border-b border-brand-navy/10 bg-brand-mint/30 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-brand-navy">Review application</DialogTitle>
              <DialogDescription className="text-slate-600">
                Confirm details and edit the WhatsApp message before approving. Use *asterisks* for bold on WhatsApp.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="max-h-[min(65vh,560px)] space-y-4 overflow-y-auto px-6 py-4">
            {reviewRow ? (
              <>
                <div className="rounded-lg border border-brand-navy/10 bg-slate-50/90 p-4 text-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-navy">Full application</p>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ReviewField
                        label="Applicant type"
                        value={applicantTypeLabel(reviewRow) === 'organization' ? 'Organization' : 'Individual'}
                      />
                      <ReviewField label="Submitted" value={formatDate(reviewRow.created_at)} />
                    </div>
                    <ReviewField label="Academy" value={academyNameFromRow(reviewRow)} />
                    <ReviewField label="Training" value={trainingTitle(reviewRow)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ReviewField label="Email" value={String(reviewRow.email ?? '').trim()} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-teal">
                          WhatsApp number
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 break-all font-mono text-[13px] text-brand-navy">
                          <MessageCircle className="size-4 shrink-0 text-brand-teal" aria-hidden />
                          {String(reviewRow.phone ?? '').trim() || '—'}
                        </p>
                      </div>
                    </div>

                    {applicantTypeLabel(reviewRow) === 'individual' ? (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <ReviewField
                            label="First name"
                            value={String(reviewRow.first_name ?? '').trim()}
                          />
                          <ReviewField label="Last name" value={String(reviewRow.last_name ?? '').trim()} />
                        </div>
                        <ReviewField
                          label="Organization name"
                          value={String(reviewRow.company ?? '').trim()}
                        />
                        <ReviewField label="Job title" value={String(reviewRow.job_title ?? '').trim()} />
                      </>
                    ) : (
                      <>
                        <ReviewField
                          label="Organization name"
                          value={String(reviewRow.company ?? '').trim()}
                        />
                        {(String(reviewRow.first_name ?? '').trim() ||
                          String(reviewRow.last_name ?? '').trim()) && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <ReviewField
                              label="Contact first name (if provided)"
                              value={String(reviewRow.first_name ?? '').trim()}
                            />
                            <ReviewField
                              label="Contact last name (if provided)"
                              value={String(reviewRow.last_name ?? '').trim()}
                            />
                          </div>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <ReviewField
                            label="Number of participants (range)"
                            value={formatParticipantBandLabel(
                              String(reviewRow.employee_count_band ?? ''),
                              String(reviewRow.employee_count_custom ?? ''),
                            )}
                          />
                          <ReviewField
                            label="Exact participant count"
                            value={participantCountLabel(reviewRow)}
                          />
                        </div>
                        <ReviewField
                          label="Roles of participants"
                          value={formatParticipantRolesList(reviewRow)}
                        />
                        <ReviewField
                          label="Preferred training format"
                          value={formatTrainingFormatLabelUi(String(reviewRow.training_format ?? ''))}
                        />
                      </>
                    )}

                    {String(reviewRow.message ?? '').trim() ? (
                      <div className="rounded-md border border-brand-navy/12 bg-white p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-teal">
                          Applicant message / notes
                        </p>
                        <p className="mt-1.5 max-h-32 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-brand-navy">
                          {String(reviewRow.message ?? '')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No optional message was submitted.</p>
                    )}

                    {!String(reviewRow.phone ?? '').trim() ? (
                      <p className="text-xs text-amber-800">
                        No WhatsApp number on file — status will still update to approved, but no WhatsApp will be sent
                        until you add a number (Edit).
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="review-wa-msg" className="text-sm font-semibold text-brand-navy">
                    Message to send on WhatsApp
                  </label>
                  <Textarea
                    id="review-wa-msg"
                    value={reviewWaMsg}
                    onChange={(e) => setReviewWaMsg(e.target.value)}
                    rows={10}
                    className={cn(dashboardFormTextareaClass, 'resize-y font-sans text-sm')}
                    placeholder="Write the message the applicant will receive…"
                  />
                  <p className="text-xs text-slate-500">
                    Leave empty to use the default approval template from the server (only if you clear the text
                    completely).
                  </p>
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter className="border-t border-brand-navy/10 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewOpen(false)}
              disabled={reviewBusy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={reviewBusy || !reviewRow}
              onClick={() => void submitReviewApprove()}
            >
              {reviewBusy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the submission for {deleteLabel}. This cannot be undone.
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
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
