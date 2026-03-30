import type { Metadata } from 'next';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero';
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

      <PageHeroShell innerClassName="max-w-4xl">
        <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b8f0d0] backdrop-blur-md sm:mb-3 sm:px-4 sm:text-xs">
          <MessageCircle className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
          Contact
        </div>
        <h1 className={pageHeroTitleClass}>
          Let&apos;s build something <span className="text-brand-green">exceptional</span>
        </h1>
        <p className={pageHeroSubtitleClass}>
          Share your priorities — our team will connect you with the right practice leads and next steps.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-brand-teal sm:mt-7" />
      </PageHeroShell>

      <ContactSection embedded={false} />

      <Footer />
    </main>
  );
}
