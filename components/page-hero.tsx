import { cn } from '@/lib/utils';

/** Shared compact page hero (matches `/our-team` — not the home carousel hero). */
export const pageHeroEyebrowClass =
  'inline-flex items-center gap-1.5 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-brand-teal backdrop-blur-sm sm:gap-2 sm:px-5 sm:py-2 sm:text-xs';

export const pageHeroTitleClass =
  'mx-auto mt-3 max-w-4xl text-balance text-3xl font-bold leading-[1.12] tracking-tight text-white sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl';

export const pageHeroSubtitleClass =
  'mx-auto mt-3 max-w-2xl text-sm leading-snug text-white/75 sm:mt-4 sm:text-base md:max-w-3xl md:text-lg';

export const pageHeroInnerClass =
  'relative z-10 mx-auto w-full max-w-7xl px-4 py-5 pb-8 text-center sm:px-6 sm:py-6 sm:pb-10 md:py-7 md:pb-11 lg:px-8';

type PageHeroShellProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
};

export function PageHeroShell({ children, className, innerClassName }: PageHeroShellProps) {
  return (
    <section
      className={cn('relative w-full min-h-0 overflow-hidden border-b border-white/20 bg-brand-navy pt-24 sm:pt-28', className)}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-navy via-[#0a3a52] to-brand-navy" />
      <div className="pointer-events-none absolute left-1/4 top-8 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-teal/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 translate-x-1/4 rounded-full bg-white/[0.06] blur-3xl" />
      <div className={cn(pageHeroInnerClass, innerClassName)}>{children}</div>
    </section>
  );
}
