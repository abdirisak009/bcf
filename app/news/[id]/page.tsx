import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'

import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import { getApiInternalBase } from '@/lib/api'

type NewsArticleData = {
  id: string
  title: string
  excerpt?: string | null
  body?: string | null
  category: string
  featured_image_url?: string
  gallery_urls?: string[]
  published_at?: string | null
  created_at: string
}

async function fetchNewsArticle(id: string): Promise<NewsArticleData | null> {
  const base = getApiInternalBase().replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/api/news/${id}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { success?: boolean; data?: NewsArticleData }
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
  const article = await fetchNewsArticle(id)
  if (!article) {
    return { title: 'News | Baraarug Consulting Firm' }
  }
  return {
    title: `${article.title} | Baraarug Consulting Firm`,
    description:
      (article.excerpt && article.excerpt.trim()) ||
      (article.body ? `${article.body.slice(0, 155).trim()}…` : undefined),
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await fetchNewsArticle(id)
  if (!article) notFound()

  const raw = article.published_at || article.created_at
  const d = new Date(raw)
  const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const bodyText = (article.body && article.body.trim()) || ''
  const excerptText = (article.excerpt && article.excerpt.trim()) || ''
  const mainText =
    excerptText && bodyText ? bodyText : bodyText || excerptText
  const paragraphs = mainText.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  const gallery = Array.isArray(article.gallery_urls) ? article.gallery_urls.filter(Boolean) : []
  const len = bodyText.length
  const readTime = len > 500 ? '5 min read' : len > 200 ? '3 min read' : '2 min read'

  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />
      <article className="pb-16 pt-24 sm:pt-28 md:pb-24">
        {article.featured_image_url ? (
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[21/9] max-h-[min(52vh,420px)] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-lg ring-1 ring-slate-200/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featured_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-brand-navy/40" />
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/news"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-navy transition hover:text-brand-teal"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">{article.category}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-brand-navy md:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-teal" />
              {dateStr}
            </span>
            {bodyText ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                {readTime}
              </span>
            ) : null}
          </div>

          <div className="prose prose-slate mt-10 max-w-none">
            {excerptText && bodyText ? (
              <p className="mb-6 text-lg font-medium leading-relaxed text-slate-700">{excerptText}</p>
            ) : null}
            {paragraphs.map((block, i) => (
              <p key={i} className="mt-4 text-base leading-relaxed text-slate-600 first:mt-0">
                {block.split('\n').map((line, j) => (
                  <span key={j}>
                    {j > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
            ))}
          </div>

          {gallery.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-brand-navy">Gallery</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {gallery.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>
      <Footer />
    </main>
  )
}
