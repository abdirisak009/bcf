import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { GetCertificateForm } from '@/components/get-certificate-form'
import { SITE_LOGO_SRC } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Get certificate | Baraarug Consulting Firm',
  description:
    'Download your training completion certificate using the phone number on your approved application.',
}

export default function GetCertificatePage() {
  return (
    <main className="flex min-h-0 flex-col overflow-hidden overscroll-none bg-gradient-to-b from-slate-50 via-white to-brand-mint/[0.18] font-sans text-slate-800 antialiased h-[100svh] max-h-[100svh] supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:max-h-[100dvh]">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <header className="flex shrink-0 flex-col items-center px-4 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <Link
            href="/"
            className="group relative mb-1 inline-flex rounded-2xl p-1 outline-none ring-brand-teal/20 transition-all duration-300 ease-out hover:ring-2 focus-visible:ring-2 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.98]"
          >
            <Image
              src={SITE_LOGO_SRC}
              alt="Baraarug Consulting Firm"
              width={360}
              height={96}
              className="h-[3.25rem] w-auto max-w-[min(100%,17rem)] object-contain object-center sm:h-[4rem] sm:max-w-[18rem]"
              priority
            />
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-brand-teal/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-brand-teal sm:text-[0.7rem]">
            Policy · Governance · Growth
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <GetCertificateForm />
        </div>

        <p className="shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-center text-sm">
          <Link
            href="/"
            className="text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-brand-navy hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
