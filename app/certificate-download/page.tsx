import type { Metadata } from 'next'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero'
import { CertificateDownloadForm } from '@/components/certificate-download-form'
import { Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Download certificate | Baraarug Consulting Firm',
  description: 'Enter your certificate number and download your PDF certificate.',
}

export default function CertificateDownloadPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />

      <PageHeroShell innerClassName="max-w-4xl">
        <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b8f0d0] backdrop-blur-md sm:mb-3 sm:px-4 sm:text-xs">
          <Award className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
          Certificate
        </div>
        <h1 className={pageHeroTitleClass}>
          Download your <span className="text-brand-green">certificate</span>
        </h1>
        <p className={pageHeroSubtitleClass}>
          Enter the certificate number you received after approval (e.g. BCF-2026-0001).
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-brand-teal sm:mt-7" />
      </PageHeroShell>

      <CertificateDownloadForm />

      <Footer />
    </main>
  )
}
