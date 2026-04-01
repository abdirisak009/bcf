'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  BookOpen,
  Building2,
  CreditCard,
  FileText,
  GraduationCap,
  Handshake,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Receipt,
  Settings,
  BarChart3,
  FileDown,
  FileSpreadsheet,
  FolderKanban,
  Gift,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react'

import { ActivityChart, type ActivityPoint } from '@/components/dashboard/activity-chart'
import { NewsArticleForm } from '@/components/dashboard/news-article-form'
import { NewsArticlesTable } from '@/components/dashboard/news-articles-table'
import { NewsCategoryForm } from '@/components/dashboard/news-category-form'
import { FinancialReportsPanel } from '@/components/dashboard/financial-reports-panel'
import { ReportsHub } from '@/components/dashboard/reports-hub'
import { InvoicesTable } from '@/components/dashboard/financial-invoices-table'
import {
  ClientsTable,
  ExpensesTable,
  PartnersTable,
  PaymentsTable,
} from '@/components/dashboard/operations-tables'
import { ProjectsTable } from '@/components/dashboard/projects-table'
import { PublicationForm } from '@/components/dashboard/publication-form'
import { PublicationsTable } from '@/components/dashboard/publications-table'
import { ApplicationsTable } from '@/components/dashboard/applications-table'
import { FreeTrainingPanel } from '@/components/dashboard/free-training-panel'
import { TrainingsManage } from '@/components/dashboard/trainings-manage'
import { UsersManagementPanel } from '@/components/dashboard/users-management-panel'
import { getApiBase, type ApiEnvelope } from '@/lib/api'
import { clearSession, getAuthHeaders, getStoredUser } from '@/lib/auth-client'
import { canAccessNav, type DashboardNavId, isAdmin } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/** Same light wordmark as `components/footer.tsx` (navy / dark backgrounds). */
const LOGO_SRC =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-light-P0BU6tiM5ptby7QodAsAhFQEc478P5.png'

const BRAND = {
  name: 'Bararug Consulting',
  tagline: 'Policy · Governance · Growth',
}

type ItemsData<T> = { items: T[] }

type NavId =
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

const NAV_TITLE: Record<NavId, string> = {
  overview: 'Overview',
  news: 'News',
  publications: 'Publications',
  trainings: 'Trainings',
  'free-training': 'Free training',
  applications: 'Applications',
  'finance-overview': 'Financial overview',
  invoices: 'Invoices',
  projects: 'Projects',
  payments: 'Payments',
  expenses: 'Expenses',
  'financial-reports': 'Financial reports',
  reports: 'Reports',
  clients: 'Clients',
  partners: 'Partners',
  users: 'Users & access',
}

async function fetchJSON<T>(path: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  })
  return res.json() as Promise<ApiEnvelope<T>>
}

function DashboardAccountMenu({ variant }: { variant: 'sidebar' | 'header' }) {
  const router = useRouter()
  const stored = getStoredUser()
  const label = stored?.email ?? 'Account'

  function handleSignOut() {
    clearSession()
    router.push('/sign-in')
    router.refresh()
  }

  const triggerSidebar = (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
        'border-white/10 bg-white/5 hover:bg-white/10',
      )}
    >
      <Avatar className="size-10 shrink-0 border-2 border-white/25">
        <AvatarFallback className="bg-brand-teal/35 text-white">
          <User className="size-5" strokeWidth={2} />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">{label}</p>
        <p className="text-[11px] text-white/55">Sign out</p>
      </div>
    </button>
  )

  const triggerHeader = (
    <Button
      type="button"
      variant="ghost"
      className="size-10 shrink-0 rounded-full p-0 ring-2 ring-brand-teal/30 ring-offset-2 ring-offset-white hover:bg-brand-mint/30"
      aria-label="Account menu"
    >
      <Avatar className="size-9 border border-brand-navy/10">
        <AvatarFallback className="bg-brand-mint/70 text-brand-navy">
          <User className="size-4" strokeWidth={2} />
        </AvatarFallback>
      </Avatar>
    </Button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{variant === 'sidebar' ? triggerSidebar : triggerHeader}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === 'sidebar' ? 'start' : 'end'}
        className="w-52 border-brand-navy/12 bg-card"
      >
        <DropdownMenuLabel className="text-brand-navy">Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-brand-navy/10" />
        <DropdownMenuItem
          className="cursor-pointer text-brand-navy focus:bg-brand-mint/40"
          onSelect={(e) => {
            e.preventDefault()
            handleSignOut()
          }}
        >
          <LogOut className="mr-2 size-4 text-brand-teal" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildDailySeries(rows: Record<string, unknown>[], days: number): ActivityPoint[] {
  const map = new Map<string, number>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    map.set(d.toISOString().slice(0, 10), 0)
  }
  for (const r of rows) {
    const raw = r.created_at
    if (raw == null) continue
    const day = String(raw).slice(0, 10)
    if (map.has(day)) map.set(day, (map.get(day) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }))
}

