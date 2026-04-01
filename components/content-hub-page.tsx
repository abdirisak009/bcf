'use client'

import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero'
import { ArrowRight, BookOpen, Calendar, Clock, FileText, Library, Newspaper } from 'lucide-react'
import type { ContentCard } from '@/lib/publications-news-data'
import { cn } from '@/lib/utils'

type Variant = 'publications' | 'news'

export function ContentHubPage({
  variant,
  eyebrow,
  title,
  titleAccent,
  subtitle,
  items,
}: {
  variant: Variant
  eyebrow: string
  title: string
  titleAccent?: string
  subtitle: string
  items: ContentCard[]
}) {
  const Icon = variant === 'publications' ? Library : Newspaper
  const isNews = variant === 'news'

  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />

      <PageHeroShell>
        <div
          className={cn(
            'mx-auto mb-2 flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md sm:mb-3 sm:px-4 sm:py-2 sm:text-xs',
            isNews
              ? 'border-white/20 bg-white/10 text-[#c8f5dc]'
              : 'border-white/15 bg-white/10 text-[#b8d4e8]',
          )}
        >
          <Icon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
          {eyebrow}
        </div>
        <h1 className={pageHeroTitleClass}>
          {title}
          {titleAccent ? (
            <span className={cn('mt-2 block', isNews ? 'text-brand-green' : 'text-brand-mint')}>
              {titleAccent}
            </span>
          ) : null}
        </h1>
        <p className={pageHeroSubtitleClass}>{subtitle}</p>
        <div className={cn('mx-auto mt-6 h-px w-24 sm:mt-7', isNews ? 'bg-brand-teal' : 'bg-brand-mint')} />
      </PageHeroShell>

      <section className="relative border-t border-slate-200/80 bg-brand-mint/25 py-16 md:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[min(95vw,900px)] -translate-x-1/2 rounded-full bg-brand-teal/[0.05] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p
                className={cn(
                  'text-xs font-bold uppercase tracking-[0.22em]',
                  isNews ? 'text-brand-teal' : 'text-brand-navy',
                )}
              >
                {variant === 'publications' ? 'Library' : 'Latest'}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy md:text-3xl">
                {variant === 'publications'
                  ? 'Reports, briefs & insight papers'
                  : 'Stories, updates & announcements'}
              </h2>
            </div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-5 py-2.5 text-sm font-semibold text-brand-navy shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-brand-teal/40 hover:text-brand-teal hover:shadow-md"
            >
              Back to home
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/90 px-6 py-16 text-center md:py-20">
              <p className="text-base font-medium text-brand-navy md:text-lg">
                {isNews
                  ? 'No news articles yet — stories from the team will appear here once published.'
                  : 'No publications yet — reports and briefs will appear here once added from the dashboard.'}
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {isNews
                  ? 'New posts are added from the dashboard when they are ready to go public.'
                  : 'Use “New publication” in the dashboard to upload PDFs and cover images.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {items.map((item, index) => {
                const card = (
                  <article
                    id={item.id}
                    className={cn(
                      'group/card relative flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-500 ease-out will-change-transform',
                      isNews
                        ? 'border-slate-200/85 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.06),0_20px_40px_-20px_rgba(85,197,147,0.12)] hover:-translate-y-2 hover:border-brand-teal/35 hover:shadow-[0_24px_48px_-12px_rgba(85,197,147,0.22),0_12px_24px_-8px_rgba(23,94,126,0.12)]'
                        : 'border-slate-200/70 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),0_18px_36px_-18px_rgba(23,94,126,0.18)] hover:-translate-y-2 hover:border-brand-navy/30 hover:shadow-[0_24px_48px_-12px_rgba(23,94,126,0.2),0_8px_20px_-6px_rgba(85,197,147,0.08)]',
                    )}
                    style={{ transitionDelay: `${Math.min(index * 40, 160)}ms` }}
                  >
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-x-0 top-0 z-[2] h-1',
                        isNews ? 'bg-brand-teal' : 'bg-brand-navy',
                      )}
                    />

                    {/* Media — no center icon; optional bottom fade for badge only */}
                    <div
                      className={cn(
                        'relative aspect-[16/10] overflow-hidden',
                        isNews ? 'bg-slate-100' : 'bg-slate-100/90',
                      )}
                    >
                      {item.featuredImageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.featuredImageUrl}
                            alt=""
                            className="h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover/card:scale-[1.06]"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-black/35" />
                        </>
                      ) : (
                        <div
                          className={cn(
                            'absolute inset-0',
                            isNews ? 'bg-brand-mint/60' : 'bg-slate-100',
                          )}
                        />
                      )}
                      <div className="absolute bottom-3 left-3 right-3 z-[1] flex flex-wrap items-end gap-2">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md',
                            isNews
                              ? 'bg-white/95 text-brand-navy ring-1 ring-white/80'
                              : 'bg-[#0f172a]/75 text-white ring-1 ring-white/10',
                          )}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'flex flex-1 flex-col p-6 md:p-7',
                        isNews ? 'pt-5' : 'pt-5',
                      )}
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar
                            className={cn('h-3.5 w-3.5', isNews ? 'text-brand-teal' : 'text-brand-navy')}
                          />
                          {item.date}
                        </span>
                        {item.readTime ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {item.readTime}
                          </span>
                        ) : null}
                      </div>
                      <h3
                        className={cn(
                          'text-lg font-bold leading-snug tracking-tight transition-colors duration-300 md:text-[1.125rem]',
                          isNews
                            ? 'text-brand-navy group-hover/card:text-brand-teal'
                            : 'text-brand-navy group-hover/card:text-brand-navy',
                        )}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-4">
                        {item.excerpt}
                      </p>
                      <div
                        className={cn(
                          'mt-6 flex items-center justify-between border-t pt-5',
                          isNews ? 'border-emerald-100/80' : 'border-slate-100',
                        )}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                          Baraarug Consulting
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 group-hover/card:gap-2.5',
                            isNews ? 'text-brand-teal' : 'text-brand-navy',
                          )}
                        >
                          {variant === 'publications' ? (
                            <>
                              {item.pdfDisplayMode === 'read' ? (
                                <BookOpen className="h-4 w-4 opacity-80" aria-hidden />
                              ) : (
                                <FileText className="h-4 w-4 opacity-80" aria-hidden />
                              )}
                              {item.pdfDisplayMode === 'read' ? 'Read document' : 'View brief'}
                              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/card:translate-x-0.5" />
                            </>
                          ) : (
                            <>
                              Read story
                              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/card:translate-x-0.5" />
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </article>
                )

                return (
                  <div key={item.id} className="h-full">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={cn(
                          'block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                          isNews
                            ? 'focus-visible:ring-brand-teal'
                            : 'focus-visible:ring-brand-navy',
                        )}
                      >
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-20 rounded-3xl border border-slate-200/90 bg-white p-8 shadow-[0_8px_30px_-12px_rgba(23,94,126,0.12)] md:p-10">
            <p className="text-center text-sm leading-relaxed text-slate-600 md:text-base">
              {variant === 'publications'
                ? 'Need a tailored research brief or institutional report? Our team can scope a publication aligned to your sector and stakeholders.'
                : 'For media enquiries, event partnerships, or story ideas, reach out to our communications desk.'}{' '}
              <a
                href="mailto:info@bcf.so"
                className="font-semibold text-brand-navy underline decoration-brand-green/40 underline-offset-2 transition hover:text-brand-teal"
              >
                info@bcf.so
              </a>
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={variant === 'publications' ? '/news' : '/publications'}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-300 hover:border-brand-teal/40 hover:text-brand-teal hover:shadow-md"
              >
                {variant === 'publications' ? 'Go to News' : 'Go to Publications'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/training"
                className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-teal/25 transition-all duration-300 hover:bg-brand-teal-hover hover:shadow-xl hover:shadow-brand-teal/30"
              >
                Training programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
