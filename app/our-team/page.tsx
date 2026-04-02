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

type TeamCardThemeKey = 'ceo' | 'chairman' | 'coo';

/** Visual identity per card — kala duwanaansho leh, oo dhammaan midabada ka yimaada brand tokens */
const TEAM_CARD_THEME: Record<
  TeamCardThemeKey,
  {
    glow: string;
    articleBorder: string;
    hoverShadow: string;
    portraitBg: string;
    halo: string;
    tagline: string;
    name: string;
    underline: string;
    role: string;
    stats: string;
    statValue: string;
    statLabel: string;
    tags: string;
    linkedin: string;
    footerBar: string;
  }
> = {
  ceo: {
    glow: 'bg-brand-navy',
    articleBorder: 'border-brand-navy/25 group-hover:border-brand-navy/45',
    hoverShadow: 'group-hover:shadow-[0_24px_52px_-26px_rgba(23,94,126,0.26)]',
    portraitBg: 'bg-gradient-to-b from-brand-mint/35 via-white to-white',
    halo: 'from-brand-navy/25 via-brand-teal/30 to-transparent',
    tagline: 'text-brand-teal',
    name: 'text-brand-navy drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]',
    underline: 'from-brand-teal to-brand-navy',
    role: 'text-brand-navy/80',
    stats: 'bg-gradient-to-br from-white to-brand-mint/45 ring-1 ring-brand-teal/25',
    statValue: 'text-brand-navy',
    statLabel: 'text-brand-navy/55',
    tags: 'border-brand-teal/35 bg-brand-mint/50 text-brand-navy',
    linkedin:
      'border-brand-navy/15 hover:border-brand-teal/45 hover:bg-brand-mint/40 hover:text-brand-navy',
    footerBar: 'bg-gradient-to-r from-brand-navy via-brand-teal to-brand-navy',
  },
  chairman: {
    glow: 'bg-brand-teal',
    articleBorder: 'border-brand-teal/35 group-hover:border-brand-teal/60',
    hoverShadow: 'group-hover:shadow-[0_24px_52px_-26px_rgba(85,197,147,0.32)]',
    portraitBg: 'bg-gradient-to-b from-brand-mint/40 via-white to-white',
    halo: 'from-brand-teal/45 via-brand-green/35 to-transparent',
    tagline: 'text-brand-teal',
    name: 'bg-gradient-to-br from-brand-navy via-brand-navy to-brand-teal bg-clip-text text-transparent [text-shadow:none]',
    underline: 'from-brand-green to-brand-teal',
    role: 'text-brand-navy/82',
    stats: 'bg-gradient-to-br from-brand-mint/50 to-white ring-1 ring-brand-green/30',
    statValue: 'text-brand-navy',
    statLabel: 'text-brand-navy/58',
    tags: 'border-brand-teal/40 bg-brand-mint/55 text-brand-navy',
    linkedin: 'border-brand-teal/35 hover:border-brand-teal/70 hover:bg-brand-mint/50 hover:text-brand-navy',
    footerBar: 'bg-gradient-to-r from-brand-teal via-brand-green to-brand-teal',
  },
  coo: {
    glow: 'bg-brand-navy-mid',
    articleBorder: 'border-brand-navy/28 group-hover:border-brand-teal/45',
    hoverShadow: 'group-hover:shadow-[0_24px_52px_-26px_rgba(23,94,126,0.22)]',
    portraitBg: 'bg-gradient-to-b from-brand-mint/30 via-white to-white',
    halo: 'from-brand-navy-mid/40 via-brand-teal/25 to-transparent',
    tagline: 'text-brand-navy',
    name: 'bg-gradient-to-br from-brand-navy via-brand-navy-mid to-brand-navy bg-clip-text text-transparent [text-shadow:none]',
    underline: 'from-brand-teal to-brand-navy-mid',
    role: 'text-brand-navy/85',
    stats: 'bg-gradient-to-br from-white to-brand-mint/40 ring-1 ring-brand-navy/18',
    statValue: 'text-brand-navy',
    statLabel: 'text-brand-navy/55',
    tags: 'border-brand-navy/22 bg-brand-mint/45 text-brand-navy',
    linkedin: 'border-brand-navy/20 hover:border-brand-teal/50 hover:bg-brand-mint/40 hover:text-brand-navy',
    footerBar: 'bg-gradient-to-r from-brand-navy-mid via-brand-teal to-brand-navy',
  },
};