const NAV_ORDER: NavId[] = [
  'overview',
  'news',
  'publications',
  'trainings',
  'free-training',
  'applications',
  'finance-overview',
  'invoices',
  'projects',
  'payments',
  'expenses',
  'financial-reports',
  'reports',
  'clients',
  'partners',
  'users',
]

export function DashboardView() {
  const sessionUser = getStoredUser()
  const [activeNav, setActiveNav] = useState<NavId>('overview')
  const [chartDays, setChartDays] = useState<7 | 30>(30)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newsCategoriesVersion, setNewsCategoriesVersion] = useState(0)

  const [newsItems, setNewsItems] = useState<Record<string, unknown>[]>([])
  const [pubItems, setPubItems] = useState<Record<string, unknown>[]>([])
  const [trainItems, setTrainItems] = useState<Record<string, unknown>[]>([])
  const [applications, setApplications] = useState<Record<string, unknown>[]>([])
  const [payments, setPayments] = useState<Record<string, unknown>[]>([])
  const [expenses, setExpenses] = useState<Record<string, unknown>[]>([])
  const [clients, setClients] = useState<Record<string, unknown>[]>([])
  const [partners, setPartners] = useState<Record<string, unknown>[]>([])
  const [academyItems, setAcademyItems] = useState<Record<string, unknown>[]>([])
  const [invoiceItems, setInvoiceItems] = useState<Record<string, unknown>[]>([])
  const [projectItems, setProjectItems] = useState<Record<string, unknown>[]>([])

  const firstAllowedNav = useMemo(() => {
    if (!sessionUser) return 'overview'
    const hit = NAV_ORDER.find((id) => canAccessNav(sessionUser, id as DashboardNavId))
    return hit ?? 'overview'
  }, [sessionUser])

  useEffect(() => {
    if (!sessionUser) return
    if (!canAccessNav(sessionUser, activeNav as DashboardNavId)) {
      setActiveNav(firstAllowedNav)
    }
  }, [sessionUser, activeNav, firstAllowedNav])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [n, p, t, a, pay, e, c, par, ac, inv, proj] = await Promise.all([
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/news?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/publications?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/trainings?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/applications?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/payments?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/expenses?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/clients?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/partners?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/academies?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/invoices?limit=500'),
          fetchJSON<ItemsData<Record<string, unknown>>>('/api/projects?limit=500'),
        ])
        if (cancelled) return
        setNewsItems(n.success && n.data?.items ? n.data.items : [])
        setPubItems(p.success && p.data?.items ? p.data.items : [])
        setTrainItems(t.success && t.data?.items ? t.data.items : [])
        setApplications(a.success && a.data?.items ? a.data.items : [])
        setPayments(pay.success && pay.data?.items ? pay.data.items : [])
        setExpenses(e.success && e.data?.items ? e.data.items : [])
        setClients(c.success && c.data?.items ? c.data.items : [])
        setPartners(par.success && par.data?.items ? par.data.items : [])
        setAcademyItems(ac.success && ac.data?.items ? ac.data.items : [])
        setInvoiceItems(inv.success && inv.data?.items ? inv.data.items : [])
        setProjectItems(proj.success && proj.data?.items ? proj.data.items : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function refetchNews() {
    const n = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/news?limit=500')
    setNewsItems(n.success && n.data?.items ? n.data.items : [])
  }

  async function refetchPublications() {
    const p = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/publications?limit=500')
    setPubItems(p.success && p.data?.items ? p.data.items : [])
  }

  async function refetchTrainingsAndAcademies() {
    const [t, ac] = await Promise.all([
      fetchJSON<ItemsData<Record<string, unknown>>>('/api/trainings?limit=500'),
      fetchJSON<ItemsData<Record<string, unknown>>>('/api/academies?limit=500'),
    ])
    setTrainItems(t.success && t.data?.items ? t.data.items : [])
    setAcademyItems(ac.success && ac.data?.items ? ac.data.items : [])
  }

  async function refetchPayments() {
    const pay = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/payments?limit=500')
    setPayments(pay.success && pay.data?.items ? pay.data.items : [])
    const inv = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/invoices?limit=500')
    setInvoiceItems(inv.success && inv.data?.items ? inv.data.items : [])
  }

  async function refetchExpenses() {
    const [ex, proj] = await Promise.all([
      fetchJSON<ItemsData<Record<string, unknown>>>('/api/expenses?limit=500'),
      fetchJSON<ItemsData<Record<string, unknown>>>('/api/projects?limit=500'),
    ])
    setExpenses(ex.success && ex.data?.items ? ex.data.items : [])
    setProjectItems(proj.success && proj.data?.items ? proj.data.items : [])
  }

  async function refetchClients() {
    const c = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/clients?limit=500')
    setClients(c.success && c.data?.items ? c.data.items : [])
  }

  async function refetchPartners() {
    const par = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/partners?limit=500')
    setPartners(par.success && par.data?.items ? par.data.items : [])
  }

  async function refetchApplications() {
    const a = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/applications?limit=500')
    setApplications(a.success && a.data?.items ? a.data.items : [])
  }

  async function refetchInvoices() {
    const inv = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/invoices?limit=500')
    setInvoiceItems(inv.success && inv.data?.items ? inv.data.items : [])
  }

  async function refetchProjects() {
    const proj = await fetchJSON<ItemsData<Record<string, unknown>>>('/api/projects?limit=500')
    setProjectItems(proj.success && proj.data?.items ? proj.data.items : [])
  }

  const totalContent = newsItems.length + pubItems.length + trainItems.length
  const paymentsTotal = useMemo(
    () =>
      payments.reduce((s, p) => {
        const raw = p.amount_paid ?? p.amount
        return s + Number(raw ?? 0)
      }, 0),
    [payments],
  )
  const expensesTotal = useMemo(
    () => expenses.reduce((s, p) => s + Number(p.amount ?? 0), 0),
    [expenses],
  )
  const netCashflow = paymentsTotal - expensesTotal
  const paymentsByCurrency = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of payments) {
      const cur = String(p.currency ?? 'USD').trim() || 'USD'
      const amt = Number(p.amount_paid ?? p.amount ?? 0)
      if (!Number.isFinite(amt)) continue
      m.set(cur, (m.get(cur) ?? 0) + amt)
    }
    return Array.from(m.entries())
      .map(([currency, total]) => ({ currency, total }))
      .sort((a, b) => a.currency.localeCompare(b.currency))
  }, [payments])

  const chartData = useMemo(() => {
    const days = chartDays
    const allRows = [
      ...newsItems,
      ...pubItems,
      ...trainItems,
      ...applications,
      ...payments,
      ...expenses,
    ]
    return buildDailySeries(allRows, days)
  }, [newsItems, pubItems, trainItems, applications, payments, expenses, chartDays])

  const NavButton = ({
    id,
    icon: Icon,
    label,
  }: {
    id: NavId
    icon: ComponentType<{ className?: string }>
    label: string
  }) => (
    <button
      type="button"
      onClick={() => {
        setActiveNav(id)
        setMobileOpen(false)
      }}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all',
        activeNav === id
          ? 'border border-white/15 bg-brand-teal text-white shadow-sm'
          : 'border border-transparent text-white/85 hover:bg-white/10 hover:text-white',
      )}
    >
      <Icon className={cn('size-4 shrink-0', activeNav === id ? 'text-white' : 'text-white/75')} />
      <span className="flex-1 truncate">{label}</span>
    </button>
  )

  const sidebarInner = (
    <>
      <div className="h-1.5 shrink-0 bg-brand-teal" aria-hidden />
      <div className="flex flex-col gap-4 p-4">
        <Link
          href="/"
          className="block rounded-lg px-0 py-0.5 transition-opacity hover:opacity-90"
        >
          <Image
            src={LOGO_SRC}
            alt={BRAND.name}
            width={220}
            height={72}
            className="h-14 w-auto max-w-[200px] object-contain object-left"
            priority
          />
        </Link>
        <p className="text-xs leading-snug text-white/55">{BRAND.tagline}</p>
        <DashboardAccountMenu variant="sidebar" />
      </div>
      <Separator className="bg-white/10" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-1">
        <ScrollArea className="min-h-0 flex-1 touch-pan-y">
          <div className="space-y-1 pr-3 pb-4">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Main
            </p>
            {canAccessNav(sessionUser, 'overview') && (
              <NavButton id="overview" icon={LayoutDashboard} label="Overview" />
            )}
            {canAccessNav(sessionUser, 'news') && <NavButton id="news" icon={Newspaper} label="News" />}
            {canAccessNav(sessionUser, 'publications') && (
              <NavButton id="publications" icon={BookOpen} label="Publications" />
            )}
            {canAccessNav(sessionUser, 'trainings') && (
              <NavButton id="trainings" icon={GraduationCap} label="Trainings" />
            )}
            {canAccessNav(sessionUser, 'free-training') && (
              <NavButton id="free-training" icon={Gift} label="Free training" />
            )}
            <p className="mt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Operations
            </p>
            {canAccessNav(sessionUser, 'applications') && (
              <NavButton id="applications" icon={FileText} label="Applications" />
            )}
            <p className="mt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Finance
            </p>
            {canAccessNav(sessionUser, 'finance-overview') && (
              <NavButton id="finance-overview" icon={Wallet} label="Financial overview" />
            )}
            {canAccessNav(sessionUser, 'invoices') && (
              <NavButton id="invoices" icon={FileSpreadsheet} label="Invoices" />
            )}
            {canAccessNav(sessionUser, 'projects') && (
              <NavButton id="projects" icon={FolderKanban} label="Projects" />
            )}
            {canAccessNav(sessionUser, 'payments') && (
              <NavButton id="payments" icon={CreditCard} label="Payments" />
            )}
            {canAccessNav(sessionUser, 'expenses') && (
              <NavButton id="expenses" icon={Receipt} label="Expenses" />
            )}
            {canAccessNav(sessionUser, 'financial-reports') && (
              <NavButton id="financial-reports" icon={BarChart3} label="Financial reports" />
            )}
            {canAccessNav(sessionUser, 'reports') && (
              <NavButton id="reports" icon={FileDown} label="Reports" />
            )}
            <p className="mt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Directory
            </p>
            {canAccessNav(sessionUser, 'clients') && (
              <NavButton id="clients" icon={Building2} label="Clients" />
            )}
            {canAccessNav(sessionUser, 'partners') && (
              <NavButton id="partners" icon={Handshake} label="Partners" />
            )}
            {isAdmin(sessionUser) && (
              <>
                <p className="mt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  Administration
                </p>
                <NavButton id="users" icon={Users} label="Users & access" />
              </>
            )}
          </div>
        </ScrollArea>
      </div>
      <Separator className="bg-white/10" />
      <div className="shrink-0 space-y-1 p-3">
        <Button variant="ghost" className="w-full justify-start gap-2 text-white/90 hover:bg-white/10 hover:text-white" asChild>
          <Link href="/">
            <Home className="size-4" />
            Back to website
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-white/65 hover:bg-white/10 hover:text-white" asChild>
          <Link href="/contact">
            <Settings className="size-4" />
            Support
          </Link>
        </Button>
      </div>
      <div className="shrink-0 border-t border-white/10 p-3">
        <p className="text-center text-[11px] leading-relaxed text-white/45">
          Public overview — everyone can explore programs, news, and activity summaries.
        </p>
      </div>
    </>
  )

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-brand-mint/25">
      <aside className="hidden h-full min-h-0 w-[17rem] shrink-0 flex-col border-r border-white/10 bg-brand-navy text-white shadow-[4px_0_20px_-8px_rgba(23,94,126,0.35)] lg:flex lg:min-h-0">
        {sidebarInner}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 border-white/20 bg-brand-navy text-white shadow-md backdrop-blur-sm lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-white/10 bg-brand-navy p-0 text-white">
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full max-h-[100dvh] min-h-0 flex-col">{sidebarInner}</div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Teal stripe aligns with sidebar top; header sits flush under it */}
        <div className="h-1.5 shrink-0 bg-brand-teal" aria-hidden />
        <header className="sticky top-0 z-40 shrink-0 border-b border-brand-navy/10 bg-white px-4 py-2 shadow-sm sm:px-6 sm:py-2.5 lg:px-8">
          <div className="flex items-center justify-between gap-3 pl-12 lg:pl-0">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-teal sm:text-[11px]">
                Dashboard
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight text-brand-navy sm:text-xl">
                {NAV_TITLE[activeNav]}
              </h1>
            </div>
            <DashboardAccountMenu variant="header" />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth">
          <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">
            {activeNav === 'overview' && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    title="Content items"
                    value={loading ? '—' : String(totalContent)}
                    hint="News + publications + trainings"
                    icon={TrendingUp}
                    variant="mint"
                  />
                  <KpiCard
                    title="Training applications"
                    value={loading ? '—' : String(applications.length)}
                    hint="Submitted forms"
                    icon={FileText}
                    variant="teal"
                  />
                  <KpiCard
                    title="Payments (total)"
                    value={loading ? '—' : formatMoney(paymentsTotal)}
                    hint="Sum of recorded payments"
                    icon={CreditCard}
                    variant="green"
                  />
                  <KpiCard
                    title="Expenses (total)"
                    value={loading ? '—' : formatMoney(expensesTotal)}
                    hint="Recorded spend"
                    icon={Receipt}
                    variant="mintAlt"
                  />
                </div>

                <div className="overflow-hidden rounded-xl border border-brand-navy/12 bg-white shadow-sm">
                  <div className="border-b border-brand-navy/8 bg-brand-mint/30 px-4 py-3 sm:px-6 sm:py-3.5">
                    <div className="flex flex-row flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-brand-navy">Activity</h3>
                        <p className="text-sm text-slate-600">New records per day (aggregated)</p>
                      </div>
                      <div className="flex gap-0.5 rounded-lg border border-brand-navy/10 bg-white p-1">
                          <Button
                            type="button"
                            variant={chartDays === 7 ? 'default' : 'ghost'}
                            size="sm"
                            className={cn(
                              'h-9 rounded-md px-4',
                              chartDays === 7 && 'bg-brand-teal text-white shadow-sm',
                              chartDays !== 7 && 'text-brand-navy hover:bg-brand-mint/50',
                            )}
                            onClick={() => setChartDays(7)}
                          >
                            7 days
                          </Button>
                          <Button
                            type="button"
                            variant={chartDays === 30 ? 'default' : 'ghost'}
                            size="sm"
                            className={cn(
                              'h-9 rounded-md px-4',
                              chartDays === 30 && 'bg-brand-teal text-white shadow-sm',
                              chartDays !== 30 && 'text-brand-navy hover:bg-brand-mint/50',
                            )}
                            onClick={() => setChartDays(30)}
                          >
                            30 days
                          </Button>
                        </div>
                    </div>
                  </div>
                  <div className="bg-brand-mint/10 p-4 sm:p-6">
                    <ActivityChart data={chartData} />
                  </div>
                </div>
              </>
            )}

            {activeNav === 'news' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-xl text-sm text-slate-600">
                    Add articles here — they appear on the public News page for visitors.
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <NewsCategoryForm
                      onCreated={() => setNewsCategoriesVersion((v) => v + 1)}
                    />
                    <NewsArticleForm
                      onCreated={refetchNews}
                      categoriesVersion={newsCategoriesVersion}
                    />
                  </div>
                </div>
                <NewsArticlesTable
                  rows={newsItems}
                  loading={loading}
                  empty={loading ? 'Loading…' : 'No articles yet — use New article.'}
                  onRefresh={refetchNews}
                  categoriesVersion={newsCategoriesVersion}
                />
              </div>
            )}
            {activeNav === 'publications' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-xl text-sm text-slate-600">
                    Uploads go to MinIO; URLs look like{' '}
                    <span className="font-mono text-xs">/files/publications/…</span>{' '}
                    in this repo.
                  </p>
                  <PublicationForm onCreated={refetchPublications} />
                </div>
                <PublicationsTable
                  rows={pubItems}
                  loading={loading}
                  empty={loading ? 'Loading…' : 'No publications — use New publication.'}
                  onRefresh={refetchPublications}
                />
              </div>
            )}
            {activeNav === 'trainings' && (
              <TrainingsManage
                academies={academyItems}
                trainings={trainItems}
                loading={loading}
                onRefresh={refetchTrainingsAndAcademies}
              />
            )}
            {activeNav === 'free-training' && <FreeTrainingPanel />}
            {activeNav === 'applications' && (
              <ApplicationsTable
                rows={applications}
                trainings={trainItems}
                loading={loading}
                empty={
                  loading
                    ? 'Loading…'
                    : 'No applications yet — use Add new to register someone manually, or they appear when visitors apply on the Training page.'
                }
                onRefresh={refetchApplications}
              />
            )}
            {activeNav === 'finance-overview' && (
              <div className="space-y-6">
                <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
                  Track consulting and training income alongside operational spend. Use{' '}
                  <span className="font-medium text-brand-navy">payment type</span> to label projects or training fees;
                  expenses are recorded in a single amount column (add categories for reporting).
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    title="Payments (sum of amounts)"
                    value={loading ? '—' : formatMoney(paymentsTotal)}
                    hint="All currencies summed as numbers — see breakdown below"
                    icon={CreditCard}
                    variant="green"
                  />
                  <KpiCard
                    title="Expenses (total)"
                    value={loading ? '—' : formatMoney(expensesTotal)}
                    hint={`${expenses.length} expense record(s)`}
                    icon={Receipt}
                    variant="mintAlt"
                  />
                  <KpiCard
                    title="Net (payments − expenses)"
                    value={loading ? '—' : formatMoney(netCashflow)}
                    hint="Approximate when mixed currencies are used"
                    icon={TrendingUp}
                    variant="teal"
                  />
                  <KpiCard
                    title="Records"
                    value={loading ? '—' : `${payments.length} pay · ${expenses.length} exp`}
                    hint="Transactions in the dashboard database"
                    icon={Wallet}
                    variant="mint"
                  />
                </div>
                <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
                  <div className="h-1 bg-brand-teal" />
                  <CardHeader className="border-b border-brand-navy/8 bg-brand-mint/25 py-4">
                    <CardTitle className="text-lg text-brand-navy">Payments by currency</CardTitle>
                    <CardDescription className="text-slate-600">
                      Totals per currency code. Use the Financial reports page for P&amp;L in a chosen period.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loading ? (
                      <p className="text-muted-foreground px-6 py-6 text-sm">Loading…</p>
                    ) : paymentsByCurrency.length === 0 ? (
                      <p className="text-muted-foreground px-6 py-6 text-sm">No payments yet — use Payments to add income.</p>
                    ) : (
                      <ScrollArea className="max-h-[min(280px,40dvh)] w-full">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                              <TableHead className="font-semibold text-white">Currency</TableHead>
                              <TableHead className="text-right font-semibold text-white">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paymentsByCurrency.map((row) => (
                              <TableRow key={row.currency} className="odd:bg-white even:bg-brand-mint/15">
                                <TableCell className="font-mono text-sm font-medium text-brand-navy">{row.currency}</TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  {row.total.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="bg-brand-navy text-white hover:brightness-110"
                    onClick={() => setActiveNav('invoices')}
                  >
                    <FileSpreadsheet className="mr-2 size-4" />
                    Invoices
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-brand-navy/20 text-brand-navy hover:bg-brand-mint/40"
                    onClick={() => setActiveNav('payments')}
                  >
                    <CreditCard className="mr-2 size-4" />
                    Payments
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-brand-navy/20 text-brand-navy hover:bg-brand-mint/40"
                    onClick={() => setActiveNav('expenses')}
                  >
                    <Receipt className="mr-2 size-4" />
                    Expenses
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-brand-navy/20 text-brand-navy hover:bg-brand-mint/40"
                    onClick={() => setActiveNav('financial-reports')}
                  >
                    <BarChart3 className="mr-2 size-4" />
                    Reports
                  </Button>
                </div>
              </div>
            )}
            {activeNav === 'invoices' && (
              <InvoicesTable
                rows={invoiceItems}
                clients={clients}
                trainings={trainItems}
                projects={projectItems}
                loading={loading}
                empty={loading ? 'Loading…' : 'No invoices yet — create one or link payments.'}
                onRefresh={refetchInvoices}
              />
            )}
            {activeNav === 'projects' && (
              <ProjectsTable
                rows={projectItems}
                clients={clients}
                expenses={expenses}
                loading={loading}
                empty={loading ? 'Loading…' : 'No projects — add consulting engagements here.'}
                onRefresh={refetchProjects}
              />
            )}
            {activeNav === 'payments' && (
              <PaymentsTable
                rows={payments}
                clients={clients}
                invoices={invoiceItems}
                loading={loading}
                empty={loading ? 'Loading…' : 'No payments — use Add payment.'}
                onRefresh={refetchPayments}
              />
            )}
            {activeNav === 'expenses' && (
              <ExpensesTable
                rows={expenses}
                projects={projectItems}
                loading={loading}
                empty={loading ? 'Loading…' : 'No expenses — use Add expense.'}
                onRefresh={refetchExpenses}
              />
            )}
            {activeNav === 'financial-reports' && (
              <div className="space-y-4">
                <p className="max-w-3xl text-sm text-slate-600">
                  Profit &amp; loss, revenue by type, expense categories, and monthly cash flow for the selected period.
                </p>
                <FinancialReportsPanel />
              </div>
            )}
            {activeNav === 'reports' && (
              <ReportsHub
                loading={loading}
                projects={projectItems}
                expenses={expenses}
                clients={clients}
              />
            )}
            {activeNav === 'clients' && (
              <ClientsTable
                rows={clients}
                loading={loading}
                empty={loading ? 'Loading…' : 'No clients — use Add client.'}
                onRefresh={refetchClients}
              />
            )}
            {activeNav === 'partners' && (
              <PartnersTable
                rows={partners}
                loading={loading}
                empty={loading ? 'Loading…' : 'No partners — use Add partner.'}
                onRefresh={refetchPartners}
              />
            )}
            {activeNav === 'users' && isAdmin(sessionUser) && <UsersManagementPanel />}
          </div>
        </main>
      </div>
    </div>
  )
}

const kpiSurfaces: Record<
  'mint' | 'teal' | 'green' | 'mintAlt',
  { card: string; icon: string }
> = {
  mint: {
    card: 'border-brand-navy/12 bg-brand-mint/50',
    icon: 'border-brand-teal/30 bg-brand-teal/20 text-brand-teal',
  },
  teal: {
    card: 'border-brand-teal/25 bg-brand-teal/12',
    icon: 'border-brand-navy/25 bg-brand-navy/12 text-brand-navy',
  },
  green: {
    card: 'border-brand-green/30 bg-brand-green/20',
    icon: 'border-brand-teal/30 bg-white text-brand-navy shadow-sm',
  },
  mintAlt: {
    card: 'border-brand-navy/12 bg-brand-mint/35',
    icon: 'border-brand-navy/20 bg-brand-mint/60 text-brand-navy',
  },
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  variant,
}: {
  title: string
  value: string
  hint: string
  icon: ComponentType<{ className?: string }>
  variant: keyof typeof kpiSurfaces
}) {
  const s = kpiSurfaces[variant]
  return (
    <div
      className={cn(
        'rounded-xl border p-4 shadow-sm transition hover:shadow-md sm:p-5',
        s.card,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-brand-navy/10 pb-3">
        <span className="text-sm font-medium text-brand-navy/80">{title}</span>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg border',
            s.icon,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="pt-3">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-brand-navy">{value}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{hint}</p>
      </div>
    </div>
  )
}

function DataTable({
  title,
  rows,
  empty,
  columns,
}: {
  title: string
  rows: Record<string, unknown>[]
  empty: string
  columns: string[]
}) {
  return (
    <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
      <div className="h-1 bg-brand-teal" />
      <CardHeader className="border-b border-brand-navy/8 bg-brand-mint/25 py-4">
        <CardTitle className="text-lg text-brand-navy">{title}</CardTitle>
        <CardDescription className="text-slate-600">
          {rows.length} row{rows.length === 1 ? '' : 's'} · database
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {rows.length === 0 ? (
          <p className="px-6 pb-6 pt-6 text-sm text-slate-600">{empty}</p>
        ) : (
          <ScrollArea className="max-h-[min(560px,calc(100dvh-16rem))] w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                  {columns.map((c) => (
                    <TableHead key={c} className="whitespace-nowrap font-semibold text-white">
                      {c}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow
                    key={i}
                    className="border-brand-navy/8 odd:bg-white even:bg-brand-mint/15 hover:bg-brand-mint/35"
                  >
                    {columns.map((c) => (
                      <TableCell key={c} className="max-w-[min(280px,40vw)] align-top font-mono text-xs text-brand-navy">
                        <span className="line-clamp-3 break-all">{formatCell(row[c])}</span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function formatCell(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
  return JSON.stringify(v)
}

function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}
