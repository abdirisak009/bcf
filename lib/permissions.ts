import type { AuthUser } from '@/lib/auth-client'

/** Mirrors backend/internal/permissions/keys.go */
export const PERM = {
  news: 'news',
  publications: 'publications',
  trainings: 'trainings',
  applications: 'applications',
  projects: 'projects',
  invoices: 'invoices',
  financial_reports: 'financial_reports',
  payments: 'payments',
  expenses: 'expenses',
  clients: 'clients',
  partners: 'partners',
} as const

export type PermissionKey = (typeof PERM)[keyof typeof PERM]

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  [PERM.news]: 'News & categories',
  [PERM.publications]: 'Publications',
  [PERM.trainings]: 'Trainings & academies',
  [PERM.applications]: 'Applications',
  [PERM.projects]: 'Projects',
  [PERM.invoices]: 'Invoices & PDFs',
  [PERM.financial_reports]: 'Financial reports',
  [PERM.payments]: 'Payments',
  [PERM.expenses]: 'Expenses',
  [PERM.clients]: 'Clients',
  [PERM.partners]: 'Partners',
}

export type DashboardNavId =
  | 'overview'
  | 'news'
  | 'publications'
  | 'trainings'
  | 'free-training'
  | 'applications'
  | 'finance-overview'
  | 'invoices'
  | 'projects'
  | 'payments'
  | 'expenses'
  | 'financial-reports'
  | 'reports'
  | 'clients'
  | 'partners'
  | 'users'

const NAV_PERM: Partial<Record<DashboardNavId, PermissionKey | PermissionKey[]>> = {
  news: PERM.news,
  publications: PERM.publications,
  trainings: PERM.trainings,
  'free-training': PERM.trainings,
  applications: PERM.applications,
  projects: PERM.projects,
  invoices: PERM.invoices,
  'financial-reports': PERM.financial_reports,
  reports: PERM.financial_reports,
  payments: PERM.payments,
  expenses: PERM.expenses,
  clients: PERM.clients,
  partners: PERM.partners,
  'finance-overview': [PERM.payments, PERM.expenses, PERM.invoices],
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin'
}

/** Whether the user can open a dashboard nav section (admin: all). */
export function canAccessNav(user: AuthUser | null, nav: DashboardNavId): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (nav === 'overview') return true
  if (nav === 'users') return false
  const need = NAV_PERM[nav]
  if (!need) return true
  const list = Array.isArray(need) ? need : [need]
  const have = new Set(user.permissions ?? [])
  if (user.role === 'partner' && (!user.permissions || user.permissions.length === 0)) {
    return nav === 'news'
  }
  return list.some((p) => have.has(p))
}

export function hasPermission(user: AuthUser | null, key: PermissionKey): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'partner' && (!user.permissions || user.permissions.length === 0)) {
    return key === PERM.news
  }
  return (user.permissions ?? []).includes(key)
}
