import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Gift, MapPin } from 'lucide-react'

import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero'
import { getApiInternalBase } from '@/lib/api'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Free training | Baraarug Consulting',
  description: 'Register your interest for free training opportunities from Baraarug Consulting.',
}

type ProgramRow = {
  id: string
  title: string
  slug: string
  venue_location: string
  is_active: boolean
}

async function fetchPrograms(): Promise<ProgramRow[]> {
  const base = getApiInternalBase().replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/api/free-training-programs/public`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = (await res.json()) as { success?: boolean; data?: { items?: ProgramRow[] } }
    if (!json.success || !json.data?.items) return []
    return json.data.items
  } catch {
    return []
  }
}

export default async function FreeTrainingHubPage() {
  const items = await fetchPrograms()

  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />
      <PageHeroShell>
        <div className="mx-auto mb-2 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b8d4e8] backdrop-blur-md">
          <Gift className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Free training
        </div>
        <h1 className={pageHeroTitleClass}>
          Open programs
          <span className="mt-2 block text-brand-mint">you can join today</span>
        </h1>
        <p className={pageHeroSubtitleClass}>
          Self-register for upcoming free sessions. Each program has its own page and registration form — share the link
          with your network.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-brand-mint" />
      </PageHeroShell>

      <section className="border-t border-slate-200/80 bg-brand-mint/20 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 px-8 py-16 text-center">
              <p className="text-lg font-medium text-brand-navy">No open free trainings right now.</p>
              <p className="mt-2 text-sm text-slate-600">Check back soon or explore our main training catalogue.</p>
              <Link
                href="/training"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-navy-muted"
              >
                Training catalogue
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2">
              {items.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/training/free/${encodeURIComponent(p.slug)}`}
                    className={cn(
                      'group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition',
                      'hover:-translate-y-0.5 hover:border-brand-teal/40 hover:shadow-lg',
                    )}
                  >
                    <h2 className="text-xl font-bold text-brand-navy group-hover:text-brand-teal">{p.title}</h2>
                    <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-brand-teal" aria-hidden />
                      {p.venue_location}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-navy">
                      Register
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
