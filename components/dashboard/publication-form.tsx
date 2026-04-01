'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AlignLeft, BookOpen, Download, FileText, ImageIcon, Loader2, Plus, Tag, Type } from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  onCreated: () => void
}

export function PublicationForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  /** When true, public page opens PDF in a reader dialog; when false, primary action is open/download in a new tab. */
  const [pdfReadInBrowser, setPdfReadInBrowser] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null)
      return
    }
    const url = URL.createObjectURL(coverFile)
    setCoverPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [coverFile])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
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
      if (excerpt.trim()) payload.excerpt = excerpt.trim()
      if (coverUrl) payload.cover_image_url = coverUrl
      if (fileUrl) payload.file_url = fileUrl
      payload.file_display_mode = pdfReadInBrowser ? 'read' : 'download'

      const res = await fetch('/api/dashboard/publications', {
        method: 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? `Save failed (${res.status})`)
        return
      }
      setOpen(false)
      setTitle('')
      setCategory('')
      setExcerpt('')
      setCoverFile(null)
      setPdfFile(null)
      setPdfReadInBrowser(false)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — is the API running?')
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          className="border-0 bg-brand-navy text-white shadow-md shadow-brand-navy/25 hover:brightness-110"
        >
          <Plus className="mr-2 size-4" />
          New publication
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={dashboardSheetWide}>
        <div className={dashboardSheetHeader}>
          <SheetTitle className={dashboardSheetTitle}>Add publication</SheetTitle>
          <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
            Files are stored under{' '}
            <span className="rounded bg-brand-mint/50 px-1 font-mono text-xs text-brand-navy">
              /files/publications/… (MinIO)
            </span>{' '}
            in this project. Cover is optional; add a PDF and choose whether visitors read it in the browser or use download-first.
          </SheetDescription>
        </div>

        <form onSubmit={handleSubmit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-5 pb-2')}>
              <DashboardFormField label="Title" htmlFor="pub-title" icon={Type}>
                <Input
                  id="pub-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Report or brief title"
                  required
                  autoComplete="off"
                  className={dashboardFormInputClass}
                />
              </DashboardFormField>

              <DashboardFormField
                label="Category (optional)"
                htmlFor="pub-category"
                icon={Tag}
                hint="e.g. Research Report, Policy Brief"
              >
                <Input
                  id="pub-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Research Report"
                  autoComplete="off"
                  className={dashboardFormInputClass}
                />
              </DashboardFormField>

              <DashboardFormField label="Cover image (optional)" htmlFor="pub-cover" icon={ImageIcon}>
                <Input
                  id="pub-cover"
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
                    className="mt-2 max-h-36 w-full rounded-lg border-2 border-brand-navy/10 object-cover shadow-inner"
                  />
                ) : null}
              </DashboardFormField>

              <DashboardFormField label="PDF file (optional)" htmlFor="pub-pdf" icon={FileText}>
                <Input
                  id="pub-pdf"
                  type="file"
                  accept="application/pdf"
                  className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
                {pdfFile ? (
                  <p className="flex items-center gap-2 text-xs font-medium text-brand-navy">
                    <FileText className="size-3.5 shrink-0 text-brand-teal" />
                    {pdfFile.name}
                  </p>
                ) : null}
              </DashboardFormField>

              <div className="flex flex-col gap-3 rounded-xl border border-brand-navy/10 bg-brand-mint/15 px-4 py-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                    <BookOpen className="size-4 shrink-0 text-brand-teal" aria-hidden />
                    PDF on the public site
                  </div>
                  <p className="text-muted-foreground text-xs leading-snug">
                    Dooro hal: <strong className="font-medium text-brand-navy/90">Download</strong> ama{' '}
                    <strong className="font-medium text-brand-navy/90">Read</strong> (checkbox midba midka kale wuu beddelayaa).
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <label
                    htmlFor="pub-mode-download"
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                      !pdfReadInBrowser
                        ? 'border-brand-teal/50 bg-white/80 shadow-sm'
                        : 'border-transparent hover:bg-brand-mint/40',
                    )}
                  >
                    <Checkbox
                      id="pub-mode-download"
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
                        Badhanka ugu weyn: fur / soo deji PDF (tab cusub).
                      </span>
                    </span>
                  </label>
                  <label
                    htmlFor="pub-mode-read"
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                      pdfReadInBrowser
                        ? 'border-brand-teal/50 bg-white/80 shadow-sm'
                        : 'border-transparent hover:bg-brand-mint/40',
                    )}
                  >
                    <Checkbox
                      id="pub-mode-read"
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
                        Akhris popup-ka ku jirta (akhristaha PDF).
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <DashboardFormField
                label="Short description (optional)"
                htmlFor="pub-excerpt"
                icon={AlignLeft}
                hint="Shown on the publications hub."
              >
                <Textarea
                  id="pub-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Shown on the publications hub"
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
                onClick={() => setOpen(false)}
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
                  'Publish'
                )}
              </Button>
            </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
