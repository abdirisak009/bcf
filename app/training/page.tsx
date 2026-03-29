'use client'

import { Mail, Phone } from 'lucide-react'

import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { CertificateSection } from '@/components/certificate-section'
import { TrainingDynamicSection } from '@/components/training-dynamic-section'
import { OFFICE_ADDRESS } from '@/lib/site-config'

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />

      {/* Hero — programs: dashboard (API) + published catalogue below */}
      <section
        className="relative flex min-h-[min(420px,70vh)] items-center justify-center overflow-hidden"
        style={{ paddingTop: '104px' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-brand-navy" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(80vw,640px)] w-[min(80vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal/10 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-[#b8f0d0]">
            Training &amp; Capacity Development
          </p>
          <div className="mx-auto mb-6 h-px w-16 bg-brand-teal" />
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white text-balance sm:text-5xl md:text-6xl">
            Training programs
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base text-white/85 md:text-lg">
            The catalogue below is served from the database — manage it in the dashboard or seed the default catalogue once.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="mailto:info@bcf.so?subject=Training%20inquiry"
              className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Mail size={18} />
              info@bcf.so
            </a>
            <a
              href="tel:+252613685943"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-navy shadow-lg transition hover:bg-white/95"
            >
              <Phone size={18} />
              +252-613-685-943
            </a>
          </div>
        </div>
      </section>

      <TrainingDynamicSection />

      <CertificateSection />

      <section className="border-t border-slate-200 bg-slate-50 py-10 px-6">
        <p className="mx-auto max-w-2xl text-center text-sm text-slate-600">
          {OFFICE_ADDRESS}
        </p>
      </section>

      <Footer />
    </main>
  )
}
