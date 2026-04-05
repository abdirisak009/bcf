import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'

import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import { PublicationPdfActions } from '@/components/publication-pdf-actions'
import { getApiInternalBase } from '@/lib/api'

type PublicationRow = {
  id: string
  title: string
  excerpt?: string | null
  category?: string | null
  cover_image_url?: string | null
  file_url?: string | null
  file_display_mode?: string | null
  created_at: string
}

async function fetchPublication(id: string): Promise<PublicationRow | null> {
  const base = getApiInternalBase().replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/api/publications/${id}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { success?: boolean; data?: PublicationRow }
    if (!json.success || !json.data) return null
    return json.data
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const pub = await fetchPublication(id)
  if (!pub) {
    return { title: 'Publications | Baraarug Consulting Firm' }
  }
  return {
    title: `${pub.title} | Baraarug Consulting Firm`,
    description: pub.excerpt?.trim() ?? undefined,
  }
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pub = await fetchPublication(id)
  if (!pub) notFound()

  const d = new Date(pub.created_at)
  const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />
      <article className="pb-16 pt-24 sm:pt-28 md:pb-24">
        {pub.cover_image_url ? (
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[21/9] max-h-[min(52vh,420px)] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-lg ring-1 ring-slate-200/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pub.cover_image_url} alt="" className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-brand-navy/40" />
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/publications"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-navy transition hover:text-brand-teal"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Publications
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">
            {(pub.category && pub.category.trim()) || 'Publication'}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-brand-navy md:text-4xl">
            {pub.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-teal" />
              {dateStr}
            </span>
          </div>

          {pub.excerpt ? (
            <p className="mt-8 text-lg leading-relaxed text-slate-600">{pub.excerpt.trim()}</p>
          ) : null}

          {pub.file_url ? (
            <PublicationPdfActions
              pubId={pub.id}
              title={pub.title}
              mode={
                String(pub.file_display_mode ?? '').toLowerCase().trim() === 'read'
                  ? 'read'
                  : 'download'
              }
            />
          ) : (
            <p className="mt-10 text-sm text-slate-500">No file attached for this entry.</p>
          )}
        </div>
      </article>
      <Footer />
    </main>
  )
}
