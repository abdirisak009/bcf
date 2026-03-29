import type { Metadata } from 'next';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { ContactSection } from '@/components/contact-section';
import { MessageCircle } from 'lucide-react';
import { OFFICE_ADDRESS } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contact | Baraarug Consulting Firm',
  description: `Visit Baraarug Consulting at ${OFFICE_ADDRESS}. Strategy, audit, M&E, training, and institutional support across the region.`,
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased text-slate-800">
      <Navigation />

      <section className="relative overflow-hidden" style={{ paddingTop: '104px' }}>
        <div className="pointer-events-none absolute inset-0 bg-brand-navy" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f0d0] backdrop-blur-md">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            Contact
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white text-balance sm:text-5xl md:text-6xl">
            Let&apos;s build something{' '}
            <span className="text-brand-green">exceptional</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/88 md:text-xl">
            Share your priorities — our team will connect you with the right practice leads and next steps.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-brand-teal" />
        </div>
      </section>

      <ContactSection embedded={false} />

      <Footer />
    </main>
  );
}
