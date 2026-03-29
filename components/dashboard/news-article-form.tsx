'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  AlignLeft,
  Calendar,
  FolderOpen,
  ImageIcon,
  Images,
  Loader2,
  Plus,
  Type,
} from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { dashboardAuthHeaders } from '@/lib/dashboard-client'
import { uploadDashboardFile } from '@/lib/dashboard-upload'
import {
  dashboardFormInputClass,
  dashboardFormSelectTriggerClass,
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

type CategoryRow = { id: string; name: string }

type Props = {
  onCreated: () => void
  categoriesVersion?: number
}

export function NewsArticleForm({ onCreated, categoriesVersion = 0 }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [publishedAt, setPublishedAt] = useState('')
  const [featuredFile, setFeaturedFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/news-categories', { cache: 'no-store' })
      const json = (await res.json()) as {
        success?: boolean
        data?: { items?: CategoryRow[] }
      }
      if (json.success && json.data?.items) {
        setCategories(json.data.items)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (!open) return
    void loadCategories()
  }, [open, loadCategories, categoriesVersion])

  useEffect(() => {
    if (!featuredFile) {
      setFeaturedPreview(null)
      return
    }
    const url = URL.createObjectURL(featuredFile)
    setFeaturedPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [featuredFile])

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
      let featuredUrl: string | undefined
      if (featuredFile) {
        featuredUrl = await uploadDashboardFile(featuredFile, 'news')
      }
      const galleryUrls: string[] = []
      for (const f of galleryFiles) {
        galleryUrls.push(await uploadDashboardFile(f, 'news'))
      }

      const payload: Record<string, unknown> = { title: t }
      if (excerpt.trim()) payload.excerpt = excerpt.trim()
      if (body.trim()) payload.body = body.trim()
      if (categoryId && categoryId !== '_none') {
        payload.category_id = categoryId
      }
      if (featuredUrl) payload.featured_image_url = featuredUrl
      if (galleryUrls.length > 0) payload.gallery_urls = galleryUrls
      if (publishedAt) {
        const d = new Date(publishedAt)
        if (!Number.isNaN(d.getTime())) payload.published_at = d.toISOString()
      }

      const res = await fetch('/api/dashboard/news', {
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
      setExcerpt('')
      setBody('')
      setCategoryId('')
      setPublishedAt('')
      setFeaturedFile(null)
      setGalleryFiles([])
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
          className="border-0 bg-brand-teal text-white shadow-md shadow-brand-teal/25 hover:bg-brand-teal-hover"
        >
          <Plus className="mr-2 size-4" />
          New article
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={dashboardSheetWide}>
        <div className={dashboardSheetHeader}>
          <SheetTitle className={dashboardSheetTitle}>Publish news article</SheetTitle>
          <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
            This appears on the public <span className="font-medium text-brand-navy">/news</span> page after you save.
            Use <span className="font-medium text-brand-teal">New category</span> if you need a new section first.
          </SheetDescription>
        </div>

        <form onSubmit={handleSubmit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-5 pb-2')}>
              <DashboardFormField label="Title" htmlFor="news-title" icon={Type}>
                <Input
                  id="news-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Headline"
                  required
                  autoComplete="off"
                  className={dashboardFormInputClass}
                />
              </DashboardFormField>

              <DashboardFormField label="Category" icon={FolderOpen}>
                <Select
                  value={categoryId || '_none'}
                  onValueChange={(v) => {
                    setCategoryId(v === '_none' ? '' : v)
                  }}
                >
                  <SelectTrigger className={dashboardFormSelectTriggerClass}>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No categories yet — use &quot;New category&quot; above, then pick it here.
                  </p>
                ) : null}
              </DashboardFormField>

              <DashboardFormField label="Featured image (cover)" htmlFor="news-featured" icon={ImageIcon}>
                <Input
                  id="news-featured"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    setFeaturedFile(f ?? null)
                  }}
                />
                {featuredPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredPreview}
                    alt=""
                    className="mt-2 max-h-40 w-full rounded-lg border-2 border-brand-navy/10 object-cover shadow-inner"
                  />
                ) : null}
              </DashboardFormField>

              <DashboardFormField label="Gallery images (optional)" htmlFor="news-gallery" icon={Images}>
                <Input
                  id="news-gallery"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                  onChange={(e) => {
                    const list = e.target.files
                    setGalleryFiles(list ? Array.from(list) : [])
                  }}
                />
                {galleryFiles.length > 0 ? (
                  <p className="text-xs text-slate-500">
                    {galleryFiles.length} file{galleryFiles.length === 1 ? '' : 's'} selected — shown on the article
                    page.
                  </p>
                ) : null}
              </DashboardFormField>

              <DashboardFormField
                label="Short excerpt (optional)"
                htmlFor="news-excerpt"
                icon={AlignLeft}
                hint="One or two sentences for cards on the news hub."
              >
                <Textarea
                  id="news-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="One or two sentences for cards"
                  rows={3}
                  className={cn(dashboardFormTextareaClass, 'resize-y')}
                />
              </DashboardFormField>

              <DashboardFormField label="Full text (optional)" htmlFor="news-body" icon={AlignLeft}>
                <Textarea
                  id="news-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Longer story — shown as excerpt on the hub if excerpt is empty"
                  rows={5}
                  className={cn(dashboardFormTextareaClass, 'resize-y')}
                />
              </DashboardFormField>

              <DashboardFormField label="Publish date (optional)" htmlFor="news-published" icon={Calendar}>
                <Input
                  id="news-published"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className={dashboardFormInputClass}
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
              <Button type="submit" disabled={pending} className="bg-brand-teal hover:bg-brand-teal-hover">
                {pending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Publish to website'
                )}
              </Button>
            </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