type TeamMember = {
  name: string;
  role: string;
  gender: 'female' | 'male';
  surface: string;
  cardTheme: TeamCardThemeKey;
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
  /** Optional size override for circular portrait, e.g. `h-40 w-40 sm:h-44 sm:w-44` */
  photoPortraitClassName?: string;
  /** If primary `photo` 404s, try these in order (e.g. `/images/if.jpeg` vs `/if.jpeg`) */
  photoSrcFallbacks?: string[];
};

const teamMembers: TeamMember[] = [
  {
    name: 'Mss. Ayan Ali Aden',
    role: 'CEO',
    gender: 'female',
    cardTheme: 'ceo',
    surface: 'bg-brand-navy',
    tagline: '14 Years of Visionary Leadership',
    bio: 'CEO with 14 years in public financial management, procurement, and institutional reform — partnering with World Bank, AfDB, UNDP, and UN-Habitat.',
    expertise: ['Public Financial Management', 'Fiscal Governance', 'Institutional Capacity Building', 'Public Procurement'],
    stats: [{ label: 'Years Exp.', value: '14+' }, { label: 'Organizations', value: '10+' }, { label: 'Countries', value: '5+' }],
    /** Primary portrait: `public/ayan.jpg` (fallback: `public/ayan.jpeg`) */
    photo: '/ayan.jpg',
    photoSrcFallbacks: ['/ayan.jpeg'],
    photoPortraitClassName: 'h-36 w-36 sm:h-40 sm:w-40',
    photoImageClassName:
      'object-cover object-[40%_42%] transition-transform duration-500 ease-out group-hover:scale-105',
  },
  {
    name: 'Dr. Abdinur Ahmed',
    role: 'Chairman',
    gender: 'male',
    cardTheme: 'chairman',
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
    cardTheme: 'coo',
    surface: 'bg-brand-navy-mid',
    tagline: '10+ Years Driving Strategic Excellence',
    bio: 'COO focused on public-sector consulting, audit, strategic policy, and transformation across the Horn of Africa.',
    expertise: ['Public Sector Consulting', 'Audit & Assurance', 'Strategic Policy', 'Organizational Transformation'],
    stats: [{ label: 'Years Exp.', value: '10+' }, { label: 'Projects Led', value: '50+' }, { label: 'Sectors', value: '8+' }],
    photo: '/ifrah.png',
    photoSrcFallbacks: ['/images/if.jpeg', '/if.jpeg', '/ifrah.jpeg'],
    photoPortraitClassName: 'h-32 w-32 sm:h-36 sm:w-36',
    photoImageClassName:
      'object-cover object-[50%_35%] transition-transform duration-500 ease-out group-hover:scale-105',
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
      sizes="(max-width: 640px) 40vw, 180px"
      className={className}
      priority={priority}
      onError={onError}
    />
  )
}

