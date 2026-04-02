'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  GraduationCap,
  Layers,
  Loader2,
  Minus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import { dashboardAuthHeaders } from '@/lib/dashboard-client'
import { uploadDashboardFile } from '@/lib/dashboard-upload'
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
import { cn } from '@/lib/utils'
import { DashboardTablePaginationBar } from '@/components/dashboard/dashboard-table-pagination'

type Props = {
  academies: Record<string, unknown>[]
  trainings: Record<string, unknown>[]
  loading: boolean
  onRefresh: () => void
}

export function TrainingsManage({ academies, trainings, loading, onRefresh }: Props) {
  const [academyOpen, setAcademyOpen] = useState(false)
  const [academyPending, setAcademyPending] = useState(false)
  const [academyErr, setAcademyErr] = useState<string | null>(null)
  const [aName, setAName] = useState('')
  const [aDesc, setADesc] = useState('')
  const [aSort, setASort] = useState('0')

  const [trainOpen, setTrainOpen] = useState(false)
  const [trainPending, setTrainPending] = useState(false)
  const [trainErr, setTrainErr] = useState<string | null>(null)
  const [tTitle, setTTitle] = useState('')
  const [tDesc, setTDesc] = useState('')
  const [tSlug, setTSlug] = useState('')
  const [tAcademy, setTAcademy] = useState('')
  const [tDuration, setTDuration] = useState('')
  const [tFormat, setTFormat] = useState('')
  const [tLevel, setTLevel] = useState('')
  const [tCurriculum, setTCurriculum] = useState<{ title: string; detail: string }[]>([{ title: '', detail: '' }])
  const [tOutcomes, setTOutcomes] = useState('')
  const [tCertSigUrl, setTCertSigUrl] = useState('')
  const [certSigUploading, setCertSigUploading] = useState(false)

  const [editAcademyId, setEditAcademyId] = useState<string | null>(null)
  const [editTrainId, setEditTrainId] = useState<string | null>(null)

  const [delAcademy, setDelAcademy] = useState<{ id: string; name: string } | null>(null)
  const [delTrain, setDelTrain] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [academySearch, setAcademySearch] = useState('')
  const [academyPage, setAcademyPage] = useState(1)
  const [academyPageSize, setAcademyPageSize] = useState(10)

  const [trainSearch, setTrainSearch] = useState('')
  const [trainAcademyFilter, setTrainAcademyFilter] = useState<string>('all')
  const [trainPage, setTrainPage] = useState(1)
  const [trainPageSize, setTrainPageSize] = useState(10)

  const academyOptions = useMemo(
    () =>
      academies
        .map((a) => ({ id: String(a.id ?? ''), name: String(a.name ?? '') }))
        .filter((x) => x.id),
    [academies],
  )

  const filteredAcademies = useMemo(() => {
    const q = academySearch.trim().toLowerCase()
    if (!q) return academies
    return academies.filter((row) => {
      const name = String(row.name ?? '').toLowerCase()
      const sort = String(row.sort_order ?? '')
      return name.includes(q) || sort.includes(q)
    })
  }, [academies, academySearch])

  const academyTotalPages = Math.max(1, Math.ceil(filteredAcademies.length / academyPageSize))
  const academyPageSafe = Math.min(academyPage, academyTotalPages)

  const pagedAcademies = useMemo(() => {
    const start = (academyPageSafe - 1) * academyPageSize
    return filteredAcademies.slice(start, start + academyPageSize)
  }, [filteredAcademies, academyPageSafe, academyPageSize])

  useEffect(() => {
    setAcademyPage(1)
  }, [academySearch])

  useEffect(() => {
    setAcademyPage((p) => Math.min(p, academyTotalPages))
  }, [academyTotalPages])

  function trainingAcademyId(row: Record<string, unknown>): string {
    const aid = row.academy_id
    if (typeof aid === 'string') return aid
    if (aid != null) return String(aid)
    const ac = row.academy as Record<string, unknown> | undefined
    if (ac && typeof ac === 'object' && ac.id != null) return String(ac.id)
    return ''
  }

  const filteredTrainings = useMemo(() => {
    let rows = trainings
    if (trainAcademyFilter !== 'all') {
      rows = rows.filter((row) => trainingAcademyId(row) === trainAcademyFilter)
    }
    const q = trainSearch.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => {
      const title = String(row.title ?? '').toLowerCase()
      const ac = row.academy as Record<string, unknown> | undefined
      const an = ac && typeof ac.name === 'string' ? ac.name.toLowerCase() : ''
      return title.includes(q) || an.includes(q)
    })
  }, [trainings, trainAcademyFilter, trainSearch])

  const trainTotalPages = Math.max(1, Math.ceil(filteredTrainings.length / trainPageSize))
  const trainPageSafe = Math.min(trainPage, trainTotalPages)

  const pagedTrainings = useMemo(() => {
    const start = (trainPageSafe - 1) * trainPageSize
    return filteredTrainings.slice(start, start + trainPageSize)
  }, [filteredTrainings, trainPageSafe, trainPageSize])

  useEffect(() => {
    setTrainPage(1)
  }, [trainSearch, trainAcademyFilter])

  useEffect(() => {
    setTrainPage((p) => Math.min(p, trainTotalPages))
  }, [trainTotalPages])

  async function submitAcademy(e: FormEvent) {
    e.preventDefault()
    const name = aName.trim()
    if (!name) {
      setAcademyErr('Name is required.')
      return
    }
    setAcademyErr(null)
    setAcademyPending(true)
    try {
      const payload: Record<string, unknown> = {
        name,
        sort_order: Number.parseInt(aSort, 10) || 0,
      }
      if (aDesc.trim()) payload.description = aDesc.trim()

      const url = editAcademyId ? `/api/academies/${editAcademyId}` : '/api/academies'
      const res = await fetch(url, {
        method: editAcademyId ? 'PATCH' : 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setAcademyErr(data.error ?? 'Save failed')
        return
      }
      setAcademyOpen(false)
      setAName('')
      setADesc('')
      setASort('0')
      setEditAcademyId(null)
      onRefresh()
    } finally {
      setAcademyPending(false)
    }
  }

  async function submitTraining(e: FormEvent) {
    e.preventDefault()
    const title = tTitle.trim()
    if (!title) {
      setTrainErr('Title is required.')
      return
    }
    if (!tAcademy) {
      setTrainErr('Select an academy.')
      return
    }
    setTrainErr(null)
    setTrainPending(true)
    try {
      const curriculum = tCurriculum
        .map((c) => ({
          title: c.title.trim(),
          detail: c.detail.trim(),
        }))
        .filter((c) => c.title || c.detail)

      const outcomes = tOutcomes
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload: Record<string, unknown> = {
        title,
        academy_id: tAcademy,
        curriculum,
        outcomes,
      }
      if (tDesc.trim()) payload.description = tDesc.trim()
      if (tSlug.trim()) payload.slug = tSlug.trim()
      if (tDuration.trim()) payload.duration = tDuration.trim()
      if (tFormat.trim()) payload.format = tFormat.trim()
      if (tLevel.trim()) payload.level = tLevel.trim()
      if (editTrainId) {
        payload.certificate_signature_image_url = tCertSigUrl.trim() || null
      } else if (tCertSigUrl.trim()) {
        payload.certificate_signature_image_url = tCertSigUrl.trim()
      }

      const url = editTrainId ? `/api/trainings/${editTrainId}` : '/api/trainings'
      const res = await fetch(url, {
        method: editTrainId ? 'PATCH' : 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setTrainErr(data.error ?? 'Save failed')
        return
      }
      setTrainOpen(false)
      setTTitle('')
      setTDesc('')
      setTSlug('')
      setTAcademy('')
      setTDuration('')
      setTFormat('')
      setTLevel('')
      setTCurriculum([{ title: '', detail: '' }])
      setTOutcomes('')
      setTCertSigUrl('')
      setEditTrainId(null)
      onRefresh()
    } finally {
      setTrainPending(false)
    }
  }

  function openEditAcademy(row: Record<string, unknown>) {
    setEditAcademyId(String(row.id ?? ''))
    setAName(String(row.name ?? ''))
    setADesc(String(row.description ?? ''))
    setASort(String(row.sort_order ?? '0'))
    setAcademyErr(null)
    setAcademyOpen(true)
  }

  function openNewAcademy() {
    setEditAcademyId(null)
    setAName('')
    setADesc('')
    setASort('0')
    setAcademyErr(null)
    setAcademyOpen(true)
  }

  function openEditTrain(row: Record<string, unknown>) {
    setEditTrainId(String(row.id ?? ''))
    setTTitle(String(row.title ?? ''))
    setTDesc(String(row.description ?? ''))
    setTSlug(String(row.slug ?? ''))
    setTDuration(String(row.duration ?? ''))
    setTFormat(String(row.format ?? ''))
    setTLevel(String(row.level ?? ''))
    const aid = row.academy_id
    setTAcademy(typeof aid === 'string' ? aid : aid != null ? String(aid) : '')
    const cur = row.curriculum
    if (Array.isArray(cur) && cur.length > 0) {
      setTCurriculum(
        cur.map((x) => {
          if (x && typeof x === 'object') {
            const o = x as Record<string, unknown>
            return { title: String(o.title ?? ''), detail: String(o.detail ?? '') }
          }
          return { title: '', detail: '' }
        }),
      )
    } else {
      setTCurriculum([{ title: '', detail: '' }])
    }
    const out = row.outcomes
    if (Array.isArray(out) && out.length > 0) {
      setTOutcomes(out.map((x) => String(x)).join('\n'))
    } else {
      setTOutcomes('')
    }
    const csu = row.certificate_signature_image_url
    setTCertSigUrl(typeof csu === 'string' ? csu : '')
    setTrainErr(null)
    setTrainOpen(true)
  }

  function openNewTrain() {
    setEditTrainId(null)
    setTTitle('')
    setTDesc('')
    setTSlug('')
    setTDuration('')
    setTFormat('')
    setTLevel('')
    setTCurriculum([{ title: '', detail: '' }])
    setTOutcomes('')
    setTCertSigUrl('')
    setTAcademy(academyOptions[0]?.id ?? '')
    setTrainErr(null)
    setTrainOpen(true)
  }

  async function confirmDeleteAcademy() {
    if (!delAcademy) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/academies/${delAcademy.id}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Delete failed')
        return
      }
      setDelAcademy(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  async function confirmDeleteTrain() {
    if (!delTrain) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/trainings/${delTrain.id}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Delete failed')
        return
      }
      setDelTrain(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
        <div className="h-1 bg-brand-teal" />
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-brand-navy/8 bg-brand-mint/25 py-4">
          <div>
            <CardTitle className="text-lg text-brand-navy">Academies</CardTitle>
            <CardDescription className="text-slate-600">
              Create an academy first, then add trainings under it. Order uses sort (lower first).
            </CardDescription>
          </div>
          <Button
            type="button"
            className="border-0 bg-brand-navy text-white shadow-md hover:brightness-110"
            onClick={openNewAcademy}
          >
            <Plus className="mr-2 size-4" />
            New academy
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">Loading…</p>
          ) : academies.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">No academies yet.</p>
          ) : filteredAcademies.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">No academies match your search.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2 border-b border-brand-navy/8 bg-white px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search by name or sort…"
                    value={academySearch}
                    onChange={(e) => setAcademySearch(e.target.value)}
                    className="h-10 border-brand-navy/15 bg-brand-mint/20 pl-9 text-brand-navy placeholder:text-slate-400"
                    aria-label="Search academies"
                  />
                </div>
              </div>
              <div className="max-h-[min(420px,calc(100dvh-18rem))] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                      <TableHead className="sticky top-0 z-10 bg-brand-navy font-semibold text-white shadow-sm">Name</TableHead>
                      <TableHead className="sticky top-0 z-10 hidden bg-brand-navy font-semibold text-white shadow-sm sm:table-cell">
                        Sort
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 w-[100px] bg-brand-navy pr-4 text-right font-semibold text-white shadow-sm">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedAcademies.map((row) => {
                      const id = String(row.id ?? '')
                      return (
                        <TableRow key={id} className="odd:bg-white even:bg-brand-mint/15 hover:bg-brand-mint/35">
                          <TableCell className="font-medium text-brand-navy">{String(row.name ?? '')}</TableCell>
                          <TableCell className="hidden text-sm sm:table-cell">{String(row.sort_order ?? 0)}</TableCell>
                          <TableCell className="pr-4 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9"
                              onClick={() => openEditAcademy(row)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive size-9"
                              onClick={() => setDelAcademy({ id, name: String(row.name ?? '') })}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <DashboardTablePaginationBar
                page={academyPageSafe}
                totalPages={academyTotalPages}
                pageSize={academyPageSize}
                totalRows={filteredAcademies.length}
                onPageChange={setAcademyPage}
                onPageSizeChange={(n) => {
                  setAcademyPageSize(n)
                  setAcademyPage(1)
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
        <div className="h-1 bg-brand-teal" />
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-brand-navy/8 bg-brand-mint/25 py-4">
          <div>
            <CardTitle className="text-lg text-brand-navy">Trainings</CardTitle>
            <CardDescription className="text-slate-600">
              Full catalogue fields (duration, format, curriculum, outcomes) appear on the public Training page.
            </CardDescription>
          </div>
          <Button
            type="button"
            className="border-0 bg-brand-navy text-white shadow-md hover:brightness-110"
            onClick={openNewTrain}
            disabled={academyOptions.length === 0}
          >
            <GraduationCap className="mr-2 size-4" />
            New training
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">Loading…</p>
          ) : trainings.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">No trainings yet.</p>
          ) : filteredTrainings.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">No trainings match your filters.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2 border-b border-brand-navy/8 bg-white px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search title or academy…"
                    value={trainSearch}
                    onChange={(e) => setTrainSearch(e.target.value)}
                    className="h-10 border-brand-navy/15 bg-brand-mint/20 pl-9 text-brand-navy placeholder:text-slate-400"
                    aria-label="Search trainings"
                  />
                </div>
                <Select value={trainAcademyFilter} onValueChange={setTrainAcademyFilter}>
                  <SelectTrigger className="h-10 w-full border-brand-navy/15 bg-white sm:w-[min(100%,240px)]">
                    <SelectValue placeholder="Academy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All academies</SelectItem>
                    {academyOptions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="max-h-[min(480px,calc(100dvh-20rem))] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                      <TableHead className="sticky top-0 z-10 bg-brand-navy font-semibold text-white shadow-sm">Title</TableHead>
                      <TableHead className="sticky top-0 z-10 hidden bg-brand-navy font-semibold text-white shadow-sm md:table-cell">
                        Academy
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 w-[100px] bg-brand-navy pr-4 text-right font-semibold text-white shadow-sm">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedTrainings.map((row) => {
                      const id = String(row.id ?? '')
                      const ac = row.academy as Record<string, unknown> | undefined
                      const an = ac && typeof ac.name === 'string' ? ac.name : '—'
                      return (
                        <TableRow key={id} className="odd:bg-white even:bg-brand-mint/15 hover:bg-brand-mint/35">
                          <TableCell className="max-w-[min(320px,50vw)] font-medium text-brand-navy">
                            <span className="line-clamp-2">{String(row.title ?? '')}</span>
                          </TableCell>
                          <TableCell className="hidden text-sm md:table-cell">{an}</TableCell>
                          <TableCell className="pr-4 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9"
                              onClick={() => openEditTrain(row)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive size-9"
                              onClick={() => setDelTrain({ id, title: String(row.title ?? '') })}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <DashboardTablePaginationBar
                page={trainPageSafe}
                totalPages={trainTotalPages}
                pageSize={trainPageSize}
                totalRows={filteredTrainings.length}
                onPageChange={setTrainPage}
                onPageSizeChange={(n) => {
                  setTrainPageSize(n)
                  setTrainPage(1)
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={academyOpen}
        onOpenChange={(o) => {
          setAcademyOpen(o)
          if (!o) setEditAcademyId(null)
        }}
      >
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>{editAcademyId ? 'Edit academy' : 'New academy'}</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
              Academies group trainings on the website (e.g. Policy Academy).
            </SheetDescription>
          </div>
          <form onSubmit={submitAcademy} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Name" htmlFor="ac-name" icon={Layers}>
                <Input
                  id="ac-name"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                />
              </DashboardFormField>
              <DashboardFormField label="Description (optional)" htmlFor="ac-desc" icon={Layers}>
                <Textarea
                  id="ac-desc"
                  value={aDesc}
                  onChange={(e) => setADesc(e.target.value)}
                  rows={3}
                  className={cn(dashboardFormTextareaClass, 'resize-y')}
                />
              </DashboardFormField>
              <DashboardFormField label="Sort order" htmlFor="ac-sort" icon={Layers}>
                <Input
                  id="ac-sort"
                  type="number"
                  value={aSort}
                  onChange={(e) => setASort(e.target.value)}
                  className={dashboardFormInputClass}
                />
              </DashboardFormField>
              {academyErr ? <p className="text-destructive text-sm">{academyErr}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setAcademyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={academyPending} className="bg-brand-navy">
                {academyPending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={trainOpen}
        onOpenChange={(o) => {
          setTrainOpen(o)
          if (!o) setEditTrainId(null)
        }}
      >
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>{editTrainId ? 'Edit training' : 'New training'}</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
              Academy, summary, metadata bar, curriculum topics, and learning outcomes (like the PDF catalogue).
            </SheetDescription>
          </div>
          <form onSubmit={submitTraining} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
                <DashboardFormField label="Academy" htmlFor="tr-ac" icon={GraduationCap}>
                  <Select value={tAcademy} onValueChange={setTAcademy}>
                    <SelectTrigger id="tr-ac" className={dashboardFormInputClass}>
                      <SelectValue placeholder="Select academy" />
                    </SelectTrigger>
                    <SelectContent>
                      {academyOptions.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DashboardFormField>
                <DashboardFormField label="Course title" htmlFor="tr-t" icon={GraduationCap}>
                  <Input
                    id="tr-t"
                    value={tTitle}
                    onChange={(e) => setTTitle(e.target.value)}
                    className={dashboardFormInputClass}
                    required
                    placeholder="e.g. Course 1.1 — Strategic Business Planning"
                  />
                </DashboardFormField>
                <DashboardFormField
                  label="Description"
                  htmlFor="tr-d"
                  icon={GraduationCap}
                  hint="What participants gain from this course."
                >
                  <Textarea
                    id="tr-d"
                    value={tDesc}
                    onChange={(e) => setTDesc(e.target.value)}
                    rows={4}
                    className={cn(dashboardFormTextareaClass, 'resize-y')}
                  />
                </DashboardFormField>
                <div className="grid gap-3 sm:grid-cols-3">
                  <DashboardFormField label="Duration" htmlFor="tr-du" icon={GraduationCap}>
                    <Input
                      id="tr-du"
                      value={tDuration}
                      onChange={(e) => setTDuration(e.target.value)}
                      className={dashboardFormInputClass}
                      placeholder="5 Days"
                    />
                  </DashboardFormField>
                  <DashboardFormField label="Format" htmlFor="tr-fo" icon={GraduationCap}>
                    <Input
                      id="tr-fo"
                      value={tFormat}
                      onChange={(e) => setTFormat(e.target.value)}
                      className={dashboardFormInputClass}
                      placeholder="Workshop / In-person"
                    />
                  </DashboardFormField>
                  <DashboardFormField label="Level / audience" htmlFor="tr-lv" icon={GraduationCap}>
                    <Input
                      id="tr-lv"
                      value={tLevel}
                      onChange={(e) => setTLevel(e.target.value)}
                      className={dashboardFormInputClass}
                      placeholder="Intermediate – Advanced"
                    />
                  </DashboardFormField>
                </div>
                <DashboardFormField label="Slug (optional)" htmlFor="tr-s" icon={GraduationCap}>
                  <Input id="tr-s" value={tSlug} onChange={(e) => setTSlug(e.target.value)} className={dashboardFormInputClass} />
                </DashboardFormField>

                <DashboardFormField
                  label="Certificate signature image"
                  htmlFor="tr-certsig"
                  icon={GraduationCap}
                  hint="PNG or JPG, shown on PDF certificates for this course (optional)."
                >
                  <Input
                    id="tr-certsig"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={certSigUploading}
                    className={dashboardFormInputClass}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      if (!f) return
                      setCertSigUploading(true)
                      void uploadDashboardFile(f, 'certificates')
                        .then((url) => setTCertSigUrl(url))
                        .catch((err: unknown) =>
                          setTrainErr(err instanceof Error ? err.message : 'Signature upload failed'),
                        )
                        .finally(() => setCertSigUploading(false))
                    }}
                  />
                  {tCertSigUrl ? (
                    <div className="mt-2 flex flex-wrap items-end gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tCertSigUrl} alt="" className="max-h-16 max-w-[200px] rounded border border-brand-navy/15 object-contain" />
                      <Button type="button" variant="outline" size="sm" onClick={() => setTCertSigUrl('')}>
                        Remove signature
                      </Button>
                    </div>
                  ) : null}
                </DashboardFormField>

                <div className="space-y-2 rounded-lg border border-brand-navy/10 bg-brand-mint/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-brand-navy">Curriculum topics</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-brand-navy/20"
                      onClick={() => setTCurriculum((prev) => [...prev, { title: '', detail: '' }])}
                    >
                      <Plus className="mr-1 size-3.5" /> Add topic
                    </Button>
                  </div>
                  {tCurriculum.map((row, idx) => (
                    <div key={idx} className="space-y-2 rounded-md border border-white/60 bg-white/80 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">Topic {idx + 1}</span>
                        {tCurriculum.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => setTCurriculum((prev) => prev.filter((_, i) => i !== idx))}
                            aria-label="Remove topic"
                          >
                            <Minus className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                      <Input
                        placeholder="Topic title"
                        value={row.title}
                        onChange={(e) => {
                          const v = e.target.value
                          setTCurriculum((prev) => prev.map((r, i) => (i === idx ? { ...r, title: v } : r)))
                        }}
                        className={dashboardFormInputClass}
                      />
                      <Textarea
                        placeholder="Summary / sub-points (optional)"
                        value={row.detail}
                        onChange={(e) => {
                          const v = e.target.value
                          setTCurriculum((prev) => prev.map((r, i) => (i === idx ? { ...r, detail: v } : r)))
                        }}
                        rows={2}
                        className={cn(dashboardFormTextareaClass, 'resize-y text-sm')}
                      />
                    </div>
                  ))}
                </div>

                <DashboardFormField
                  label="Key learning outcomes"
                  htmlFor="tr-out"
                  icon={GraduationCap}
                  hint="One outcome per line."
                >
                  <Textarea
                    id="tr-out"
                    value={tOutcomes}
                    onChange={(e) => setTOutcomes(e.target.value)}
                    rows={5}
                    placeholder={'Conduct comprehensive analysis.\nDesign scalable processes.'}
                    className={cn(dashboardFormTextareaClass, 'resize-y font-mono text-sm')}
                  />
                </DashboardFormField>
                {trainErr ? <p className="text-destructive text-sm">{trainErr}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setTrainOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={trainPending} className="bg-brand-navy">
                {trainPending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={delAcademy !== null} onOpenChange={(o) => !o && setDelAcademy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete academy?</AlertDialogTitle>
            <AlertDialogDescription>
              Trainings under &quot;{delAcademy?.name}&quot; will be unlinked (not deleted). Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void confirmDeleteAcademy()
              }}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={delTrain !== null} onOpenChange={(o) => !o && setDelTrain(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete training?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &quot;{delTrain?.title}&quot;? Applications referencing it may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void confirmDeleteTrain()
              }}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
