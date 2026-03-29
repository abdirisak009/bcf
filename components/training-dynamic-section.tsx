'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock,
  GraduationCap,
  Layers,
  Loader2,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { getApiBase } from '@/lib/api'
import { getStaticTrainingCatalogRows } from '@/lib/map-static-training-catalog'

const PREVIEW_TOPICS = 2

type CurriculumItem = { title?: string; detail?: string }

type TrainingRow = {
  id: string
  title: string
  description?: string | null
  duration?: string | null
  format?: string | null
  level?: string | null
  curriculum?: unknown
  outcomes?: unknown
  /** Set for published catalogue rows — opens `/training/apply/...` instead of the DB-backed sheet. */
  applyHref?: string
}

type AcademyRow = {
  id: string
  name: string
  description?: string | null
  trainings?: TrainingRow[]
}

function parseCurriculum(raw: unknown): CurriculumItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x) => {
    if (x && typeof x === 'object') {
      const o = x as Record<string, unknown>
      return { title: String(o.title ?? ''), detail: String(o.detail ?? '') }
    }
    return { title: '', detail: '' }
  })
}

function parseOutcomes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x) => String(x)).filter(Boolean)
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={`transition-all duration-700 ${v ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

function trainingApplyProgramPath(trainingId: string) {
  return `/training/apply/program/${trainingId}`
}

function TrainingCard({ c }: { c: TrainingRow }) {
  const curriculum = parseCurriculum(c.curriculum).filter((t) => t.title?.trim() || t.detail?.trim())
  const outcomes = parseOutcomes(c.outcomes)
  const totalTopics = curriculum.length
  const previewTopics = curriculum.slice(0, Math.min(PREVIEW_TOPICS, totalTopics))
  const restTopics = curriculum.slice(PREVIEW_TOPICS)
  const hasMore = restTopics.length > 0 || outcomes.length > 0
  const previewPct =
    totalTopics > 0 ? Math.round((Math.min(PREVIEW_TOPICS, totalTopics) / totalTopics) * 100) : 0

  const desc = c.description?.trim()
  const duration = c.duration?.trim()
  const format = c.format?.trim()
  const level = c.level?.trim()
  const hasMeta = Boolean(duration || format || level)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(23,94,126,0.15)] transition duration-300 hover:-translate-y-1 hover:border-brand-teal/35 hover:shadow-[0_12px_40px_-12px_rgba(23,94,126,0.18)]">
      <div className="h-1 w-full bg-brand-teal opacity-90" />
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 shrink-0 text-brand-teal" />
          <span className="rounded-full bg-brand-teal/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0d4a2a]">
            Training
          </span>
        </div>

        <h4 className="text-lg font-bold leading-snug text-brand-navy md:text-xl">{c.title}</h4>

        {hasMeta ? (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {duration ? (
              <div className="rounded-lg bg-brand-navy px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm">
                <span className="flex items-center justify-center gap-1.5 opacity-90">
                  <Clock className="size-3.5 shrink-0" />
                  Duration
                </span>
                <p className="mt-1 text-[13px] font-bold leading-tight">{duration}</p>
              </div>
            ) : null}
            {format ? (
              <div className="rounded-lg bg-brand-navy px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm">
                <span className="flex items-center justify-center gap-1.5 opacity-90">
                  <Layers className="size-3.5 shrink-0" />
                  Format
                </span>
                <p className="mt-1 text-[13px] font-bold leading-tight">{format}</p>
              </div>
            ) : null}
            {level ? (
              <div className="rounded-lg bg-brand-teal px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm">
                <span className="flex items-center justify-center gap-1.5 opacity-90">
                  <GraduationCap className="size-3.5 shrink-0" />
                  Level
                </span>
                <p className="mt-1 text-[13px] font-bold leading-tight">{level}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {desc ? (
          <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600" title={desc}>
            {desc}
          </p>
        ) : null}

        {totalTopics > 0 ? (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Curriculum preview</p>
            <ol className="space-y-2">
              {previewTopics.map((topic, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="font-mono text-xs font-bold text-brand-teal tabular-nums">{i + 1}.</span>
                  <span>
                    <span className="font-semibold text-brand-navy">{topic.title || `Topic ${i + 1}`}</span>
                    {topic.detail ? (
                      <span className="mt-0.5 block text-xs italic text-slate-500">{topic.detail}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
            <div className="pt-1">
              <div className="mb-1 flex justify-between text-[11px] font-medium text-slate-500">
                <span>Shown on card</span>
                <span>
                  {Math.min(PREVIEW_TOPICS, totalTopics)} / {totalTopics} modules
                </span>
              </div>
              <Progress
                value={previewPct}
                className="h-2 bg-slate-200 [&>[data-slot=progress-indicator]]:bg-brand-teal"
              />
            </div>
          </div>
        ) : null}

        {hasMore ? (
          <Collapsible className="mt-4">
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-xl border border-brand-navy/15 bg-brand-mint/30 px-4 py-3 text-left text-sm font-semibold text-brand-navy transition hover:bg-brand-mint/50">
              <span>View full programme</span>
              <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden">
              <div className="mt-3 space-y-4 rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
                {restTopics.length > 0 ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Remaining modules
                    </p>
                    <ol className="space-y-3">
                      {restTopics.map((topic, i) => {
                        const n = PREVIEW_TOPICS + i + 1
                        return (
                          <li key={i} className="flex gap-2 text-sm text-slate-700">
                            <span className="font-mono text-xs font-bold text-brand-teal tabular-nums">{n}.</span>
                            <span>
                              <span className="font-semibold text-brand-navy">{topic.title || `Topic ${n}`}</span>
                              {topic.detail ? (
                                <span className="mt-0.5 block text-xs italic text-slate-500">{topic.detail}</span>
                              ) : null}
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                ) : null}

                {outcomes.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-brand-navy/20 shadow-sm">
                    <div className="flex items-center gap-2 bg-brand-navy px-4 py-2.5 text-sm font-bold text-white">
                      <Sparkles className="size-4 shrink-0 text-brand-teal" />
                      Key learning outcomes
                    </div>
                    <ul className="space-y-2 bg-brand-navy/[0.06] px-4 py-4">
                      {outcomes.map((o, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700">
                          <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand-teal" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}

        <Button
          type="button"
          asChild
          className="mt-6 w-full bg-brand-navy font-semibold text-white shadow-md transition hover:bg-brand-teal hover:shadow-lg"
        >
          <Link href={c.applyHref?.trim() ? c.applyHref.trim() : trainingApplyProgramPath(c.id)}>
            Apply now
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export function TrainingDynamicSection() {
  const [items, setItems] = useState<AcademyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    const staticCatalog = getStaticTrainingCatalogRows()
    ;(async () => {
      setError(null)
      try {
        const res = await fetch(`${getApiBase()}/api/academies/catalog`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        const json = (await res.json()) as { success?: boolean; data?: { items?: AcademyRow[] }; error?: string }
        if (cancelled) return
        if (!res.ok || json.success === false) {
          setError(
            json.error ??
              'Could not load programs — showing the offline catalogue only. Start the API for database-backed listings.',
          )
          setItems(staticCatalog)
          return
        }
        const rows = json.data?.items ?? []
        const apiItems = rows.filter((a) => (a.trainings?.length ?? 0) > 0)
        setItems(apiItems)
      } catch {
        if (!cancelled) {
          setError(
            'Network error — showing the published catalogue. Start the API to include programs from the dashboard.',
          )
          setItems(staticCatalog)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <section className="border-b border-slate-200 bg-white py-24 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4">
          <Loader2 className="size-10 animate-spin text-brand-teal" aria-hidden />
          <p className="text-sm font-medium text-slate-600">Loading programs from the database…</p>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="border-b border-slate-200 bg-white py-20 px-6 md:py-28">
        <div className="mx-auto max-w-xl text-center">
          <GraduationCap className="mx-auto mb-4 size-12 text-brand-teal/80" strokeWidth={1.25} />
          <h2 className="text-2xl font-bold text-brand-navy">No trainings yet</h2>
          <p className="mt-3 text-slate-600">
            Add programs in the dashboard, or import the published catalogue once into the database from the backend
            folder:{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-brand-navy">go run ./cmd/seed-training-catalog</code>
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="border-b border-slate-200 bg-white py-16 px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-center text-sm text-amber-950">
            {error}
          </div>
        ) : null}
        <Reveal className="mb-14 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">Programs</span>
          <h2 className="mt-3 text-3xl font-bold text-brand-navy md:text-4xl">By academy</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Programs are loaded from the database (dashboard or one-time catalogue seed). Expand a card for the full
            programme when curriculum and outcomes are set.
          </p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-teal" />
        </Reveal>

        <div className="space-y-16">
          {items.map((academy, ai) => (
            <div key={academy.id} id={`academy-${academy.id}`}>
              <Reveal delay={ai * 40}>
                <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg ring-4 ring-brand-teal/15">
                      <GraduationCap className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-brand-navy">{academy.name}</h3>
                      {academy.description ? (
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{academy.description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Reveal>
              <div className="grid gap-6 md:grid-cols-2">
                {(academy.trainings ?? []).map((c, ci) => (
                  <Reveal key={c.id} delay={ci * 50}>
                    <TrainingCard c={c} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
