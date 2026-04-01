import { Suspense } from 'react'
import Image from 'next/image'

import { SignInForm } from '@/components/sign-in-form'

/** Business Leaders Forum — panel photo (public/slide2.png) */
const HERO_SRC = '/slide2.png'

function SignInFormFallback() {
  return (
    <div className="mx-auto flex w-full max-w-lg animate-pulse flex-col items-center">
      <div className="h-20 w-64 rounded-xl bg-slate-200" />
      <div className="mt-3 h-3 w-40 rounded bg-slate-100" />
      <div className="mt-5 h-10 w-48 rounded-lg bg-slate-200" />
      <div className="mt-2 h-4 w-72 max-w-full rounded bg-slate-100" />
      <div className="mt-9 w-full rounded-2xl border border-slate-100 bg-slate-50/80 p-8">
        <div className="h-11 w-full rounded-lg bg-slate-100" />
        <div className="mt-5 h-11 w-full rounded-lg bg-slate-100" />
        <div className="mt-6 h-12 w-full rounded-full bg-slate-200" />
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <main className="flex min-h-0 flex-col overflow-hidden overscroll-none bg-white h-[100svh] max-h-[100svh] supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:max-h-[100dvh]">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Left: image (desktop — fills column height, no page scroll) */}
        <div className="animate-sign-in-hero relative hidden min-h-0 lg:block lg:h-full lg:w-[46%] lg:shrink-0 lg:overflow-hidden">
          <Image
            src={HERO_SRC}
            alt="Business Leaders Forum — panel discussion"
            fill
            priority
            className="object-cover object-center transition-transform duration-[1.2s] ease-out motion-safe:lg:hover:scale-[1.02]"
            sizes="(min-width: 1024px) 46vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/92 via-brand-navy/55 to-brand-teal/30" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-10 [@media(max-height:760px)]:lg:p-6">
            <div className="max-w-md [@media(max-height:700px)]:lg:max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 [@media(max-height:700px)]:lg:text-[0.65rem]">
                Bararug Consulting
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-white md:text-3xl [@media(max-height:700px)]:lg:mt-1 [@media(max-height:700px)]:lg:text-xl">
                Policy · Governance · Growth
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/85 [@media(max-height:700px)]:lg:mt-2 [@media(max-height:700px)]:lg:text-xs [@media(max-height:700px)]:lg:leading-snug">
                Sign in to manage news, publications, trainings, and financial tools from one dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile hero strip — short so form + strip fit better */}
        <div className="animate-sign-in-hero relative h-[min(11rem,28svh)] shrink-0 overflow-hidden lg:hidden">
          <Image
            src={HERO_SRC}
            alt="Business Leaders Forum"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/92 via-brand-navy/55 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <p className="text-base font-semibold text-white drop-shadow-sm">Sign in to your account</p>
            <p className="mt-0.5 text-xs text-white/80">Bararug Consulting</p>
          </div>
        </div>

        {/* Right: form — lg: overflow hidden = no document scroll on desktop */}
        <div className="animate-sign-in-form flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overflow-x-hidden px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 lg:overflow-hidden lg:px-10 lg:py-3 xl:px-16 [@media(max-height:760px)]:lg:py-2 [@media(max-height:640px)]:lg:py-1">
          <Suspense fallback={<SignInFormFallback />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
