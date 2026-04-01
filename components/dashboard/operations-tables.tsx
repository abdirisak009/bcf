'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Building2, CreditCard, FileDown, Handshake, Loader2, Pencil, Plus, Receipt, Trash2 } from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dashboardAuthHeaders } from '@/lib/dashboard-client'
import { uploadDashboardFile } from '@/lib/dashboard-upload'
import { OFFICE_ADDRESS } from '@/lib/site-config'
import {
  dashboardFormInputClass,
  dashboardFormTextareaClass,
  dashboardSheetBody,
  dashboardSheetDescription,
  dashboardSheetFooter,
  dashboardSheetForm,
  dashboardSheetHeader,
  dashboardSheetTitle,
  dashboardSheetWide,
} from '@/lib/dashboard-ui'
import { openDashboardInvoicePdf } from '@/lib/invoice-pdf'
import { cn } from '@/lib/utils'

function formatCell(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

type BaseProps = {
  rows: Record<string, unknown>[]
  loading: boolean
  empty: string
  onRefresh: () => void
}

type PaymentsTableProps = BaseProps & {
  clients: Record<string, unknown>[]
  invoices: Record<string, unknown>[]
}

function toDatetimeLocalValue(iso: unknown): string {
  if (iso == null || typeof iso !== 'string') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function paymentAmount(row: Record<string, unknown>): number {
  const ap = row.amount_paid
  if (ap != null && ap !== '') return Number(ap)
  return Number(row.amount ?? 0)
}

/** Sum of payments linked to an invoice, optionally excluding one payment row (when editing). */
function sumPaidForInvoice(
  paymentRows: Record<string, unknown>[],
  invoiceId: string,
  excludePaymentId: string | null,
): number {
  return paymentRows.reduce((acc, row) => {
    if (String(row.invoice_id ?? '') !== invoiceId) return acc
    if (excludePaymentId && String(row.id ?? '') === excludePaymentId) return acc
    return acc + paymentAmount(row)
  }, 0)
}

export function PaymentsTable({ rows, clients, invoices, loading, empty, onRefresh }: PaymentsTableProps) {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [amountPaid, setAmountPaid] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [paymentType, setPaymentType] = useState('consulting')
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [paymentDate, setPaymentDate] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [clientId, setClientId] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [del, setDel] = useState<{ id: string; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const selectedInvoiceBalance = useMemo(() => {
    if (!invoiceId.trim()) return null
    const inv = invoices.find((i) => String(i.id) === invoiceId) as Record<string, unknown> | undefined
    if (!inv) return null
    const total = Number(inv.amount ?? 0)
    if (!Number.isFinite(total)) return null
    const cur = String(inv.currency ?? 'USD')
    const paidOthers = sumPaidForInvoice(rows, invoiceId, editId)
    const thisPayment = Number.parseFloat(amountPaid) || 0
    const remainingAfter = Math.max(0, total - paidOthers - thisPayment)
    const maxForThisLine = Math.max(0, total - paidOthers)
    const over = thisPayment > maxForThisLine + 1e-6
    return { total, currency: cur, paidOthers, thisPayment, remainingAfter, maxForThisLine, over }
  }, [invoiceId, invoices, rows, editId, amountPaid])

  function openNew() {
    setEditId(null)
    setAmountPaid('')
    setCurrency('USD')
    setPaymentType('consulting')
    setPaymentMethod('bank')
    setPaymentDate(toDatetimeLocalValue(new Date().toISOString()))
    setReferenceNumber('')
    setClientId('')
    setInvoiceId('')
    setErr(null)
    setOpen(true)
  }

  function openEdit(row: Record<string, unknown>) {
    setEditId(String(row.id ?? ''))
    setAmountPaid(String(paymentAmount(row)))
    setCurrency(String(row.currency ?? 'USD'))
    setPaymentType(String(row.payment_type ?? 'consulting'))
    setPaymentMethod(String(row.payment_method ?? 'bank'))
    setPaymentDate(toDatetimeLocalValue(row.payment_date ?? row.created_at))
    setReferenceNumber(String(row.reference_number ?? row.reference ?? ''))
    setClientId(row.client_id ? String(row.client_id) : '')
    setInvoiceId(row.invoice_id ? String(row.invoice_id) : '')
    setErr(null)
    setOpen(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const a = Number.parseFloat(amountPaid)
    if (!Number.isFinite(a) || a <= 0 || !paymentType.trim()) {
      setErr('Amount and payment type are required.')
      return
    }
    setPending(true)
    setErr(null)
    try {
      const pd = paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString()
      const payload: Record<string, unknown> = {
        amount_paid: a,
        currency: currency.trim() || 'USD',
        payment_type: paymentType.trim(),
        payment_method: paymentMethod.trim() || 'bank',
        payment_date: pd,
        reference_number: referenceNumber.trim() || null,
      }
      if (clientId) payload.client_id = clientId
      else payload.client_id = null
      if (invoiceId) payload.invoice_id = invoiceId
      else payload.invoice_id = null

      const url = editId ? `/api/dashboard/payments/${editId}` : '/api/dashboard/payments'
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErr(data.error ?? 'Save failed')
        return
      }
      setOpen(false)
      onRefresh()
    } finally {
      setPending(false)
    }
  }

  async function confirmDelete() {
    if (!del) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/payments/${del.id}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Delete failed')
        return
      }
      setDel(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
        <div className="h-1 bg-brand-teal" />
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-brand-navy/8 bg-brand-mint/25 py-4">
          <div>
            <CardTitle className="text-lg text-brand-navy">Payments</CardTitle>
            <CardDescription className="text-slate-600">
              {rows.length} row(s) · training / project / consulting · link to invoices for partial pay
            </CardDescription>
          </div>
          <Button type="button" className="bg-brand-navy text-white hover:brightness-110" onClick={openNew}>
            <Plus className="mr-2 size-4" />
            Add payment
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : (
            <ScrollArea className="max-h-[min(480px,calc(100dvh-18rem))] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                    <TableHead className="font-semibold text-white">Amount</TableHead>
                    <TableHead className="font-semibold text-white">Type</TableHead>
                    <TableHead className="hidden font-semibold text-white md:table-cell">Method</TableHead>
                    <TableHead className="hidden font-semibold text-white lg:table-cell">Invoice</TableHead>
                    <TableHead className="w-[132px] pr-4 text-right font-semibold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const id = String(row.id ?? '')
                    const invId = row.invoice_id ? String(row.invoice_id) : ''
                    return (
                      <TableRow key={id} className="odd:bg-white even:bg-brand-mint/15">
                        <TableCell className="font-mono text-sm">
                          {formatCell(paymentAmount(row))} {String(row.currency ?? '')}
                        </TableCell>
                        <TableCell className="text-sm capitalize">{formatCell(row.payment_type)}</TableCell>
                        <TableCell className="hidden text-xs capitalize md:table-cell">{formatCell(row.payment_method)}</TableCell>
                        <TableCell className="hidden max-w-[120px] truncate font-mono text-xs lg:table-cell">
                          {row.invoice_id
                            ? formatCell(
                                (invoices.find((i) => String(i.id) === String(row.invoice_id)) as Record<string, unknown> | undefined)
                                  ?.invoice_number,
                              )
                            : '—'}
                        </TableCell>
                        <TableCell className="pr-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-brand-teal disabled:opacity-30"
                            disabled={!invId}
                            title={invId ? 'Download invoice PDF' : 'No invoice linked'}
                            onClick={() => {
                              if (invId) void openDashboardInvoicePdf(invId, 'download')
                            }}
                          >
                            <FileDown className="size-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => openEdit(row)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive size-8"
                            onClick={() => setDel({ id, label: `${paymentAmount(row)} ${row.currency}` })}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>{editId ? 'Edit payment' : 'New payment'}</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
              Choose an invoice to see its balance, then enter the amount. Status updates automatically.
            </SheetDescription>
          </div>
          <form onSubmit={submit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Revenue type" htmlFor="pay-pt" icon={CreditCard}>
                <select
                  id="pay-pt"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                >
                  <option value="training">Training</option>
                  <option value="project">Project</option>
                  <option value="consulting">Consulting</option>
                </select>
              </DashboardFormField>
              <DashboardFormField label="Payment method" htmlFor="pay-pm" icon={CreditCard}>
                <select
                  id="pay-pm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={dashboardFormInputClass}
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="mobile">Mobile</option>
                </select>
              </DashboardFormField>
              <DashboardFormField label="Payment date" htmlFor="pay-pd" icon={CreditCard}>
                <Input
                  id="pay-pd"
                  type="datetime-local"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                />
              </DashboardFormField>
              <DashboardFormField label="Client (optional)" htmlFor="pay-cl" icon={CreditCard}>
                <select
                  id="pay-cl"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={dashboardFormInputClass}
                >
                  <option value="">—</option>
                  {clients.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {String(c.name)}
                    </option>
                  ))}
                </select>
              </DashboardFormField>
              <DashboardFormField label="Invoice (optional)" htmlFor="pay-inv" icon={CreditCard}>
                <select
                  id="pay-inv"
                  value={invoiceId}
                  onChange={(e) => {
                    const v = e.target.value
                    setInvoiceId(v)
                    if (v) {
                      const inv = invoices.find((i) => String(i.id) === v) as Record<string, unknown> | undefined
                      if (inv?.currency) setCurrency(String(inv.currency))
                    }
                  }}
                  className={dashboardFormInputClass}
                >
                  <option value="">—</option>
                  {invoices.map((inv) => (
                    <option key={String(inv.id)} value={String(inv.id)}>
                      {String(inv.invoice_number ?? inv.id)}
                    </option>
                  ))}
                </select>
              </DashboardFormField>
              {selectedInvoiceBalance ? (
                <div
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-sm',
                    selectedInvoiceBalance.over
                      ? 'border-amber-400/80 bg-amber-50 text-amber-950'
                      : 'border-brand-teal/30 bg-brand-mint/30 text-brand-navy',
                  )}
                >
                  <p className="font-semibold text-brand-navy">Invoice balance</p>
                  <ul className="mt-1.5 space-y-0.5 text-slate-700">
                    <li className="flex justify-between gap-2">
                      <span>Invoice total</span>
                      <span className="font-mono tabular-nums">
                        {selectedInvoiceBalance.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {selectedInvoiceBalance.currency}
                      </span>
                    </li>
                    <li className="flex justify-between gap-2">
                      <span>Other payments{editId ? ' (excl. this entry)' : ''}</span>
                      <span className="font-mono tabular-nums">
                        {selectedInvoiceBalance.paidOthers.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {selectedInvoiceBalance.currency}
                      </span>
                    </li>
                    <li className="flex justify-between gap-2 border-t border-brand-navy/10 pt-1 font-medium text-brand-navy">
                      <span>Balance before this payment</span>
                      <span className="font-mono tabular-nums">
                        {selectedInvoiceBalance.maxForThisLine.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {selectedInvoiceBalance.currency}
                      </span>
                    </li>
                    <li className="flex justify-between gap-2 text-slate-600">
                      <span>Remaining after this amount</span>
                      <span className="font-mono tabular-nums">
                        {selectedInvoiceBalance.remainingAfter.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {selectedInvoiceBalance.currency}
                      </span>
                    </li>
                  </ul>
                  {selectedInvoiceBalance.over ? (
                    <p className="mt-2 text-xs text-amber-900">
                      This amount is higher than the outstanding balance for this invoice. Adjust the amount or check the
                      invoice.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <DashboardFormField label="Amount paid" htmlFor="pay-amt" icon={CreditCard}>
                <Input
                  id="pay-amt"
                  type="number"
                  step="0.01"
                  min={0}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                />
              </DashboardFormField>
              <DashboardFormField label="Currency" htmlFor="pay-cur" icon={CreditCard}>
                <Input id="pay-cur" value={currency} onChange={(e) => setCurrency(e.target.value)} className={dashboardFormInputClass} />
              </DashboardFormField>
              <DashboardFormField label="Reference # (optional)" htmlFor="pay-ref" icon={CreditCard}>
                <Input
                  id="pay-ref"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className={dashboardFormInputClass}
                />
              </DashboardFormField>
              {err ? <p className="text-destructive text-sm">{err}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="bg-brand-navy">
                {pending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={del !== null} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment?</AlertDialogTitle>
            <AlertDialogDescription>This removes the record for {del?.label}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

type ExpensesTableProps = BaseProps & {
  projects: Record<string, unknown>[]
}

/** Split stored description when category is `other`: first block = custom label, rest = notes. */
function parseExpenseOtherDescription(row: Record<string, unknown>): { otherLabel: string; notes: string } {
  const cat = String(row.category ?? '').toLowerCase()
  if (cat !== 'other') return { otherLabel: '', notes: String(row.description ?? '') }
  const desc = String(row.description ?? '')
  const idx = desc.indexOf('\n\n')
  if (idx === -1) return { otherLabel: desc, notes: '' }
  return { otherLabel: desc.slice(0, idx), notes: desc.slice(idx + 2) }
}

function formatExpenseCategoryCell(row: Record<string, unknown>): string {
  const cat = String(row.category ?? '').toLowerCase()
  if (cat !== 'other') return formatCell(row.category)
  const { otherLabel } = parseExpenseOtherDescription(row)
  const label = otherLabel.trim()
  if (!label) return 'Other'
  return `Other — ${label}`
}

const LEDGER_ACCOUNT = '020611264001'
const LEDGER_PHONE = '+252-613-685-943'

function expenseSortTime(row: Record<string, unknown>): number {
  const ed = row.expense_date
  if (typeof ed === 'string' && ed.length > 0) {
    const t = Date.parse(ed)
    if (!Number.isNaN(t)) return t
  }
  const ca = row.created_at
  if (typeof ca === 'string') {
    const t = Date.parse(ca)
    if (!Number.isNaN(t)) return t
  }
  return 0
}

function parseExpenseAmount(row: Record<string, unknown>): number {
  const v = row.amount
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

function formatLedgerDate(row: Record<string, unknown>): string {
  const ed = row.expense_date
  if (typeof ed === 'string' && ed.length >= 10) {
    const d = new Date(ed.slice(0, 10) + 'T12:00:00')
    if (!Number.isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }
  }
  const ca = row.created_at
  if (typeof ca === 'string') {
    const d = new Date(ca)
    if (!Number.isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }
  }
  return '—'
}

function expenseNarration(row: Record<string, unknown>): string {
  const cat = String(row.category ?? '').toLowerCase()
  if (cat === 'other') {
    const { otherLabel, notes } = parseExpenseOtherDescription(row)
    const a = otherLabel.trim()
    const b = notes.trim()
    if (a && b) return `${a} — ${b}`
    if (a) return a
    if (b) return b
    return '—'
  }
  const d = String(row.description ?? '').trim()
  if (d) return d
  return formatExpenseCategoryCell(row)
}

function expenseParticulars(row: Record<string, unknown>, projects: Record<string, unknown>[]): string {
  const cat = formatExpenseCategoryCell(row)
  if (row.project_id) {
    const p = projects.find((x) => String(x.id) === String(row.project_id))
    const name = p ? String((p as Record<string, unknown>).name ?? '') : ''
    if (name) return `${cat} · ${name}`
  }
  return cat
}

function formatExpenseMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency.trim() || 'USD'}`
}

export function ExpensesTable({ rows, projects, loading, empty, onRefresh }: ExpensesTableProps) {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [category, setCategory] = useState('office')
  const [otherCategory, setOtherCategory] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [paidBy, setPaidBy] = useState('')
  const [del, setDel] = useState<{ id: string; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const ledgerRows = useMemo(() => {
    const list = [...rows]
    list.sort((a, b) => {
      const ta = expenseSortTime(a)
      const tb = expenseSortTime(b)
      if (ta !== tb) return ta - tb
      return String(a.id ?? '').localeCompare(String(b.id ?? ''))
    })
    let running = 0
    return list.map((row) => {
      const debit = parseExpenseAmount(row)
      running += debit
      return { row, debit, balance: running }
    })
  }, [rows])

  function openNew() {
    setEditId(null)
    setAmount('')
    setCurrency('USD')
    setCategory('office')
    setOtherCategory('')
    setDescription('')
    setProjectId('')
    setExpenseDate(new Date().toISOString().slice(0, 10))
    setReceiptUrl('')
    setReceiptFile(null)
    setPaidBy('')
    setErr(null)
    setOpen(true)
  }

  function openEdit(row: Record<string, unknown>) {
    setEditId(String(row.id ?? ''))
    setAmount(String(row.amount ?? ''))
    setCurrency(String(row.currency ?? 'USD'))
    setCategory(String(row.category ?? 'office'))
    const cat = String(row.category ?? 'office').toLowerCase()
    if (cat === 'other') {
      const { otherLabel, notes } = parseExpenseOtherDescription(row)
      setOtherCategory(otherLabel)
      setDescription(notes)
    } else {
      setOtherCategory('')
      setDescription(String(row.description ?? ''))
    }
    setProjectId(row.project_id ? String(row.project_id) : '')
    const ed = row.expense_date
    setExpenseDate(typeof ed === 'string' ? ed.slice(0, 10) : new Date().toISOString().slice(0, 10))
    setReceiptUrl(typeof row.receipt_url === 'string' ? row.receipt_url : '')
    setReceiptFile(null)
    setPaidBy(typeof row.paid_by === 'string' ? row.paid_by : String(row.paid_by ?? ''))
    setErr(null)
    setOpen(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const a = Number.parseFloat(amount)
    if (!Number.isFinite(a) || a < 0) {
      setErr('Valid amount required.')
      return
    }
    const cat = (category.trim() || 'office').toLowerCase()
    if (cat === 'other' && !otherCategory.trim()) {
      setErr('Specify the category name for Other.')
      return
    }
    setPending(true)
    setErr(null)
    try {
      let urlReceipt = receiptUrl.trim() || undefined
      if (receiptFile) {
        urlReceipt = await uploadDashboardFile(receiptFile, 'expenses')
      }
      const payload: Record<string, unknown> = {
        amount: a,
        currency: currency.trim() || 'USD',
        category: cat || 'office',
      }
      if (cat === 'other') {
        const oc = otherCategory.trim()
        const notes = description.trim()
        payload.description = notes ? `${oc}\n\n${notes}` : oc
      } else if (description.trim()) {
        payload.description = description.trim()
      } else {
        payload.description = null
      }
      if (projectId) payload.project_id = projectId
      else payload.project_id = null
      if (expenseDate) payload.expense_date = new Date(`${expenseDate}T12:00:00.000Z`).toISOString()
      if (urlReceipt) payload.receipt_url = urlReceipt
      else if (receiptUrl.trim()) payload.receipt_url = receiptUrl.trim()
      else payload.receipt_url = null
      payload.paid_by = paidBy.trim() || null

      const url = editId ? `/api/dashboard/expenses/${editId}` : '/api/dashboard/expenses'
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErr(data.error ?? 'Save failed')
        return
      }
      setOpen(false)
      onRefresh()
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'Upload failed')
    } finally {
      setPending(false)
    }
  }

  async function confirmDelete() {
    if (!del) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/expenses/${del.id}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Delete failed')
        return
      }
      setDel(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border border-slate-300/80 bg-white shadow-md">
        <div className="bg-[#4ebce3] px-4 py-3 text-white sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-bold tracking-tight sm:text-xl">Baraarug Consulting Firm Ledger</p>
              <p className="mt-0.5 text-sm font-medium text-white/95">Expenses register · Debit / Credit / Balance</p>
            </div>
            <span className="inline-flex w-fit shrink-0 rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Monthly
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-600 sm:px-6 sm:text-xs">
          <span>
            <span className="font-semibold text-slate-700">Account:</span> {LEDGER_ACCOUNT}
          </span>
          <span className="max-w-[min(100%,20rem)]">
            <span className="font-semibold text-slate-700">Location:</span> {OFFICE_ADDRESS}
          </span>
          <span>
            <span className="font-semibold text-slate-700">Tel:</span> {LEDGER_PHONE}
          </span>
        </div>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-brand-navy/10 bg-brand-mint/20 py-4">
          <div>
            <CardTitle className="text-lg text-brand-navy">Expenses</CardTitle>
            <CardDescription className="text-slate-600">
              {loading ? 'Loading…' : `${rows.length} entr${rows.length === 1 ? 'y' : 'ies'}`} · narration, particulars, debit &amp; running balance
            </CardDescription>
          </div>
          <Button type="button" className="bg-brand-navy text-white hover:brightness-110" onClick={openNew}>
            <Plus className="mr-2 size-4" />
            Add expense
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <ScrollArea className="max-h-[min(520px,calc(100dvh-16rem))] w-full">
            <div className="min-w-[880px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                    <TableHead className="whitespace-nowrap font-semibold text-white">Date</TableHead>
                    <TableHead className="min-w-[140px] font-semibold text-white">Description / Narration</TableHead>
                    <TableHead className="hidden whitespace-nowrap font-semibold text-white md:table-cell">Paid by</TableHead>
                    <TableHead className="min-w-[120px] font-semibold text-white">Particulars</TableHead>
                    <TableHead className="whitespace-nowrap text-right font-semibold text-white">Debit</TableHead>
                    <TableHead className="whitespace-nowrap text-right font-semibold text-white">Credit</TableHead>
                    <TableHead className="whitespace-nowrap text-right font-semibold text-white">Balance</TableHead>
                    <TableHead className="w-[88px] pr-4 text-right font-semibold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-5 animate-spin text-brand-teal" aria-hidden />
                          {empty}
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-slate-500">
                        {empty}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledgerRows.map(({ row, debit, balance }) => {
                      const id = String(row.id ?? '')
                      const cur = String(row.currency ?? 'USD').trim() || 'USD'
                      return (
                        <TableRow key={id} className="border-slate-200 odd:bg-white even:bg-slate-50/80">
                          <TableCell className="whitespace-nowrap font-mono text-xs text-slate-800">{formatLedgerDate(row)}</TableCell>
                          <TableCell className="max-w-[220px] text-xs leading-snug text-slate-800">{expenseNarration(row)}</TableCell>
                          <TableCell className="hidden max-w-[140px] text-xs text-slate-600 md:table-cell">
                            {row.paid_by != null && String(row.paid_by).trim() !== '' ? String(row.paid_by) : '—'}
                          </TableCell>
                          <TableCell className="max-w-[180px] text-xs leading-snug text-slate-700">{expenseParticulars(row, projects)}</TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono text-xs font-medium text-slate-900">
                            {formatExpenseMoney(debit, cur)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono text-xs text-slate-400">—</TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono text-xs font-semibold text-brand-navy">
                            {formatExpenseMoney(balance, cur)}
                          </TableCell>
                          <TableCell className="pr-2 text-right">
                            <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => openEdit(row)}>
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive size-8"
                              onClick={() => setDel({ id, label: String(row.amount) })}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>{editId ? 'Edit expense' : 'New expense'}</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>Operational spend by category.</SheetDescription>
          </div>
          <form onSubmit={submit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Amount" htmlFor="ex-amt" icon={Receipt}>
                <Input
                  id="ex-amt"
                  type="number"
                  step="0.01"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                />
              </DashboardFormField>
              <DashboardFormField label="Currency" htmlFor="ex-cur" icon={Receipt}>
                <Input id="ex-cur" value={currency} onChange={(e) => setCurrency(e.target.value)} className={dashboardFormInputClass} />
              </DashboardFormField>
              <DashboardFormField label="Category" htmlFor="ex-cat" icon={Receipt}>
                <select
                  id="ex-cat"
                  value={category}
                  onChange={(e) => {
                    const v = e.target.value
                    setCategory(v)
                    if (v !== 'other') setOtherCategory('')
                  }}
                  className={dashboardFormInputClass}
                >
                  <option value="salary">Salary</option>
                  <option value="transport">Transport</option>
                  <option value="office">Office</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </DashboardFormField>
              {category === 'other' ? (
                <DashboardFormField label="Specify category" htmlFor="ex-other" icon={Receipt} hint="Required when Other is selected">
                  <Input
                    id="ex-other"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    className={dashboardFormInputClass}
                    placeholder="e.g. Software subscription, Legal fees…"
                    required
                    autoComplete="off"
                  />
                </DashboardFormField>
              ) : null}
              <DashboardFormField label="Expense date" htmlFor="ex-ed" icon={Receipt}>
                <Input id="ex-ed" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className={dashboardFormInputClass} />
              </DashboardFormField>
              <DashboardFormField label="Project (optional)" htmlFor="ex-pj" icon={Receipt}>
                <select id="ex-pj" value={projectId} onChange={(e) => setProjectId(e.target.value)} className={dashboardFormInputClass}>
                  <option value="">—</option>
                  {projects.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {String(p.name)}
                    </option>
                  ))}
                </select>
              </DashboardFormField>
              <DashboardFormField label="Paid by (optional)" htmlFor="ex-pb" icon={Receipt} hint="Who approved or paid this expense">
                <Input
                  id="ex-pb"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className={dashboardFormInputClass}
                  placeholder="e.g. Finance, Director"
                  autoComplete="off"
                />
              </DashboardFormField>
              <DashboardFormField label="Receipt (optional)" htmlFor="ex-rc" icon={Receipt}>
                <Input
                  id="ex-rc"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                {receiptUrl && !receiptFile ? (
                  <a href={receiptUrl} className="mt-2 block text-xs text-brand-teal underline" target="_blank" rel="noreferrer">
                    Current file
                  </a>
                ) : null}
              </DashboardFormField>
              <DashboardFormField
                label={category === 'other' ? 'Additional notes (optional)' : 'Description (optional)'}
                htmlFor="ex-d"
                icon={Receipt}
              >
                <Textarea
                  id="ex-d"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={cn(dashboardFormTextareaClass, 'resize-y')}
                  placeholder={category === 'other' ? 'Extra context beyond the category name…' : undefined}
                />
              </DashboardFormField>
              {err ? <p className="text-destructive text-sm">{err}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="bg-brand-navy">
                {pending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={del !== null} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>Remove this expense record.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function ClientsTable({ rows, loading, empty, onRefresh }: BaseProps) {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [existingLogo, setExistingLogo] = useState<string | null>(null)
  const [del, setDel] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const sortedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) ||
          String(a.id ?? '').localeCompare(String(b.id ?? '')),
      ),
    [rows],
  )

  function openNew() {
    setEditId(null)
    setName('')
    setSortOrder(0)
    setLogoFile(null)
    setExistingLogo(null)
    setErr(null)
    setOpen(true)
  }

  function openEdit(row: Record<string, unknown>) {
    setEditId(String(row.id ?? ''))
    setName(String(row.name ?? ''))
    setSortOrder(Number(row.sort_order) || 0)
    const u = row.logo_url
    setExistingLogo(typeof u === 'string' && u.trim() ? u.trim() : null)
    setLogoFile(null)
    setErr(null)
    setOpen(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) {
      setErr('Name is required.')
      return
    }
    setPending(true)
    setErr(null)
    try {
      let logoUrl: string | undefined
      if (logoFile) {
        logoUrl = await uploadDashboardFile(logoFile, 'clients')
      }
      const payload: Record<string, unknown> = { name: n, sort_order: sortOrder }
      if (logoUrl) payload.logo_url = logoUrl
      else if (existingLogo) payload.logo_url = existingLogo

      const url = editId ? `/api/dashboard/clients/${editId}` : '/api/dashboard/clients'
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErr(data.error ?? 'Save failed')
        return
      }
      setOpen(false)
      onRefresh()
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'Upload failed')
    } finally {
      setPending(false)
    }
  }

  async function confirmDelete() {
    if (!del) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/clients/${del.id}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Delete failed')
        return
      }
      setDel(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
        <div className="h-1 bg-brand-teal" />
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-brand-navy/8 bg-brand-mint/25 py-4">
          <div>
            <CardTitle className="text-lg text-brand-navy">Clients</CardTitle>
            <CardDescription className="text-slate-600">Logos appear on the public site.</CardDescription>
          </div>
          <Button type="button" className="bg-brand-navy text-white hover:brightness-110" onClick={openNew}>
            <Plus className="mr-2 size-4" />
            Add client
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : (
            <ScrollArea className="max-h-[min(480px,calc(100dvh-18rem))] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                    <TableHead className="w-16 font-semibold text-white">Logo</TableHead>
                    <TableHead className="w-14 font-semibold text-white">Order</TableHead>
                    <TableHead className="font-semibold text-white">Name</TableHead>
                    <TableHead className="w-[88px] pr-4 text-right font-semibold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row) => {
                    const id = String(row.id ?? '')
                    const logo = row.logo_url
                    const logoUrl = typeof logo === 'string' && logo.trim() ? logo.trim() : null
                    return (
                      <TableRow key={id} className="odd:bg-white even:bg-brand-mint/15">
                        <TableCell>
                          <div className="relative size-12 overflow-hidden rounded-md border bg-white">
                            {logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={logoUrl} alt="" className="size-full object-contain p-1" />
                            ) : (
                              <div className="flex size-full items-center justify-center text-[10px] text-slate-400">—</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {Number(row.sort_order) || 0}
                        </TableCell>
                        <TableCell className="font-medium text-brand-navy">{formatCell(row.name)}</TableCell>
                        <TableCell className="pr-2 text-right">
                          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => openEdit(row)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive size-8"
                            onClick={() => setDel({ id, name: String(row.name ?? '') })}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>{editId ? 'Edit client' : 'New client'}</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
              Upload a logo (PNG/JPG/WebP). Stored in MinIO; served at /files/clients/…. Order controls how the home page lists clients (lower first).
            </SheetDescription>
          </div>
          <form onSubmit={submit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Name" htmlFor="cl-name" icon={Building2}>
                <Input id="cl-name" value={name} onChange={(e) => setName(e.target.value)} className={dashboardFormInputClass} required />
              </DashboardFormField>
              <DashboardFormField label="Display order" htmlFor="cl-order" icon={Building2}>
                <Input
                  id="cl-order"
                  type="number"
                  min={0}
                  step={1}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  className={dashboardFormInputClass}
                />
              </DashboardFormField>
              <DashboardFormField label="Logo" htmlFor="cl-logo" icon={Building2}>
                <Input
                  id="cl-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
                {existingLogo && !logoFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={existingLogo} alt="" className="mt-2 h-20 w-auto max-w-full object-contain" />
                ) : null}
              </DashboardFormField>
              {err ? <p className="text-destructive text-sm">{err}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="bg-brand-navy">
                {pending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={del !== null} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>Remove {del?.name} from the directory.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function PartnersTable({ rows, loading, empty, onRefresh }: BaseProps) {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [existingLogo, setExistingLogo] = useState<string | null>(null)
  const [del, setDel] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const sortedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) ||
          String(a.id ?? '').localeCompare(String(b.id ?? '')),
      ),
    [rows],
  )

  function openNew() {
    setEditId(null)
    setName('')
    setSortOrder(0)
    setLogoFile(null)
    setExistingLogo(null)
    setErr(null)
    setOpen(true)
  }

  function openEdit(row: Record<string, unknown>) {
    setEditId(String(row.id ?? ''))
    setName(String(row.name ?? ''))
    setSortOrder(Number(row.sort_order) || 0)
    const u = row.logo_url
    setExistingLogo(typeof u === 'string' && u.trim() ? u.trim() : null)
    setLogoFile(null)
    setErr(null)
    setOpen(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) {
      setErr('Name is required.')
      return
    }
    setPending(true)
    setErr(null)
    try {
      let logoUrl: string | undefined
      if (logoFile) {
        logoUrl = await uploadDashboardFile(logoFile, 'partners')
      }
      const payload: Record<string, unknown> = { name: n, sort_order: sortOrder }
      if (logoUrl) payload.logo_url = logoUrl
      else if (existingLogo) payload.logo_url = existingLogo

      const url = editId ? `/api/dashboard/partners/${editId}` : '/api/dashboard/partners'
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: { ...dashboardAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErr(data.error ?? 'Save failed')
        return
      }
      setOpen(false)
      onRefresh()
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'Upload failed')
    } finally {
      setPending(false)
    }
  }

  async function confirmDelete() {
    if (!del) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/partners/${del.id}`, {
        method: 'DELETE',
        headers: dashboardAuthHeaders(),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        alert(data.error ?? 'Delete failed')
        return
      }
      setDel(null)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-brand-navy/12 bg-white shadow-sm">
        <div className="h-1 bg-brand-teal" />
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-brand-navy/8 bg-brand-mint/25 py-4">
          <div>
            <CardTitle className="text-lg text-brand-navy">Partners</CardTitle>
            <CardDescription className="text-slate-600">Logos appear on the home page.</CardDescription>
          </div>
          <Button type="button" className="bg-brand-navy text-white hover:brightness-110" onClick={openNew}>
            <Plus className="mr-2 size-4" />
            Add partner
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground px-6 py-6 text-sm">{empty}</p>
          ) : (
            <ScrollArea className="max-h-[min(480px,calc(100dvh-18rem))] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                    <TableHead className="w-16 font-semibold text-white">Logo</TableHead>
                    <TableHead className="w-14 font-semibold text-white">Order</TableHead>
                    <TableHead className="font-semibold text-white">Name</TableHead>
                    <TableHead className="w-[88px] pr-4 text-right font-semibold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row) => {
                    const id = String(row.id ?? '')
                    const logo = row.logo_url
                    const logoUrl = typeof logo === 'string' && logo.trim() ? logo.trim() : null
                    return (
                      <TableRow key={id} className="odd:bg-white even:bg-brand-mint/15">
                        <TableCell>
                          <div className="relative size-12 overflow-hidden rounded-md border bg-white">
                            {logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={logoUrl} alt="" className="size-full object-contain p-1" />
                            ) : (
                              <div className="flex size-full items-center justify-center text-[10px] text-slate-400">—</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {Number(row.sort_order) || 0}
                        </TableCell>
                        <TableCell className="font-medium text-brand-navy">{formatCell(row.name)}</TableCell>
                        <TableCell className="pr-2 text-right">
                          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => openEdit(row)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive size-8"
                            onClick={() => setDel({ id, name: String(row.name ?? '') })}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className={dashboardSheetWide}>
          <div className={dashboardSheetHeader}>
            <SheetTitle className={dashboardSheetTitle}>{editId ? 'Edit partner' : 'New partner'}</SheetTitle>
            <SheetDescription className={cn('mt-2', dashboardSheetDescription)}>
              Upload a logo. Stored in MinIO; served at /files/partners/…. Order controls how the home page lists partners (lower first).
            </SheetDescription>
          </div>
          <form onSubmit={submit} className={dashboardSheetForm}>
            <div className={cn(dashboardSheetBody, 'space-y-4')}>
              <DashboardFormField label="Name" htmlFor="pr-name" icon={Handshake}>
                <Input id="pr-name" value={name} onChange={(e) => setName(e.target.value)} className={dashboardFormInputClass} required />
              </DashboardFormField>
              <DashboardFormField label="Display order" htmlFor="pr-order" icon={Handshake}>
                <Input
                  id="pr-order"
                  type="number"
                  min={0}
                  step={1}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  className={dashboardFormInputClass}
                />
              </DashboardFormField>
              <DashboardFormField label="Logo" htmlFor="pr-logo" icon={Handshake}>
                <Input
                  id="pr-logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className={cn(dashboardFormInputClass, 'cursor-pointer py-2')}
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
                {existingLogo && !logoFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={existingLogo} alt="" className="mt-2 h-20 w-auto max-w-full object-contain" />
                ) : null}
              </DashboardFormField>
              {err ? <p className="text-destructive text-sm">{err}</p> : null}
            </div>
            <div className={dashboardSheetFooter}>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="bg-brand-navy">
                {pending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={del !== null} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete partner?</AlertDialogTitle>
            <AlertDialogDescription>Remove {del?.name}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
