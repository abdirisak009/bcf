'use client'

import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getBrowserApiUrl } from '@/lib/api'
import { cn } from '@/lib/utils'

type Program = {
  title: string
  venue_location: string
  content: string
  outcomes: string
}

export function FreeTrainingRegisterForm({ slug, program }: { slug: string; program: Program }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState<string>('unspecified')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ message: string } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const url = getBrowserApiUrl(`/api/free-training-programs/public/slug/${encodeURIComponent(slug)}/register`)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          location: location.trim(),
          gender: gender === 'unspecified' ? '' : gender,
          message: message.trim() || undefined,
        }),
      })
      const json = (await res.json()) as { success?: boolean; data?: { success_message?: string }; error?: string }
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Registration failed. Please try again.')
        return
      }
      const msg = json.data?.success_message ?? 'Thank you for registering.'
      setDone({ message: msg })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div
        className="rounded-2xl border border-brand-teal/30 bg-brand-mint/25 px-6 py-8 text-center shadow-inner"
        role="status"
      >
        <p className="text-lg font-semibold text-brand-navy">Registration received</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{done.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-navy">Training overview</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{program.content}</p>
      </section>
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-navy">What you will gain</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{program.outcomes}</p>
      </section>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold text-brand-navy">Register your interest</h2>
        <p className="text-sm text-slate-600">
          Venue / area: <span className="font-medium text-brand-navy">{program.venue_location}</span>
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ft-full">Full name *</Label>
            <Input
              id="ft-full"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-brand-navy/15"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ft-email">Email *</Label>
            <Input
              id="ft-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-brand-navy/15"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ft-phone">Phone</Label>
            <Input
              id="ft-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-brand-navy/15"
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ft-loc">Your location (city / region) *</Label>
            <Input
              id="ft-loc"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-brand-navy/15"
              placeholder="e.g. Mogadishu"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ft-gender">Gender (optional)</Label>
            <select
              id="ft-gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={cn(
                'border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm',
                'border-brand-navy/15 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              )}
            >
              <option value="unspecified">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ft-msg">Why you want to join (optional)</Label>
          <Textarea
            id="ft-msg"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={cn('resize-y border-brand-navy/15')}
            placeholder="Brief motivation or questions"
          />
        </div>

        {error ? <p className="text-destructive text-sm font-medium">{error}</p> : null}

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-teal text-white hover:bg-brand-teal-hover sm:w-auto"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Submit registration
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
