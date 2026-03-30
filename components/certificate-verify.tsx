'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Award, CheckCircle2, Download, Loader2, ShieldCheck, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
  const searchParams = useSearchParams()
  const no = searchParams.get('no')?.trim() ?? ''

  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading')
  const [data, setData] = useState<CertData | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!no) {
      setState('err')
      setMessage('No certificate number in the link. Use the QR code on your certificate or add ?no=BCF-... to the URL.')
      return
    }
    setState('loading')
    setMessage(null)
    try {
      const res = await fetch(`/api/certificate/${encodeURIComponent(no)}`, {
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
  }, [no])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-brand-mint/25 to-white py-14 px-4 md:py-20">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-brand-teal/25 bg-white shadow-sm">
            <ShieldCheck className="size-8 text-brand-teal" strokeWidth={1.25} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-brand-navy md:text-3xl">Verify certificate</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This page confirms that a training certificate was issued by Baraarug Consulting Firm. Scan the QR code on
            the PDF or open the link you were sent.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
          {state === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-600">
              <Loader2 className="size-9 animate-spin text-brand-teal" aria-hidden />
              <p className="text-sm">Checking certificate…</p>
            </div>
          )}

          {state === 'err' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <XCircle className="size-12 text-red-500/90" aria-hidden />
              <p className="text-sm text-slate-700">{message}</p>
              <Button asChild variant="outline" className="mt-2 rounded-full border-brand-navy/20">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          )}

          {state === 'ok' && data && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-brand-teal">
                <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                <span className="text-sm font-semibold text-brand-navy">Verified</span>
              </div>

              <div className="space-y-1 border-b border-slate-100 pb-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Participant</p>
                <p className="text-lg font-bold text-brand-navy">{data.student_name}</p>
              </div>

              <div className="space-y-1 border-b border-slate-100 pb-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Program / training</p>
                <p className="text-base font-semibold text-slate-800">{data.training_name}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-teal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE_LOGO_SRC} alt="" className="h-8 w-auto object-contain" width={120} height={28} />
            <span>Baraarug Consulting Firm</span>
          </Link>
          <p className="max-w-sm text-xs text-slate-500">
            <Award className="inline size-3.5 align-text-bottom text-brand-teal" aria-hidden /> Official verification
            for certificates issued through our training programmes.
          </p>
        </div>
      </div>
    </section>
  )
}
