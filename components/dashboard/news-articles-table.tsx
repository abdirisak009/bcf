'use client'

import { useMemo, useState } from 'react'
import { Loader2, Newspaper, Pencil, Search, Trash2 } from 'lucide-react'

import { NewsArticleEditDialog } from '@/components/dashboard/news-article-edit-dialog'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dashboardAuthHeaders } from '@/lib/dashboard-client'
import { cn } from '@/lib/utils'

function formatNewsDate(v: unknown): string {
  if (v == null || !String(v).trim()) return '—'
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

type Props = {
  rows: Record<string, unknown>[]
  loading: boolean
  empty: string
  onRefresh: () => void
  categoriesVersion: number
}

export function NewsArticlesTable({ rows, loading, empty, onRefresh, categoriesVersion }: Props) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState('')
  const [deleting, setDeleting] = useState(false)

  const categoryOptions = useMemo(() => {
    const s = new Set<string>()
    for (const row of rows) {
      s.add(String(row.category ?? 'News'))
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b))
  }, [rows])

  const filtered = useMemo(() => {
    let r = rows
    const q = search.trim().toLowerCase()
    if (q) {
      r = r.filter((row) => {
        const title = String(row.title ?? '').toLowerCase()
        const cat = String(row.category ?? '').toLowerCase()
        const ex = String(row.excerpt ?? '').toLowerCase()
        return title.includes(q) || cat.includes(q) || ex.includes(q)
      })
    }
    if (categoryFilter !== 'all') {
      r = r.filter((row) => String(row.category ?? 'News') === categoryFilter)
    }
    return r
  }, [rows, search, categoryFilter])

  async function confirmDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/news/${deleteId}`, {
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

  return (
    <>
      <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
        <div className="h-1 bg-brand-teal" />
        <CardHeader className="space-y-4 border-b border-brand-navy/8 bg-brand-mint/25 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl text-brand-navy">News</CardTitle>
              <CardDescription className="text-slate-600">
                {loading ? 'Loading…' : `${filtered.length} of ${rows.length} shown · database`}
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px] sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search title, category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 border-brand-navy/15 bg-white pl-9 shadow-sm"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10 w-full border-brand-navy/15 shadow-sm sm:w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 pb-6 text-sm">{empty}</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground px-6 pb-6 text-sm">{empty}</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground px-6 pb-6 text-sm">No articles match your filters.</p>
          ) : (
            <ScrollArea className="max-h-[min(560px,calc(100dvh-16rem))] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                    <TableHead className="w-[72px] pl-4 font-semibold text-white">Cover</TableHead>
                    <TableHead className="min-w-[200px] font-semibold text-white">Title</TableHead>
                    <TableHead className="font-semibold text-white">Category</TableHead>
                    <TableHead className="hidden font-semibold text-white md:table-cell">Published</TableHead>
                    <TableHead className="hidden font-semibold text-white lg:table-cell">Created</TableHead>
                    <TableHead className="w-[100px] pr-4 text-right font-semibold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => {
                    const id = String(row.id ?? '')
                    const title = String(row.title ?? '')
                    const cat = String(row.category ?? '—')
                    const cover = row.featured_image_url
                    const coverUrl = typeof cover === 'string' && cover.trim() ? cover.trim() : null
                    return (
                      <TableRow
                        key={id}
                        className="border-brand-navy/8 odd:bg-white even:bg-brand-mint/15 transition-colors hover:bg-brand-mint/35"
                      >
                        <TableCell className="w-[72px] pl-4 align-middle">
                          <div
                            className={cn(
                              'relative size-14 shrink-0 overflow-hidden rounded-lg border border-slate-200/90 bg-slate-100 shadow-sm',
                            )}
                          >
                            {coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={coverUrl}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-slate-400">
                                <Newspaper className="size-6 opacity-70" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">
                          <span className="line-clamp-2 font-medium text-brand-navy" title={title}>
                            {title}
                          </span>
                        </TableCell>
                        <TableCell className="align-middle">
                          <span className="inline-flex rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-navy">
                            {cat}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden align-middle text-sm md:table-cell">
                          {formatNewsDate(row.published_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden align-middle text-sm lg:table-cell">
                          {formatNewsDate(row.created_at)}
                        </TableCell>
                        <TableCell className="pr-4 text-right align-middle">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-brand-navy hover:bg-brand-teal/10 hover:text-brand-teal"
                              onClick={() => setEditId(id)}
                              aria-label="Edit article"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 size-9"
                              onClick={() => {
                                setDeleteId(id)
                                setDeleteTitle(title)
                              }}
                              aria-label="Delete article"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
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

      <NewsArticleEditDialog
        articleId={editId}
        open={editId !== null}
        onOpenChange={(o) => {
          if (!o) setEditId(null)
        }}
        onSaved={() => {
          setEditId(null)
          onRefresh()
        }}
        categoriesVersion={categoriesVersion}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTitle.slice(0, 120)}
              {deleteTitle.length > 120 ? '…' : ''}&quot; will be removed from the database and the public News
              page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
