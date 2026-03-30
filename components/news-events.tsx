'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Library, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ContentCard } from '@/lib/publications-news-data'
import { cn } from '@/lib/utils'

const CAROUSEL_PAGE_SIZE = 3

function CarouselThreeColumn({
  items,
  accent,
  fallbackHref,
  emptyMessage,
}: {
  items: ContentCard[]
  accent: 'publication' | 'news'
  fallbackHref: string
  emptyMessage: string
}) {
  const totalPages = Math.max(1, Math.ceil(items.length / CAROUSEL_PAGE_SIZE))
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1))
  }, [totalPages])

  const clampedPage = Math.min(page, totalPages - 1)
  const sliceStart = clampedPage * CAROUSEL_PAGE_SIZE
  const visible = items.slice(sliceStart, sliceStart + CAROUSEL_PAGE_SIZE)
  const canPrev = clampedPage > 0
  const canNext = clampedPage < totalPages - 1
  const showNav = items.length > CAROUSEL_PAGE_SIZE

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">{emptyMessage}</p>
    )
  }

  return (
    <div className="flex items-stretch gap-2 sm:gap-3 md:gap-4">
      {showNav ? (
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className={cn(
              'h-10 w-10 rounded-full border-slate-200 bg-white shadow-sm md:h-11 md:w-11',
              'text-brand-navy hover:border-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal',
              'disabled:pointer-events-none disabled:opacity-35',
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Button>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
          key={clampedPage}
        >
          {visible.map((item) => (
            <ContentPreviewCard key={item.id} item={item} accent={accent} fallbackHref={fallbackHref} />
          ))}
        </div>
        {showNav ? (
          <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
            {clampedPage + 1} / {totalPages}
          </p>
        ) : null}
      </div>

      {showNav ? (
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!canNext}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className={cn(
              'h-10 w-10 rounded-full border-slate-200 bg-white shadow-sm md:h-11 md:w-11',
              'text-brand-navy hover:border-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal',
              'disabled:pointer-events-none disabled:opacity-35',
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function ContentPreviewCard({
  item,
  accent,
  fallbackHref,
}: {
  item: ContentCard
  accent: 'publication' | 'news'
  fallbackHref: string
}) {
  const href = item.href ?? fallbackHref
  const hasImage = Boolean(item.featuredImageUrl?.trim())

  const shell =
    accent === 'publication'
      ? {
          tag: 'bg-white/95 text-brand-navy ring-1 ring-white/40',
          hoverBorder: 'hover:border-brand-navy/30',
          hoverShadow: 'hover:shadow-[0_28px_56px_-20px_rgba(23,94,126,0.28)]',
          titleHover: 'group-hover:text-brand-navy',
          fallbackGradient: 'from-brand-navy via-[#1a6d8a] to-brand-navy-mid',
        }
      : {
          tag: 'bg-white/95 text-brand-teal ring-1 ring-white/40',
          hoverBorder: 'hover:border-brand-teal/40',
          hoverShadow: 'hover:shadow-[0_28px_56px_-20px_rgba(85,197,147,0.22)]',
          titleHover: 'group-hover:text-brand-teal',
          fallbackGradient: 'from-brand-teal via-brand-navy/90 to-brand-navy',
        }

  const FallbackIcon = accent === 'publication' ? Library : Newspaper

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white',
        'shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08),0_12px_40px_-24px_rgba(23,94,126,0.12)]',
        'transition-all duration-500 ease-out will-change-transform',
        'hover:-translate-y-1.5',
        shell.hoverBorder,
        shell.hoverShadow,
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100">
        {hasImage ? (
          <Image
            src={item.featuredImageUrl!}
            alt={item.title}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-gradient-to-br',
              shell.fallbackGradient,
            )}
            aria-hidden
          >
            <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/25 backdrop-blur-[2px]">
              <FallbackIcon className="h-10 w-10 text-white/95 drop-shadow-sm" strokeWidth={1.75} />
            </div>
          </div>
        )}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent',
            hasImage
              ? 'from-black/45 via-black/5'
              : 'from-brand-navy/55 via-brand-navy/10',
          )}
          aria-hidden
        />
        <span
          className={cn(
            'absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm',
            shell.tag,
          )}
        >
          {item.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h4
          className={cn(
            'text-lg font-bold leading-snug text-brand-navy transition-colors duration-300',
            shell.titleHover,
          )}
        >
          {item.title}
        </h4>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.excerpt}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <CalendarDays className="h-3.5 w-3.5 opacity-70" aria-hidden />
            {item.date}
          </span>
          {item.readTime ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">{item.readTime}</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

type NewsEventsProps = {
  /** Latest publications from the API (home passes up to 12 for carousel). */
  publications: ContentCard[]
  /** Latest news from the API (home passes up to 12 for carousel). */
  news: ContentCard[]
}

export default function NewsEvents({ publications: previewPubs, news: previewNews }: NewsEventsProps) {

  return (
    <section
      id="events"
      className="scroll-mt-28 bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center md:mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-teal">
            Events & insights
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            News & Events
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Publications, research, and the latest stories from our work across the region
          </p>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-brand-teal" />
        </div>

        {/* Publications — cooler slate/teal card language */}
        <div className="mb-16 md:mb-20">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10 text-brand-navy shadow-sm ring-1 ring-brand-navy/12">
                <Library className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-xl font-bold text-brand-navy md:text-2xl">Publications</h3>
                <p className="text-sm text-muted-foreground">Reports &amp; briefs</p>
              </div>
            </div>
            <Link
              href="/publications"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-teal transition-all duration-300 hover:gap-3"
            >
              View all publications
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <CarouselThreeColumn
            items={previewPubs}
            accent="publication"
            fallbackHref="/publications"
            emptyMessage="No publications in the database yet. Add items from the dashboard or check back soon."
          />
        </div>

        {/* News — warmer emerald accent */}
        <div className="mb-12">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/15 text-brand-teal shadow-sm ring-1 ring-brand-teal/18">
                <Newspaper className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-xl font-bold text-brand-navy md:text-2xl">News</h3>
                <p className="text-sm text-muted-foreground">Updates &amp; announcements</p>
              </div>
            </div>
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-teal transition-all duration-300 hover:gap-3"
            >
              View all news
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <CarouselThreeColumn
            items={previewNews}
            accent="news"
            fallbackHref="/news"
            emptyMessage="No news posts in the database yet. Add items from the dashboard or check back soon."
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            className="h-12 rounded-full bg-brand-navy px-8 font-semibold text-white shadow-lg shadow-brand-navy/20 transition-all duration-300 hover:bg-brand-navy-muted hover:shadow-xl"
          >
            <Link href="/publications" className="inline-flex items-center gap-2">
              <Library className="h-4 w-4" />
              Browse publications
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-2 border-brand-teal px-8 font-semibold text-brand-teal transition-all duration-300 hover:bg-brand-teal hover:text-white"
          >
            <Link href="/news" className="inline-flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Read news
            </Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full text-brand-navy hover:text-brand-teal">
            <Link href="/training" className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Training &amp; events
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
