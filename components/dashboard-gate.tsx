'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getToken } from '@/lib/auth-client'

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      router.replace('/sign-in?next=/dashboard')
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent" />
        <p className="text-sm text-slate-600">Checking session…</p>
      </div>
    )
  }

  return <>{children}</>
}
