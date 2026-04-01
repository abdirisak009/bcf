import type { Metadata } from 'next'
import { Suspense } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { CertificateVerifyView } from '@/components/certificate-verify'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Verify | Certificate check | Baraarug Consulting Firm',
  description:
    'Official verify page: scan the QR code on your Baraarug certificate PDF to see participant name, training programme, and certificate number.',
  openGraph: {
    title: 'Verify — Baraarug certificate',
    description: 'Check a training certificate issued by Baraarug Consulting Firm.',
  },
}

function VerifyFallback() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-brand-mint/25 to-white py-20 px-4">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-slate-600">
        <Loader2 className="size-9 animate-spin text-brand-teal" aria-hidden />
        <p className="text-sm">Loading…</p>
      </div>
    </section>
  )
}

export default function VerifyCertificatePage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />
      <Suspense fallback={<VerifyFallback />}>
        <CertificateVerifyView />
      </Suspense>
      <Footer />
    </main>
  )
}