function TeamCard({ member, idx }: { member: TeamMember; idx: number }) {
  const { ref, visible } = useScrollReveal();
  const t = TEAM_CARD_THEME[member.cardTheme];
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
        className={cn('absolute -inset-[1px] rounded-3xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-[0.14]', t.glow)}
      />

      <article
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(23,94,126,0.12)] ring-1 ring-slate-900/[0.03] transition-all duration-500 group-hover:-translate-y-1',
          t.articleBorder,
          t.hoverShadow,
        )}
      >
        {/* Portrait — compact halo */}
        <div className={cn('relative shrink-0 overflow-hidden px-5 pb-1 pt-6 sm:px-6 sm:pt-7', t.portraitBg)}>
          <div
            className={cn(
              'pointer-events-none absolute inset-x-10 top-4 h-24 rounded-full bg-gradient-to-b blur-2xl',
              t.halo,
            )}
          />
          <div className="relative mx-auto flex justify-center">
            <div
              className={cn(
                'relative shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-slate-100 shadow-[0_12px_32px_-16px_rgba(23,94,126,0.38)]',
                member.photoAccent
                  ? 'ring-2 ring-amber-400/55 ring-offset-[3px] ring-offset-white shadow-[0_16px_40px_-14px_rgba(217,119,6,0.28)]'
                  : 'ring-1 ring-slate-200/80',
                member.photoPortraitClassName ?? 'h-32 w-32 sm:h-36 sm:w-36',
              )}
            >
              {hasPhoto ? (
                <TeamPortraitImage
                  member={member}
                  priority={idx === 0}
                  className={cn(
                    'object-cover object-[center_22%] transition-transform duration-500 ease-out group-hover:scale-[1.03]',
                    member.photoImageClassName,
                  )}
                />
              ) : (
                <div
                  className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br from-white/20 to-black/10', member.surface)}
                >
                  <div className="rounded-full border-2 border-white/40 bg-white/15 p-1 shadow-inner">
                    <div className="flex h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)] items-center justify-center overflow-hidden rounded-full">
                      <Avatar className="h-[72%] w-[72%]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name-first hierarchy: tagline muted → title hero → role */}
        <div className="border-b border-slate-100/80 bg-white px-4 pb-3 pt-1 text-center sm:px-5">
          <p className={cn('text-[8px] font-semibold uppercase tracking-[0.2em] sm:text-[9px]', t.tagline)}>{member.tagline}</p>
          <h3
            className={cn(
              'mt-1.5 text-balance font-[family-name:var(--font-merriweather)] text-2xl font-bold leading-[1.1] tracking-tight sm:text-[1.65rem] md:text-[1.85rem] md:leading-[1.06]',
              t.name,
            )}
          >
            {member.name}
          </h3>
          <div className={cn('mx-auto mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r sm:w-12', t.underline)} />
          <p className={cn('mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs', t.role)}>{member.role}</p>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 px-4 pb-3.5 pt-3 sm:gap-3 sm:px-5 sm:pb-4">
          <div className={cn('flex gap-0.5 rounded-xl p-1', t.stats)}>
            {member.stats.map((stat, sIdx) => (
              <div
                key={sIdx}
                className="min-w-0 flex-1 rounded-lg px-0.5 py-1.5 text-center transition-colors group-hover:bg-white/55 sm:py-2"
              >
                <p className={cn('text-xs font-black tabular-nums leading-none sm:text-sm', t.statValue)}>{stat.value}</p>
                <p
                  className={cn(
                    'mt-0.5 text-[6px] font-bold uppercase leading-tight tracking-[0.12em] sm:text-[7px]',
                    t.statLabel,
                  )}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="line-clamp-2 text-center text-[11px] leading-snug text-slate-600 sm:text-xs">{member.bio}</p>

          <div className="flex flex-wrap justify-center gap-1">
            {tagPreview.map((tag, tIdx) => (
              <span
                key={tIdx}
                className={cn('rounded-full border px-2 py-0.5 text-[8px] font-semibold sm:text-[9px]', t.tags)}
              >
                {tag}
              </span>
            ))}
            {tagExtra > 0 && (
              <span className="self-center rounded-full border border-dashed border-slate-300/80 px-1.5 py-0.5 text-[8px] font-medium text-slate-500">
                +{tagExtra}
              </span>
            )}
          </div>

          <div className="mt-auto flex gap-1.5 border-t border-slate-100/90 pt-2.5">
            <button
              type="button"
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg ${member.surface} py-2 text-[10px] font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:text-[11px]`}
            >
              <Mail className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
              Contact
            </button>
            <button
              type="button"
              className={cn(
                'flex flex-1 items-center justify-center gap-1 rounded-lg border bg-white py-2 text-[10px] font-bold text-slate-700 shadow-sm transition active:scale-[0.98] sm:text-[11px]',
                t.linkedin,
              )}
            >
              <Linkedin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
              LinkedIn
            </button>
          </div>
        </div>

        <div className={cn('h-0.5 w-full', t.footerBar)} />
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
