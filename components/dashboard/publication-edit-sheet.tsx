'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AlignLeft, BookOpen, Download, FileText, ImageIcon, Loader2, Tag, Type } from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getApiBase } from '@/lib/api'
import { dashboardAuthHeaders } from '@/lib/dashboard-client'
import { uploadDashboardFile } from '@/lib/dashboard-upload'
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

type Props = {
  publicationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function PublicationEditSheet({ publicationId, open, onOpenChange, onSaved }: Props) {
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [existingCover, setExistingCover] = useState<string | null>(null)
  const [existingPdf, setExistingPdf] = useState<string | null>(null)
  const [pdfReadInBrowser, setPdfReadInBrowser] = useState(false)

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null)
      return
    }
    const url = URL.createObjectURL(coverFile)
    setCoverPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [coverFile])

  useEffect(() => {
    if (!open || !publicationId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${getApiBase()}/api/publications/${publicationId}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        const json = (await res.json()) as { success?: boolean; data?: Record<string, unknown> }
        if (cancelled) return
        if (!res.ok || !json.success || !json.data) {
          setError('Could not load publication.')
          return
        }
        const d = json.data
        setTitle(String(d.title ?? ''))
        setCategory(String(d.category ?? ''))
        setExcerpt(String(d.excerpt ?? ''))
        const c = d.cover_image_url
        const f = d.file_url
        setExistingCover(typeof c === 'string' && c.trim() ? c.trim() : null)
        setExistingPdf(typeof f === 'string' && f.trim() ? f.trim() : null)
        const mode = d.file_display_mode
        setPdfReadInBrowser(
          typeof mode === 'string' && mode.trim().toLowerCase() === 'read',
        )
        setCoverFile(null)
        setPdfFile(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, publicationId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!publicationId) return
    setError(null)
    const t = title.trim()
    if (!t) {
      setError('Title is required.')
      return
    }
    setPending(true)
    try {
      let coverUrl: string | undefined
      let fileUrl: string | undefined
      if (coverFile) {
        coverUrl = await uploadDashboardFile(coverFile, 'publications')
      }
      if (pdfFile) {
        fileUrl = await uploadDashboardFile(pdfFile, 'publications')
      }

      const payload: Record<string, unknown> = { title: t }
      if (category.trim()) payload.category = category.trim()
      else payload.category = null
      if (excerpt.trim()) payload.excerpt = excerpt.trim()
      else payload.excerpt = null
      if (coverUrl) payload.cover_image_url = coverUrl
      else if (existingCover) payload.cover_image_url = existingCover
      if (fileUrl) payload.file_url = fileUrl
      else if (existingPdf) payload.file_url = existingPdf
      payload.file_display_mode = pdfReadInBrowser ? 'read' : 'download'

      const res = await fetch(`/api/dashboard/publications/${publicationId}`, {
        method: 'PATCH',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? `Save failed (${res.status})`)
        return
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={dashboardSheetWide}>
        <div className={dashboardSheetHeader}>
          <SheetTitle className={dashboardSheetTitle}>Edit publication</SheetTitle>
          <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
            Update metadata and replace files if needed.
          </SheetDescription>
        </div>

        {loading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-8">
            <Loader2 className="size-8 animate-spin text-brand-teal" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={dashboardSheetForm}>
              <div className={cn(dashboardSheetBody, 'space-y-5 pb-2')}>
                <DashboardFormField label="Title" htmlFor="epub-title" icon={Type}>
                  <Input
                    id="epub-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className={dashboardFormInputClass}
                  />
                </DashboardFormField>

                <DashboardFormField label="Category (optional)" htmlFor="epub-cat" icon={Tag}>
                  <Input
                    id="epub-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={dashboardFormInputClass}
                  />
                </DashboardFormField>

                <DashboardFormField label="New cover (optional)" htmlFor="epub-cover" icon={ImageIcon}>
                  <Input
                    id="epub-cover"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  />
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverPreview}
                      alt=""
                      className="mt-2 max-h-36 w-full rounded-lg border object-cover"
                    />
                  ) : existingCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={existingCover}
                      alt=""
                      className="mt-2 max-h-36 w-full rounded-lg border object-cover"
                    />
                  ) : null}
                </DashboardFormField>

                <DashboardFormField label="New PDF (optional)" htmlFor="epub-pdf" icon={FileText}>
                  <Input
                    id="epub-pdf"
                    type="file"
                    accept="application/pdf"
                    className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                  {existingPdf && !pdfFile ? (
                    <p className="text-muted-foreground mt-1 font-mono text-xs">{existingPdf}</p>
                  ) : null}
                </DashboardFormField>

                <div className="flex flex-col gap-3 rounded-xl border border-brand-navy/10 bg-brand-mint/15 px-4 py-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                      <BookOpen className="size-4 shrink-0 text-brand-teal" aria-hidden />
                      PDF on the public site
                    </div>
                    <p className="text-muted-foreground text-xs leading-snug">
                      Choose one: <span className="font-medium text-brand-navy/90">Download</span> or{' '}
                      <span className="font-medium text-brand-navy/90">Read</span> — checking one unchecks the other.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <label
                      htmlFor="epub-mode-download"
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                        !pdfReadInBrowser
                          ? 'border-brand-teal/50 bg-white/80 shadow-sm'
                          : 'border-transparent hover:bg-brand-mint/40',
                      )}
                    >
                      <Checkbox
                        id="epub-mode-download"
                        checked={!pdfReadInBrowser}
                        onCheckedChange={(v) => {
                          if (v === true) setPdfReadInBrowser(false)
                          else setPdfReadInBrowser(true)
                        }}
                        className="mt-0.5 border-brand-navy/30 data-[state=checked]:border-brand-teal data-[state=checked]:bg-brand-teal"
                        aria-label="Download first (new tab)"
                      />
                      <span className="font-normal leading-snug">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
                          <Download className="size-3.5 shrink-0 text-brand-teal" aria-hidden />
                          Download
                        </span>
                        <span className="text-muted-foreground mt-0.5 block text-xs">
                          Primary action: open PDF in a new tab.
                        </span>
                      </span>
                    </label>
                    <label
                      htmlFor="epub-mode-read"
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                        pdfReadInBrowser
                          ? 'border-brand-teal/50 bg-white/80 shadow-sm'
                          : 'border-transparent hover:bg-brand-mint/40',
                      )}
                    >
                      <Checkbox
                        id="epub-mode-read"
                        checked={pdfReadInBrowser}
                        onCheckedChange={(v) => {
                          if (v === true) setPdfReadInBrowser(true)
                          else setPdfReadInBrowser(false)
                        }}
                        className="mt-0.5 border-brand-navy/30 data-[state=checked]:border-brand-teal data-[state=checked]:bg-brand-teal"
                        aria-label="Read in browser (popup)"
                      />
                      <span className="font-normal leading-snug">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
                          <BookOpen className="size-3.5 shrink-0 text-brand-teal" aria-hidden />
                          Read
                        </span>
                        <span className="text-muted-foreground mt-0.5 block text-xs">
                          In-app reader popup (read-focused).
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <DashboardFormField label="Description" htmlFor="epub-ex" icon={AlignLeft}>
                  <Textarea
                    id="epub-ex"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                    className={cn(dashboardFormTextareaClass, 'resize-y')}
                  />
                </DashboardFormField>

                {error ? <p className="text-destructive text-sm font-medium">{error}</p> : null}
              </div>

              <div className={dashboardSheetFooter}>
                <Button
                  type="button"
                  variant="outline"
                  className="border-brand-navy/25 text-brand-navy hover:bg-brand-mint/50"
                  onClick={() => onOpenChange(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending} className="bg-brand-navy hover:brightness-110">
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
