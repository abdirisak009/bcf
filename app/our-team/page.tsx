'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell } from '@/components/page-hero';
import { Mail, Award, Globe, ChevronRight, Star, Users, Briefcase, Linkedin } from 'lucide-react';

// Male avatar SVG icon
function MaleAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="40" cy="28" r="18" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" />
      <circle cx="40" cy="28" r="10" fill="rgba(255,255,255,0.5)" />
      <path d="M10 72c0-16.569 13.431-30 30-30s30 13.431 30 30" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Female avatar SVG icon
function FemaleAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="40" cy="26" r="16" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" />
      <circle cx="40" cy="26" r="9" fill="rgba(255,255,255,0.5)" />
      {/* Hijab / head covering arc */}
      <path d="M18 26 Q18 8 40 8 Q62 8 62 26" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <path d="M14 50c2-10 12-16 26-16s24 6 26 16v20H14V50z" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
    </svg>
  );
}

// Scroll animation hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

type TeamMember = {
  name: string;
  role: string;
  gender: 'female' | 'male';
  surface: string;
  tagline: string;
  bio: string;
  expertise: string[];
  stats: { label: string; value: string }[];
  /** Public path under `/public` e.g. `/abdinor.png` */
  photo?: string;
  /** Extra ring accent (e.g. gold for chairman portrait) */
  photoAccent?: boolean;
};

const teamMembers: TeamMember[] = [
  {
    name: 'Mss. Ayan Ali Aden',
    role: 'CEO',
    gender: 'female',
    surface: 'bg-brand-navy',
    tagline: '14 Years of Visionary Leadership',
    bio: 'Ayan Ali Aden is the CEO of Baraarug Consulting Firm with 14 years of experience in public financial management, fiscal governance, and institutional capacity building, including eight years in public procurement management. She has worked with the World Bank, AfDB, UNDP, and UN-Habitat.',
    expertise: ['Public Financial Management', 'Fiscal Governance', 'Institutional Capacity Building', 'Public Procurement'],
    stats: [{ label: 'Years Exp.', value: '14+' }, { label: 'Organizations', value: '10+' }, { label: 'Countries', value: '5+' }],
    photo: '/Ayan.png',
  },
  {
    name: 'Dr. Abdinur Ahmed',
    role: 'Chairman',
    gender: 'male',
    surface: 'bg-brand-teal',
    tagline: 'Economic Theory & Climate Expert',
    bio: 'Dr. Abdinur specializes in economic theory, financial inclusion, and climate change. He has served as Dean of Graduate Studies and Dean of the Faculty of Economics at SIMAD University, and has led research on the economic impacts of climate change across East Africa.',
    expertise: ['Economic Theory', 'Financial Inclusion', 'Climate Economics', 'Policy Development'],
    stats: [{ label: 'Research Papers', value: '20+' }, { label: 'Yrs. Academic', value: '12+' }, { label: 'Policy Reports', value: '30+' }],
    photo: '/abdinor.jpg',
    photoAccent: true,
  },
  {
    name: 'Mss. Ifrah Abdirahman',
    role: 'Chief Operating Officer (COO)',
    gender: 'female',
    surface: 'bg-brand-navy-mid',
    tagline: '10+ Years Driving Strategic Excellence',
    bio: 'Ifrah Abdirahman brings over 10 years of experience in public sector consulting, audit, strategic policy development, and organizational transformation. She has expertise in financial oversight, risk management, and capacity building across the Horn of Africa.',
    expertise: ['Public Sector Consulting', 'Audit & Assurance', 'Strategic Policy', 'Organizational Transformation'],
    stats: [{ label: 'Years Exp.', value: '10+' }, { label: 'Projects Led', value: '50+' }, { label: 'Sectors', value: '8+' }],
  },
];

