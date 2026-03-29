'use client'

import { useState } from 'react'
import { Award, Loader2, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function GetCertificateForm() {
  const [phone, setPhone] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const p = phone.trim()
    if (!p) {
      setErr('Enter the phone number you used on your training application.')
      return
    }
    setPending(true)
    try {
      const res = await fetch('/api/certificates/issue-by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
        body: JSON.stringify({
          phone: p,
          from_date: fromDate.trim() || undefined,
          to_date: toDate.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setErr(j.error ?? 'Could not issue certificate.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'certificate.pdf'
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setErr('Network error — try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-brand-mint/20 to-white py-14 px-6 md:py-20">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <Award className="mx-auto mb-3 size-11 text-brand-teal" strokeWidth={1.25} />
          <h2 className="text-2xl font-bold text-brand-navy md:text-3xl">Get your certificate</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Enter the <strong>phone number</strong> from your training application. Your application must be{' '}
            <strong>approved</strong> in our system. Optional dates appear on the certificate.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="cert-phone">Phone number</Label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-navy/40"
                aria-hidden
              />
              <Input
                id="cert-phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+252 61 …"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-brand-navy/10 pl-10"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cert-from">Program from (optional)</Label>
              <Input
                id="cert-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border-brand-navy/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-to">Program to (optional)</Label>
              <Input
                id="cert-to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border-brand-navy/10"
              />
            </div>
          </div>
          {err ? <p className="text-sm text-destructive">{err}</p> : null}
          <Button type="submit" disabled={pending} className="w-full bg-brand-navy hover:brightness-110">
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Award className="mr-2 size-4" />
                Download certificate (PDF)
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  )
}
