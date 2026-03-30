'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Users, BookOpen, FileText, Target, BarChart2, Presentation,
  HeartHandshake, Building2,
  CheckCircle2, ArrowRight, ChevronRight, Phone, Mail,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell, pageHeroSubtitleClass, pageHeroEyebrowClass, pageHeroTitleClass } from '@/components/page-hero';

const subServices = [
  {
    icon: Users,
    title: 'End-to-End HR Management',
    description:
      'Delivered comprehensive HR management solutions for public and private institutions, enhancing operational efficiency and staff performance across diverse organizational settings.',
    highlights: ['HR systems design & implementation', 'Staff performance frameworks', 'Organizational efficiency audits'],
  },
  {
    icon: BookOpen,
    title: 'Leadership & Skills Development',
    description:
      'Ensure that organizations develop the leadership, technical skills, and institutional knowledge to sustain long-term success through comprehensive development programs.',
    highlights: ['Executive leadership programs', 'Technical skills training', 'Institutional knowledge transfer'],
  },
  {
    icon: FileText,
    title: 'HR Policies & Procedures',
    description:
      'Developed and implemented HR policies and procedures aligned with local labor laws and global best practices to ensure compliance and organizational effectiveness.',
    highlights: ['Labor law compliance', 'Policy manual development', 'Grievance & disciplinary frameworks'],
  },
  {
    icon: Target,
    title: 'Capacity Building Programs',
    description:
      'Designed and facilitated capacity building programs focused on leadership development, employee performance, and institutional effectiveness to drive organizational success.',
    highlights: ['Custom training curricula', 'Institutional capacity assessments', 'Post-training evaluation'],
  },
  {
    icon: BarChart2,
    title: 'Performance Appraisal Systems',
    description:
      'Supported government agencies and private firms in establishing performance appraisal systems to drive accountability and results through structured evaluation frameworks.',
    highlights: ['KPI design & tracking', 'Evaluation frameworks', '360-degree feedback systems'],
  },
  {
    icon: Presentation,
    title: 'Training Workshops',
    description:
      'Delivered targeted training workshops on soft skills, compliance, workplace ethics, and change management to enhance employee capabilities and organizational culture.',
    highlights: ['Soft skills workshops', 'Change management training', 'Workplace ethics programs'],
  },
  {
    icon: HeartHandshake,
    title: 'HR Capacity Building',
    description:
      'Partnered with donors and development partners to build HR capacity in fragile and post-conflict settings across Somalia and East Africa, supporting organizational resilience.',
    highlights: ['Fragile context HR support', 'Donor-funded HR programs', 'Organizational resilience'],
  },
  {
    icon: Building2,
    title: 'Organizational Development',
    description:
      'Comprehensive organizational development strategies to enhance institutional effectiveness and create sustainable human capital management systems.',
    highlights: ['Org structure redesign', 'Change management', 'Institutional effectiveness reviews'],
  },
];

const keyAreas = [
  'Comprehensive HR management solutions for public and private institutions',
  'Leadership, technical skills, and institutional knowledge development programs',
  'HR policies and procedures aligned with local labor laws and global best practices',
  'Capacity building programs focused on leadership development and institutional effectiveness',
  'Performance appraisal systems for government agencies and private firms',
  'Targeted training workshops on soft skills, compliance, and workplace ethics',
  'HR capacity building in fragile and post-conflict settings across Somalia and East Africa',
  'Organizational development strategies for sustainable human capital management',
];

