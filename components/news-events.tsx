'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Library, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { ContentCard } from '@/lib/publications-news-data'
import { cn } from '@/lib/utils'

/** Interleave news and publications so the feed mixes both types */
function mergeNewsAndPublications(
  news: ContentCard[],
  pubs: ContentCard[],
): { item: ContentCard; kind: 'publication' | 'news' }[] {
  const out: { item: ContentCard; kind: 'publication' | 'news' }[] = []
  const n = Math.max(news.length, pubs.length)
  for (let i = 0; i < n; i++) {
    if (i < news.length) out.push({ item: news[i], kind: 'news' })
    if (i < pubs.length) out.push({ item: pubs[i], kind: 'publication' })
  }
  return out
}

function SpotlightCard({
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
          tag: 'bg-brand-navy/12 text-brand-navy ring-1 ring-brand-navy/20',
          gradient: 'from-brand-navy via-[#1a6d8a] to-brand-navy-mid',
          hoverRing: 'group-hover:ring-brand-navy/25',
        }
      : {
          tag: 'bg-brand-teal/12 text-brand-teal ring-1 ring-brand-teal/25',
          gradient: 'from-brand-teal via-brand-navy/90 to-brand-navy',
          hoverRing: 'group-hover:ring-brand-teal/30',
        }
  const FallbackIcon = accent === 'publication' ? Library : Newspaper

  return (
    <Link
      href={href}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_40px_-20px_rgba(23,94,126,0.12)] ring-1 ring-transparent transition-all duration-500',
        'hover:-translate-y-1 hover:border-brand-teal/35 hover:shadow-[0_24px_48px_-20px_rgba(23,94,126,0.22)]',
        shell.hoverRing,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {hasImage ? (
          <Image
            src={item.featuredImageUrl!}
            alt={item.title}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className={cn('absolute inset-0 flex items-center justify-center bg-gradient-to-br', shell.gradient)}
            aria-hidden
          >
            <FallbackIcon className="h-14 w-14 text-white/95" strokeWidth={1.5} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/20 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span
          className={cn(
            'mb-2 inline-block w-fit max-w-full truncate rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
            shell.tag,
          )}
        >
          {item.category}
        </span>
        <h4 className="line-clamp-2 min-h-[2.5rem] text-base font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-teal sm:text-[17px]">
          {item.title}
        </h4>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-brand-teal/70" aria-hidden />
            {item.date}
          </span>
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-teal transition group-hover:gap-2">
          Read more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

type NewsEventsProps = {
  publications: ContentCard[]
  news: ContentCard[]
}

export default function NewsEvents({ publications: previewPubs, news: previewNews }: NewsEventsProps) {
  const slides = useMemo(
    () => mergeNewsAndPublications(previewNews, previewPubs),
    [previewNews, previewPubs],
  )

  return (
    <section id="events" className="scroll-mt-28 bg-gradient-to-b from-slate-50/80 via-white to-brand-mint/[0.08] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-teal">Events &amp; insights</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            News &amp; publications
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            Latest announcements, stories, and research from Baraarug — stay informed on our work and impact.
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-brand-teal via-brand-green/90 to-brand-navy" />
        </div>

        {slides.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-16 text-center text-muted-foreground">
            No news or publications yet. Check back soon.
          </p>
        ) : (
          <div className="relative">
            <Carousel
              opts={{
                align: 'start',
                loop: false,
                dragFree: false,
                containScroll: 'trimSnaps',
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 md:-ml-4">
                {slides.map(({ item, kind }) => (
                  <CarouselItem
                    key={`${kind}-${item.id}`}
                    className="pl-3 md:pl-4 basis-full min-[520px]:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full pt-1">
                      <SpotlightCard
                        item={item}
                        accent={kind}
                        fallbackHref={kind === 'news' ? '/news' : '/publications'}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {slides.length > 3 && (
                <>
                  <CarouselPrevious
                    variant="outline"
                    className={cn(
                      'z-20 h-11 w-11 border-2 border-brand-teal/35 bg-white/95 text-brand-navy shadow-lg',
                      'hover:border-brand-teal hover:bg-brand-mint/40 hover:text-brand-navy',
                      'disabled:pointer-events-none disabled:opacity-0',
                      'left-0 top-[42%] -translate-y-1/2 sm:left-1 md:left-0 lg:-left-2',
                    )}
                  />
                  <CarouselNext
                    variant="outline"
                    className={cn(
                      'z-20 h-11 w-11 border-2 border-brand-teal/35 bg-white/95 text-brand-navy shadow-lg',
                      'hover:border-brand-teal hover:bg-brand-mint/40 hover:text-brand-navy',
                      'disabled:pointer-events-none disabled:opacity-0',
                      'right-0 top-[42%] -translate-y-1/2 sm:right-1 md:right-0 lg:-right-2',
                    )}
                  />
                </>
              )}
            </Carousel>
          </div>
        )}

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
