'use client'

import { useState } from 'react'
import { Award, Loader2, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type FreeTrainingChoice = {
  program_id: string
  slug: string
  title: string
}

export function GetCertificateForm() {
  const [phone, setPhone] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [choiceOpen, setChoiceOpen] = useState(false)
  const [choices, setChoices] = useState<FreeTrainingChoice[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<string>('')
  const [pendingChoice, setPendingChoice] = useState(false)

  async function issueCertificate(body: { phone: string; free_training_program_id?: string }) {
    const payload: Record<string, string> = { phone: body.phone }
    if (body.free_training_program_id) payload.free_training_program_id = body.free_training_program_id

    const res = await fetch('/api/certificates/issue-by-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/pdf, application/json' },
      body: JSON.stringify(payload),
    })
    const ct = res.headers.get('Content-Type') ?? ''

    if (!res.ok) {
      if (ct.includes('application/json')) {
        const j = (await res.json()) as {
          success?: boolean
          error?: string
          code?: string
          data?: { choices?: FreeTrainingChoice[] }
        }
        if (res.status === 422 && j.code === 'multiple_free_trainings' && j.data?.choices && j.data.choices.length > 0) {
          setChoices(j.data.choices)
          setSelectedProgramId(j.data.choices[0].program_id)
          setChoiceOpen(true)
          return
        }
        throw new Error(j.error ?? 'Could not issue certificate.')
      }
      throw new Error('Could not issue certificate.')
    }

    if (!ct.includes('application/pdf')) {
      throw new Error('Unexpected response from server.')
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'certificate.pdf'
    a.rel = 'noopener'
    a.click()
    URL.revokeObjectURL(url)
    setChoiceOpen(false)
  }

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
      await issueCertificate({ phone: p })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not issue certificate.')
    } finally {
      setPending(false)
    }
  }

  async function confirmChoiceDownload() {
    const p = phone.trim()
    if (!p || !selectedProgramId) return
    setPendingChoice(true)
    setErr(null)
    try {
      await issueCertificate({ phone: p, free_training_program_id: selectedProgramId })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not issue certificate.')
    } finally {
      setPendingChoice(false)
    }
  }

  const inputClass =
    'h-11 rounded-xl border-slate-200/90 bg-white pl-10 shadow-sm transition-all duration-300 placeholder:text-slate-400 hover:border-brand-teal/35 hover:shadow-md focus-visible:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal/25 sm:h-12'

  return (
    <section className="flex min-h-0 flex-1 flex-col justify-start border-0 px-4 pb-6 pt-1 sm:px-6 sm:pb-8 sm:pt-3">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-4 text-center sm:mb-5">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand-teal/25 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-teal shadow-sm backdrop-blur-sm sm:mb-2.5 sm:text-[11px]">
            <Award className="size-3 shrink-0" strokeWidth={2} aria-hidden />
            Certificate
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
            Get your certificate
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-600 sm:mt-2 sm:text-[0.9375rem]">
            Enter the phone you used when you registered. We verify your approved or eligible training, then you download
            your PDF.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className={cn(
            'space-y-4 rounded-2xl border border-brand-navy/[0.08] bg-gradient-to-b from-white to-brand-mint/[0.14] p-5 shadow-[0_8px_40px_-12px_rgba(23,94,126,0.12)] ring-1 ring-brand-navy/[0.04] backdrop-blur-[2px] transition-shadow duration-500 hover:shadow-[0_12px_48px_-12px_rgba(23,94,126,0.14)] sm:p-6 md:p-8',
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="cert-phone" className="text-sm font-medium text-brand-navy/85">
              Phone number
            </Label>
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
                className={inputClass}
              />
            </div>
          </div>
          {err ? (
            <p
              className="animate-in fade-in slide-in-from-top-1 rounded-xl border border-red-200/90 bg-red-50/95 px-3 py-2.5 text-sm text-red-800 duration-200"
              role="alert"
            >
              {err}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={pending}
            className={cn(
              'h-11 w-full min-w-0 rounded-full text-base font-semibold shadow-lg transition-all duration-300 ease-out sm:h-12',
              'bg-brand-teal text-white shadow-brand-teal/30 hover:bg-brand-teal-hover hover:shadow-xl hover:shadow-brand-teal/35 motion-safe:hover:scale-[1.01] motion-safe:active:scale-[0.99]',
              'disabled:opacity-70',
            )}
          >
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

      <Dialog open={choiceOpen} onOpenChange={setChoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a free training</DialogTitle>
            <DialogDescription>
              This number is registered for more than one eligible free training. Select the program name, then download
              your certificate.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={selectedProgramId} onValueChange={setSelectedProgramId} className="gap-3">
            {choices.map((c) => (
              <div
                key={c.program_id}
                className="flex items-start gap-3 rounded-lg border border-brand-navy/10 bg-brand-mint/10 p-3"
              >
                <RadioGroupItem value={c.program_id} id={`ft-choice-${c.program_id}`} className="mt-0.5" />
                <Label htmlFor={`ft-choice-${c.program_id}`} className="cursor-pointer font-medium leading-snug text-brand-navy">
                  {c.title || 'Free training'}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setChoiceOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-brand-teal text-white hover:bg-brand-teal-hover"
              disabled={!selectedProgramId || pendingChoice}
              onClick={() => void confirmChoiceDownload()}
            >
              {pendingChoice ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <Award className="mr-2 size-4" />
                  Download PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
