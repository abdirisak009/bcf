import Link from 'next/link'
import { ArrowRight, CalendarDays, Library, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ContentCard } from '@/lib/publications-news-data'
import { cn } from '@/lib/utils'

type NewsEventsProps = {
  /** Latest publications from the API (home passes up to 3). */
  publications: ContentCard[]
  /** Latest news from the API (home passes up to 3). */
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
          <div className="grid gap-6 md:grid-cols-3 md:gap-7">
            {previewPubs.length === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground">
                No publications in the database yet. Add items from the dashboard or check back soon.
              </p>
            )}
            {previewPubs.map((item) => (
              <Link
                key={item.id}
                href={item.href ?? '/publications'}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_16px_32px_-16px_rgba(23,94,126,0.14)]',
                  'transition-all duration-500 ease-out will-change-transform',
                  'hover:-translate-y-1.5 hover:border-brand-navy/25 hover:shadow-[0_20px_40px_-16px_rgba(23,94,126,0.22)]',
                  'before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-brand-teal',
                )}
              >
                <span className="inline-flex w-fit rounded-full bg-brand-navy/8 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
                  {item.category}
                </span>
                <h4 className="mt-3 text-lg font-bold leading-snug text-brand-navy transition-colors duration-300 group-hover:text-brand-navy">
                  {item.title}
                </h4>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {item.excerpt}
                </p>
                <p className="mt-5 text-xs font-medium text-slate-400">{item.date}</p>
              </Link>
            ))}
          </div>
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
          <div className="grid gap-6 md:grid-cols-3 md:gap-7">
            {previewNews.length === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground">
                No news posts in the database yet. Add items from the dashboard or check back soon.
              </p>
            )}
            {previewNews.map((item) => (
              <Link
                key={item.id}
                href={item.href ?? '/news'}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_16px_32px_-16px_rgba(85,197,147,0.1)]',
                  'transition-all duration-500 ease-out will-change-transform',
                  'hover:-translate-y-1.5 hover:border-brand-teal/35 hover:shadow-[0_20px_40px_-16px_rgba(85,197,147,0.18)]',
                  'before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-brand-green',
                )}
              >
                <span className="inline-flex w-fit rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                  {item.category}
                </span>
                <h4 className="mt-3 text-lg font-bold leading-snug text-brand-navy transition-colors duration-300 group-hover:text-brand-teal">
                  {item.title}
                </h4>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {item.excerpt}
                </p>
                <p className="mt-5 text-xs font-medium text-slate-400">{item.date}</p>
              </Link>
            ))}
          </div>
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
