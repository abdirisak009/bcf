'use client'

import { useState } from 'react'
import { Award, Loader2, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-brand-mint/20 to-white py-14 px-6 md:py-20">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <Award className="mx-auto mb-3 size-11 text-brand-teal" strokeWidth={1.25} />
          <h2 className="text-2xl font-bold text-brand-navy md:text-3xl">Get your certificate</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Enter the <strong>phone number</strong> you used when registering. For <strong>paid trainings</strong>, your
            application must be <strong>approved</strong>. For <strong>free trainings</strong>, you must be on the
            Participants list (Shortlisted or Precepts) and certificate download must be turned on for that program. If
            you joined more than one free training, choose which certificate to download.
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
