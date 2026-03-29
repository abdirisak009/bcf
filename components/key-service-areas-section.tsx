'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export type KeyServiceAreaItem = {
  text: string;
  icon: LucideIcon;
};

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function RevealCard({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function KeyServiceAreasSection({
  items,
  columns = 3,
}: {
  items: KeyServiceAreaItem[];
  /** 2 columns balances 5-item layouts; 3 columns fits 6+ items in a classic grid */
  columns?: 2 | 3;
}) {
  const isLastSoloCenter =
    columns === 2 && items.length % 2 === 1 && items.length > 1;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 px-6">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[min(50vw,420px)] h-[min(50vw,420px)] rounded-full bg-brand-teal/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[min(40vw,320px)] h-[min(40vw,320px)] rounded-full bg-brand-navy/8 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <RevealCard className="text-center mb-14 md:mb-16">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-teal uppercase mb-3">Scope of work</p>
          <h2 className="text-3xl md:text-4xl lg:text-[2.35rem] font-bold text-brand-navy text-balance tracking-tight">
            Key Service Areas
          </h2>
          <div className="mt-5 flex justify-center">
            <div className="h-1 w-16 rounded-full bg-brand-teal" />
          </div>
        </RevealCard>

        <div
          className={
            columns === 2
              ? 'grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto'
              : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6'
          }
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            const num = String(i + 1).padStart(2, '0');
            const soloCenter = isLastSoloCenter && i === items.length - 1;
            return (
              <RevealCard
                key={i}
                delay={i * 70}
                className={soloCenter ? 'md:col-span-2 flex justify-center' : ''}
              >
                <article
                  className={`group relative h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 lg:p-7 shadow-[0_1px_0_0_rgba(15,23,42,0.03),0_8px_24px_-8px_rgba(23,94,126,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-navy/25 hover:shadow-[0_12px_40px_-12px_rgba(23,94,126,0.2)] ${soloCenter ? 'w-full max-w-2xl' : ''}`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-2 -top-4 font-bold text-7xl leading-none text-brand-navy/[0.06] tabular-nums select-none"
                  >
                    {num}
                  </div>
                  <div className="relative flex gap-4">
                    <div className="shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg shadow-brand-navy/25 ring-4 ring-brand-teal/15 transition-transform duration-300 group-hover:scale-[1.03] group-hover:ring-brand-teal/25">
                        <Icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[0.9375rem] leading-relaxed text-slate-600 text-pretty">{item.text}</p>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-brand-teal/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </article>
              </RevealCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
