'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  User,
  Users,
} from 'lucide-react'

import { DashboardFormField } from '@/components/dashboard/dashboard-form-field'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getApiBase } from '@/lib/api'
import {
  dashboardFormInputClass,
  dashboardFormSelectTriggerClass,
  dashboardFormTextareaClass,
} from '@/lib/dashboard-ui'
import { cn } from '@/lib/utils'

type ApplicantType = 'individual' | 'organization'

/** Stored as employee_count_band in API; labels reflect participant count ranges. */
const PARTICIPANT_BANDS: { value: string; label: string }[] = [
  { value: '1_10', label: '1–10' },
  { value: '11_50', label: '11–50' },
  { value: '51_200', label: '51–200' },
  { value: '200_plus', label: '200+' },
  { value: 'custom', label: 'Custom' },
]

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'executives', label: 'Executives' },
  { value: 'managers', label: 'Managers' },
  { value: 'team_leads', label: 'Team leads' },
  { value: 'staff', label: 'Staff' },
]

const FORMAT_OPTIONS: { value: string; label: string }[] = [
  { value: 'online', label: 'Online' },
  { value: 'in_person', label: 'In-person' },
  { value: 'hybrid', label: 'Hybrid' },
]

type Props = {
  trainingId: string
}

export function TrainingApplyDbPageClient({ trainingId }: Props) {
  const [loadMeta, setLoadMeta] = useState<'loading' | 'ok' | 'error'>('loading')
  const [metaErr, setMetaErr] = useState<string | null>(null)
  const [trainingTitle, setTrainingTitle] = useState('')
  const [academyName, setAcademyName] = useState('')

  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const [applicantType, setApplicantType] = useState<ApplicantType>('individual')

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [message, setMessage] = useState('')

  const [participantBand, setParticipantBand] = useState<string>('')
  const [participantCustom, setParticipantCustom] = useState('')
  const [roleFlags, setRoleFlags] = useState<Record<string, boolean>>({
    executives: false,
    managers: false,
    team_leads: false,
    staff: false,
  })
  const [trainingFormat, setTrainingFormat] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadMeta('loading')
      setMetaErr(null)
      try {
        const res = await fetch(`${getApiBase()}/api/trainings/${trainingId}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        const json = (await res.json()) as {
          success?: boolean
          data?: { title?: string; academy?: { name?: string } | null }
          error?: string
        }
        if (cancelled) return
        if (!res.ok || json.success === false || !json.data) {
          setMetaErr(json.error ?? 'Training not found.')
          setLoadMeta('error')
          return
        }
        const t = json.data
        setTrainingTitle(String(t.title ?? ''))
        const an =
          t.academy && typeof t.academy === 'object' && t.academy?.name
            ? String(t.academy.name)
            : 'Baraarug Consulting'
        setAcademyName(an)
        setLoadMeta('ok')
      } catch {
        if (!cancelled) {
          setMetaErr('Could not load this programme. Check that the API is running.')
          setLoadMeta('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [trainingId])

  function toggleRole(value: string, checked: boolean) {
    setRoleFlags((prev) => ({ ...prev, [value]: checked }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const em = email.trim().toLowerCase()
    if (!em) {
      setError('Email is required.')
      return
    }

    if (applicantType === 'individual') {
      if (!firstName.trim()) {
        setError('First name is required.')
        return
      }
      if (!lastName.trim()) {
        setError('Last name is required.')
        return
      }
      if (!phone.trim()) {
        setError('WhatsApp number is required.')
        return
      }
      if (!company.trim()) {
        setError('Organization name is required.')
        return
      }
    } else {
      if (!phone.trim()) {
        setError('WhatsApp number is required.')
        return
      }
      if (!company.trim()) {
        setError('Organization name is required.')
        return
      }
      if (!participantBand) {
        setError('Number of participants is required.')
        return
      }
      if (participantBand === 'custom' && !participantCustom.trim()) {
        setError('Please specify the number of participants.')
        return
      }
      const selectedRoles = ROLE_OPTIONS.filter((r) => roleFlags[r.value]).map((r) => r.value)
      if (selectedRoles.length < 1) {
        setError('Select at least one participant role.')
        return
      }
      if (!trainingFormat) {
        setError('Preferred training format is required.')
        return
      }
    }

    setPending(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        training_id: trainingId,
        email: em,
        applicant_type: applicantType,
      }
      if (applicantType === 'individual') {
        payload.first_name = firstName.trim()
        payload.last_name = lastName.trim()
        payload.phone = phone.trim()
        payload.company = company.trim()
        if (jobTitle.trim()) payload.job_title = jobTitle.trim()
        if (message.trim()) payload.message = message.trim()
      } else {
        payload.phone = phone.trim()
        payload.company = company.trim()
        payload.employee_count_band = participantBand
        if (participantBand === 'custom') payload.employee_count_custom = participantCustom.trim()
        payload.participant_roles = ROLE_OPTIONS.filter((r) => roleFlags[r.value]).map((r) => r.value)
        payload.training_format = trainingFormat
        if (message.trim()) payload.message = message.trim()
      }

      const res = await fetch('/api/training-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`)
        return
      }
      if (data.success === false) {
        setError(data.error ?? 'Application failed')
        return
      }
      setDone(true)
    } catch {
      setError('Network error — try again or email info@bcf.so')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      <Navigation />

      <section className="border-b border-slate-200 bg-brand-navy pt-[104px] pb-10">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/training"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Training catalogue
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#b8f0d0]">Training application</p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Apply for this programme</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Share this page link with anyone who should enroll. Submit the form and our team will follow up by email.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-10 md:py-14">
        {loadMeta === 'loading' ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
            <Loader2 className="size-10 animate-spin text-brand-teal" aria-hidden />
            <p className="text-sm text-slate-600">Loading programme details…</p>
          </div>
        ) : loadMeta === 'error' ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 px-6 py-10 text-center shadow-sm">
            <p className="font-medium text-red-900">{metaErr}</p>
            <Button asChild className="mt-6 bg-brand-navy" variant="default">
              <Link href="/training">Back to training</Link>
            </Button>
          </div>
        ) : done ? (
          <div className="overflow-hidden rounded-2xl border border-brand-teal/25 bg-white shadow-[0_12px_40px_-16px_rgba(23,94,126,0.18)] md:p-0">
            <div className="bg-gradient-to-br from-brand-mint/50 via-white to-brand-teal/10 px-6 py-8 md:px-10 md:py-10">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-brand-teal/20">
                  <Sparkles className="size-8 text-brand-teal" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">Success</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy md:text-3xl">
                  Your application is in safe hands
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  Thank you for choosing Baraarug. We&apos;ve saved your details and our team will review everything
                  carefully.
                </p>
              </div>
            </div>
            <div className="space-y-6 border-t border-slate-100 px-6 py-8 md:px-10 md:py-9">
              <div className="rounded-xl border border-brand-navy/10 bg-slate-50/80 p-5 md:p-6">
                <div className="flex gap-3 text-left">
                  <div className="mt-0.5 shrink-0 rounded-lg bg-brand-navy/10 p-2">
                    <Mail className="size-5 text-brand-navy" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-teal">What happens next</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      We&apos;ll reach out to you at{' '}
                      <span className="font-semibold text-brand-navy">{email}</span>
                      {phone.trim() ? (
                        <>
                          {' '}
                          and on your WhatsApp (
                          <span className="font-semibold text-brand-navy">{phone.trim()}</span>) when we have an update.
                        </>
                      ) : (
                        <> when we have an update.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-brand-teal/35 bg-brand-mint/20 px-4 py-3 text-left text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-teal" aria-hidden />
                <p>
                  <span className="font-semibold text-brand-navy">Tip:</span> Add our number to your contacts so you
                  don&apos;t miss our message.
                </p>
              </div>
              <div className="text-center">
                <Button asChild className="bg-brand-navy font-semibold shadow-md" size="lg">
                  <Link href="/training">Back to training catalogue</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(23,94,126,0.12)] md:p-8">
            <div className="mb-8 border-b border-slate-100 pb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-teal">Selected programme</p>
              <p className="mt-2 text-sm font-medium text-slate-500">{academyName}</p>
              <h2 className="mt-1 text-xl font-bold leading-snug text-brand-navy md:text-2xl">{trainingTitle}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <DashboardFormField label="Applying as" htmlFor="tap-applicant" icon={Users} hint="Choose whether you are enrolling yourself or a team.">
                <RadioGroup
                  id="tap-applicant"
                  value={applicantType}
                  onValueChange={(v) => {
                    setApplicantType(v as ApplicantType)
                    setError(null)
                  }}
                  className="flex flex-col gap-3 sm:flex-row sm:gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="individual" id="tap-applicant-individual" />
                    <Label htmlFor="tap-applicant-individual" className="cursor-pointer font-normal text-brand-navy">
                      Individual
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="organization" id="tap-applicant-org" />
                    <Label htmlFor="tap-applicant-org" className="cursor-pointer font-normal text-brand-navy">
                      Organization
                    </Label>
                  </div>
                </RadioGroup>
              </DashboardFormField>

              <DashboardFormField label="Email" htmlFor="tap-email" icon={Mail} hint="Required">
                <Input
                  id="tap-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={dashboardFormInputClass}
                  required
                />
              </DashboardFormField>

              {applicantType === 'individual' ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DashboardFormField label="First name" htmlFor="tap-fn" icon={User} hint="Required">
                      <Input
                        id="tap-fn"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={dashboardFormInputClass}
                        required
                      />
                    </DashboardFormField>
                    <DashboardFormField label="Last name" htmlFor="tap-ln" icon={User} hint="Required">
                      <Input
                        id="tap-ln"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={dashboardFormInputClass}
                        required
                      />
                    </DashboardFormField>
                  </div>
                  <DashboardFormField label="WhatsApp Number" htmlFor="tap-ph" icon={Phone} hint="Required">
                    <Input
                      id="tap-ph"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={dashboardFormInputClass}
                      placeholder="+252 …"
                      required
                    />
                  </DashboardFormField>
                  <DashboardFormField label="Organization name" htmlFor="tap-co" icon={Building2} hint="Required">
                    <Input
                      id="tap-co"
                      autoComplete="organization"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={dashboardFormInputClass}
                      required
                    />
                  </DashboardFormField>
                  <DashboardFormField label="Job title" htmlFor="tap-job" icon={Briefcase}>
                    <Input
                      id="tap-job"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className={dashboardFormInputClass}
                    />
                  </DashboardFormField>
                  <DashboardFormField label="Message (optional)" htmlFor="tap-msg" icon={Mail}>
                    <Textarea
                      id="tap-msg"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Goals, preferred timing, or questions…"
                      className={cn(dashboardFormTextareaClass, 'resize-y')}
                    />
                  </DashboardFormField>
                </>
              ) : (
                <>
                  <DashboardFormField label="WhatsApp Number" htmlFor="tap-org-wa" icon={Phone} hint="Required">
                    <Input
                      id="tap-org-wa"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={dashboardFormInputClass}
                      placeholder="+252 …"
                      required
                    />
                  </DashboardFormField>
                  <DashboardFormField label="Organization name" htmlFor="tap-org-name" icon={Building2} hint="Required">
                    <Input
                      id="tap-org-name"
                      autoComplete="organization"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={dashboardFormInputClass}
                      required
                    />
                  </DashboardFormField>
                  <DashboardFormField label="Number of participants" htmlFor="tap-participant-band" icon={Users} hint="Required">
                    <Select
                      value={participantBand || undefined}
                      onValueChange={(v) => {
                        setParticipantBand(v)
                        setError(null)
                      }}
                    >
                      <SelectTrigger id="tap-participant-band" className={dashboardFormSelectTriggerClass}>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTICIPANT_BANDS.map((b) => (
                          <SelectItem key={b.value} value={b.value}>
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DashboardFormField>
                  {participantBand === 'custom' ? (
                    <DashboardFormField label="Specify number of participants" htmlFor="tap-participant-custom" icon={Users}>
                      <Input
                        id="tap-participant-custom"
                        value={participantCustom}
                        onChange={(e) => setParticipantCustom(e.target.value)}
                        className={dashboardFormInputClass}
                        placeholder="e.g. 500"
                      />
                    </DashboardFormField>
                  ) : null}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-semibold tracking-tight text-brand-navy">
                      <Users className="size-4 shrink-0 text-brand-teal" strokeWidth={2} aria-hidden />
                      Roles of participants
                    </Label>
                    <p className="text-xs text-slate-500">Select all that apply.</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ROLE_OPTIONS.map((r) => (
                        <label
                          key={r.value}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-brand-navy/10 bg-white px-3 py-2.5 text-sm text-brand-navy shadow-sm transition hover:border-brand-teal/40"
                        >
                          <Checkbox
                            checked={roleFlags[r.value] ?? false}
                            onCheckedChange={(c) => toggleRole(r.value, c === true)}
                          />
                          <span>{r.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <DashboardFormField label="Preferred training format" htmlFor="tap-format" icon={Users} hint="Required">
                    <Select
                      value={trainingFormat || undefined}
                      onValueChange={(v) => {
                        setTrainingFormat(v)
                        setError(null)
                      }}
                    >
                      <SelectTrigger id="tap-format" className={dashboardFormSelectTriggerClass}>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DashboardFormField>
                  <DashboardFormField label="Message (optional)" htmlFor="tap-msg-org" icon={Mail}>
                    <Textarea
                      id="tap-msg-org"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Goals, preferred timing, or questions…"
                      className={cn(dashboardFormTextareaClass, 'resize-y')}
                    />
                  </DashboardFormField>
                </>
              )}

              {error ? <p className="text-destructive text-sm font-medium">{error}</p> : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" asChild className="border-brand-navy/20">
                  <Link href="/training">Cancel</Link>
                </Button>
                <Button type="submit" disabled={pending} className="bg-brand-navy font-semibold">
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Apply now
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