function TeamCard({ member, idx }: { member: TeamMember; idx: number }) {
  const { ref, visible } = useScrollReveal();
  const Avatar = member.gender === 'female' ? FemaleAvatar : MaleAvatar;
  const tagPreview = member.expertise.slice(0, 3);
  const tagExtra = member.expertise.length - tagPreview.length;
  const hasPhoto = Boolean(member.photo?.trim());

  return (
    <div
      ref={ref}
      className="group relative cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${idx * 0.1}s, transform 0.6s ease ${idx * 0.1}s`,
      }}
    >
      <div
        className={`absolute -inset-[1px] ${member.surface} rounded-[1.75rem] opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-[0.18]`}
      />

      <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_4px_6px_-1px_rgba(15,23,42,0.06),0_24px_48px_-20px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.04] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-brand-teal/25 group-hover:shadow-[0_32px_64px_-24px_rgba(23,94,126,0.22)]">
        {/* Portrait — full width, clearly visible */}
        <div className="relative aspect-[3/4] w-full min-h-[220px] max-h-[340px] sm:max-h-[360px] overflow-hidden bg-slate-200">
          {hasPhoto ? (
            <>
              <Image
                src={member.photo!}
                alt={member.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 380px"
                className="object-cover object-[center_15%] transition-transform duration-[1.1s] ease-out group-hover:scale-[1.04]"
                priority={idx < 2}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/20 to-transparent"
                aria-hidden
              />
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t ${member.photoAccent ? 'from-amber-950/40' : 'from-black/0'} to-transparent opacity-60`}
                aria-hidden
              />
            </>
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center ${member.surface} bg-gradient-to-br from-white/10 to-black/20`}
            >
              <div className="rounded-full border-4 border-white/25 bg-white/10 p-1 shadow-2xl ring-4 ring-white/10">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/10 sm:h-40 sm:w-40">
                  <Avatar className="h-28 w-28 sm:h-32 sm:w-32" />
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-[1] px-4 pb-4 pt-12 text-left sm:px-5 sm:pb-5">
            <p className="mb-1 inline-block rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/95 backdrop-blur-sm sm:text-[10px]">
              {member.tagline}
            </p>
            <h3 className="text-balance text-lg font-bold leading-tight tracking-tight text-white drop-shadow-md sm:text-xl">
              {member.name}
            </h3>
            <p className="mt-0.5 text-sm font-medium text-brand-teal drop-shadow">{member.role}</p>
          </div>

          <span className="absolute right-3 top-3 z-[1] h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-green shadow-md ring-2 ring-brand-navy/30" aria-hidden />
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 pb-5 pt-4 sm:px-5 sm:pt-5">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-gradient-to-b from-slate-50 to-white px-2 py-2.5 ring-1 ring-slate-200/80">
            {member.stats.map((stat, sIdx) => (
              <div key={sIdx} className="min-w-0 border-r border-slate-200/80 text-center last:border-r-0">
                <p className="text-base font-black tabular-nums leading-none text-brand-navy sm:text-lg">{stat.value}</p>
                <p className="mt-1 text-[9px] font-medium uppercase leading-tight tracking-wide text-slate-500 sm:text-[10px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="line-clamp-3 text-[13px] leading-relaxed text-slate-600 sm:line-clamp-4 sm:text-sm">{member.bio}</p>

          <div className="flex flex-wrap gap-1.5">
            {tagPreview.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="rounded-md border border-brand-navy/10 bg-brand-mint/40 px-2 py-1 text-[10px] font-semibold text-brand-navy transition-colors group-hover:border-brand-teal/30 group-hover:bg-brand-mint/70 sm:text-[11px]"
              >
                {tag}
              </span>
            ))}
            {tagExtra > 0 && (
              <span className="self-center rounded-md border border-dashed border-slate-300 px-2 py-1 text-[10px] font-medium text-slate-500">
                +{tagExtra}
              </span>
            )}
          </div>

          <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl ${member.surface} py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-110 sm:text-sm`}
            >
              <Mail className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              Contact
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-teal hover:text-brand-teal sm:text-sm"
            >
              <Linkedin className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              LinkedIn
            </button>
          </div>
        </div>

        <div className={`h-1 w-full ${member.surface} opacity-90`} />
      </article>
    </div>
  );
}

export default function OurTeamPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <PageHeroShell>
        <div
          ref={heroRef}
          className="flex w-full flex-col"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.65s ease, transform 0.65s ease',
          }}
        >
          <div className="inline-flex items-center gap-1.5 self-center rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-brand-teal backdrop-blur-sm sm:gap-2 sm:px-5 sm:py-2 sm:text-xs">
            <Star size={11} fill="currentColor" className="shrink-0 sm:h-3.5 sm:w-3.5" />
            OUR LEADERSHIP
            <Star size={11} fill="currentColor" className="shrink-0 sm:h-3.5 sm:w-3.5" />
          </div>

          <h1 className="mx-auto mt-3 max-w-4xl text-balance text-3xl font-bold leading-[1.12] tracking-tight text-white sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
            Meet Our{' '}
            <span className="relative inline-block">
              <span className="text-brand-green">Expert Team</span>
              <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-brand-teal shadow-[0_0_16px_rgba(85,197,147,0.4)]" />
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-snug text-white/75 sm:mt-4 sm:text-base md:max-w-3xl md:text-lg">
            Our diverse team of experts brings together decades of experience and specialized knowledge to deliver exceptional results across Somalia and beyond.
          </p>

          <div className="mx-auto mt-6 grid w-full max-w-5xl grid-cols-2 gap-2.5 sm:mt-7 sm:grid-cols-2 sm:gap-3 md:grid-cols-4 lg:gap-3.5">
            {[
              { icon: Users, value: '30+', label: 'Staff Members' },
              { icon: Briefcase, value: '200+', label: 'Projects Delivered' },
              { icon: Globe, value: '3+', label: 'Countries' },
              { icon: Award, value: '500+', label: 'Consultants' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-b from-white/[0.09] to-white/[0.02] px-3 py-3 text-left shadow-[0_2px_20px_-8px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:border-brand-teal/35 hover:from-white/[0.12] hover:shadow-[0_12px_40px_-12px_rgba(45,212,191,0.15)] sm:rounded-2xl sm:px-3.5 sm:py-3.5"
                  style={{
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(10px)',
                    transition: `opacity 0.55s ease ${0.1 + idx * 0.06}s, transform 0.55s ease ${0.1 + idx * 0.06}s`,
                  }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-teal/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal/35 via-brand-teal/15 to-brand-teal/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] ring-1 ring-white/15 sm:h-10 sm:w-10">
                      <Icon className="h-[18px] w-[18px] text-white sm:h-5 sm:w-5" strokeWidth={1.85} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold tabular-nums leading-none tracking-tight text-white sm:text-xl">{stat.value}</p>
                      <p className="mt-1 text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-white/45 sm:text-[10px] sm:tracking-[0.14em]">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col items-center gap-1.5 text-white/40 sm:mt-7">
            <span className="text-[9px] font-semibold tracking-[0.22em] sm:text-[10px]">SCROLL TO MEET THE TEAM</span>
            <div className="h-5 w-px bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </div>
      </PageHeroShell>

      {/* Team Cards Section */}
      <section className="relative overflow-hidden bg-brand-mint/25 py-28 px-4 md:px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-teal/4 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-navy/4 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-brand-navy/10 text-brand-navy px-6 py-2 rounded-full text-sm font-bold mb-5 border border-brand-navy/20 tracking-widest">
              THE PEOPLE BEHIND BARAARUG
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">Our Leadership Team</h2>
            <div className="mx-auto h-1.5 w-20 rounded-full bg-brand-teal"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 xl:grid-cols-3 xl:items-stretch xl:gap-10">
            {teamMembers.map((member, idx) => (
              <TeamCard key={member.name} member={member} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="relative overflow-hidden bg-brand-navy py-24 px-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 border border-white/20 text-white px-6 py-2 rounded-full text-sm font-bold tracking-widest mb-8">
            JOIN OUR TEAM
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">Work With the Best</h2>
          <p className="text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
            We are always looking for talented professionals to join our growing team. Explore career opportunities at Baraarug Consulting Firm.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-brand-teal hover:bg-brand-teal-deep text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              View Open Positions
              <ChevronRight size={20} />
            </button>
            <button className="bg-white/10 border border-white/25 backdrop-blur-sm text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
              <Mail size={20} />
              Send Your CV
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
