import Link from 'next/link'
import { Suspense } from 'react'
import Image from 'next/image'

import { SignInForm } from '@/components/sign-in-form'

const HERO_SRC =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'

const LOGO_SRC =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-light-P0BU6tiM5ptby7QodAsAhFQEc478P5.png'

function SignInFormFallback() {
  return (
    <div className="flex w-full max-w-md animate-pulse flex-col gap-4">
      <div className="h-9 w-48 rounded bg-slate-200" />
      <div className="h-4 w-full max-w-sm rounded bg-slate-100" />
      <div className="mt-6 h-11 w-full rounded-lg bg-slate-100" />
      <div className="h-11 w-full rounded-lg bg-slate-100" />
      <div className="h-11 w-full rounded-full bg-slate-200" />
    </div>
  )
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left: image */}
        <div className="relative hidden min-h-[40vh] lg:block lg:min-h-screen lg:w-[46%] lg:max-w-none">
          <Image
            src={HERO_SRC}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 46vw, 100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/45 to-brand-teal/25" />
          <div className="absolute inset-0 flex flex-col justify-between p-10 lg:p-12">
            <Link href="/" className="inline-flex w-fit items-center gap-3">
              <span className="relative block h-10 w-36 shrink-0">
                <Image src={LOGO_SRC} alt="Bararug Consulting" fill className="object-contain object-left" unoptimized />
              </span>
            </Link>
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Bararug Consulting</p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white md:text-3xl">
                Policy · Governance · Growth
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Sign in to manage news, publications, trainings, and financial tools from one dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile hero strip */}
        <div className="relative min-h-[220px] lg:hidden">
          <Image
            src={HERO_SRC}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="relative block h-9 w-32 shrink-0">
                <Image src={LOGO_SRC} alt="Bararug" fill className="object-contain object-left" unoptimized />
              </span>
            </Link>
            <p className="mt-3 text-lg font-semibold text-white">Sign in to your account</p>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <Suspense fallback={<SignInFormFallback />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
