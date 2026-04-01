'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginRequest, setSession } from '@/lib/auth-client'
import { SITE_LOGO_SRC } from '@/lib/site-config'
import { cn } from '@/lib/utils'

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get('next'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  /** Button UI: idle → loading (spinner) → success (tick) → navigate */
  const [btnPhase, setBtnPhase] = useState<'idle' | 'loading' | 'success'>('idle')
  /** Stops double-submit (double click / slow network) from sending two login POSTs. */
  const submitLock = useRef(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitLock.current || btnPhase === 'loading' || btnPhase === 'success') return
    submitLock.current = true
    setError(null)
    setBtnPhase('loading')
    try {
      const res = await loginRequest({ email: email.trim(), password: password.trim() })
      if (!res.success || !res.data?.token || !res.data?.user) {
        setError(res.error ?? 'Could not sign in.')
        setBtnPhase('idle')
        return
      }
      setSession(res.data.token, {
        id: res.data.user.id,
        email: res.data.user.email,
        role: res.data.user.role,
        permissions: res.data.user.permissions,
      })
      setBtnPhase('success')
      await new Promise((r) => setTimeout(r, 520))
      router.push(nextPath)
      router.refresh()
    } catch {
      setError('Network error. Is the API running?')
      setBtnPhase('idle')
    } finally {
      submitLock.current = false
    }
  }

  const inputClass =
    'h-11 rounded-xl border-slate-200/90 bg-white shadow-sm transition-all duration-300 placeholder:text-slate-400 hover:border-brand-teal/35 hover:shadow-md focus-visible:border-brand-teal focus-visible:ring-2 focus-visible:ring-brand-teal/25 sm:h-12 [@media(max-height:700px)]:lg:h-10'

  return (
    <div className="mx-auto w-full max-w-lg min-h-0 [@media(max-height:700px)]:lg:max-w-md">
      {/* Brand block — centered, prominent logo */}
      <div className="flex flex-col items-center text-center">
        <Link
          href="/"
          className="group relative mb-4 inline-flex rounded-2xl p-1 outline-none ring-brand-teal/20 transition-all duration-300 ease-out hover:ring-2 focus-visible:ring-2 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.98] [@media(max-height:720px)]:lg:mb-2"
        >
          <Image
            src={SITE_LOGO_SRC}
            alt="Bararug Consulting"
            width={360}
            height={96}
            className="h-[3.75rem] w-auto max-w-[min(100%,18rem)] object-contain object-center sm:h-[4.5rem] md:h-[5rem] md:max-w-[20rem] [@media(max-height:720px)]:lg:h-[3.5rem] [@media(max-height:720px)]:lg:max-w-[16rem]"
            priority
          />
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-brand-teal/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brand-teal md:text-xs [@media(max-height:700px)]:lg:text-[0.65rem]">
          Policy · Governance · Growth
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl md:text-[2.35rem] md:leading-tight [@media(max-height:720px)]:lg:mt-2 [@media(max-height:720px)]:lg:text-3xl">
          Sign in
        </h1>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-600 [@media(max-height:700px)]:lg:mt-1 [@media(max-height:700px)]:lg:text-xs">
          Use your Bararug account to open the dashboard.
        </p>
      </div>

      {/* Form card */}
      <div className="mt-6 rounded-2xl border border-brand-navy/[0.08] bg-gradient-to-b from-white to-brand-mint/[0.14] p-5 shadow-[0_8px_40px_-12px_rgba(23,94,126,0.12)] ring-1 ring-brand-navy/[0.04] backdrop-blur-[2px] transition-shadow duration-500 hover:shadow-[0_12px_48px_-12px_rgba(23,94,126,0.14)] sm:p-6 md:p-8 [@media(max-height:720px)]:lg:mt-4 [@media(max-height:720px)]:lg:p-5 [@media(max-height:640px)]:lg:mt-3 [@media(max-height:640px)]:lg:p-4">
        <form onSubmit={onSubmit} className="space-y-4 text-left [@media(max-height:700px)]:lg:space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-brand-navy/85">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-brand-navy/85">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error ? (
          <p
            className="animate-in fade-in slide-in-from-top-1 rounded-xl border border-red-200/90 bg-red-50/95 px-3 py-2.5 text-sm text-red-800 duration-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={btnPhase !== 'idle'}
          aria-busy={btnPhase === 'loading'}
          aria-label={
            btnPhase === 'loading' ? 'Signing in' : btnPhase === 'success' ? 'Signed in successfully' : 'Sign in'
          }
          className={cn(
            'h-11 w-full min-w-0 rounded-full text-base font-semibold shadow-lg transition-all duration-500 ease-out sm:h-12 [@media(max-height:700px)]:lg:h-10 [@media(max-height:700px)]:lg:text-sm',
            'disabled:cursor-not-allowed disabled:opacity-100',
            btnPhase === 'idle' &&
              'bg-brand-teal text-white shadow-brand-teal/30 hover:bg-brand-teal-hover hover:shadow-xl hover:shadow-brand-teal/35 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]',
            btnPhase === 'loading' &&
              'bg-brand-teal text-white shadow-brand-teal/35 ring-2 ring-white/25 ring-offset-2 ring-offset-brand-teal/90',
            btnPhase === 'success' &&
              'bg-emerald-600 text-white shadow-emerald-600/35 hover:bg-emerald-600 motion-safe:scale-100',
          )}
        >
          <span className="inline-flex min-h-[1.5rem] items-center justify-center gap-2">
            {btnPhase === 'loading' ? (
              <>
                <Loader2 className="size-5 shrink-0 animate-spin text-white" aria-hidden />
                <span className="tabular-nums">Signing in…</span>
              </>
            ) : btnPhase === 'success' ? (
              <Check className="size-7 shrink-0 drop-shadow-sm animate-sign-in-tick" strokeWidth={2.75} aria-hidden />
            ) : (
              'Sign in'
            )}
          </span>
        </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600 [@media(max-height:720px)]:lg:mt-4 [@media(max-height:720px)]:lg:text-xs">
        Need training or a certificate?{' '}
        <Link
          href="/training"
          className="font-medium text-brand-teal underline-offset-4 transition-colors duration-200 hover:text-brand-navy hover:underline"
        >
          Training
        </Link>
        {' · '}
        <Link
          href="/get-certificate"
          className="font-medium text-brand-teal underline-offset-4 transition-colors duration-200 hover:text-brand-navy hover:underline"
        >
          Get certificate
        </Link>
      </p>
      <p className="mt-3 text-center text-sm [@media(max-height:720px)]:lg:mt-2">
        <Link
          href="/"
          className="text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-brand-navy hover:underline"
        >
          Back to home
        </Link>
      </p>
    </div>
  )
}
