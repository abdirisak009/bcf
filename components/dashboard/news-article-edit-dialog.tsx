'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  AlignLeft,
  Calendar,
  FolderOpen,
  ImageIcon,
  Images,
  Loader2,
  Type,
  X,
} from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
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
import { getBrowserApiUrl } from '@/lib/api'
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

type ApiArticle = {
  id: string
  title: string
  excerpt?: string | null
  body?: string | null
  category_id?: string | null
  featured_image_url?: string | null
  gallery_urls?: string[] | null
  published_at?: string | null
}

function toDatetimeLocal(iso: string | undefined | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type Props = {
  articleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  categoriesVersion?: number
}

export function NewsArticleEditDialog({
  articleId,
  open,
  onOpenChange,
  onSaved,
  categoriesVersion = 0,
}: Props) {
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [publishedAt, setPublishedAt] = useState('')
  const [featuredUrl, setFeaturedUrl] = useState('')
  const [featuredFile, setFeaturedFile] = useState<File | null>(null)
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([])
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/news/categories', { cache: 'no-store' })
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
    if (!open || !articleId) return
    let cancelled = false
    ;(async () => {
      setLoadingArticle(true)
      setError(null)
      try {
        const res = await fetch(getBrowserApiUrl(`/api/news/${articleId}`), {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        })
        const json = (await res.json()) as { success?: boolean; data?: ApiArticle }
        if (!res.ok || !json.success || !json.data) {
          setError('Could not load article.')
          return
        }
        if (cancelled) return
        const a = json.data
        setTitle(a.title ?? '')
        setExcerpt(a.excerpt ?? '')
        setBody(a.body ?? '')
        setCategoryId(a.category_id ?? '')
        setPublishedAt(toDatetimeLocal(a.published_at))
        setFeaturedUrl(a.featured_image_url?.trim() ?? '')
        setGalleryUrls(Array.isArray(a.gallery_urls) ? [...a.gallery_urls] : [])
        setFeaturedFile(null)
        setNewGalleryFiles([])
      } catch {
        if (!cancelled) setError('Network error loading article.')
      } finally {
        if (!cancelled) setLoadingArticle(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, articleId])

  useEffect(() => {
    if (!featuredFile) {
      setFeaturedPreview(featuredUrl || null)
      return
    }
    const url = URL.createObjectURL(featuredFile)
    setFeaturedPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [featuredFile, featuredUrl])

  function removeGalleryUrl(url: string) {
    setGalleryUrls((g) => g.filter((u) => u !== url))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!articleId) return
    setError(null)
    const t = title.trim()
    if (!t) {
      setError('Title is required.')
      return
    }
    setPending(true)
    try {
      let featured = featuredUrl.trim()
      if (featuredFile) {
        featured = await uploadDashboardFile(featuredFile, 'news')
      }
      const mergedGallery = [...galleryUrls]
      for (const f of newGalleryFiles) {
        mergedGallery.push(await uploadDashboardFile(f, 'news'))
      }

      const payload: Record<string, unknown> = {
        title: t,
        excerpt: excerpt.trim() ? excerpt.trim() : null,
        body: body.trim() ? body.trim() : null,
        gallery_urls: mergedGallery,
        featured_image_url: featured,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      }
      if (categoryId && categoryId !== '_none') {
        payload.category_id = categoryId
      } else {
        payload.category_id = null
      }

      const res = await fetch(`/api/news/${articleId}`, {
        method: 'PATCH',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || data.success === false) {
        setError(data.error ?? `Save failed (${res.status})`)
        return
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={dashboardSheetWide}>
        <div className={dashboardSheetHeader}>
          <SheetTitle className={dashboardSheetTitle}>Edit news article</SheetTitle>
          <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
            Update the story, images, and publish date. Changes go live on save.
          </SheetDescription>
        </div>

        {loadingArticle ? (
          <div className="flex min-h-0 flex-1 items-center justify-center py-20">
            <Loader2 className="size-10 animate-spin text-brand-teal" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={dashboardSheetForm}>
              <div className={cn(dashboardSheetBody, 'space-y-5 pb-2')}>
                <DashboardFormField label="Title" htmlFor="edit-news-title" icon={Type}>
                  <Input
                    id="edit-news-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoComplete="off"
                    className={dashboardFormInputClass}
                  />
                </DashboardFormField>

                <DashboardFormField label="Category" icon={FolderOpen}>
                  <Select
                    value={categoryId || '_none'}
                    onValueChange={(v) => setCategoryId(v === '_none' ? '' : v)}
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
                </DashboardFormField>

                <DashboardFormField label="Featured image (replace optional)" htmlFor="edit-news-featured" icon={ImageIcon}>
                  <Input
                    id="edit-news-featured"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                    onChange={(e) => setFeaturedFile(e.target.files?.[0] ?? null)}
                  />
                  {featuredPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredPreview}
                      alt=""
                      className="mt-2 max-h-40 w-full rounded-lg border-2 border-brand-navy/10 object-cover shadow-inner"
                    />
                  ) : null}
                  {featuredUrl && !featuredFile ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 w-fit text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setFeaturedUrl('')
                        setFeaturedFile(null)
                      }}
                    >
                      Remove cover image
                    </Button>
                  ) : null}
                </DashboardFormField>

                <DashboardFormField label="Gallery" icon={Images}>
                  <div className="flex flex-wrap gap-2">
                    {galleryUrls.map((url) => (
                      <span
                        key={url}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-navy/10 bg-brand-mint/40 px-2.5 py-1 text-xs font-medium text-brand-navy"
                      >
                        <span className="max-w-[180px] truncate font-mono text-[11px]">
                          {url.split('/').pop()}
                        </span>
                        <button
                          type="button"
                          className="text-destructive hover:opacity-80"
                          onClick={() => removeGalleryUrl(url)}
                          aria-label="Remove"
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className={cn(dashboardFormInputClass, 'mt-2 cursor-pointer py-2')}
                    onChange={(e) => {
                      const list = e.target.files
                      setNewGalleryFiles(list ? Array.from(list) : [])
                    }}
                  />
                  {newGalleryFiles.length > 0 ? (
                    <p className="text-xs text-slate-500">
                      {newGalleryFiles.length} new file(s) will upload on save.
                    </p>
                  ) : null}
                </DashboardFormField>

                <DashboardFormField label="Short excerpt" htmlFor="edit-news-excerpt" icon={AlignLeft}>
                  <Textarea
                    id="edit-news-excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                    className={cn(dashboardFormTextareaClass, 'resize-y')}
                  />
                </DashboardFormField>

                <DashboardFormField label="Full text" htmlFor="edit-news-body" icon={AlignLeft}>
                  <Textarea
                    id="edit-news-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    className={cn(dashboardFormTextareaClass, 'resize-y')}
                  />
                </DashboardFormField>

                <DashboardFormField label="Publish date" htmlFor="edit-news-published" icon={Calendar}>
                  <Input
                    id="edit-news-published"
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
                  onClick={() => onOpenChange(false)}
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
