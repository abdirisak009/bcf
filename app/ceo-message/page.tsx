'use client';

import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import ChairpersonMessage from '@/components/chairperson-message';
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero';

export default function CEOMessagePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <PageHeroShell>
        <div className="mb-2 flex justify-center sm:mb-3">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-wide text-white/95 backdrop-blur-sm sm:px-5 sm:py-2 sm:text-xs">
            Leadership
          </span>
        </div>
        <h1 className={pageHeroTitleClass}>CEO Message</h1>
        <p className={pageHeroSubtitleClass}>
          A word from the Chief Executive Officer on our mission, values, and commitment to clients
        </p>
      </PageHeroShell>

      <ChairpersonMessage />

      <Footer />
    </main>
  );
}
