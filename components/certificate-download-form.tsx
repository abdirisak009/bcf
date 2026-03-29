'use client'

import { useState } from 'react'
import { Award, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CertificateDownloadForm() {
  const [certificateNo, setCertificateNo] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const no = certificateNo.trim().toUpperCase()
    if (!no) {
      setErr('Enter your certificate number.')
      return
    }
    setPending(true)
    try {
      const res = await fetch(`/api/certificate/${encodeURIComponent(no)}/download`, {
        method: 'GET',
        headers: { Accept: 'application/pdf' },
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setErr(j.error ?? 'Certificate not found or download failed.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${no.replace(/[^A-Z0-9-]/gi, '-')}.pdf`
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
          <h2 className="text-2xl font-bold text-brand-navy md:text-3xl">Certificate number</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Use the exact number issued to you (format: <strong>BCF-2026-0001</strong>).
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="cert-no">Certificate number</Label>
            <Input
              id="cert-no"
              required
              autoComplete="off"
              placeholder="BCF-2026-0001"
              value={certificateNo}
              onChange={(e) => setCertificateNo(e.target.value)}
              className="border-brand-navy/10 font-mono uppercase"
            />
          </div>
          {err ? <p className="text-sm text-destructive">{err}</p> : null}
          <Button type="submit" disabled={pending} className="w-full bg-brand-navy hover:brightness-110">
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Preparing…
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
