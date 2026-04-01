'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Award, CheckCircle2, Download, Loader2, QrCode, ShieldCheck, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SITE_LOGO_SRC } from '@/lib/site-config'

type CertData = {
  student_name: string
  training_name: string
  from_date: string
  to_date: string
  certificate_no: string
  issue_date: string
}

type ApiEnvelope = { success?: boolean; data?: CertData; error?: string }

function formatDate(iso: string) {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(t))
}

export function CertificateVerifyView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const no = searchParams.get('no')?.trim() ?? ''

  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>(() =>
    no ? 'loading' : 'idle',
  )
  const [data, setData] = useState<CertData | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [manualNo, setManualNo] = useState('')

  const fetchCert = useCallback(async (certNo: string) => {
    setState('loading')
    setMessage(null)
    try {
      const res = await fetch(`/api/certificate/${encodeURIComponent(certNo)}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      const j = (await res.json()) as ApiEnvelope
      if (!res.ok || !j.success || !j.data) {
        setState('err')
        setMessage(j.error ?? 'Certificate not found. Check the number and try again.')
        setData(null)
        return
      }
      setData(j.data)
      setState('ok')
    } catch {
      setState('err')
      setMessage('Could not reach the server. Check your connection and try again.')
      setData(null)
    }
  }, [])

  useEffect(() => {
    if (!no) {
      setState('idle')
      setData(null)
      setMessage(null)
      return
    }
    void fetchCert(no)
  }, [no, fetchCert])

  function onManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = manualNo.trim()
    if (!n) return
    router.push(`/verify?no=${encodeURIComponent(n)}`)
  }

  return (
    <section
      id="verify"
      className="border-b border-slate-200 bg-gradient-to-b from-brand-mint/25 to-white py-14 px-4 md:py-20"
    >
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-brand-teal/25 bg-white shadow-sm">
            <ShieldCheck className="size-8 text-brand-teal" strokeWidth={1.25} aria-hidden />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">Verify</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-navy md:text-3xl">Certificate verification</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            <span className="block">This is the official page linked from the QR code on your certificate PDF.</span>
            <span className="mt-1 block text-slate-500">
              Boggan waa xaqiijinta shahaadada: marka aad scan gareyso QR-ka, halkan ayaa lagu tusayaa magacaaga, tababarka,
              iyo lambarka shahaadada.
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
          {!no && (
            <div className="space-y-5 py-2">
              <div className="flex items-start gap-3 rounded-xl border border-brand-mint/40 bg-brand-mint/15 p-4 text-left">
                <QrCode className="mt-0.5 size-5 shrink-0 text-brand-teal" aria-hidden />
                <div className="text-sm text-slate-700">
                  <p className="font-medium text-brand-navy">Scan the QR on your PDF</p>
                  <p className="mt-1 text-slate-600">
                    The QR opens this page with your certificate number. You can also type the number below (e.g.{' '}
                    <span className="font-mono text-xs">BCF-2026-0001</span>).
                  </p>
                </div>
              </div>
              <form onSubmit={onManualSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="verify-cert-no">Certificate number</Label>
                  <Input
                    id="verify-cert-no"
                    name="no"
                    placeholder="BCF-2026-…"
                    value={manualNo}
                    onChange={(e) => setManualNo(e.target.value)}
                    className="border-brand-navy/15 font-mono text-sm"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" className="w-full bg-brand-navy hover:brightness-110">
                  Look up certificate
                </Button>
              </form>
            </div>
          )}

          {no && state === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-600">
              <Loader2 className="size-9 animate-spin text-brand-teal" aria-hidden />
              <p className="text-sm">Loading certificate details…</p>
            </div>
          )}

          {no && state === 'err' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <XCircle className="size-12 text-red-500/90" aria-hidden />
              <p className="text-sm text-slate-700">
                {message ?? 'Certificate not found. Check the number and try again.'}
              </p>
              <Button asChild variant="outline" className="mt-2 rounded-full border-brand-navy/20">
                <Link href="/verify">Try another number</Link>
              </Button>
              <Button asChild variant="ghost" className="text-slate-600">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          )}

          {no && state === 'ok' && data && (
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-800">
                  <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                  <span className="text-sm font-semibold">Verified — Baraarug certificate</span>
                </div>
                <p className="mt-1 text-xs text-emerald-900/80">The details below match our records for this number.</p>
              </div>

              <div className="rounded-xl bg-brand-navy/[0.04] px-4 py-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Participant</p>
                <p className="mt-1 text-2xl font-bold leading-tight text-brand-navy md:text-3xl">{data.student_name}</p>
              </div>

              <div className="space-y-1 border-b border-slate-100 pb-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Program / training</p>
                <p className="text-lg font-semibold text-slate-800">{data.training_name}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">From</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(data.from_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">To</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(data.to_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Issued</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(data.issue_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Certificate no.</p>
                  <p className="font-mono text-sm font-semibold text-brand-navy">{data.certificate_no}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
                <Button
                  asChild
                  className="rounded-full bg-brand-teal font-semibold text-white hover:bg-brand-navy"
                >
                  <a
                    href={`/api/certificate/${encodeURIComponent(data.certificate_no)}/download`}
                    download
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Download className="size-4" aria-hidden />
                    Download PDF
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-teal"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE_LOGO_SRC} alt="" className="h-8 w-auto object-contain" width={120} height={28} />
            <span>Baraarug Consulting Firm</span>
          </Link>
          <p className="max-w-sm text-xs text-slate-500">
            <Award className="inline size-3.5 align-text-bottom text-brand-teal" aria-hidden /> Official verification for
            certificates issued through our training programmes.
          </p>
        </div>
      </div>
    </section>
  )
}
