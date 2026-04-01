'use client'

import { useState } from 'react'
import { BookOpen, Download, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type PublicationPdfMode = 'read' | 'download'

type Props = {
  fileUrl: string
  title: string
  mode: PublicationPdfMode
  className?: string
}

/**
 * Download link, or “Read document” opening a full-screen style dialog with an embedded PDF viewer.
 */
export function PublicationPdfActions({ fileUrl, title, mode, className }: Props) {
  const [open, setOpen] = useState(false)
  const readMode = mode === 'read'

  if (!readMode) {
    return (
      <div className={cn('mt-10', className)}>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-navy-muted"
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden />
          Download PDF
        </a>
      </div>
    )
  }

  return (
    <div className={cn('mt-10', className)}>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-navy/20 hover:bg-brand-navy-muted"
      >
        <BookOpen className="mr-2 h-4 w-4 shrink-0" aria-hidden />
        Read document
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            '!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2',
            'flex !max-w-none flex-col gap-0 overflow-hidden p-0 shadow-2xl',
            'rounded-2xl border border-slate-200/90 bg-white ring-2 ring-slate-900/[0.06]',
            /* Width: line up with wide content (~max-w-7xl), gutters on small screens */
            'w-[min(calc(100vw-1.25rem),72rem)] sm:w-[min(calc(100vw-2rem),72rem)]',
            /* Height: fit dynamic viewport, max ~56rem so it stays balanced on large displays */
            'h-[min(calc(100dvh-1.25rem),56rem)] max-h-[min(calc(100dvh-1.25rem),56rem)]',
            'sm:h-[min(calc(100dvh-2rem),56rem)] sm:max-h-[min(calc(100dvh-2rem),56rem)]',
          )}
        >
          <DialogHeader className="relative shrink-0 space-y-0 border-b border-white/15 bg-gradient-to-r from-brand-navy via-[#153d52] to-brand-navy px-4 py-3.5 pr-12 text-left text-white sm:px-5 sm:py-4 sm:pr-14">
            <DialogTitle className="line-clamp-2 pr-2 text-left text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Read-only viewer for {title}. Close with the button when finished.
            </DialogDescription>
            <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center sm:right-3">
              <DialogClose asChild>
                <button
                  type="button"
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/15 hover:text-white"
                  aria-label="Close reader"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
          {/* Framed “page” area — aligns with publication layout feel */}
          <div className="relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-100/90 to-slate-200/50 p-2 sm:p-3">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] ring-1 ring-slate-300/40">
              {/*
                Chrome embedded PDF: toolbar=0 / navpanes=0 where honored.
              */}
              <iframe
                title={title}
                src={`${fileUrl}#toolbar=0&navpanes=0&view=FitH`}
                className="absolute inset-0 h-full w-full border-0 bg-white"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
