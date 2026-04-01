'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Tag } from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  dashboardFormInputClass,
  dashboardSheetBody,
  dashboardSheetDescription,
  dashboardSheetFooter,
  dashboardSheetForm,
  dashboardSheetHeader,
  dashboardSheetTitle,
  dashboardSheetNarrow,
} from '@/lib/dashboard-ui'
import { dashboardAuthHeaders } from '@/lib/dashboard-client'
import { cn } from '@/lib/utils'

type Props = {
  onCreated: () => void
}

export function NewsCategoryForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const n = name.trim()
    if (!n) {
      setError('Name is required.')
      return
    }
    setPending(true)
    try {
      const res = await fetch('/api/news/categories', {
        method: 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || data.success === false) {
        setError(data.error ?? `Save failed (${res.status})`)
        return
      }
      setOpen(false)
      setName('')
      onCreated()
    } catch {
      setError('Network error — is the API running?')
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-brand-navy/30 text-brand-navy hover:bg-brand-navy/5"
        >
          <Tag className="mr-2 size-4" />
          New category
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={dashboardSheetNarrow}>
        <div className={dashboardSheetHeader}>
          <SheetTitle className={dashboardSheetTitle}>Add news category</SheetTitle>
          <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
            Categories are shared across articles. Pick one when you publish a story.
          </SheetDescription>
        </div>

        <form onSubmit={handleSubmit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-5')}>
              <DashboardFormField label="Category name" htmlFor="cat-name" icon={Tag}>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Events, Announcements"
                  autoComplete="off"
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
                  'Create category'
                )}
              </Button>
            </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
