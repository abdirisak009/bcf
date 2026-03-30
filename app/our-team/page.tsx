'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell } from '@/components/page-hero';
import { Mail, Award, Globe, ChevronRight, Star, Users, Briefcase, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  /** Optional classes for portrait `Image` (face framing / zoom), e.g. Ayan close-up */
  photoImageClassName?: string;
  /** Optional taller portrait strip (e.g. CEO headshot) */
  photoPortraitClassName?: string;
  /** If primary `photo` 404s, try these in order (e.g. `/images/if.jpeg` vs `/if.jpeg`) */
  photoSrcFallbacks?: string[];
};

const teamMembers: TeamMember[] = [
  {
    name: 'Mss. Ayan Ali Aden',
    role: 'CEO',
    gender: 'female',
    surface: 'bg-brand-navy',
    tagline: '14 Years of Visionary Leadership',
    bio: 'CEO with 14 years in public financial management, procurement, and institutional reform — partnering with World Bank, AfDB, UNDP, and UN-Habitat.',
    expertise: ['Public Financial Management', 'Fiscal Governance', 'Institutional Capacity Building', 'Public Procurement'],
    stats: [{ label: 'Years Exp.', value: '14+' }, { label: 'Organizations', value: '10+' }, { label: 'Countries', value: '5+' }],
    photo: '/ayan.jpeg',
    photoPortraitClassName: 'h-[270px] sm:h-[295px]',
    photoImageClassName:
      'object-cover object-[40%_38%] scale-[1.28] origin-[48%_42%] transition-transform duration-500 ease-out group-hover:scale-[1.34]',
  },
  {
    name: 'Dr. Abdinur Ahmed',
    role: 'Chairman',
    gender: 'male',
    surface: 'bg-brand-teal',
    tagline: 'Economic Theory & Climate Expert',
    bio: 'Former Dean at SIMAD University; research on climate economics, financial inclusion, and policy across East Africa.',
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
    bio: 'COO focused on public-sector consulting, audit, strategic policy, and transformation across the Horn of Africa.',
    expertise: ['Public Sector Consulting', 'Audit & Assurance', 'Strategic Policy', 'Organizational Transformation'],
    stats: [{ label: 'Years Exp.', value: '10+' }, { label: 'Projects Led', value: '50+' }, { label: 'Sectors', value: '8+' }],
    photo: '/images/if.jpeg',
    photoSrcFallbacks: ['/if.jpeg', '/ifrah.jpeg', '/ifrah.png'],
    photoPortraitClassName: 'h-[250px] sm:h-[275px]',
    photoImageClassName:
      '!object-cover object-[50%_30%] -translate-y-2.5 sm:-translate-y-3 transition-transform duration-500 ease-out group-hover:scale-[1.02]',
  },
];

function TeamPortraitImage({
  member,
  className,
  priority,
}: {
  member: TeamMember
  className: string
  priority: boolean
}) {
  const chain = useMemo(
    () => [member.photo!, ...(member.photoSrcFallbacks ?? [])].filter((u) => Boolean(u?.trim())),
    [member.photo, member.photoSrcFallbacks],
  )
  const [idx, setIdx] = useState(0)
  const safeIdx = Math.min(idx, Math.max(0, chain.length - 1))
  const src = chain[safeIdx] ?? member.photo!

  useEffect(() => {
    setIdx(0)
  }, [member.photo, member.photoSrcFallbacks])

  const onError = useCallback(() => {
    setIdx((i) => (i < chain.length - 1 ? i + 1 : i))
  }, [chain.length])

  return (
    <Image
      src={src}
      alt={member.name}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px"
      className={className}
      priority={priority}
      onError={onError}
    />
  )
}

