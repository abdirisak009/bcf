'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  CalendarRange,
  Clock,
  Languages,
  LayoutGrid,
} from 'lucide-react';

const ICON_BY_LABEL: Record<string, LucideIcon> = {
  Formats: LayoutGrid,
  Duration: Clock,
  Languages: Languages,
  Certification: Award,
  Schedule: CalendarRange,
};

export type ProgramFormatRow = { label: string; value: string };

function useCardReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          o.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return { ref, visible };
}

function Card({
  label,
  value,
  Icon,
  delay,
}: {
  label: string;
  value: string;
  Icon: LucideIcon;
  delay: number;
}) {
  const { ref, visible } = useCardReveal();
  const parts = value.split(' · ').map((p) => p.trim()).filter(Boolean);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group flex h-full flex-col rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-500 hover:border-brand-teal/45 hover:bg-white/[0.11] ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal/25 text-brand-mint shadow-inner ring-1 ring-white/20 transition group-hover:scale-105 group-hover:bg-brand-teal/40 group-hover:text-white">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-teal">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {parts.map((part) => (
          <span
            key={part}
            className="inline-flex rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-left text-[11px] font-medium leading-snug text-white/90 transition group-hover:border-white/20 group-hover:bg-white/10 md:text-xs"
          >
            {part}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TrainingProgramFormatsSection({ rows }: { rows: ProgramFormatRow[] }) {
  return (
    <section className="relative overflow-hidden border-y border-white/10">
      <div className="absolute inset-0 bg-brand-navy" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-teal/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-navy/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-teal/50" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 text-center md:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#b8f0d0]">Catalogue essentials</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">How we deliver excellence</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Formats, timing, languages, credentials, and scheduling—structured for clarity at every step.
          </p>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-brand-teal" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {rows.map((row, i) => {
            const Icon = ICON_BY_LABEL[row.label] ?? LayoutGrid;
            return <Card key={row.label} label={row.label} value={row.value} Icon={Icon} delay={i * 80} />;
          })}
        </div>
      </div>
    </section>
  );
}
