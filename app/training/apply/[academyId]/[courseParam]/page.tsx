import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { TrainingApplyForm, TrainingApplyProgramSummary } from '@/components/training-apply-form';
import { getAcademyCourse } from '@/lib/training-catalogue-data';

type Props = {
  params: Promise<{ academyId: string; courseParam: string }>;
};

export default async function TrainingApplyAcademyPage({ params }: Props) {
  const { academyId, courseParam } = await params;
  const data = getAcademyCourse(academyId, courseParam);
  if (!data) notFound();

  const { academy, course } = data;

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
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#b8f0d0]">Training application</p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Apply for this course</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Complete the form below. Our team will follow up with schedule options and enrollment steps.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <TrainingApplyProgramSummary
          academyName={academy.name}
          courseTitle={course.title}
          courseCode={course.code}
          duration={course.duration}
          format={course.format}
          levelOrTarget={course.level}
          levelLabel="Level"
          summary={course.summary}
        />
        <TrainingApplyForm
          variant="academy"
          academyName={academy.name}
          courseTitle={course.title}
          courseCode={course.code}
          duration={course.duration}
          format={course.format}
          levelOrTarget={course.level}
          summary={course.summary}
          payloadMeta={{
            academyId: academy.id,
            courseCode: course.code,
          }}
        />
      </section>

      <Footer />
    </main>
  );
}