function TeamCard({ member, idx }: { member: TeamMember; idx: number }) {
  const { ref, visible } = useScrollReveal();
  const Avatar = member.gender === 'female' ? FemaleAvatar : MaleAvatar;
  const tagPreview = member.expertise.slice(0, 2);
  const tagExtra = member.expertise.length - tagPreview.length;
  const hasPhoto = Boolean(member.photo?.trim());

  return (
    <div
      ref={ref}
      className="group relative cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${idx * 0.08}s, transform 0.5s ease ${idx * 0.08}s`,
      }}
    >
      <div
        className={`absolute -inset-[1px] ${member.surface} rounded-2xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-[0.14]`}
      />

      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_32px_-16px_rgba(23,94,126,0.12)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-slate-300/90 group-hover:shadow-[0_20px_50px_-24px_rgba(23,94,126,0.18)]">
        {/* Portrait — clear photo, no dark color wash */}
        <div
          className={cn(
            'relative h-[200px] w-full shrink-0 overflow-hidden bg-slate-100 sm:h-[220px]',
            member.photoPortraitClassName,
          )}
        >
          {hasPhoto ? (
            <TeamPortraitImage
              member={member}
              priority={idx < 2}
              className={cn(
                'object-cover object-[center_20%] transition-transform duration-500 ease-out group-hover:scale-[1.02]',
                member.photoImageClassName,
              )}
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center ${member.surface} bg-gradient-to-br from-white/10 to-black/20`}
            >
              <div className="rounded-full border-[3px] border-white/25 bg-white/10 p-0.5 shadow-lg ring-2 ring-white/10">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/10 sm:h-32 sm:w-32">
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Identity — on white, readable (professional) */}
        <div className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/80 px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-teal sm:text-[11px]">{member.tagline}</p>
          <h3 className="mt-1.5 text-balance text-lg font-bold leading-snug tracking-tight text-brand-navy sm:text-xl">
            {member.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{member.role}</p>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
          <div className="grid grid-cols-3 gap-0.5 rounded-xl bg-white px-1.5 py-2.5 ring-1 ring-slate-200/80">
            {member.stats.map((stat, sIdx) => (
              <div key={sIdx} className="min-w-0 border-r border-slate-200/70 text-center last:border-r-0">
                <p className="text-sm font-black tabular-nums leading-none text-brand-navy sm:text-base">{stat.value}</p>
                <p className="mt-0.5 text-[8px] font-semibold uppercase leading-tight tracking-wide text-slate-500 sm:text-[9px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="line-clamp-2 text-xs leading-snug text-slate-600 sm:text-[13px]">{member.bio}</p>

          <div className="flex flex-wrap gap-1">
            {tagPreview.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="rounded-md border border-brand-navy/10 bg-brand-mint/35 px-1.5 py-0.5 text-[9px] font-semibold text-brand-navy sm:text-[10px]"
              >
                {tag}
              </span>
            ))}
            {tagExtra > 0 && (
              <span className="self-center rounded border border-dashed border-slate-300/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                +{tagExtra}
              </span>
            )}
          </div>

          <div className="mt-auto flex gap-1.5 border-t border-slate-100 pt-2.5">
            <button
              type="button"
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg ${member.surface} py-2 text-[11px] font-bold text-white shadow-sm transition hover:brightness-110 sm:gap-2 sm:text-xs`}
            >
              <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              Contact
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:border-brand-teal hover:text-brand-teal sm:text-xs"
            >
              <Linkedin className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              LinkedIn
            </button>
          </div>
        </div>

        <div className={`h-0.5 w-full ${member.surface} opacity-80`} />
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
      <section className="relative overflow-hidden bg-brand-mint/25 py-16 px-4 md:py-20 md:px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-teal/4 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-navy/4 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-block bg-brand-navy/10 text-brand-navy px-5 py-1.5 rounded-full text-xs font-bold mb-4 border border-brand-navy/20 tracking-widest md:text-sm">
              THE PEOPLE BEHIND BARAARUG
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">Our Leadership Team</h2>
            <div className="mx-auto h-1 w-16 rounded-full bg-brand-teal"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 xl:items-stretch xl:gap-8">
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
