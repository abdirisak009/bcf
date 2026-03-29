'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  Building2,
  CalendarDays,
  ArrowRight,
  ClipboardCheck,
  Search,
  BarChart3,
  Shield,
  GraduationCap,
  ScanSearch,
  Activity,
  Lock,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { KeyServiceAreasSection } from '@/components/key-service-areas-section';

const subServices = [
  {
    icon: Scale,
    title: 'Internal Audits & Compliance',
    description:
      'Comprehensive internal and compliance audit services, including thorough financial reviews to ensure organizational integrity and regulatory adherence.',
  },
  {
    icon: Building2,
    title: 'Forensic Audit Investigations',
    description:
      'Specialized forensic audit investigations and advanced fraud detection systems to identify and prevent fraudulent activities within organizations.',
  },
  {
    icon: CalendarDays,
    title: 'Enterprise Risk Assessments',
    description:
      'Comprehensive enterprise risk assessments and strategic mitigation planning to safeguard organizational assets and achieve business objectives.',
  },
  {
    icon: Scale,
    title: 'Risk Management Frameworks',
    description:
      'Expert development of comprehensive risk management frameworks and robust internal control systems to ensure organizational resilience and compliance.',
  },
  {
    icon: Building2,
    title: 'Audit Readiness Training',
    description:
      'Comprehensive training programs focused on audit readiness and compliance standards specifically designed for non-governmental organizations and small to medium enterprises.',
  },
  {
    icon: CalendarDays,
    title: 'Fraud Detection Systems',
    description:
      'Advanced fraud detection and prevention systems to protect organizational assets and maintain financial integrity.',
  },
  {
    icon: Scale,
    title: 'Compliance Monitoring',
    description:
      'Continuous compliance monitoring and reporting systems to ensure adherence to regulatory requirements and industry standards.',
  },
  {
    icon: Building2,
    title: 'Internal Controls Development',
    description:
      'Development and implementation of robust internal control systems to prevent fraud and ensure operational efficiency.',
  },
];

const keyAreaItems = [
  {
    icon: ClipboardCheck,
    text: 'Comprehensive internal and compliance audit services including thorough financial reviews to ensure organizational integrity and regulatory adherence.',
  },
  {
    icon: Search,
    text: 'Specialized forensic audit investigations and advanced fraud detection systems to identify and prevent fraudulent activities within organizations.',
  },
  {
    icon: BarChart3,
    text: 'Comprehensive enterprise risk assessments and strategic mitigation planning to safeguard organizational assets and achieve business objectives.',
  },
  {
    icon: Shield,
    text: 'Expert development of comprehensive risk management frameworks and robust internal control systems to ensure organizational resilience and compliance.',
  },
  {
    icon: GraduationCap,
    text: 'Comprehensive training programs focused on audit readiness and compliance standards specifically designed for non-governmental organizations and small to medium enterprises.',
  },
  {
    icon: ScanSearch,
    text: 'Advanced fraud detection and prevention systems to protect organizational assets and maintain financial integrity.',
  },
  {
    icon: Activity,
    text: 'Continuous compliance monitoring and reporting systems to ensure adherence to regulatory requirements and industry standards.',
  },
  {
    icon: Lock,
    text: 'Development and implementation of robust internal control systems to prevent fraud and ensure operational efficiency.',
  },
];

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

export default function AuditAssurancePage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <Navigation />

      {/* HERO */}
      <section
        className="relative overflow-hidden flex items-center justify-center"
        style={{ paddingTop: '104px', minHeight: '460px' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-brand-navy" />
        <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-brand-teal/15 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center pointer-events-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight text-balance pt-2">
            Audit Assurance &amp; Risk Management
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed text-pretty">
            Comprehensive audit and risk management solutions to help organizations maintain transparency, accountability,
            and security
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-5 text-balance">
              Comprehensive Audit &amp; Risk Management Solutions
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed text-pretty">
              Our audit assurance and risk management services provide organizations with the tools, strategies, and support
              needed to maintain transparency, accountability, and security across all operations.
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

      <KeyServiceAreasSection items={keyAreaItems} />

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <div className="relative overflow-hidden rounded-3xl bg-brand-navy p-12 text-center md:p-16">
              <div className="absolute -right-20 -mt-20 top-0 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20 blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-balance">
                  Ready to Strengthen Your Organization&apos;s Risk Management?
                </h2>
                <p className="text-white/85 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Let our audit and risk management experts help you establish robust controls and compliance frameworks
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
