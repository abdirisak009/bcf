'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginRequest, setSession } from '@/lib/auth-client'

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
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await loginRequest({ email: email.trim(), password })
      if (!res.success || !res.data?.token || !res.data?.user) {
        setError(res.error ?? 'Could not sign in.')
        return
      }
      setSession(res.data.token, {
        id: res.data.user.id,
        email: res.data.user.email,
        role: res.data.user.role,
        permissions: res.data.user.permissions,
      })
      router.push(nextPath)
      router.refresh()
    } catch {
      setError('Network error. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-brand-navy">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use your Bararug account to open the dashboard.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 border-slate-200 bg-white"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 border-slate-200 bg-white"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-full bg-brand-teal text-base font-semibold shadow-lg shadow-brand-teal/25 hover:bg-brand-teal-hover"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Need training or a certificate?{' '}
        <Link href="/training" className="font-medium text-brand-teal underline-offset-2 hover:underline">
          Training
        </Link>
        {' · '}
        <Link href="/get-certificate" className="font-medium text-brand-teal underline-offset-2 hover:underline">
          Get certificate
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        <Link href="/" className="text-slate-500 underline-offset-2 hover:text-brand-navy hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  )
}
