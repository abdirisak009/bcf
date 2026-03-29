import { academies, getTrainingApplyPathForCourse } from '@/lib/training-catalogue-data'

/** Matches the shape used by `TrainingDynamicSection` (API + static merged). */
export type StaticCatalogAcademyRow = {
  id: string
  name: string
  description?: string | null
  trainings: StaticCatalogTrainingRow[]
}

export type StaticCatalogTrainingRow = {
  id: string
  title: string
  description?: string | null
  duration?: string | null
  format?: string | null
  level?: string | null
  curriculum?: unknown
  outcomes?: unknown
  /** Use full apply page for catalogue entries (no DB training UUID). */
  applyHref: string
}

/** Published catalogue from `training-catalogue-data` — appended after dashboard/API academies on `/training`. */
export function getStaticTrainingCatalogRows(): StaticCatalogAcademyRow[] {
  return academies.map((a) => ({
    id: `static-${a.id}`,
    name: a.name,
    description: a.description,
    trainings: a.courses.map((c) => ({
      id: `static-${a.id}-${c.code.replace(/\./g, '-')}`,
      title: `Course ${c.code} — ${c.title}`,
      description: c.summary,
      duration: c.duration,
      format: c.format,
      level: c.level,
      applyHref: getTrainingApplyPathForCourse(a.id, c.code),
    })),
  }))
}
