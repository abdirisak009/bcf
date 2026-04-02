'use client';

import { brand } from '@/lib/brand';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell } from '@/components/page-hero';
import { AboutKeyClientsSection } from '@/components/about-key-clients';
import WhoWeAre from '@/components/who-we-are';
import CoreValues from '@/components/core-values';
import { BookOpen, Calendar, Users, Handshake, Flag, Users2, Crown, Briefcase, Settings, TrendingUp, ClipboardList, BarChart3, Award, UserCheck } from 'lucide-react';

export default function AboutPage() {
  const metrics = [
    { label: 'Founded', value: '2017', icon: Calendar, color: 'blue' },
    { label: 'Clients', value: '9+', icon: BookOpen, color: 'green' },
    { label: 'Team Members', value: '150+', icon: Users, color: 'blue' },
    { label: 'Projects', value: '200+', icon: Handshake, color: 'green' },
    { label: 'Consultants', value: '500+', icon: Users2, color: 'blue' },
    { label: 'Global Partners', value: '10+', icon: Handshake, color: 'green' },
    { label: 'Countries', value: '3+', icon: Flag, color: 'blue' },
    { label: 'Staff', value: '30', icon: Users, color: 'green' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <PageHeroShell className="pt-14 sm:pt-16 md:pt-[4.25rem]" innerClassName="px-4 py-4 pb-6 text-center sm:px-6 sm:py-5 sm:pb-7 md:py-6 md:pb-8 lg:px-8">
        <div className="mb-1.5 flex justify-center sm:mb-2">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-wide text-white/95 backdrop-blur-sm sm:px-4 sm:text-xs">
            Welcome to Baraarug Consulting Firm
          </span>
        </div>
        <h1 className="mx-auto mt-2 max-w-4xl text-balance text-2xl font-bold leading-[1.12] tracking-tight text-white sm:mt-3 sm:text-3xl md:text-4xl lg:text-[2.65rem]">
          About Baraarug
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-snug text-white/75 sm:mt-3 sm:text-sm md:max-w-3xl md:text-base">
          Discover our mission, vision, and the impact we create for organizations across Somalia
        </p>
      </PageHeroShell>

      <WhoWeAre surface="light" />

      <CoreValues />

      <section className="relative overflow-hidden bg-gradient-to-b from-[color-mix(in_srgb,var(--brand-navy)_92%,black)] via-brand-navy to-[color-mix(in_srgb,var(--brand-navy)_88%,black)] py-7 md:py-9 px-4 md:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -right-24 top-0 h-[280px] w-[280px] rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-[220px] w-[220px] rounded-full bg-brand-green/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-4 text-center md:mb-5">
            <div className="mb-2 inline-flex rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-white/90 backdrop-blur-sm md:text-[11px]">
              OUR IMPACT IN NUMBERS
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Baraarug Impact</h2>
            <div className="mx-auto mt-2 mb-2 h-0.5 w-14 rounded-full bg-gradient-to-r from-brand-teal/60 via-brand-teal to-brand-green/70 md:w-20" />
            <p className="mx-auto max-w-lg text-xs leading-relaxed text-white/75 [text-wrap:balance] md:text-sm">
              Our growth and impact — built through trust, expertise, and commitment
            </p>
          </div>

          {/* Compact stat matrix: 4×2 on md+, dense horizontal rows */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5 md:gap-3">
            {metrics.map((metric, idx) => {
              const IconComponent = metric.icon;
              const isBlue = metric.color === 'blue';
              return (
                <div
                  key={idx}
                  className="group relative rounded-xl border border-white/10 bg-white/[0.06] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.1] md:p-3"
                >
                  <div
                    className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isBlue ? 'bg-white/[0.04]' : 'bg-brand-teal/[0.08]'}`}
                  />
                  <div className="relative flex items-center gap-2.5 md:gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border md:h-10 md:w-10 ${
                        isBlue
                          ? 'border-white/15 bg-white/10 text-white'
                          : 'border-brand-teal/35 bg-brand-teal/15 text-brand-green'
                      }`}
                    >
                      <IconComponent size={16} className={isBlue ? 'text-white' : 'text-brand-teal'} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p
                        className={`text-lg font-bold tabular-nums leading-none md:text-xl ${isBlue ? 'text-white' : 'text-brand-teal'}`}
                      >
                        {metric.value}
                      </p>
                      <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-white/60 md:text-[10px]">
                        {metric.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Organizational Structure — same hierarchy, refined visual system */}
      <section
        id="organizational-structure"
        className="relative overflow-hidden border-t border-slate-100/80 bg-gradient-to-b from-white via-[color-mix(in_srgb,var(--brand-mint)_12%,white)] to-white py-7 md:py-9 px-4 md:px-6"
      >
        {/* Soft grid + ambient light */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(color-mix(in srgb, var(--brand-navy) 14%, transparent) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        <div className="pointer-events-none absolute -right-20 top-0 h-[320px] w-[320px] rounded-full bg-brand-teal/[0.07] blur-3xl md:h-[420px] md:w-[420px]" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-[260px] w-[260px] rounded-full bg-brand-navy/[0.06] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-4 text-center md:mb-5">
            <div className="mb-3 inline-flex items-center rounded-full border border-brand-teal/20 bg-white/70 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-brand-teal shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_4px_14px_-4px_rgba(23,94,126,0.15)] backdrop-blur-sm md:text-[11px]">
              ORGANIZATIONAL FRAMEWORK
            </div>
            <h2 className="bg-gradient-to-br from-brand-navy to-[color-mix(in_srgb,var(--brand-navy)_55%,black)] bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
              Organizational Structure
            </h2>
            <div className="mx-auto mt-2.5 mb-2 h-1 w-14 rounded-full bg-gradient-to-r from-brand-teal/40 via-brand-teal to-brand-green/80 md:w-20" />
            <p className="mx-auto max-w-xl text-xs leading-relaxed text-slate-600 [text-wrap:balance] md:text-sm">
              Our professional framework for delivering excellence and sustainable impact
            </p>
          </div>

          <div className="flex flex-col items-center gap-0">
            {/* CEO */}
            <div className="group relative z-10 w-full max-w-sm">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-brand-teal/40 via-brand-green/20 to-transparent opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-brand-navy via-brand-navy to-[color-mix(in_srgb,var(--brand-navy)_72%,black)] text-white shadow-[0_12px_40px_-12px_rgba(23,94,126,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset] transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/[0.06]" />
                <div className="absolute -bottom-6 left-1/4 h-20 w-20 rounded-full bg-brand-teal/[0.08] blur-2xl" />
                <div className="h-1 w-full bg-gradient-to-r from-brand-teal via-brand-green to-brand-teal" />
                <div className="relative flex items-center gap-3 px-3 py-2.5 md:gap-3.5 md:px-4 md:py-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-brand-teal/30 blur-md" />
                    <div className="relative rounded-xl border border-white/20 bg-white/10 p-1.5 shadow-inner backdrop-blur-sm md:p-2">
                      <Crown size={18} className="text-brand-green drop-shadow-sm" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold leading-snug text-white drop-shadow-sm md:text-base">
                      Managing Director / CEO
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-brand-green md:text-[10px]">
                      STRATEGIC LEADERSHIP
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector L1 → L2 */}
            <div className="flex w-full flex-col items-center">
              <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-brand-navy/50 to-brand-teal/40 md:h-4" />
              <div className="relative hidden w-full px-[calc(100%/6)] md:block">
                <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-slate-300/90 to-transparent" />
                <div className="absolute left-[calc(100%/6)] -top-[4px] h-2 w-2 rounded-full border-2 border-white bg-brand-navy shadow-sm ring-1 ring-brand-teal/40" />
                <div className="absolute left-1/2 -top-[4px] h-2 w-2 -translate-x-1/2 rounded-full border-2 border-white bg-brand-navy shadow-sm ring-1 ring-brand-teal/40" />
                <div className="absolute right-[calc(100%/6)] -top-[4px] h-2 w-2 rounded-full border-2 border-white bg-brand-navy shadow-sm ring-1 ring-brand-teal/40" />
              </div>
              <div className="hidden w-full justify-around px-[calc(100%/6-1px)] md:flex">
                <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-brand-navy/35 to-brand-teal/25 md:h-4" />
                <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-brand-navy/35 to-brand-teal/25 md:h-4" />
                <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-brand-navy/35 to-brand-teal/25 md:h-4" />
              </div>
              <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-brand-navy/40 to-brand-teal/30 md:hidden" />
            </div>

            {/* Directors */}
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
              {[
                { title: 'Operations Director', subtitle: 'Admin & Finance', icon: Briefcase, bg: 'bg-brand-navy', ring: 'ring-brand-teal/15' },
                { title: 'Technical Director', subtitle: 'Core Services', icon: Settings, bg: 'bg-brand-navy-mid', ring: 'ring-white/10' },
                { title: 'Business Dev. Director', subtitle: 'Growth & Partnerships', icon: TrendingUp, bg: 'bg-brand-teal', ring: 'ring-white/20' },
              ].map((role, idx) => {
                const IconComp = role.icon;
                return (
                  <div key={idx} className="group relative">
                    <div
                      className={`relative ${role.bg} overflow-hidden rounded-2xl border border-white/15 text-white shadow-[0_10px_28px_-12px_rgba(23,94,126,0.35)] ring-1 ${role.ring} transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_36px_-14px_rgba(23,94,126,0.4)]`}
                    >
                      <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-white/[0.07]" />
                      <div className="absolute -bottom-4 -left-2 h-12 w-12 rounded-full bg-black/10" />
                      <div className="relative p-3 md:p-3.5">
                        <div className="mb-2 inline-flex rounded-lg border border-white/15 bg-white/10 p-1.5 shadow-inner backdrop-blur-[2px]">
                          <IconComp size={15} className="text-white" strokeWidth={2} />
                        </div>
                        <p className="text-xs font-bold leading-tight drop-shadow-sm md:text-[13px]">{role.title}</p>
                        <p className="mt-0.5 text-[10px] font-medium leading-snug text-white/80 md:text-[11px]">{role.subtitle}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connector L2 → L3 */}
            <div className="flex w-full flex-col items-center">
              <div className="hidden w-full justify-around px-[calc(100%/6-1px)] md:flex">
                <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-slate-300 to-slate-200/80 md:h-3.5" />
                <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-slate-300 to-slate-200/80 md:h-3.5" />
                <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-slate-300 to-slate-200/80 md:h-3.5" />
              </div>
              <div className="h-3 w-[2px] rounded-full bg-gradient-to-b from-slate-300 to-slate-200 md:hidden" />
            </div>

            {/* Specialists */}
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
              {[
                { title: 'Program Managers', icon: Users },
                { title: 'Project Officers', icon: ClipboardList },
                { title: 'M&E Specialists', icon: BarChart3 },
              ].map((role, idx) => {
                const IconComp = role.icon;
                return (
                  <div key={idx} className="group relative">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-[0_4px_20px_-8px_rgba(23,94,126,0.12)] ring-1 ring-slate-100/80 backdrop-blur-[2px] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-brand-teal/35 group-hover:shadow-[0_12px_28px_-10px_rgba(85,197,147,0.22)]">
                      <div className="h-0.5 w-full bg-gradient-to-r from-brand-teal/50 via-brand-teal to-brand-green/70" />
                      <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-brand-teal/[0.04]" />
                      <div className="relative flex items-center gap-2.5 px-2.5 py-2 md:gap-3 md:px-3 md:py-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-teal/15 bg-gradient-to-br from-brand-mint/40 to-brand-teal/10 shadow-inner">
                          <IconComp size={14} className="text-brand-teal" strokeWidth={2} />
                        </div>
                        <p className="text-[11px] font-semibold leading-tight text-brand-navy md:text-xs">{role.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connector L3 → L4 */}
            <div className="flex flex-col items-center py-0.5">
              <div className="h-2 w-[2px] rounded-full bg-gradient-to-b from-slate-200 to-transparent" />
              <div className="h-2 w-2 rounded-full border-2 border-white bg-gradient-to-br from-brand-teal to-brand-green shadow-[0_0_0_3px_rgba(85,197,147,0.2)]" />
              <div className="h-2 w-[2px] rounded-full bg-gradient-to-b from-transparent to-slate-200" />
            </div>

            {/* Pool + consultants */}
            <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 md:gap-2.5">
              {[
                { title: 'Pool of Experts', desc: 'Pre-vetted specialists by sector', icon: Award, bg: 'bg-brand-navy', glow: brand.navy },
                { title: 'Short-term Consultants', desc: 'Ad hoc specialists for specific projects', icon: UserCheck, bg: 'bg-brand-teal', glow: brand.green },
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="group relative">
                    <div
                      className="absolute -inset-[1px] rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${item.glow}55, transparent)` }}
                    />
                    <div
                      className={`relative ${item.bg} overflow-hidden rounded-2xl border border-white/15 text-white shadow-[0_10px_32px_-14px_rgba(23,94,126,0.38)] ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-0.5`}
                    >
                      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/[0.07]" />
                      <div className="absolute bottom-0 left-0 h-16 w-32 rounded-full bg-black/10 blur-2xl" />
                      <div className="relative flex items-start gap-3 p-3 md:p-3.5">
                        <div className="flex-shrink-0 rounded-xl border border-white/20 bg-white/10 p-2 shadow-inner backdrop-blur-sm">
                          <IconComp size={16} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight drop-shadow-sm md:text-[13px]">{item.title}</p>
                          <p className="mt-1 text-[10px] leading-snug text-white/88 md:text-[11px]">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <AboutKeyClientsSection />

      <Footer />
    </main>
  );
}
