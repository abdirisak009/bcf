'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  Building2,
  ClipboardList,
  BookOpen,
  Handshake,
  Landmark,
  ArrowRight,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero';
import { KeyServiceAreasSection } from '@/components/key-service-areas-section';

const subServices = [
  {
    icon: Scale,
    title: 'Policy Development',
    description:
      'Comprehensive policy development for public institutions, NGOs, and private sector clients.',
  },
  {
    icon: Building2,
    title: 'National Policy Design',
    description:
      'Design of national policies, governance frameworks, and institutional strategies.',
  },
  {
    icon: ClipboardList,
    title: 'Decentralization Support',
    description:
      'Support for decentralization, public sector reform, and regulatory review.',
  },
  {
    icon: BookOpen,
    title: 'Capacity Building',
    description:
      'Capacity building in public policy, legislative drafting, and strategic planning.',
  },
  {
    icon: Handshake,
    title: 'Stakeholder Facilitation',
    description:
      'Facilitation of stakeholder consultations and participatory policy processes.',
  },
];

const keyAreaItems = [
  {
    icon: Building2,
    text: 'Policy development for public institutions, NGOs, and private sector clients.',
  },
  {
    icon: Landmark,
    text: 'Design of national policies, governance frameworks, and institutional strategies.',
  },
  {
    icon: ClipboardList,
    text: 'Support for decentralization, public sector reform, and regulatory review.',
  },
  {
    icon: BookOpen,
    text: 'Capacity building in public policy, legislative drafting, and strategic planning.',
  },
  {
    icon: Handshake,
    text: 'Facilitation of stakeholder consultations and participatory policy processes.',
  },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
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

export default function StrategicPolicyPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <Navigation />

      <PageHeroShell innerClassName="max-w-5xl">
        <h1 className={pageHeroTitleClass}>Strategic Policy &amp; Governance</h1>
        <p className={pageHeroSubtitleClass}>
          Comprehensive policy development and governance frameworks for sustainable institutional growth
        </p>
      </PageHeroShell>

      {/* SERVICES GRID */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-5 text-balance">
              Comprehensive Policy &amp; Governance Solutions
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed text-pretty">
              Our strategic policy and governance services provide organizations with the frameworks, strategies, and support needed to achieve sustainable institutional growth and effective governance.
            </p>
          </RevealSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {subServices.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <RevealSection key={i} delay={i * 80}>
                  <div className="group relative bg-white border-2 border-slate-100 hover:border-brand-teal/40 rounded-3xl p-8 h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
                    <div className="absolute left-0 right-0 top-0 h-1 origin-left scale-x-0 rounded-t-3xl bg-brand-teal transition-transform duration-500 group-hover:scale-x-100" />
                    <div className="bg-brand-navy/8 group-hover:bg-brand-teal/15 p-4 rounded-2xl w-fit mb-6 transition-colors duration-300">
                      <Icon size={26} className="text-brand-navy group-hover:text-brand-teal transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-3 group-hover:text-brand-teal transition-colors duration-300">{svc.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{svc.description}</p>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      <KeyServiceAreasSection items={keyAreaItems} columns={2} />

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <div className="relative overflow-hidden rounded-3xl bg-brand-navy p-12 text-center md:p-16">
              <div className="absolute -right-20 -mt-20 top-0 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20 blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-balance">
                  Ready to Transform Your Policy &amp; Governance?
                </h2>
                <p className="text-white/85 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Let&apos;s discuss how our strategic policy and governance services can help your organization achieve sustainable growth and effective governance.
                </p>
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
