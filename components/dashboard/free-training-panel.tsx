'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import {
  Award,
  ClipboardCopy,
  Download,
  Gift,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getBrowserApiUrl } from '@/lib/api'
import { dashboardAuthHeaders } from '@/lib/dashboard-client'
import { uploadDashboardFile } from '@/lib/dashboard-upload'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type FreeProgram = {
  id: string
  title: string
  slug: string
  venue_location: string
  content: string
  outcomes: string
  success_message: string
  certificate_download_enabled?: boolean
  certificate_signature_image_url?: string | null
  is_active: boolean
  created_at: string
}

type FreeReg = {
  id: string
  program_id: string
  full_name: string
  email: string
  phone: string
  location: string
  gender?: string
  message?: string | null
  status: string
  admin_notes?: string | null
  created_at: string
  program?: { title: string; slug: string }
}

function dayStartMs(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return 0
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
}

function dayEndMs(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return Number.MAX_SAFE_INTEGER
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
}

function formatGenderLabel(g?: string | null) {
  const x = String(g ?? '')
    .trim()
    .toLowerCase()
  if (x === 'male') return 'Male'
  if (x === 'female') return 'Female'
  return '—'
}

function statusBadgeClass(status: string) {
  if (status === 'shortlisted') return 'border-emerald-500/40 bg-emerald-50 text-emerald-900'
  if (status === 'precepts') return 'border-violet-500/40 bg-violet-50 text-violet-900'
  return 'border-slate-300/60 bg-slate-50 text-slate-800'
}

