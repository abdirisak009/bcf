'use client'

import { Mail, Phone } from 'lucide-react'

import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero'
import { CertificateSection } from '@/components/certificate-section'
import { TrainingDynamicSection } from '@/components/training-dynamic-section'
import { OFFICE_ADDRESS } from '@/lib/site-config'

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />

      <PageHeroShell innerClassName="max-w-3xl">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#b8f0d0] sm:mb-3 sm:text-[11px]">
          Training &amp; Capacity Development
        </p>
        <div className="mx-auto mb-3 h-px w-14 bg-brand-teal sm:mb-4" />
        <h1 className={pageHeroTitleClass}>Training programs</h1>
        <p className={`${pageHeroSubtitleClass} max-w-xl`}>
          The catalogue below is served from the database — manage it in the dashboard or seed the default catalogue once.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-7 sm:flex-row sm:gap-4">
          <a
            href="mailto:info@bcf.so?subject=Training%20inquiry"
            className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <Mail size={18} />
            info@bcf.so
          </a>
          <a
            href="tel:+252613685943"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-brand-navy shadow-lg transition hover:bg-white/95"
          >
            <Phone size={18} />
            +252-613-685-943
          </a>
        </div>
      </PageHeroShell>

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
