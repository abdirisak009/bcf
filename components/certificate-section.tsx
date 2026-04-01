'use client'

import { useEffect, useMemo, useState } from 'react'
import { Award, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiBase } from '@/lib/api'

type TrainingOpt = { id: string; title: string; academyName?: string }

export function CertificateSection() {
  const [trainings, setTrainings] = useState<TrainingOpt[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [trainingId, setTrainingId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/academies/catalog`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        const json = (await res.json()) as {
          success?: boolean
          data?: { items?: { name?: string; trainings?: { id: string; title?: string }[] }[] }
        }
        if (cancelled || !res.ok) return
        const items = json.data?.items ?? []
        const flat: TrainingOpt[] = []
        for (const a of items) {
          for (const t of a.trainings ?? []) {
            if (t?.id) {
              flat.push({
                id: t.id,
                title: String(t.title ?? 'Training'),
                academyName: a.name,
              })
            }
          }
        }
        setTrainings(flat)
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectOptions = useMemo(() => {
    return trainings.map((t) => ({
      value: t.id,
      label: t.academyName ? `${t.title} — ${t.academyName}` : t.title,
    }))
  }, [trainings])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!trainingId.trim() || !firstName.trim() || !lastName.trim() || !email.trim()) {
      setErr('Training, first name, last name, and email are required.')
      return
    }
    setPending(true)
    try {
      const res = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
        body: JSON.stringify({
          training_id: trainingId.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
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
    <section id="certificates" className="scroll-mt-28 border-b border-slate-200 bg-gradient-to-b from-brand-mint/20 to-white py-14 px-6 md:py-20">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <Award className="mx-auto mb-3 size-11 text-brand-teal" strokeWidth={1.25} />
          <h2 className="text-2xl font-bold text-brand-navy md:text-3xl">Get your certificate</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Enter the <strong>same first name, last name, and email</strong> you used on your training application. Your
            application must be <strong>approved</strong> in our system.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="cert-training">Training program</Label>
            <select
              id="cert-training"
              required
              value={trainingId}
              onChange={(e) => setTrainingId(e.target.value)}
              disabled={loadingList}
              className="h-11 w-full rounded-lg border-2 border-brand-navy/10 bg-white px-3 text-sm text-brand-navy focus-visible:border-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/25"
            >
              <option value="">{loadingList ? 'Loading programs…' : 'Select your course'}</option>
              {selectOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cert-fn">First name</Label>
              <Input
                id="cert-fn"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border-brand-navy/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-ln">Last name</Label>
              <Input
                id="cert-ln"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border-brand-navy/10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cert-email">Email</Label>
            <Input
              id="cert-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-brand-navy/10"
            />
          </div>
          {err ? <p className="text-sm text-destructive">{err}</p> : null}
          <Button type="submit" disabled={pending || loadingList} className="w-full bg-brand-navy hover:brightness-110">
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
