import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'

import { FreeTrainingCertificateDownload } from '@/components/free-training-certificate-download'
import { FreeTrainingRegisterForm } from '@/components/free-training-register-form'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import { getApiInternalBase } from '@/lib/api'

type Program = {
  id: string
  title: string
  slug: string
  venue_location: string
  content: string
  outcomes: string
  success_message: string
  certificate_download_enabled?: boolean
}

async function fetchProgram(slug: string): Promise<Program | null> {
  const base = getApiInternalBase().replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/api/free-training-programs/public/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { success?: boolean; data?: Program }
    if (!json.success || !json.data) return null
    return json.data
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = await fetchProgram(slug)
  if (!p) return { title: 'Free training | Baraarug' }
  return {
    title: `${p.title} | Free training`,
    description: p.content.slice(0, 160),
  }
}

export default async function FreeTrainingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await fetchProgram(slug)
  if (!program) notFound()

  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />
      <article className="pb-16 pt-24 sm:pt-28 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/training/free"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-navy transition hover:text-brand-teal"
          >
            <ArrowLeft className="h-4 w-4" />
            All free trainings
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">Free training</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-brand-navy md:text-4xl">
            {program.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <MapPin className="size-4 text-brand-teal" aria-hidden />
            {program.venue_location}
          </p>

          <div className="mt-10">
            <FreeTrainingRegisterForm slug={slug} program={program} />
          </div>

          {program.certificate_download_enabled !== false ? (
            <FreeTrainingCertificateDownload slug={slug} />
          ) : null}
        </div>
      </article>
      <Footer />
    </main>
  )
}
