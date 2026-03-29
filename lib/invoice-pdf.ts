import { getToken } from '@/lib/auth-client'

/** Opens invoice PDF from the dashboard proxy (requires Bearer token). */
export async function openDashboardInvoicePdf(id: string, mode: 'preview' | 'download'): Promise<void> {
  const q = mode === 'preview' ? '?preview=1' : ''
  const token = getToken()
  const res = await fetch(`/api/dashboard/invoices/${id}/pdf${q}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string }
    window.alert(j.error ?? 'Could not load PDF')
    return
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  if (mode === 'preview') {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${id}.pdf`
    a.rel = 'noopener'
    a.click()
  }
  setTimeout(() => URL.revokeObjectURL(url), 120_000)
}
