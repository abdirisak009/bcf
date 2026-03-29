'use client';

import { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
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

const teamMembers = [
  {
    name: 'Mss. Ayan Ali Aden',
    role: 'CEO',
    gender: 'female',
    surface: 'bg-brand-navy',
    tagline: '14 Years of Visionary Leadership',
    bio: 'Ayan Ali Aden is the CEO of Baraarug Consulting Firm with 14 years of experience in public financial management, fiscal governance, and institutional capacity building, including eight years in public procurement management. She has worked with the World Bank, AfDB, UNDP, and UN-Habitat.',
    expertise: ['Public Financial Management', 'Fiscal Governance', 'Institutional Capacity Building', 'Public Procurement'],
    stats: [{ label: 'Years Exp.', value: '14+' }, { label: 'Organizations', value: '10+' }, { label: 'Countries', value: '5+' }],
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

function TeamCard({ member, idx }: { member: typeof teamMembers[0]; idx: number }) {
  const { ref, visible } = useScrollReveal();
  const Avatar = member.gender === 'female' ? FemaleAvatar : MaleAvatar;
  const tagPreview = member.expertise.slice(0, 3);
  const tagExtra = member.expertise.length - tagPreview.length;

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
      <div className={`absolute -inset-0.5 ${member.surface} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-all duration-500`} />

      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md ring-1 ring-black/[0.03] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-teal/30 group-hover:shadow-xl">
        {/* Header: avatar on top (centered), then tagline, name — same structure on every card */}
        <div className={`relative ${member.surface} flex shrink-0 flex-col items-center px-5 pb-4 pt-5 text-center`}>
          <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

          <div className="relative mb-3 flex w-full flex-col items-center">
            <div className="relative">
              <div className="rounded-full p-0.5 ring-2 ring-white/35 ring-offset-0 transition-transform duration-300 group-hover:scale-[1.03]">
                <div className="relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/50 bg-white/15 shadow-md backdrop-blur-[2px]">
                  <Avatar className="h-[3.35rem] w-[3.35rem]" />
                </div>
              </div>
              <div className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand-green shadow-sm" />
            </div>
          </div>

          <div className="mb-2.5 max-w-[100%] rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[8px] font-bold uppercase leading-tight tracking-[0.18em] text-white sm:text-[9px]">
            {member.tagline}
          </div>

          <h3 className="max-w-[18ch] text-balance text-[0.95rem] font-bold leading-tight text-white sm:text-base">{member.name}</h3>
          <p className="mt-1 max-w-[22ch] text-balance text-[10px] font-medium leading-snug text-white/90 sm:text-[11px]">{member.role}</p>
        </div>

        <div className="h-1 shrink-0 bg-brand-mint" />

        <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3.5">
          <div className="grid grid-cols-3 gap-0.5 rounded-lg bg-brand-mint/40 px-1.5 py-2 ring-1 ring-brand-teal/15">
            {member.stats.map((stat, sIdx) => (
              <div key={sIdx} className="min-w-0 text-center">
                <p className="text-sm font-black tabular-nums leading-none text-brand-navy sm:text-base">{stat.value}</p>
                <p className="mt-0.5 text-[8px] font-medium leading-tight text-slate-500 sm:text-[9px]">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="line-clamp-2 text-[11px] leading-snug text-slate-600 sm:text-[12px] sm:leading-snug">{member.bio}</p>

          <div className="flex flex-wrap gap-1">
            {tagPreview.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="rounded border border-brand-navy/10 bg-brand-mint/50 px-1.5 py-0.5 text-[8px] font-semibold text-brand-navy sm:text-[9px] transition-colors group-hover:border-brand-teal/25 group-hover:bg-brand-mint/80"
              >
                {tag}
              </span>
            ))}
            {tagExtra > 0 && (
              <span className="self-center rounded border border-dashed border-slate-300 px-1.5 py-0.5 text-[8px] font-medium text-slate-500 sm:text-[9px]">
                +{tagExtra}
              </span>
            )}
          </div>

          <div className="mt-auto flex gap-2 pt-1">
            <button
              type="button"
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg ${member.surface} py-2 text-[10px] font-bold text-white shadow-sm transition hover:brightness-110 sm:text-[11px]`}
            >
              <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              Contact
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-[10px] font-bold text-slate-600 transition hover:border-brand-teal hover:text-brand-teal sm:text-[11px]"
            >
              <Linkedin className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              LinkedIn
            </button>
          </div>
        </div>

        <div className={`h-0.5 w-0 group-hover:w-full ${member.surface} transition-all duration-500`} />
      </div>
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

      {/* Hero Section */}
      <section className="relative min-h-[72vh] flex items-center justify-center overflow-hidden bg-brand-navy pt-32 pb-20 px-4">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-teal/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        <div
          ref={heroRef}
          className="relative z-10 max-w-5xl mx-auto text-center"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          <div className="inline-flex items-center gap-2 bg-brand-teal/20 border border-brand-teal/40 text-brand-teal px-6 py-2.5 rounded-full text-sm font-bold tracking-widest mb-10 backdrop-blur-sm">
            <Star size={13} fill="currentColor" />
            OUR LEADERSHIP
            <Star size={13} fill="currentColor" />
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-none tracking-tight text-balance">
            Meet Our<br />
            <span className="relative inline-block">
              <span className="text-brand-green">Expert Team</span>
              <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-brand-teal"></span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/75 max-w-3xl mx-auto mb-12 leading-relaxed text-pretty">
            Our diverse team of experts brings together decades of experience and specialized knowledge to deliver exceptional results across Somalia and beyond.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-14">
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
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-2xl hover:bg-white/20 transition-all duration-300"
                  style={{
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.7s ease ${0.3 + idx * 0.1}s, transform 0.7s ease ${0.3 + idx * 0.1}s`,
                  }}
                >
                  <Icon size={20} className="text-brand-teal" strokeWidth={1.5} />
                  <div className="text-left">
                    <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                    <p className="text-white/60 text-xs">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="tracking-widest text-xs font-semibold">SCROLL TO MEET THE TEAM</span>
            <div className="h-10 w-0.5 bg-white/35"></div>
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 xl:items-stretch">
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
