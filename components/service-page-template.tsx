'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { KeyServiceAreasSection, type KeyServiceAreaItem } from '@/components/key-service-areas-section';

export type ServiceCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type ServicePageTemplateProps = {
  heroTitle: string;
  heroSubtitle: string;
  /** Small label above the hero title (e.g. sector tag) */
  heroEyebrow?: string;
  /** Immersive hero: taller, stronger depth */
  heroVariant?: 'default' | 'immersive';
  introTitle: string;
  introBody: string;
  subServices: ServiceCard[];
  keyAreaItems: KeyServiceAreaItem[];
  keyAreaColumns?: 2 | 3;
  /** 2 = balanced 2×2 grid for 4 cards; 3 = default 3-column grid */
  serviceGridColumns?: 2 | 3;
  ctaTitle: string;
  ctaBody: string;
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
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({
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
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function ServicePageTemplate({
  heroTitle,
  heroSubtitle,
  heroEyebrow,
  heroVariant = 'default',
  introTitle,
  introBody,
  subServices,
  keyAreaItems,
  keyAreaColumns = 3,
  serviceGridColumns = 3,
  ctaTitle,
  ctaBody,
}: ServicePageTemplateProps) {
  const immersive = heroVariant === 'immersive';

  return (
    <main className="min-h-screen bg-white font-sans antialiased">
      <Navigation />

      <section
        className={`relative overflow-hidden flex items-center justify-center ${immersive ? 'min-h-[min(560px,82vh)]' : ''}`}
        style={{ paddingTop: '104px', minHeight: immersive ? undefined : '460px' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-brand-navy" />
        {immersive ? (
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,720px)] w-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal/10 blur-[100px]" />
        ) : null}
        <div className="pointer-events-none absolute -right-48 -mt-48 top-0 h-[500px] w-[500px] rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-24 text-center pointer-events-auto">
          {heroEyebrow ? (
            <div className="mb-6 flex flex-col items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#b8f0d0] backdrop-blur-sm">
                {heroEyebrow}
              </span>
              <div className="h-px w-12 bg-brand-teal" />
            </div>
          ) : null}
          <h1
            className={`font-bold text-white mb-6 leading-tight text-balance tracking-tight drop-shadow-sm ${
              immersive
                ? 'text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-7xl'
                : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl pt-2'
            }`}
          >
            {heroTitle}
          </h1>
          <p
            className={`text-white/90 max-w-3xl mx-auto leading-relaxed text-pretty ${
              immersive ? 'text-lg md:text-xl lg:text-[1.35rem] font-light' : 'text-lg md:text-xl'
            }`}
          >
            {heroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mb-5 text-balance tracking-tight">
              {introTitle}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed text-pretty">{introBody}</p>
          </RevealSection>
          <div
            className={
              serviceGridColumns === 2
                ? 'grid sm:grid-cols-2 gap-7 max-w-5xl mx-auto'
                : 'grid md:grid-cols-2 lg:grid-cols-3 gap-7'
            }
          >
            {subServices.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <RevealSection key={i} delay={i * 80}>
                  <div className="group relative bg-white border-2 border-slate-100 hover:border-brand-teal/40 rounded-3xl p-8 h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
                    <div className="absolute left-0 right-0 top-0 h-1 origin-left scale-x-0 rounded-t-3xl bg-brand-teal transition-transform duration-500 group-hover:scale-x-100" />
                    <div className="bg-brand-navy/8 group-hover:bg-brand-teal/15 p-4 rounded-2xl w-fit mb-6 transition-colors duration-300">
                      <Icon
                        size={26}
                        className="text-brand-navy group-hover:text-brand-teal transition-colors duration-300"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-3 group-hover:text-brand-teal transition-colors duration-300">
                      {svc.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{svc.description}</p>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      <KeyServiceAreasSection items={keyAreaItems} columns={keyAreaColumns} />

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <div className="relative overflow-hidden rounded-3xl bg-brand-navy p-12 text-center md:p-16">
              <div className="absolute -right-20 -mt-20 top-0 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20 blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 text-balance">{ctaTitle}</h2>
                <p className="text-white/85 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">{ctaBody}</p>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 bg-white text-brand-navy hover:bg-white/95 px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-lg"
                >
                  Contact Us Today
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      <Footer />
    </main>
  );
}