const stats = [
  { value: '80+', label: 'HR Systems Delivered' },
  { value: '5,000+', label: 'Professionals Trained' },
  { value: '40+', label: 'Institutions Supported' },
  { value: '10+', label: 'Years of Experience' },
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

export default function HumanCapitalPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <Navigation />

      <PageHeroShell innerClassName="max-w-5xl">
        <div className="mb-2 flex justify-center sm:mb-3">
          <span className={`${pageHeroEyebrowClass} gap-2`}>
            <Users size={13} className="shrink-0" aria-hidden />
            SERVICES
          </span>
        </div>
        <h1 className={pageHeroTitleClass}>
          Institution &amp; Human <span className="text-brand-teal">Capital Development</span>
        </h1>
        <p className={pageHeroSubtitleClass}>
          Comprehensive HR management solutions and capacity building programs to enhance organizational effectiveness and staff performance.
        </p>
      </PageHeroShell>

      {/* STATS BAR */}
      <section className="bg-brand-navy py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <RevealSection key={i} delay={i * 100}>
                <p className="text-4xl font-bold text-brand-teal">{s.value}</p>
                <p className="text-white/70 text-sm font-medium mt-1 tracking-wide">{s.label}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <div className="inline-block bg-brand-teal/10 text-brand-teal px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-5 border border-brand-teal/25">
              WHAT WE OFFER
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-5 text-balance">
              Comprehensive Human Capital Development Solutions
            </h2>
            <div className="mx-auto mb-6 h-1.5 w-20 rounded-full bg-brand-teal" />
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed text-pretty">
              Our human capital development services provide organizations with the tools, strategies, and support needed to build robust HR systems, develop leadership capabilities, and enhance organizational performance across all sectors.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subServices.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <RevealSection key={i} delay={i * 60}>
                  <div className="group relative bg-white border-2 border-slate-100 hover:border-brand-teal/40 rounded-3xl p-7 h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
                    <div className="absolute left-0 right-0 top-0 h-1 origin-left scale-x-0 rounded-t-3xl bg-brand-teal transition-transform duration-500 group-hover:scale-x-100" />
                    <div className="bg-brand-navy/8 group-hover:bg-brand-teal/15 p-3.5 rounded-2xl w-fit mb-5 transition-colors duration-300">
                      <Icon size={24} className="text-brand-navy group-hover:text-brand-teal transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-brand-navy mb-3 group-hover:text-brand-teal transition-colors duration-300">{svc.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{svc.description}</p>
                    <ul className="space-y-1.5">
                      {svc.highlights.map((h, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-slate-500">
                          <CheckCircle2 size={13} className="text-brand-teal mt-0.5 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* KEY SERVICE AREAS */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <div className="inline-block bg-brand-navy/10 text-brand-navy px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-6 border border-brand-navy/20">
                KEY SERVICE AREAS
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-6 text-balance leading-tight">
                Where We Build <span className="text-brand-teal">Capacity</span>
              </h2>
              <div className="mb-8 h-1.5 w-16 rounded-full bg-brand-teal" />
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                From executive leadership programs to grassroots HR systems in post-conflict environments, our expertise covers every dimension of human capital and institutional development.
              </p>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 bg-brand-navy hover:bg-brand-teal text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-teal/25"
              >
                Discuss Your Project
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </RevealSection>
            <RevealSection delay={150}>
              <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-lg">
                <div className="h-1.5 bg-brand-teal" />
                <div className="p-7">
                  <ul className="space-y-2">
                    {keyAreas.map((area, i) => (
                      <li key={i} className="group flex items-start gap-4 p-3.5 rounded-2xl hover:bg-brand-teal/5 transition-colors duration-200 cursor-default border border-transparent hover:border-brand-teal/20">
                        <div className="bg-brand-teal/10 group-hover:bg-brand-teal/20 p-2 rounded-xl shrink-0 transition-colors duration-200">
                          <ChevronRight size={15} className="text-brand-teal" />
                        </div>
                        <span className="text-slate-700 text-sm leading-relaxed font-medium">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <div className="relative overflow-hidden rounded-3xl bg-brand-navy p-12 text-center md:p-16">
              <div className="absolute -right-20 -mt-20 top-0 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20 blur-3xl" />
              <div className="relative z-10">
                <div className="inline-block bg-brand-teal/20 border border-brand-teal/40 text-brand-teal px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-6">
                  GET STARTED
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-balance">
                  Ready to Transform Your Organization&apos;s Human Capital?
                </h2>
                <p className="text-white/75 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Let our HR development experts help you build robust human capital management systems and enhance organizational performance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="tel:+252613685943" className="group inline-flex items-center gap-3 bg-brand-teal text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:bg-brand-teal-hover hover:shadow-2xl hover:shadow-brand-teal/30">
                    <Phone size={18} /> Contact Us Today
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="mailto:info@bcf.so" className="group inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105">
                    <Mail size={18} /> Send an Email
                  </a>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      <Footer />
    </main>
  );
}
