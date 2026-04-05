'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Library, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ContentCard } from '@/lib/publications-news-data'
import { cn } from '@/lib/utils'

type Shell = {
  card: string
  tag: string
  bar: string
  cta: string
  dark: boolean
}

function shellForCard(isPub: boolean, tone: number): Shell {
  const t = tone % 3
  if (isPub) {
    if (t === 0) {
      return {
        card: 'border-slate-200 bg-white ring-1 ring-slate-100',
        tag: 'bg-brand-navy text-white',
        bar: 'bg-brand-navy',
        cta: 'bg-brand-navy text-white hover:bg-brand-navy-deep',
        dark: false,
      }
    }
    if (t === 1) {
      return {
        card: 'border-brand-teal bg-brand-mint ring-1 ring-brand-teal/30',
        tag: 'bg-brand-teal text-white',
        bar: 'bg-brand-teal',
        cta: 'bg-brand-teal text-white hover:bg-brand-navy',
        dark: false,
      }
    }
    return {
      card: 'border-brand-navy-deep bg-brand-navy text-white ring-1 ring-brand-navy-deep',
      tag: 'bg-brand-mint text-brand-navy',
      bar: 'bg-brand-mint',
      cta: 'bg-brand-mint text-brand-navy hover:bg-white',
      dark: true,
    }
  }
  if (t === 0) {
    return {
      card: 'border-slate-200 bg-white ring-1 ring-slate-100',
      tag: 'bg-brand-teal text-white',
      bar: 'bg-brand-teal',
      cta: 'bg-brand-teal text-white hover:bg-brand-navy',
      dark: false,
    }
  }
  if (t === 1) {
    return {
      card: 'border-brand-navy/25 bg-brand-mint ring-1 ring-brand-teal/25',
      tag: 'bg-brand-navy text-white',
      bar: 'bg-brand-navy',
      cta: 'bg-brand-navy text-white hover:bg-brand-teal',
      dark: false,
    }
  }
  return {
    card: 'border-brand-navy-deep bg-brand-navy text-white ring-1 ring-brand-navy-deep',
    tag: 'bg-white text-brand-navy',
    bar: 'bg-brand-mint',
    cta: 'bg-brand-mint text-brand-navy hover:bg-white',
    dark: true,
  }
}

function SpotlightCard({
  item,
  variant,
  fallbackHref,
  tone,
}: {
  item: ContentCard
  variant: 'publication' | 'news'
  fallbackHref: string
  /** 0–2 — sadax qaab oo celceliya */
  tone: number
}) {
  const href = item.href ?? fallbackHref
  const hasImage = Boolean(item.featuredImageUrl?.trim())
  const isPub = variant === 'publication'
  const shell = shellForCard(isPub, tone)

  const FallbackIcon = isPub ? Library : Newspaper
  const titleClass = shell.dark
    ? 'text-white group-hover:text-brand-mint'
    : 'text-brand-navy group-hover:text-brand-teal'
  const metaClass = shell.dark ? 'text-white/90' : 'text-slate-500'
  const excerptClass = shell.dark ? 'text-white/85' : 'text-slate-600'

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 shadow-[0_20px_50px_-24px_rgba(23,94,126,0.35)] transition-all duration-500',
        'hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(23,94,126,0.4)]',
        shell.card,
      )}
    >
      <div
        className={cn('absolute left-0 top-0 z-[1] h-full w-1.5 rounded-l-3xl', shell.bar)}
        aria-hidden
      />
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {hasImage ? (
          <Image
            src={item.featuredImageUrl!}
            alt={item.title}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-gradient-to-br',
              isPub ? 'from-brand-navy via-[#1a6d8a] to-brand-navy-mid' : 'from-brand-teal via-brand-navy/95 to-brand-navy',
            )}
            aria-hidden
          >
            <FallbackIcon className="h-16 w-16 text-white/95" strokeWidth={1.25} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/55 via-brand-navy/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 z-[2] flex items-end justify-between gap-2">
          <span
            className={cn(
              'inline-flex max-w-[85%] truncate rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]',
              shell.tag,
            )}
          >
            {item.category}
          </span>
        </div>
      </div>

      <div className="relative z-[1] flex flex-1 flex-col p-5 sm:p-6">
        <h4
          className={cn(
            'line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-snug tracking-tight transition-colors sm:text-xl',
            titleClass,
          )}
        >
          {item.title}
        </h4>
        {item.excerpt ? (
          <p className={cn('mt-2 line-clamp-2 text-sm leading-relaxed', excerptClass)}>{item.excerpt}</p>
        ) : null}
        <div className={cn('mt-4 flex flex-wrap items-center gap-2 text-xs', metaClass)}>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-current opacity-80" aria-hidden />
            {item.date}
          </span>
        </div>
        <div
          className={cn(
            'mt-5 flex items-center justify-between gap-3 border-t pt-4',
            shell.dark ? 'border-white/20' : 'border-slate-200/90',
          )}
        >
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
              shell.cta,
            )}
          >
            Read more
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

type NewsEventsProps = {
  publications: ContentCard[]
  news: ContentCard[]
}

export default function NewsEvents({ publications: previewPubs, news: previewNews }: NewsEventsProps) {
  const publications = previewPubs.slice(0, 3)
  const news = previewNews.slice(0, 3)
  return (
    <section id="events" className="scroll-mt-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* —— Publications —— */}
        <div className="border-b border-slate-200/80 py-14 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-brand-navy">Library</p>
              <h2 className="text-3xl font-bold tracking-tight text-brand-navy md:text-4xl">Latest publications</h2>
              <p className="mt-2 max-w-xl text-base text-slate-600">
                Research summaries, briefs, and institutional reports — read the newest releases.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="h-11 shrink-0 self-start rounded-full border-2 border-brand-navy px-6 font-semibold text-brand-navy hover:bg-brand-navy hover:text-white md:self-auto"
            >
              <Link href="/publications" className="inline-flex items-center gap-2">
                <Library className="h-4 w-4" />
                All publications
              </Link>
            </Button>
          </div>

          {publications.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-14 text-center text-slate-500">
              No publications yet — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {publications.map((item, i) => (
                <SpotlightCard
                  key={`pub-${item.id}`}
                  item={item}
                  variant="publication"
                  tone={i % 3}
                  fallbackHref="/publications"
                />
              ))}
            </div>
          )}
        </div>

        {/* —— News —— */}
        <div className="py-14 md:py-20">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-brand-teal">Stories</p>
              <h2 className="text-3xl font-bold tracking-tight text-brand-navy md:text-4xl">Latest news</h2>
              <p className="mt-2 max-w-xl text-base text-slate-600">
                Announcements, updates, and highlights from across Baraarug.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="h-11 shrink-0 self-start rounded-full border-2 border-brand-teal px-6 font-semibold text-brand-teal hover:bg-brand-teal hover:text-white md:self-auto"
            >
              <Link href="/news" className="inline-flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                All news
              </Link>
            </Button>
          </div>

          {news.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-14 text-center text-slate-500">
              No news posts yet — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {news.map((item, i) => (
                <SpotlightCard
                  key={`news-${item.id}`}
                  item={item}
                  variant="news"
                  tone={i % 3}
                  fallbackHref="/news"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-t border-slate-100 pb-16 pt-10 sm:flex-row sm:flex-wrap sm:gap-4">
          <Button asChild variant="ghost" className="rounded-full text-brand-navy hover:bg-brand-mint/50 hover:text-brand-navy">
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
