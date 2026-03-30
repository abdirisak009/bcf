'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Library, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FacebookFeedColumn } from '@/components/home-facebook-news'
import type { ContentCard } from '@/lib/publications-news-data'
import { cn } from '@/lib/utils'

const SIDEBAR_LIMIT = 5

function CompactSidebarCard({
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
          tag: 'bg-brand-navy/10 text-brand-navy ring-1 ring-brand-navy/15',
          gradient: 'from-brand-navy via-[#1a6d8a] to-brand-navy-mid',
        }
      : {
          tag: 'bg-brand-teal/12 text-brand-teal ring-1 ring-brand-teal/20',
          gradient: 'from-brand-teal via-brand-navy/90 to-brand-navy',
        }
  const FallbackIcon = accent === 'publication' ? Library : Newspaper

  return (
    <Link
      href={href}
      className={cn(
        'group flex gap-3 rounded-xl border border-slate-200/85 bg-white p-3 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.12)] transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-brand-teal/45 hover:shadow-[0_16px_36px_-20px_rgba(23,94,126,0.22)]',
      )}
    >
      <div className="relative h-[4.5rem] w-[5.25rem] shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {hasImage ? (
          <Image
            src={item.featuredImageUrl!}
            alt={item.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="84px"
          />
        ) : (
          <div
            className={cn('absolute inset-0 flex items-center justify-center bg-gradient-to-br', shell.gradient)}
            aria-hidden
          >
            <FallbackIcon className="h-7 w-7 text-white/95" strokeWidth={1.75} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <span
          className={cn(
            'mb-1 inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
            shell.tag,
          )}
        >
          {item.category}
        </span>
        <h4 className="line-clamp-2 text-[13px] font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-teal">
          {item.title}
        </h4>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            {item.date}
          </span>
        </div>
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-teal transition group-hover:gap-1.5">
          Read more
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

function SidebarColumn({
  title,
  subtitle,
  icon: Icon,
  items,
  accent,
  fallbackHref,
  emptyMessage,
  viewAllHref,
  iconClass,
}: {
  title: string
  subtitle: string
  icon: typeof Library
  items: ContentCard[]
  accent: 'publication' | 'news'
  fallbackHref: string
  emptyMessage: string
  viewAllHref: string
  iconClass: string
}) {
  const slice = items.slice(0, SIDEBAR_LIMIT)

  return (
    <aside
      className={cn(
        'flex h-full flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/40 p-4 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.03] sm:p-5',
      )}
    >
      <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1',
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-tight text-brand-navy md:text-lg">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {slice.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          slice.map((item) => (
            <CompactSidebarCard key={item.id} item={item} accent={accent} fallbackHref={fallbackHref} />
          ))
        )}
      </div>

      <Link
        href={viewAllHref}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white py-2.5 text-sm font-semibold text-brand-navy shadow-sm transition hover:border-brand-teal/40 hover:bg-brand-teal/5 hover:text-brand-teal"
      >
        View all
        <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  )
}

type NewsEventsProps = {
  publications: ContentCard[]
  news: ContentCard[]
}

export default function NewsEvents({ publications: previewPubs, news: previewNews }: NewsEventsProps) {
  return (
    <section id="events" className="scroll-mt-28 bg-gradient-to-b from-slate-50/70 via-white to-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-teal">Events &amp; insights</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            News, social &amp; publications
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            Stories and research on the sides — our Facebook feed at the centre so you never miss an update.
          </p>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-brand-teal to-brand-navy/80" />
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          <div className="lg:col-span-3">
            <SidebarColumn
              title="News & activities"
              subtitle="Updates & announcements"
              icon={Newspaper}
              items={previewNews}
              accent="news"
              fallbackHref="/news"
              emptyMessage="No news yet. Check back soon."
              viewAllHref="/news"
              iconClass="bg-brand-teal/15 text-brand-teal ring-brand-teal/20"
            />
          </div>

          <div className="flex min-h-[480px] flex-col lg:col-span-6">
            <FacebookFeedColumn className="h-full min-h-[520px] flex-1" />
          </div>

          <div className="lg:col-span-3">
            <SidebarColumn
              title="Publications"
              subtitle="Reports & briefs"
              icon={Library}
              items={previewPubs}
              accent="publication"
              fallbackHref="/publications"
              emptyMessage="No publications yet."
              viewAllHref="/publications"
              iconClass="bg-brand-navy/10 text-brand-navy ring-brand-navy/12"
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
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
