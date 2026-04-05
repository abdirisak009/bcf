'use client';

import { brand } from '@/lib/brand';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero';
import { AboutKeyClientsSection } from '@/components/about-key-clients';
import WhoWeAre from '@/components/who-we-are';
import CoreValues from '@/components/core-values';
import { BookOpen, Calendar, Users, Handshake, Flag, Users2, Crown, Briefcase, Settings, TrendingUp, ClipboardList, BarChart3, Award, UserCheck } from 'lucide-react';

export default function AboutPage() {
  const metrics = [
    { label: 'Founded', value: '2012', icon: Calendar, color: 'blue' },
    { label: 'Projects', value: '100+', icon: BookOpen, color: 'green' },
    { label: 'Projects Delivered', value: '200+', icon: Handshake, color: 'green' },
    { label: 'Consultants', value: '500+', icon: Users2, color: 'blue' },
    { label: 'International Partners', value: '5', icon: Handshake, color: 'green' },
    { label: 'Countries', value: '3+', icon: Flag, color: 'blue' },
    { label: 'Staff', value: '30', icon: Users, color: 'green' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <PageHeroShell innerClassName="max-w-4xl text-center">
        <div className="mb-2 flex justify-center sm:mb-3">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-sm sm:px-5 sm:text-sm">
            Welcome to Baraarug Consulting Firm
          </span>
        </div>
        <h1 className={pageHeroTitleClass}>About Baraarug</h1>
        <p className={pageHeroSubtitleClass}>
          Discover our mission, vision, and the impact we create for organizations across Somalia
        </p>
      </PageHeroShell>

      <WhoWeAre surface="light" />

      <CoreValues />

      <section className="relative overflow-hidden border-t border-slate-200/80 bg-white py-14 md:py-20 lg:py-24 px-4 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(85,197,147,0.08),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(color-mix(in srgb, var(--brand-navy) 10%, transparent) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -right-24 top-0 h-[min(320px,55vw)] w-[min(320px,55vw)] rounded-full bg-brand-teal/[0.12] blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-[min(260px,45vw)] w-[min(260px,45vw)] rounded-full bg-brand-navy/[0.06] blur-[90px]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-10 text-center md:mb-14">
            <div className="mb-4 inline-flex rounded-full border border-brand-teal/30 bg-brand-teal/[0.1] px-5 py-2.5 text-xs font-bold tracking-[0.22em] text-brand-teal shadow-sm backdrop-blur-sm md:text-sm">
              OUR IMPACT IN NUMBERS
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl lg:text-[2.85rem] lg:leading-tight">
              Baraarug Impact
            </h2>
            <div className="mx-auto mt-4 mb-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-brand-teal/60 via-brand-teal to-brand-green/80 md:w-28" />
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 [text-wrap:balance] md:text-xl md:leading-relaxed">
              Our growth and impact — built through trust, expertise, and commitment
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-5 lg:gap-6">
            {metrics.map((metric) => {
              const IconComponent = metric.icon;
              const isBlue = metric.color === 'blue';
              return (
                <div
                  key={metric.label}
                  className="group relative rounded-2xl border border-slate-200/95 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(15,60,80,0.12)] ring-1 ring-slate-100/90 transition-all duration-500 hover:-translate-y-1 hover:border-brand-teal/25 hover:shadow-[0_20px_48px_-20px_rgba(23,94,126,0.18)] md:rounded-[1.25rem] md:p-5"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[1.25rem] bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
                    aria-hidden
                  />
                  <div
                    className={`absolute inset-0 rounded-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 md:rounded-[1.25rem] ${
                      isBlue
                        ? 'bg-gradient-to-br from-slate-50/90 to-transparent'
                        : 'bg-gradient-to-br from-brand-teal/[0.08] to-transparent'
                    }`}
                  />
                  <div className="relative flex items-center gap-3.5 md:gap-4">
                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md md:h-14 md:w-14 ${
                        isBlue
                          ? 'border-slate-200/90 bg-white text-brand-navy shadow-[inset_0_1px_0_rgba(255,255,255,1)]'
                          : 'border-brand-teal/30 bg-brand-teal/[0.1] text-brand-teal shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
                      }`}
                    >
                      <IconComponent
                        size={22}
                        className={isBlue ? 'text-brand-navy' : 'text-brand-teal'}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p
                        className={`font-bold tabular-nums leading-none tracking-tight ${
                          isBlue ? 'text-2xl text-brand-navy md:text-3xl' : 'text-2xl text-brand-teal md:text-3xl'
                        }`}
                      >
                        {metric.value}
                      </p>
                      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] md:text-xs md:tracking-[0.16em]">
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

      {/* ── Organizational Structure ── */}
      <section
        id="organizational-structure"
        className="relative overflow-hidden bg-gradient-to-b from-[color-mix(in_srgb,var(--brand-navy)_95%,black)] via-brand-navy to-[color-mix(in_srgb,var(--brand-navy)_88%,#020617)] py-16 px-4 sm:px-6 md:py-24 lg:py-28"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-teal/[0.05] via-transparent to-brand-navy/80" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="pointer-events-none absolute -right-32 top-1/4 h-[min(480px,65vw)] w-[min(480px,65vw)] rounded-full bg-brand-teal/[0.16] blur-[120px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-[min(380px,50vw)] w-[min(380px,50vw)] rounded-full bg-brand-green/[0.08] blur-[100px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(85%,44rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12 text-center md:mb-16">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/[0.08] px-5 py-2.5 text-xs font-bold tracking-[0.22em] text-white/95 shadow-[0_0_40px_-12px_rgba(45,212,191,0.3)] backdrop-blur-md md:text-sm">
              ORGANIZATIONAL FRAMEWORK
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-[2.85rem] lg:leading-tight">
              Organizational Structure
            </h2>
            <div className="mx-auto mt-4 mb-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-brand-teal/50 via-brand-teal to-brand-green/80 shadow-[0_0_24px_rgba(45,212,191,0.4)] md:w-28" />
            <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-white/80 md:text-xl">
              Our professional framework for delivering excellence and sustainable impact
            </p>
          </div>

          <div className="flex flex-col items-center gap-0">

            {/* ─── CEO ─── */}
            <div className="group relative z-10 w-full max-w-lg">
              <div className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-br from-brand-teal/50 via-brand-green/25 to-white/10 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative overflow-hidden rounded-[1.25rem] border border-white/20 bg-gradient-to-br from-white/[0.14] to-white/[0.04] shadow-[0_20px_56px_-20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_28px_64px_-24px_rgba(23,94,126,0.5)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-teal/[0.12] blur-2xl" />
                <div className="absolute -bottom-8 left-1/4 h-24 w-24 rounded-full bg-brand-green/[0.1] blur-2xl" />
                <div className="h-1.5 w-full bg-gradient-to-r from-brand-teal via-brand-green to-brand-teal shadow-[0_0_16px_rgba(45,212,191,0.6)]" />
                <div className="relative flex items-center gap-5 px-5 py-5 md:gap-6 md:px-7 md:py-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-brand-teal/40 blur-md" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_24px_-6px_rgba(45,212,191,0.4)] backdrop-blur-sm md:h-16 md:w-16">
                      <Crown size={28} className="text-brand-green drop-shadow-[0_0_10px_rgba(124,227,149,0.5)]" strokeWidth={1.75} />
                    </div>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-lg font-extrabold leading-tight tracking-tight text-white drop-shadow-sm md:text-xl">
                      Managing Director / CEO
                    </p>
                    <p className="mt-1.5 text-xs font-bold tracking-[0.2em] text-brand-green/90 sm:text-sm">
                      STRATEGIC LEADERSHIP
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector L1 → L2 */}
            <div className="flex w-full flex-col items-center">
              <div className="h-6 w-px bg-gradient-to-b from-brand-teal/60 to-brand-teal/20 md:h-8" />
              <div className="relative hidden w-full px-[calc(100%/6)] md:block">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-teal/40 to-transparent" />
                {[`left-[calc(100%/6)]`, 'left-1/2 -translate-x-1/2', `right-[calc(100%/6)]`].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} -top-[5px] h-2.5 w-2.5 rounded-full border-2 border-brand-navy bg-brand-teal shadow-[0_0_10px_rgba(45,212,191,0.6)]`} />
                ))}
              </div>
              <div className="hidden w-full justify-around px-[calc(100%/6-1px)] md:flex">
                {[0,1,2].map(i => <div key={i} className="h-6 w-px bg-gradient-to-b from-brand-teal/40 to-brand-teal/15 md:h-8" />)}
              </div>
              <div className="h-5 w-px bg-gradient-to-b from-brand-teal/40 to-brand-teal/15 md:hidden" />
            </div>

            {/* ─── Directors ─── */}
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
              {[
                { title: 'Operations Director', subtitle: 'Admin & Finance', icon: Briefcase, gradient: 'from-brand-navy via-brand-navy to-[color-mix(in_srgb,var(--brand-navy)_75%,black)]' },
                { title: 'Technical Director', subtitle: 'Core Services', icon: Settings, gradient: 'from-[color-mix(in_srgb,var(--brand-navy)_85%,var(--brand-teal))] via-brand-navy to-brand-navy' },
                { title: 'Business Dev. Director', subtitle: 'Growth & Partnerships', icon: TrendingUp, gradient: 'from-brand-teal via-[color-mix(in_srgb,var(--brand-teal)_85%,var(--brand-navy))] to-brand-teal' },
              ].map((role) => {
                const IconComp = role.icon;
                return (
                  <div key={role.title} className="group relative">
                    <div className="absolute -inset-px rounded-[1.15rem] bg-gradient-to-br from-brand-teal/35 via-white/10 to-transparent opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-100" />
                    <div className={`relative overflow-hidden rounded-[1.15rem] border border-white/15 bg-gradient-to-br ${role.gradient} text-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_56px_-20px_rgba(23,94,126,0.4)]`}>
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/[0.06]" />
                      <div className="absolute -bottom-5 -left-3 h-16 w-16 rounded-full bg-black/10" />
                      <div className="relative p-5 md:p-6">
                        <div className="mb-4 inline-flex rounded-xl border border-white/20 bg-white/[0.1] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-sm">
                          <IconComp size={22} className="text-white drop-shadow-sm" strokeWidth={1.75} />
                        </div>
                        <p className="text-base font-extrabold leading-tight tracking-tight drop-shadow-sm md:text-lg">{role.title}</p>
                        <p className="mt-1.5 text-sm font-medium leading-snug text-white/80 md:text-base">{role.subtitle}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connector L2 → L3 */}
            <div className="flex w-full flex-col items-center">
              <div className="hidden w-full justify-around px-[calc(100%/6-1px)] md:flex">
                {[0,1,2].map(i => <div key={i} className="h-5 w-px bg-gradient-to-b from-brand-teal/35 to-brand-teal/10 md:h-7" />)}
              </div>
              <div className="h-5 w-px bg-gradient-to-b from-brand-teal/30 to-transparent md:hidden" />
            </div>

            {/* ─── Specialists ─── */}
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
              {[
                { title: 'Program Managers', icon: Users },
                { title: 'Project Officers', icon: ClipboardList },
                { title: 'M&E Specialists', icon: BarChart3 },
              ].map((role) => {
                const IconComp = role.icon;
                return (
                  <div key={role.title} className="group relative">
                    <div className="relative overflow-hidden rounded-[1.15rem] border border-white/12 bg-gradient-to-br from-white/[0.1] to-white/[0.03] shadow-[0_8px_28px_-12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:border-brand-teal/30 group-hover:shadow-[0_16px_36px_-14px_rgba(45,212,191,0.25)]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <div className="h-px w-full bg-gradient-to-r from-brand-teal/40 via-brand-teal to-brand-green/60" />
                      <div className="relative flex items-center gap-4 px-4 py-4 md:gap-4 md:px-5 md:py-4.5">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-teal/30 bg-brand-teal/[0.15] shadow-[inset_0_1px_0_rgba(45,212,191,0.2)] transition-transform duration-300 group-hover:scale-105 md:h-12 md:w-12">
                          <IconComp size={20} className="text-brand-teal drop-shadow-sm" strokeWidth={2} />
                        </div>
                        <p className="text-sm font-bold leading-tight text-white md:text-base">{role.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connector L3 → L4 */}
            <div className="flex flex-col items-center py-1">
              <div className="h-4 w-px bg-gradient-to-b from-brand-teal/30 to-transparent" />
              <div className="h-3 w-3 rounded-full border-2 border-brand-navy bg-brand-teal shadow-[0_0_14px_rgba(45,212,191,0.6)]" />
              <div className="h-4 w-px bg-gradient-to-b from-transparent to-brand-teal/20" />
            </div>

            {/* ─── Pool + Consultants ─── */}
            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
              {[
                { title: 'Pool of Experts', desc: 'Pre-vetted specialists by sector', icon: Award, gradient: 'from-brand-navy via-brand-navy to-[color-mix(in_srgb,var(--brand-navy)_80%,black)]' },
                { title: 'Short-term Consultants', desc: 'Ad hoc specialists for specific projects', icon: UserCheck, gradient: 'from-brand-teal via-[color-mix(in_srgb,var(--brand-teal)_80%,var(--brand-navy))] to-brand-teal' },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <div key={item.title} className="group relative">
                    <div className="absolute -inset-px rounded-[1.15rem] bg-gradient-to-br from-brand-teal/30 via-white/10 to-transparent opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-100" />
                    <div className={`relative overflow-hidden rounded-[1.15rem] border border-white/15 bg-gradient-to-br ${item.gradient} text-white shadow-[0_16px_44px_-18px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_56px_-20px_rgba(23,94,126,0.4)]`}>
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/[0.06]" />
                      <div className="absolute bottom-0 left-0 h-20 w-36 rounded-full bg-black/10 blur-2xl" />
                      <div className="relative flex items-start gap-4 p-5 md:p-6">
                        <div className="flex-shrink-0 rounded-xl border border-white/20 bg-white/[0.1] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                          <IconComp size={24} className="text-white drop-shadow-sm" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-extrabold leading-tight tracking-tight drop-shadow-sm md:text-lg">{item.title}</p>
                          <p className="mt-2 text-sm leading-snug text-white/85 md:text-base">{item.desc}</p>
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
