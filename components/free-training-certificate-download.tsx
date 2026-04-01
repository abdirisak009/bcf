'use client'

import { useState } from 'react'
import { Award, Loader2, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getBrowserApiUrl } from '@/lib/api'

/**
 * Public: download completion PDF when the program has certificate download enabled,
 * phone matches registration, and status is Shortlisted or Precepts (Participants list).
 */
export function FreeTrainingCertificateDownload({ slug }: { slug: string }) {
  const [phone, setPhone] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function runDownload() {
    setErr(null)
    const p = phone.trim()
    if (!p) {
      setErr('Enter the phone number you used when you registered for this training.')
      return
    }
    setPending(true)
    try {
      const url = getBrowserApiUrl(
        `/api/free-training-programs/public/slug/${encodeURIComponent(slug)}/certificate`,
      )
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
        body: JSON.stringify({ phone: p }),
      })
      const ct = res.headers.get('Content-Type') ?? ''

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setErr(j.error ?? 'Could not download certificate.')
        return
      }

      if (!ct.includes('application/pdf')) {
        setErr('Unexpected response from server.')
        return
      }

      const blob = await res.blob()
      const dl = res.headers.get('Content-Disposition')
      let filename = 'certificate.pdf'
      const m = dl?.match(/filename="([^"]+)"/)
      if (m?.[1]) filename = m[1]
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setErr('Network error — try again.')
    } finally {
      setPending(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    void runDownload()
  }

  return (
    <section className="mt-10 rounded-2xl border border-brand-teal/25 bg-gradient-to-br from-brand-mint/30 to-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <Award className="size-10 shrink-0 text-brand-teal" strokeWidth={1.25} aria-hidden />
        <div>
          <h2 className="text-xl font-bold text-brand-navy">Download your certificate</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Use the <strong>same phone number</strong> you registered with. Only people on the{' '}
            <strong>Participants</strong> list (<strong>Shortlisted</strong> or <strong>Precepts</strong>) can download.
            If download is turned off for this program, contact the team.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="ft-cert-phone">Phone number</Label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-navy/40"
                aria-hidden
              />
              <Input
                id="ft-cert-phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-brand-navy/15 pl-10"
                placeholder="+252…"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="shrink-0 bg-brand-navy text-white hover:bg-brand-navy/90 sm:min-w-[160px]"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Preparing…
              </>
            ) : (
              'Download PDF'
            )}
          </Button>
        </div>
      </form>
      {err ? <p className="text-destructive mt-3 text-sm font-medium">{err}</p> : null}
    </section>
  )
}
