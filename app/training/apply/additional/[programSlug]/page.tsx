import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { TrainingApplyForm, TrainingApplyProgramSummary } from '@/components/training-apply-form';
import { getAdditionalProgramBySlug } from '@/lib/training-catalogue-data';

type Props = {
  params: Promise<{ programSlug: string }>;
};

export default async function TrainingApplyAdditionalPage({ params }: Props) {
  const { programSlug } = await params;
  const program = getAdditionalProgramBySlug(programSlug);
  if (!program) notFound();

  return (
    <main className="min-h-screen bg-white font-sans antialiased">
      <Navigation />

      <section className="border-b border-white/20 bg-brand-navy pt-24 pb-8 sm:pt-28">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/training"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Training catalogue
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#b8f0d0]">Specialized program</p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Apply for this program</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Tell us about your needs—we will propose format, timing, and next steps.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <TrainingApplyProgramSummary
          academyName="Additional specialized programs"
          courseTitle={program.title}
          duration="Flexible / cohort-based"
          format="In-person · Virtual · Blended"
          levelOrTarget={program.target}
          levelLabel="Target group"
          summary={program.description}
        />
        <TrainingApplyForm
          variant="additional"
          academyName="Additional specialized programs"
          courseTitle={program.title}
          duration="Flexible / cohort-based"
          format="In-person · Virtual · Blended"
          levelOrTarget={program.target}
          summary={program.description}
          payloadMeta={{
            programSlug: program.slug,
          }}
        />
      </section>

      <Footer />
    </main>
  );
}
