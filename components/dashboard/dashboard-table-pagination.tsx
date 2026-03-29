'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export const DASHBOARD_PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const

/** Page numbers with ellipsis markers for gaps (e.g. 1 … 4 5 6 … 12). */
function buildPaginationItems(current: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 1) return []
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const set = new Set<number>()
  set.add(1)
  set.add(totalPages)
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= totalPages) set.add(p)
  }
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]
    if (i > 0 && n - sorted[i - 1] > 1) out.push('gap')
    out.push(n)
  }
  return out
}

export function DashboardTablePaginationBar({
  page,
  totalPages,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  totalPages: number
  pageSize: number
  totalRows: number
  onPageChange: (p: number) => void
  onPageSizeChange: (n: number) => void
}) {
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalRows)
  const items = buildPaginationItems(page, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-brand-navy/10 bg-brand-mint/15 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span className="whitespace-nowrap">Rows per page</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[76px] border-brand-navy/15 bg-white text-brand-navy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DASHBOARD_PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-slate-500">
          Showing <span className="font-medium text-brand-navy">{from}</span>–
          <span className="font-medium text-brand-navy">{to}</span> of{' '}
          <span className="font-medium text-brand-navy">{totalRows}</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-brand-navy/20 bg-white px-2.5 text-brand-navy"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        {items.map((it, idx) =>
          it === 'gap' ? (
            <span
              key={`g-${idx}`}
              className="flex size-8 items-center justify-center text-sm text-slate-400"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Button
              key={it}
              type="button"
              variant={page === it ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 min-w-8 px-2',
                page === it ? 'bg-brand-navy text-white hover:bg-brand-navy' : 'border-brand-navy/20 bg-white text-brand-navy',
              )}
              onClick={() => onPageChange(it)}
            >
              {it}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-brand-navy/20 bg-white px-2.5 text-brand-navy"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