const STATUS_OPTS = [
  { value: 'pending_review', label: 'Pending review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'precepts', label: 'Precepts' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'not_selected', label: 'Not selected' },
]

/** Statuses shown under Participants (shortlist pipeline + precepts step). */
const PARTICIPANT_STATUSES = new Set(['shortlisted', 'precepts'])

/** Bulk status on Participants: pipeline steps + return to main Registrations list (pending_review). */
const PARTICIPANT_BULK_OPTS = [
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'precepts', label: 'Precepts' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'not_selected', label: 'Not selected' },
  {
    value: 'pending_review',
    label: 'Pending review (return to Registrations)',
  },
]

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function FreeTrainingPanel() {
  const [programs, setPrograms] = useState<FreeProgram[]>([])
  const [regs, setRegs] = useState<FreeReg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [programFilter, setProgramFilter] = useState<string>('all')
  const [registrationGenderFilter, setRegistrationGenderFilter] = useState<
    'all' | 'male' | 'female' | 'unspecified'
  >('all')
  const [registrationDateFrom, setRegistrationDateFrom] = useState('')
  const [registrationDateTo, setRegistrationDateTo] = useState('')
  const [participantStatusFilter, setParticipantStatusFilter] = useState<'all' | 'shortlisted' | 'precepts'>('all')
  const [participantGenderFilter, setParticipantGenderFilter] = useState<
    'all' | 'male' | 'female' | 'unspecified'
  >('all')
  const [participantDateFrom, setParticipantDateFrom] = useState('')
  const [participantDateTo, setParticipantDateTo] = useState('')
  const [participantSearch, setParticipantSearch] = useState('')
  const [sort, setSort] = useState<'created_at' | 'full_name' | 'status' | 'email'>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [venue, setVenue] = useState('')
  const [content, setContent] = useState('')
  const [outcomes, setOutcomes] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [certDownloadEnabled, setCertDownloadEnabled] = useState(true)
  const [certSigUrl, setCertSigUrl] = useState('')
  const [certSigUploading, setCertSigUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [review, setReview] = useState<FreeReg | null>(null)
  const [reviewStatus, setReviewStatus] = useState('')
  const [reviewGender, setReviewGender] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)

  const [selectedRegIds, setSelectedRegIds] = useState<Set<string>>(() => new Set())
  const [bulkStatus, setBulkStatus] = useState('precepts')
  const [bulkSaving, setBulkSaving] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [certToggleBusyId, setCertToggleBusyId] = useState<string | null>(null)

  const [tab, setTab] = useState<'programs' | 'registrations' | 'participants'>('programs')

  const shareBase = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/training/free/`
  }, [])

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [pRes, rRes] = await Promise.all([
        fetch(getBrowserApiUrl('/api/free-training-programs'), { headers: dashboardAuthHeaders(), cache: 'no-store' }),
        fetch(getBrowserApiUrl('/api/free-training-registrations?limit=500&sort=created_at&order=desc'), {
          headers: dashboardAuthHeaders(),
          cache: 'no-store',
        }),
      ])
      const pJson = (await pRes.json()) as { success?: boolean; data?: { items?: FreeProgram[] }; error?: string }
      const rJson = (await rRes.json()) as { success?: boolean; data?: { items?: FreeReg[] }; error?: string }
      if (!pRes.ok || !pJson.success) throw new Error(pJson.error ?? 'Failed to load programs')
      if (!rRes.ok || !rJson.success) throw new Error(rJson.error ?? 'Failed to load registrations')
      setPrograms(pJson.data?.items ?? [])
      setRegs(rJson.data?.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredRegs = useMemo(() => {
    let rows = regs
    if (programFilter !== 'all') {
      rows = rows.filter((r) => r.program_id === programFilter)
    }
    if (registrationGenderFilter === 'male') {
      rows = rows.filter((r) => r.gender === 'male')
    } else if (registrationGenderFilter === 'female') {
      rows = rows.filter((r) => r.gender === 'female')
    } else if (registrationGenderFilter === 'unspecified') {
      rows = rows.filter((r) => !r.gender || r.gender === '')
    }
    if (registrationDateFrom) {
      const from = dayStartMs(registrationDateFrom)
      rows = rows.filter((r) => new Date(r.created_at).getTime() >= from)
    }
    if (registrationDateTo) {
      const to = dayEndMs(registrationDateTo)
      rows = rows.filter((r) => new Date(r.created_at).getTime() <= to)
    }
    const mult = order === 'asc' ? 1 : -1
    rows = [...rows].sort((a, b) => {
      let cmp = 0
      if (sort === 'full_name') cmp = a.full_name.localeCompare(b.full_name)
      else if (sort === 'email') cmp = a.email.localeCompare(b.email)
      else if (sort === 'status') cmp = a.status.localeCompare(b.status)
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return cmp * mult
    })
    return rows
  }, [regs, programFilter, registrationGenderFilter, registrationDateFrom, registrationDateTo, sort, order])

  const hasPipelineRegs = useMemo(
    () => regs.some((r) => PARTICIPANT_STATUSES.has(r.status)),
    [regs],
  )

  /** Shortlisted + Precepts with advanced filters (Participants tab). */
  const filteredParticipantRegs = useMemo(() => {
    let rows = regs.filter((r) => PARTICIPANT_STATUSES.has(r.status))
    if (programFilter !== 'all') {
      rows = rows.filter((r) => r.program_id === programFilter)
    }
    if (participantStatusFilter !== 'all') {
      rows = rows.filter((r) => r.status === participantStatusFilter)
    }
    if (participantGenderFilter === 'male') {
      rows = rows.filter((r) => r.gender === 'male')
    } else if (participantGenderFilter === 'female') {
      rows = rows.filter((r) => r.gender === 'female')
    } else if (participantGenderFilter === 'unspecified') {
      rows = rows.filter((r) => !r.gender || r.gender === '')
    }
    const q = participantSearch.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          (r.phone && r.phone.toLowerCase().includes(q)),
      )
    }
    if (participantDateFrom) {
      const from = dayStartMs(participantDateFrom)
      rows = rows.filter((r) => new Date(r.created_at).getTime() >= from)
    }
    if (participantDateTo) {
      const to = dayEndMs(participantDateTo)
      rows = rows.filter((r) => new Date(r.created_at).getTime() <= to)
    }
    const mult = order === 'asc' ? 1 : -1
    rows = [...rows].sort((a, b) => {
      let cmp = 0
      if (sort === 'full_name') cmp = a.full_name.localeCompare(b.full_name)
      else if (sort === 'email') cmp = a.email.localeCompare(b.email)
      else if (sort === 'status') cmp = a.status.localeCompare(b.status)
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return cmp * mult
    })
    return rows
  }, [
    regs,
    programFilter,
    participantStatusFilter,
    participantGenderFilter,
    participantSearch,
    participantDateFrom,
    participantDateTo,
    sort,
    order,
  ])

  useEffect(() => {
    if (tab === 'programs') {
      setSelectedRegIds(new Set())
      return
    }
    const visibleRows = tab === 'participants' ? filteredParticipantRegs : filteredRegs
    const visible = new Set(visibleRows.map((r) => r.id))
    setSelectedRegIds((prev) => {
      const next = new Set<string>()
      prev.forEach((id) => {
        if (visible.has(id)) next.add(id)
      })
      return next
    })
  }, [tab, filteredRegs, filteredParticipantRegs])

  useEffect(() => {
    if (tab !== 'participants') return
    const allowed = new Set(PARTICIPANT_BULK_OPTS.map((o) => o.value))
    if (!allowed.has(bulkStatus)) setBulkStatus('shortlisted')
  }, [tab, bulkStatus])

  const allFilteredSelected =
    filteredRegs.length > 0 && filteredRegs.every((r) => selectedRegIds.has(r.id))
  const someFilteredSelected =
    filteredRegs.length > 0 && filteredRegs.some((r) => selectedRegIds.has(r.id)) && !allFilteredSelected

  const allParticipantSelected =
    filteredParticipantRegs.length > 0 && filteredParticipantRegs.every((r) => selectedRegIds.has(r.id))
  const someParticipantSelected =
    filteredParticipantRegs.length > 0 &&
    filteredParticipantRegs.some((r) => selectedRegIds.has(r.id)) &&
    !allParticipantSelected

  const selectedCount = selectedRegIds.size

  function toggleRegSelect(id: string, checked: boolean) {
    setSelectedRegIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleSelectAllFiltered(checked: boolean) {
    if (checked) {
      setSelectedRegIds(new Set(filteredRegs.map((r) => r.id)))
    } else {
      setSelectedRegIds(new Set())
    }
  }

  function toggleSelectAllParticipants(checked: boolean) {
    if (checked) {
      setSelectedRegIds(new Set(filteredParticipantRegs.map((r) => r.id)))
    } else {
      setSelectedRegIds(new Set())
    }
  }

  function clearParticipantFilters() {
    setParticipantStatusFilter('all')
    setParticipantGenderFilter('all')
    setParticipantDateFrom('')
    setParticipantDateTo('')
    setParticipantSearch('')
  }

  function clearRegistrationFilters() {
    setRegistrationGenderFilter('all')
    setRegistrationDateFrom('')
    setRegistrationDateTo('')
  }

  function exportParticipantsExcel() {
    const rows = filteredParticipantRegs
    if (rows.length === 0) return
    const sheet = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Name: r.full_name,
        Email: r.email,
        Phone: r.phone ?? '',
        Location: r.location,
        Gender: formatGenderLabel(r.gender),
        Program: r.program?.title ?? '',
        Status: r.status.replace(/_/g, ' '),
        Registered: new Date(r.created_at).toLocaleString(),
      })),
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, 'Participants')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `participants-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function applyBulkStatus() {
    const ids = [...selectedRegIds]
    if (ids.length === 0) return
    setBulkSaving(true)
    setError(null)
    try {
      await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/dashboard/free-training-registrations/${id}`, {
            method: 'PATCH',
            headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: bulkStatus }),
          })
          const j = (await res.json()) as { success?: boolean; error?: string }
          if (!res.ok || !j.success) throw new Error(j.error ?? `Failed for ${id}`)
        }),
      )
      setSelectedRegIds(new Set())
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk update failed')
    } finally {
      setBulkSaving(false)
    }
  }

  async function deleteRegistration(id: string) {
    setDeleteBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/free-training-registrations/${id}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      const j = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !j.success) throw new Error(j.error ?? 'Delete failed')
      setReview((prev) => (prev?.id === id ? null : prev))
      setSelectedRegIds((prev) => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleteBusy(false)
    }
  }

  async function bulkDeleteRegistrations() {
    const ids = [...selectedRegIds]
    if (ids.length === 0) return
    setDeleteBusy(true)
    setError(null)
    try {
      await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/dashboard/free-training-registrations/${id}`, {
            method: 'DELETE',
            headers: dashboardAuthHeaders(),
          })
          const j = (await res.json()) as { success?: boolean; error?: string }
          if (!res.ok || !j.success) throw new Error(j.error ?? `Failed for ${id}`)
        }),
      )
      setReview((prev) => (prev && ids.includes(prev.id) ? null : prev))
      setSelectedRegIds(new Set())
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk delete failed')
    } finally {
      setDeleteBusy(false)
    }
  }

  function openCreate() {
    setEditId(null)
    setTitle('')
    setSlug('')
    setVenue('')
    setContent('')
    setOutcomes('')
    setSuccessMsg('')
    setIsActive(true)
    setCertDownloadEnabled(true)
    setCertSigUrl('')
    setFormOpen(true)
  }

  function openEdit(p: FreeProgram) {
    setEditId(p.id)
    setTitle(p.title)
    setSlug(p.slug)
    setVenue(p.venue_location)
    setContent(p.content)
    setOutcomes(p.outcomes)
    setSuccessMsg(p.success_message ?? '')
    setIsActive(p.is_active)
    setCertDownloadEnabled(p.certificate_download_enabled !== false)
    setCertSigUrl(
      typeof p.certificate_signature_image_url === 'string' ? p.certificate_signature_image_url : '',
    )
    setFormOpen(true)
  }

  async function saveProgram(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim() || slugifyTitle(title),
        venue_location: venue.trim(),
        content: content.trim(),
        outcomes: outcomes.trim(),
        success_message: successMsg.trim(),
        is_active: isActive,
        certificate_download_enabled: certDownloadEnabled,
      }
      if (certSigUrl.trim()) {
        body.certificate_signature_image_url = certSigUrl.trim()
      } else if (editId) {
        body.certificate_signature_image_url = ''
      }
      if (editId) {
        const res = await fetch(`/api/dashboard/free-training-programs/${editId}`, {
          method: 'PATCH',
          headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const j = (await res.json()) as { success?: boolean; error?: string }
        if (!res.ok || !j.success) throw new Error(j.error ?? 'Save failed')
      } else {
        const res = await fetch('/api/dashboard/free-training-programs', {
          method: 'POST',
          headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const j = (await res.json()) as { success?: boolean; error?: string }
        if (!res.ok || !j.success) throw new Error(j.error ?? 'Create failed')
      }
      setFormOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function setProgramCertificateDownload(p: FreeProgram, enabled: boolean) {
    setCertToggleBusyId(p.id)
    setError(null)
    const prevPrograms = programs
    setPrograms((rows) =>
      rows.map((r) => (r.id === p.id ? { ...r, certificate_download_enabled: enabled } : r)),
    )
    if (editId === p.id) setCertDownloadEnabled(enabled)
    try {
      const body: Record<string, unknown> = {
        title: p.title.trim(),
        slug: p.slug.trim(),
        venue_location: p.venue_location.trim(),
        content: p.content.trim(),
        outcomes: p.outcomes.trim(),
        success_message: (p.success_message ?? '').trim(),
        is_active: p.is_active,
        certificate_download_enabled: enabled,
      }
      if (p.certificate_signature_image_url) {
        body.certificate_signature_image_url = p.certificate_signature_image_url
      }
      const res = await fetch(`/api/dashboard/free-training-programs/${p.id}`, {
        method: 'PATCH',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = (await res.json()) as {
        success?: boolean
        error?: string
        data?: FreeProgram
      }
      if (!res.ok || !j.success) throw new Error(j.error ?? 'Update failed')
      if (j.data) {
        setPrograms((rows) => rows.map((r) => (r.id === p.id ? { ...r, ...j.data } : r)))
        if (editId === p.id) setCertDownloadEnabled(j.data.certificate_download_enabled !== false)
      }
    } catch (err) {
      setPrograms(prevPrograms)
      if (editId === p.id) {
        const orig = prevPrograms.find((x) => x.id === p.id)
        if (orig) setCertDownloadEnabled(orig.certificate_download_enabled !== false)
      }
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setCertToggleBusyId(null)
    }
  }

  async function deleteProgram(id: string) {
    if (!confirm('Delete this program and all its registrations?')) return
    const res = await fetch(`/api/dashboard/free-training-programs/${id}`, {
      method: 'DELETE',
      headers: dashboardAuthHeaders(),
    })
    const j = (await res.json()) as { success?: boolean; error?: string }
    if (!res.ok || !j.success) {
      setError(j.error ?? 'Delete failed')
      return
    }
    await load()
  }

  function copyLink(slug: string) {
    void navigator.clipboard.writeText(`${shareBase}${slug}`)
  }

  function openReview(r: FreeReg) {
    setReview(r)
    setReviewStatus(r.status)
    setReviewGender(r.gender ?? '')
    setReviewNotes(r.admin_notes ?? '')
  }

  async function saveReview() {
    if (!review) return
    setReviewSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/free-training-registrations/${review.id}`, {
        method: 'PATCH',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          admin_notes: reviewNotes.trim() || null,
          gender: reviewGender === '' ? '' : reviewGender,
        }),
      })
      const j = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !j.success) throw new Error(j.error ?? 'Update failed')
      setReview(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setReviewSaving(false)
    }
  }

  function toggleSort(col: typeof sort) {
    if (sort === col) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    else {
      setSort(col)
      setOrder(col === 'created_at' ? 'desc' : 'asc')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          From <span className="font-medium text-brand-navy">Registrations</span>, set status to{' '}
          <span className="font-medium text-brand-navy">Precepts</span> (or Shortlisted) so they appear under Participants.
          From <span className="font-medium text-brand-navy">Participants</span>, use bulk status{' '}
          <span className="font-medium text-brand-navy">Pending review (return to Registrations)</span> to send someone
          back to the main registration list, or Shortlisted / Precepts to move within the pipeline.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn('mr-2 size-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error ? <p className="text-destructive text-sm font-medium">{error}</p> : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full gap-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-brand-mint/40 p-1 sm:w-fit">
          <TabsTrigger
            value="programs"
            className="data-[state=active]:bg-brand-navy data-[state=active]:text-white"
          >
            <Gift className="mr-2 size-4" />
            Programs
          </TabsTrigger>
          <TabsTrigger
            value="registrations"
            className="data-[state=active]:bg-brand-navy data-[state=active]:text-white"
          >
            <Users className="mr-2 size-4" />
            Registrations
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="data-[state=active]:bg-brand-navy data-[state=active]:text-white"
          >
            <UserCheck className="mr-2 size-4" />
            Participants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-0 space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-brand-teal text-white hover:bg-brand-teal-hover"
              onClick={openCreate}
            >
              <Plus className="mr-2 size-4" />
              New free training
            </Button>
          </div>
          <Card className="border-brand-navy/12">
            <CardHeader className="border-b border-brand-navy/8 bg-brand-mint/20">
              <CardTitle className="flex items-center gap-2 text-brand-navy">
                <Gift className="size-5 text-brand-teal" />
                Programs &amp; share links
              </CardTitle>
              <CardDescription>Copy the registration link and share it (WhatsApp, email, social).</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-muted-foreground p-6 text-sm">Loading…</p>
              ) : programs.length === 0 ? (
                <p className="text-muted-foreground p-6 text-sm">No programs yet — create one to get a share link.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                      <TableHead className="font-semibold text-white">Title</TableHead>
                      <TableHead className="font-semibold text-white">Slug</TableHead>
                      <TableHead className="font-semibold text-white">Active</TableHead>
                      <TableHead className="text-right font-semibold text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((p) => (
                      <TableRow key={p.id} className="odd:bg-white even:bg-brand-mint/10">
                        <TableCell className="font-medium text-brand-navy">{p.title}</TableCell>
                        <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                        <TableCell>{p.is_active ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <div
                              className="inline-flex items-center gap-1 rounded-md border border-brand-navy/15 bg-white px-1.5 py-0.5 shadow-sm"
                              title="Certificate download on the public training page"
                            >
                              <Award className="size-3.5 shrink-0 text-brand-teal" aria-hidden />
                              {certToggleBusyId === p.id ? (
                                <Loader2 className="size-3.5 animate-spin text-brand-navy" aria-label="Updating" />
                              ) : (
                                <Switch
                                  className="scale-90"
                                  checked={p.certificate_download_enabled !== false}
                                  disabled={certToggleBusyId !== null}
                                  onCheckedChange={(v) => void setProgramCertificateDownload(p, v === true)}
                                  aria-label={`Certificate download for ${p.title}`}
                                />
                              )}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => copyLink(p.slug)}>
                              <ClipboardCopy className="mr-1 size-3.5" />
                              Copy link
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => openEdit(p)}>
                              <Pencil className="mr-1 size-3.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => void deleteProgram(p.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="mt-0">
          <Card className="border-brand-navy/12">
            <CardHeader className="border-b border-brand-navy/8 bg-brand-mint/20">
              <CardTitle className="flex items-center gap-2 text-brand-navy">
                <Users className="size-5 text-brand-teal" />
                Registrations
              </CardTitle>
              <CardDescription>
                Filter by program, gender, and registration date range. Select rows and set status in bulk (default{' '}
                <span className="font-medium text-brand-navy">Precepts</span> moves them into the Participants tab). Open
                one row for full review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="rounded-xl border border-brand-navy/10 bg-brand-mint/15 p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-navy">Filters</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-slate-600"
                    onClick={clearRegistrationFilters}
                  >
                    Clear date &amp; gender filters
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ft-filter" className="text-xs font-medium text-slate-600">
                      Program
                    </Label>
                    <Select value={programFilter} onValueChange={setProgramFilter}>
                      <SelectTrigger id="ft-filter" className="h-10 border-brand-navy/20 bg-white">
                        <SelectValue placeholder="All programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All programs</SelectItem>
                        {programs.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Gender</Label>
                    <Select
                      value={registrationGenderFilter}
                      onValueChange={(v) => setRegistrationGenderFilter(v as typeof registrationGenderFilter)}
                    >
                      <SelectTrigger className="h-10 border-brand-navy/20 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unspecified">Not specified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ft-reg-from" className="text-xs font-medium text-slate-600">
                      Registered from
                    </Label>
                    <Input
                      id="ft-reg-from"
                      type="date"
                      value={registrationDateFrom}
                      onChange={(e) => setRegistrationDateFrom(e.target.value)}
                      className="h-10 border-brand-navy/20 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ft-reg-to" className="text-xs font-medium text-slate-600">
                      Registered to
                    </Label>
                    <Input
                      id="ft-reg-to"
                      type="date"
                      value={registrationDateTo}
                      onChange={(e) => setRegistrationDateTo(e.target.value)}
                      className="h-10 border-brand-navy/20 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                {filteredRegs.length > 0 ? (
                  <div className="flex w-full flex-col gap-2 rounded-xl border border-brand-navy/10 bg-brand-mint/20 p-3 sm:w-auto sm:flex-row sm:items-center">
                    <span className="text-sm font-medium text-brand-navy">
                      {selectedCount} selected
                      {selectedCount > 0 ? (
                        <span className="text-muted-foreground font-normal"> · apply status to all selected</span>
                      ) : null}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={bulkStatus} onValueChange={setBulkStatus}>
                        <SelectTrigger className="w-[min(100%,200px)] border-brand-navy/20 bg-white">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="border border-brand-navy/15 bg-white"
                        disabled={selectedCount === 0 || bulkSaving || deleteBusy}
                        onClick={() => void applyBulkStatus()}
                      >
                        {bulkSaving ? <Loader2 className="size-4 animate-spin" /> : 'Apply to selected'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        disabled={selectedCount === 0 || deleteBusy || bulkSaving}
                        onClick={() => void bulkDeleteRegistrations()}
                      >
                        {deleteBusy ? <Loader2 className="size-4 animate-spin" /> : 'Delete selected'}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              {loading ? (
                <Loader2 className="size-8 animate-spin text-brand-teal" />
              ) : filteredRegs.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {regs.length === 0
                    ? 'No registrations yet.'
                    : 'No registrations match these filters. Try another program, gender, or date range.'}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-brand-navy/10">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-brand-navy hover:bg-brand-navy">
                        <TableHead className="w-12 pl-3">
                          <Checkbox
                            checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
                            onCheckedChange={(v) => toggleSelectAllFiltered(v === true)}
                            aria-label="Select all rows in this list"
                            className="border-white/70 data-[state=checked]:border-white data-[state=checked]:bg-brand-teal"
                          />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer font-semibold text-white"
                          onClick={() => toggleSort('full_name')}
                        >
                          Name {sort === 'full_name' ? (order === 'asc' ? '↑' : '↓') : ''}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer font-semibold text-white"
                          onClick={() => toggleSort('email')}
                        >
                          Email {sort === 'email' ? (order === 'asc' ? '↑' : '↓') : ''}
                        </TableHead>
                        <TableHead className="font-semibold text-white">Gender</TableHead>
                        <TableHead className="font-semibold text-white">Location</TableHead>
                        <TableHead
                          className="cursor-pointer font-semibold text-white"
                          onClick={() => toggleSort('status')}
                        >
                          Status {sort === 'status' ? (order === 'asc' ? '↑' : '↓') : ''}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer font-semibold text-white"
                          onClick={() => toggleSort('created_at')}
                        >
                          Date {sort === 'created_at' ? (order === 'asc' ? '↑' : '↓') : ''}
                        </TableHead>
                        <TableHead className="text-right font-semibold text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegs.map((r) => (
                        <TableRow key={r.id} className="odd:bg-white even:bg-brand-mint/10">
                          <TableCell className="pl-3" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedRegIds.has(r.id)}
                              onCheckedChange={(v) => toggleRegSelect(r.id, v === true)}
                              aria-label={`Select ${r.full_name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{r.full_name}</TableCell>
                          <TableCell className="text-sm">{r.email}</TableCell>
                          <TableCell className="text-sm text-slate-600">{formatGenderLabel(r.gender)}</TableCell>
                          <TableCell className="max-w-[140px] truncate text-sm">{r.location}</TableCell>
                          <TableCell className="text-sm capitalize">{r.status.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-slate-600">
                            {new Date(r.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-1">
                              <Button type="button" size="sm" variant="outline" onClick={() => openReview(r)}>
                                Review
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                disabled={deleteBusy}
                                onClick={() => void deleteRegistration(r.id)}
                                aria-label={`Delete ${r.full_name}`}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-0">
          <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-brand-navy/10 sm:rounded-2xl">
            <CardHeader className="relative border-b border-brand-navy/10 bg-gradient-to-r from-brand-navy via-brand-navy to-brand-teal/90 px-4 py-5 text-white sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
                    <UserCheck className="size-6 shrink-0 text-brand-mint" />
                    Participants &amp; precepts
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-sm text-white/85">
                    Filter by program, dates, gender, and status. Export to Excel. Bulk status includes{' '}
                    <span className="font-medium text-brand-mint/95">Pending review (return to Registrations)</span> to
                    remove someone from this pipeline, or Shortlisted / Precepts to adjust the step.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={loading || filteredParticipantRegs.length === 0}
                  onClick={exportParticipantsExcel}
                  className="shrink-0 border border-white/25 bg-white/15 text-white shadow-md backdrop-blur-sm hover:bg-white/25"
                >
                  <Download className="mr-2 size-4" />
                  Download Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 bg-gradient-to-b from-brand-mint/20 via-white to-slate-50/80 p-4 sm:p-6">
              <div className="rounded-2xl border border-brand-navy/10 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <SlidersHorizontal className="size-4 text-brand-teal" aria-hidden />
                  <span className="text-sm font-semibold text-brand-navy">Advanced filters</span>
                  <Badge variant="secondary" className="ml-auto font-normal sm:ml-0">
                    {filteredParticipantRegs.length} shown
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 text-xs text-slate-600"
                    onClick={clearParticipantFilters}
                  >
                    Clear filters
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                    <Label htmlFor="ft-pp-search" className="text-xs font-medium text-slate-600">
                      Search
                    </Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="ft-pp-search"
                        value={participantSearch}
                        onChange={(e) => setParticipantSearch(e.target.value)}
                        placeholder="Name, email, phone, location…"
                        className="h-10 border-brand-navy/15 pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ft-filter-participants" className="text-xs font-medium text-slate-600">
                      Program
                    </Label>
                    <Select value={programFilter} onValueChange={setProgramFilter}>
                      <SelectTrigger id="ft-filter-participants" className="h-10 border-brand-navy/20">
                        <SelectValue placeholder="All programs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All programs</SelectItem>
                        {programs.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Pipeline status</Label>
                    <Select
                      value={participantStatusFilter}
                      onValueChange={(v) => setParticipantStatusFilter(v as typeof participantStatusFilter)}
                    >
                      <SelectTrigger className="h-10 border-brand-navy/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Shortlisted + Precepts</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted only</SelectItem>
                        <SelectItem value="precepts">Precepts only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Gender</Label>
                    <Select
                      value={participantGenderFilter}
                      onValueChange={(v) => setParticipantGenderFilter(v as typeof participantGenderFilter)}
                    >
                      <SelectTrigger className="h-10 border-brand-navy/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unspecified">Not specified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ft-pp-from" className="text-xs font-medium text-slate-600">
                      Registered from
                    </Label>
                    <Input
                      id="ft-pp-from"
                      type="date"
                      value={participantDateFrom}
                      onChange={(e) => setParticipantDateFrom(e.target.value)}
                      className="h-10 border-brand-navy/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ft-pp-to" className="text-xs font-medium text-slate-600">
                      Registered to
                    </Label>
                    <Input
                      id="ft-pp-to"
                      type="date"
                      value={participantDateTo}
                      onChange={(e) => setParticipantDateTo(e.target.value)}
                      className="h-10 border-brand-navy/20"
                    />
                  </div>
                </div>
              </div>

              {filteredParticipantRegs.length > 0 ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-brand-teal/30 bg-gradient-to-r from-brand-mint/40 to-brand-mint/15 p-4 shadow-inner sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-brand-navy">
                    {selectedCount} selected
                    {selectedCount > 0 ? (
                      <span className="text-muted-foreground font-normal"> · bulk status or delete</span>
                    ) : null}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={bulkStatus} onValueChange={setBulkStatus}>
                      <SelectTrigger className="w-[min(100%,220px)] border-brand-navy/20 bg-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTICIPANT_BULK_OPTS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="border border-brand-navy/15 bg-white"
                      disabled={selectedCount === 0 || bulkSaving || deleteBusy}
                      onClick={() => void applyBulkStatus()}
                    >
                      {bulkSaving ? <Loader2 className="size-4 animate-spin" /> : 'Apply to selected'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10"
                      disabled={selectedCount === 0 || deleteBusy || bulkSaving}
                      onClick={() => void bulkDeleteRegistrations()}
                    >
                      {deleteBusy ? <Loader2 className="size-4 animate-spin" /> : 'Delete selected'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="size-10 animate-spin text-brand-teal" />
                </div>
              ) : !hasPipelineRegs ? (
                <p className="text-muted-foreground rounded-xl border border-dashed border-brand-navy/20 bg-white/60 px-4 py-10 text-center text-sm">
                  No participants in this pipeline yet. In <strong className="text-brand-navy">Registrations</strong>, set
                  status to <strong className="text-brand-navy">Shortlisted</strong> (then <strong>Precepts</strong> when
                  ready).
                </p>
              ) : filteredParticipantRegs.length === 0 ? (
                <p className="text-muted-foreground rounded-xl border border-dashed border-amber-200/80 bg-amber-50/50 px-4 py-10 text-center text-sm">
                  No rows match these filters. Try widening the date range, clearing search, or reset filters.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-brand-navy/10 bg-white shadow-md">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                          <TableHead className="w-12 pl-3">
                            <Checkbox
                              checked={allParticipantSelected ? true : someParticipantSelected ? 'indeterminate' : false}
                              onCheckedChange={(v) => toggleSelectAllParticipants(v === true)}
                              aria-label="Select all participants in this list"
                              className="border-white/70 data-[state=checked]:border-white data-[state=checked]:bg-brand-teal"
                            />
                          </TableHead>
                          <TableHead
                            className="cursor-pointer font-semibold text-white"
                            onClick={() => toggleSort('full_name')}
                          >
                            Name {sort === 'full_name' ? (order === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead
                            className="cursor-pointer font-semibold text-white"
                            onClick={() => toggleSort('email')}
                          >
                            Email {sort === 'email' ? (order === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="font-semibold text-white">Gender</TableHead>
                          <TableHead className="font-semibold text-white">Location</TableHead>
                          <TableHead className="font-semibold text-white">Program</TableHead>
                          <TableHead
                            className="cursor-pointer font-semibold text-white"
                            onClick={() => toggleSort('status')}
                          >
                            Status {sort === 'status' ? (order === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead
                            className="cursor-pointer font-semibold text-white"
                            onClick={() => toggleSort('created_at')}
                          >
                            Registered {sort === 'created_at' ? (order === 'asc' ? '↑' : '↓') : ''}
                          </TableHead>
                          <TableHead className="text-right font-semibold text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParticipantRegs.map((r) => (
                          <TableRow
                            key={r.id}
                            className="border-brand-navy/5 transition-colors odd:bg-white even:bg-slate-50/80 hover:bg-brand-mint/25"
                          >
                            <TableCell className="pl-3" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedRegIds.has(r.id)}
                                onCheckedChange={(v) => toggleRegSelect(r.id, v === true)}
                                aria-label={`Select ${r.full_name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium text-brand-navy">{r.full_name}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm text-slate-700">{r.email}</TableCell>
                            <TableCell className="text-sm text-slate-600">{formatGenderLabel(r.gender)}</TableCell>
                            <TableCell className="max-w-[120px] truncate text-sm">{r.location}</TableCell>
                            <TableCell className="max-w-[160px] truncate text-sm text-slate-700">
                              {r.program?.title ?? '—'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn('capitalize', statusBadgeClass(r.status))}
                              >
                                {r.status.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs tabular-nums text-slate-600">
                              {new Date(r.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap justify-end gap-1">
                                <Button type="button" size="sm" variant="outline" onClick={() => openReview(r)}>
                                  Review
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  disabled={deleteBusy}
                                  onClick={() => void deleteRegistration(r.id)}
                                  aria-label={`Delete ${r.full_name}`}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[min(92dvh,800px)] max-w-2xl overflow-y-auto">
          <form onSubmit={saveProgram}>
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit free training' : 'New free training'}</DialogTitle>
              <DialogDescription>
                Slug appears in the URL: /training/free/your-slug. You can edit the auto-generated slug if needed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ft-title">Title *</Label>
                <Input
                  id="ft-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  onBlur={() => {
                    if (!editId && !slug) setSlug(slugifyTitle(title))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ft-slug">URL slug *</Label>
                <Input
                  id="ft-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  required
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ft-venue">Venue / location (shown publicly) *</Label>
                <Input id="ft-venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ft-content">Training content (what the session covers) *</Label>
                <Textarea id="ft-content" rows={5} value={content} onChange={(e) => setContent(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ft-out">Outcomes (what participants will gain) *</Label>
                <Textarea id="ft-out" rows={4} value={outcomes} onChange={(e) => setOutcomes(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ft-succ">Message after registration (shortlist notice)</Label>
                <Textarea
                  id="ft-succ"
                  rows={3}
                  value={successMsg}
                  onChange={(e) => setSuccessMsg(e.target.value)}
                  placeholder="Thank you… If shortlisted, we will contact you…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ft-certsig">Certificate signature image (optional)</Label>
                <Input
                  id="ft-certsig"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={certSigUploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ''
                    if (!f) return
                    setCertSigUploading(true)
                    void uploadDashboardFile(f, 'certificates')
                      .then((url) => setCertSigUrl(url))
                      .catch((err: unknown) =>
                        setError(err instanceof Error ? err.message : 'Signature upload failed'),
                      )
                      .finally(() => setCertSigUploading(false))
                  }}
                />
                <p className="text-muted-foreground text-xs">
                  Shown on PDF certificates for this program. PNG or JPG; stored under public uploads.
                </p>
                {certSigUrl ? (
                  <div className="flex flex-wrap items-end gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={certSigUrl}
                      alt=""
                      className="max-h-16 max-w-[200px] rounded border border-brand-navy/15 object-contain"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => setCertSigUrl('')}>
                      Remove signature
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ft-act" checked={isActive} onCheckedChange={(v) => setIsActive(v === true)} />
                <Label htmlFor="ft-act" className="cursor-pointer font-normal">
                  Program is open for registration (listed publicly)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ft-cert"
                  checked={certDownloadEnabled}
                  onCheckedChange={(v) => setCertDownloadEnabled(v === true)}
                />
                <Label htmlFor="ft-cert" className="cursor-pointer font-normal">
                  Allow certificate download on the public page (Shortlisted or Precepts only; same phone as registration)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-brand-navy">
                {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!review} onOpenChange={(o) => !o && setReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review registration</DialogTitle>
            <DialogDescription>
              {review?.full_name} — {review?.email}
            </DialogDescription>
          </DialogHeader>
          {review ? (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium text-brand-navy">Phone:</span> {review.phone || '—'}
              </p>
              <p>
                <span className="font-medium text-brand-navy">Location:</span> {review.location}
              </p>
              {review.message ? (
                <p className="whitespace-pre-wrap">
                  <span className="font-medium text-brand-navy">Message:</span> {review.message}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={reviewGender === '' || (reviewGender !== 'male' && reviewGender !== 'female') ? 'unspecified' : reviewGender}
                  onValueChange={(v) => setReviewGender(v === 'unspecified' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unspecified">Not specified</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adm-notes">Internal notes</Label>
                <Textarea
                  id="adm-notes"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Notes visible only in dashboard"
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReview(null)}>
              Close
            </Button>
            <Button type="button" className="bg-brand-teal" disabled={reviewSaving} onClick={() => void saveReview()}>
              {reviewSaving ? <Loader2 className="size-4 animate-spin" /> : 'Save review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
