'use client';

import { useState } from 'react';
import { brand } from '@/lib/brand';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero';
import { AboutKeyClientsSection } from '@/components/about-key-clients';
import WhoWeAre from '@/components/who-we-are';
import { Heart, BookOpen, Lightbulb, Calendar, Users, Handshake, Flag, Users2, Download, Crown, Briefcase, Settings, TrendingUp, ClipboardList, BarChart3, Award, UserCheck, Globe, Shield, Layers, UserCog } from 'lucide-react';

export default function AboutPage() {
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);

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

  const principles = [
    { title: 'Core Values', icon: Heart, description: 'Excellence • Integrity • Innovation • Collaboration • Accountability • Transparency' },
    { title: 'Our Philosophy', icon: Lightbulb, description: 'We believe in the transformative power of strategic thinking, evidence-based solutions, and collaborative partnerships to create lasting positive impact.' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <PageHeroShell>
        <div className="mb-2 flex justify-center sm:mb-3">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-wide text-white/95 backdrop-blur-sm sm:px-5 sm:py-2 sm:text-xs">
            Welcome to Baraarug Consulting Firm
          </span>
        </div>
        <h1 className={pageHeroTitleClass}>About Baraarug</h1>
        <p className={pageHeroSubtitleClass}>
          Discover our mission, vision, values, and the impact we create for organizations across Somalia
        </p>
      </PageHeroShell>

      <WhoWeAre surface="light" />

      {/* Guiding Principles - Full Width Section */}
      <section className="relative overflow-hidden bg-slate-100 py-28">
        {/* Full-width decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-teal/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-teal/3 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-block bg-brand-teal/20 text-brand-teal px-6 py-2 rounded-full text-sm font-bold mb-4 border border-brand-teal/40">
              CORE FOUNDATION
            </div>
            <h3 className="text-5xl md:text-6xl font-bold text-brand-navy mb-6">Our Guiding Principles</h3>
            <div className="w-24 h-1.5 bg-brand-teal mx-auto mb-6"></div>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto">The beliefs and values that define our commitment to excellence and transformation</p>
          </div>

          {/* Cards Grid - 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {principles.map((principle, idx) => {
              const IconComponent = principle.icon;
              const cardStyles = [
                { bg: 'bg-white', border: 'border-brand-teal/20 hover:border-brand-teal', iconBg: 'bg-brand-teal', iconText: 'text-white', titleColor: 'text-brand-teal', descColor: 'text-slate-700', accentColor: 'bg-brand-teal', shadowHover: 'hover:shadow-brand-teal/20', topAccent: 'bg-brand-teal' },
                { bg: 'bg-white', border: 'border-brand-navy/20 hover:border-brand-navy', iconBg: 'bg-brand-navy', iconText: 'text-white', titleColor: 'text-brand-navy', descColor: 'text-slate-700', accentColor: 'bg-brand-navy', shadowHover: 'hover:shadow-brand-navy/20', topAccent: 'bg-brand-navy' },
              ];
              const style = cardStyles[idx];

              return (
                <div
                  key={idx}
                  className="group relative"
                >
                  {/* Main card */}
                  <div className={`relative ${style.bg} ${style.border} border-2 rounded-3xl overflow-hidden shadow-lg ${style.shadowHover} hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2`}>
                    <div className={`h-1.5 w-full ${style.topAccent}`}></div>

                    <div className="p-10 lg:p-12">
                      {/* Icon + Title Row */}
                      <div className="flex items-center gap-5 mb-8">
                        <div className="relative">
                          {/* Icon glow */}
                          <div className={`absolute inset-0 ${style.iconBg} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                          <div className={`relative ${style.iconBg} p-5 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                            <IconComponent size={32} className={style.iconText} strokeWidth={2} />
                          </div>
                        </div>
                        <h4 className={`text-2xl lg:text-3xl font-bold ${style.titleColor}`}>{principle.title}</h4>
                      </div>
                      
                      {/* Description */}
                      <p className={`${style.descColor} leading-relaxed text-lg`}>{principle.description}</p>
                      
                      {/* Bottom accent line */}
                      <div className={`mt-8 h-1 w-12 ${style.accentColor} rounded-full group-hover:w-24 transition-all duration-500`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Organizational Structure — About page only; full chart */}
      <section
        id="organizational-structure"
        className="relative overflow-hidden border-t border-slate-100 bg-white py-28 px-4 md:px-8"
      >
        {/* Background dot pattern */}
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-navy/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-teal/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-24">
            <div className="inline-block bg-brand-teal/15 text-brand-teal px-6 py-2 rounded-full text-sm font-bold mb-5 border border-brand-teal/30 tracking-widest">
              ORGANIZATIONAL FRAMEWORK
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-brand-navy mb-6">Organizational Structure</h2>
            <div className="w-24 h-1.5 bg-brand-teal mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Our professional framework for delivering excellence and sustainable impact</p>
          </div>

          {/* ===== ORG CHART ===== */}
          <div className="flex flex-col items-center gap-0">

            {/* LEVEL 1 — CEO */}
            <div className="group relative w-full max-w-md z-10">
              <div className="absolute -inset-1 bg-brand-teal rounded-[2rem] blur-xl opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy text-white shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                <div className="h-2 w-full bg-brand-teal"></div>
                <div className="p-8 flex items-center gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-brand-teal rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                    <div className="relative bg-brand-teal/25 p-4 rounded-2xl border border-brand-teal/40">
                      <Crown size={32} className="text-brand-teal" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-2xl leading-tight">Managing Director / CEO</p>
                    <p className="text-brand-teal font-semibold text-sm tracking-widest mt-1">STRATEGIC LEADERSHIP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector L1 → L2 */}
            <div className="flex flex-col items-center w-full">
              <div className="h-8 w-0.5 bg-brand-navy/50"></div>
              <div className="hidden md:block w-full px-[calc(100%/6)] relative">
                <div className="h-0.5 w-full bg-brand-navy/35"></div>
                <div className="absolute left-[calc(100%/6)] -top-1.5 w-3 h-3 bg-brand-navy rounded-full shadow-md"></div>
                <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-brand-navy rounded-full shadow-md"></div>
                <div className="absolute right-[calc(100%/6)] -top-1.5 w-3 h-3 bg-brand-navy rounded-full shadow-md"></div>
              </div>
              <div className="hidden md:flex w-full justify-around px-[calc(100%/6-1px)]">
                <div className="w-0.5 h-8 bg-brand-navy/40"></div>
                <div className="w-0.5 h-8 bg-brand-navy/40"></div>
                <div className="w-0.5 h-8 bg-brand-navy/40"></div>
              </div>
              <div className="md:hidden w-0.5 h-8 bg-brand-navy/40"></div>
            </div>

            {/* LEVEL 2 — Directors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              {[
                { title: 'Operations Director', subtitle: 'Admin & Finance', icon: Briefcase, bg: 'bg-brand-navy' },
                { title: 'Technical Director', subtitle: 'Core Services', icon: Settings, bg: 'bg-brand-navy-mid' },
                { title: 'Business Dev. Director', subtitle: 'Growth & Partnerships', icon: TrendingUp, bg: 'bg-brand-teal' },
              ].map((role, idx) => {
                const IconComp = role.icon;
                return (
                  <div key={idx} className="group relative">
                    <div className="absolute -inset-1 rounded-2xl bg-brand-teal/15 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                    <div className={`relative ${role.bg} overflow-hidden rounded-2xl text-white shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                      <div className="p-7">
                        <div className="bg-white/20 p-3 rounded-xl w-fit mb-5">
                          <IconComp size={22} className="text-white" />
                        </div>
                        <p className="font-bold text-lg leading-tight mb-1">{role.title}</p>
                        <p className="text-white/80 text-sm font-medium">{role.subtitle}</p>
                        <div className="mt-5 h-0.5 w-8 bg-white/40 rounded-full group-hover:w-16 transition-all duration-500"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connector L2 → L3 */}
            <div className="flex flex-col items-center w-full">
              <div className="hidden md:flex w-full justify-around px-[calc(100%/6-1px)]">
                <div className="w-0.5 h-8 bg-slate-300"></div>
                <div className="w-0.5 h-8 bg-slate-300"></div>
                <div className="w-0.5 h-8 bg-slate-300"></div>
              </div>
              <div className="md:hidden w-0.5 h-8 bg-slate-300"></div>
            </div>

            {/* LEVEL 3 — Specialists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              {[
                { title: 'Program Managers', icon: Users },
                { title: 'Project Officers', icon: ClipboardList },
                { title: 'M&E Specialists', icon: BarChart3 },
              ].map((role, idx) => {
                const IconComp = role.icon;
                return (
                  <div key={idx} className="group relative">
                    <div className="relative bg-white border-2 border-slate-200 group-hover:border-brand-teal rounded-2xl shadow-md overflow-hidden group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-500">
                      <div className="h-1 w-full bg-brand-teal/70"></div>
                      <div className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-teal/10 group-hover:bg-brand-teal/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                          <IconComp size={22} className="text-brand-teal" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy text-base">{role.title}</p>
                          <div className="h-0.5 w-6 bg-brand-teal/40 rounded-full mt-2 group-hover:w-12 transition-all duration-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connector L3 → L4 */}
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-6 bg-slate-200"></div>
              <div className="w-3 h-3 border-2 border-brand-teal bg-white rounded-full shadow"></div>
              <div className="w-0.5 h-6 bg-slate-200"></div>
            </div>

            {/* LEVEL 4 — Support (full width 2-col) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {[
                { title: 'Pool of Experts', desc: 'Pre-vetted specialists by sector', icon: Award, bg: 'bg-brand-navy', glow: brand.navy },
                { title: 'Short-term Consultants', desc: 'Ad hoc specialists for specific projects', icon: UserCheck, bg: 'bg-brand-teal', glow: brand.green },
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="group relative">
                    <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 rounded-3xl blur-2xl transition-opacity duration-500" style={{background: `${item.glow}25`}}></div>
                    <div className={`relative ${item.bg} overflow-hidden rounded-3xl text-white shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl`}>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <div className="relative p-10 flex items-center gap-6">
                        <div className="bg-white/20 p-5 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                          <IconComp size={32} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-2xl leading-tight mb-2">{item.title}</p>
                          <div className="h-0.5 w-10 bg-white/50 rounded-full mb-3 group-hover:w-20 transition-all duration-500"></div>
                          <p className="text-white/85 text-base">{item.desc}</p>
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

      {/* Why Choose Us Section - Premium */}
      <section className="relative py-28 px-4 md:px-8 bg-white overflow-hidden">
        {/* Background dot pattern */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-teal/4 rounded-full -mr-64 -mt-64 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/4 rounded-full -ml-48 -mb-48 blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-block bg-brand-navy/10 text-brand-navy px-6 py-2 rounded-full text-sm font-bold mb-5 border border-brand-navy/20 tracking-widest">
              OUR ADVANTAGE
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-brand-navy mb-6">Why Choose Us</h2>
            <div className="w-24 h-1.5 bg-brand-teal mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">What sets us apart in the consulting industry and makes us the trusted partner for impactful change</p>
          </div>

          {/* Cards grid — 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Globe,
                title: 'Deep Local Expertise with Global Standards',
                desc: 'Unmatched local knowledge of Somalia and the Horn of Africa, combined with international best practices and globally recognized methodologies.',
                bg: 'bg-brand-navy',
                accent: brand.green,
                tag: 'LOCAL + GLOBAL',
              },
              {
                icon: Shield,
                title: 'Proven Track Record of Impact',
                desc: 'Demonstrated success across 200+ projects and 9+ clients, delivering measurable, evidence-based results that create lasting organizational transformation.',
                bg: 'bg-brand-teal',
                accent: '#ffffff',
                tag: '200+ PROJECTS',
              },
              {
                icon: Layers,
                title: 'Comprehensive Solutions Portfolio',
                desc: 'End-to-end consulting services spanning governance, finance, M&E, research, education, and climate — a full-spectrum partner for every organizational need.',
                bg: 'bg-brand-teal',
                accent: '#ffffff',
                tag: 'FULL SPECTRUM',
              },
              {
                icon: UserCog,
                title: 'Expert Team Composition',
                desc: 'A multidisciplinary team of 30+ dedicated staff and 500+ specialized consultants bringing diverse expertise, innovation, and a relentless pursuit of excellence.',
                bg: 'bg-brand-navy',
                accent: brand.green,
                tag: '500+ EXPERTS',
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="group relative">
                  <div className={`absolute -inset-1 ${item.bg} opacity-0 group-hover:opacity-20 rounded-3xl blur-2xl transition-opacity duration-500`}></div>

                  <div className={`relative ${item.bg} overflow-hidden rounded-3xl shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl`}>
                    {/* Inner top accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-24 -mt-24 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl"></div>

                    <div className="relative p-10 lg:p-12">
                      {/* Tag pill */}
                      <div className="inline-block bg-white/15 text-white text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-8 border border-white/20">
                        {item.tag}
                      </div>

                      {/* Icon + Title row */}
                      <div className="flex items-start gap-6 mb-6">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
                          <div className="relative bg-white/20 p-5 rounded-2xl group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500">
                            <IconComp size={32} className="text-white" strokeWidth={1.5} />
                          </div>
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight pt-1">{item.title}</h3>
                      </div>

                      {/* Divider */}
                      <div className="h-0.5 w-16 bg-white/30 rounded-full mb-6 group-hover:w-28 transition-all duration-500"></div>

                      {/* Description */}
                      <p className="text-white/85 text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-navy py-28 px-4 md:px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-teal/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-block bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-5 border border-white/20 tracking-widest">
              OUR IMPACT IN NUMBERS
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Baraarug Impact</h2>
            <div className="mx-auto mb-6 h-1.5 w-24 rounded-full bg-brand-teal"></div>
            <p className="text-xl text-white/80 max-w-xl mx-auto">Our growth and impact — built through trust, expertise, and commitment</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => {
              const IconComponent = metric.icon;
              const isBlue = metric.color === 'blue';
              return (
                <div
                  key={idx}
                  className="group relative"
                  onMouseEnter={() => setHoveredMetric(idx)}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  {/* Glow */}
                  <div className={`absolute inset-0 ${isBlue ? 'bg-white/10' : 'bg-brand-teal/20'} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  {/* Card */}
                  <div className={`relative bg-white/10 backdrop-blur-sm border ${isBlue ? 'border-white/20 group-hover:border-white/40' : 'border-brand-teal/30 group-hover:border-brand-teal/70'} rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl`}>
                    {/* Icon circle */}
                    <div className={`relative mb-5`}>
                      <div className={`absolute inset-0 ${isBlue ? 'bg-white' : 'bg-brand-teal'} rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                      <div className={`relative w-16 h-16 ${isBlue ? 'bg-white/15' : 'bg-brand-teal/20'} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent size={28} className={isBlue ? 'text-white' : 'text-brand-teal'} strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Value */}
                    <span className={`text-4xl font-bold mb-2 ${isBlue ? 'text-white' : 'text-brand-teal'}`}>{metric.value}</span>

                    {/* Label */}
                    <p className="text-white/75 font-medium text-sm tracking-wide uppercase">{metric.label}</p>

                    {/* Bottom accent */}
                    <div className={`mt-4 h-0.5 w-8 ${isBlue ? 'bg-white/40' : 'bg-brand-teal/60'} rounded-full group-hover:w-16 transition-all duration-500`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Documents Section - Premium Redesign */}
      <section className="relative overflow-hidden bg-slate-50 py-28 px-4 md:px-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-teal/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-navy/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-brand-teal/15 text-brand-teal px-6 py-2 rounded-full text-sm font-bold mb-5 border border-brand-teal/30 tracking-widest">
              COMPANY RESOURCES
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-brand-navy mb-6">Company Documents</h2>
            <div className="w-24 h-1.5 bg-brand-teal mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-slate-600 max-w-xl mx-auto">Download our comprehensive company profile and other important documents</p>
          </div>

          {/* Document card */}
          <div className="group relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-[2rem] bg-brand-teal/20 blur-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>

            <div className="relative bg-white border-2 border-slate-100 group-hover:border-brand-teal/40 rounded-[2rem] shadow-xl overflow-hidden transition-all duration-500 group-hover:shadow-2xl">
              {/* Top accent bar */}
              <div className="h-2 w-full bg-brand-teal"></div>

              <div className="p-10 md:p-14 flex flex-col md:flex-row gap-10 items-start">
                {/* PDF icon block */}
                <div className="flex-shrink-0">
                  <div className="relative group-hover:-translate-y-1 transition-transform duration-500">
                    <div className="absolute inset-0 bg-brand-navy rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <div className="relative flex h-36 w-28 flex-col items-center justify-center rounded-2xl border border-white/10 bg-brand-navy text-white shadow-2xl">
                      <Download size={36} className="mb-2" strokeWidth={1.5} />
                      <span className="font-black text-lg tracking-widest">PDF</span>
                      <div className="mt-2 w-8 h-0.5 bg-brand-teal rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4 leading-tight">
                    Baraarug Consulting Firm — Company Profile
                  </h3>
                  <div className="mb-6 h-1 w-16 rounded-full bg-brand-teal"></div>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Our comprehensive company profile showcases our services, expertise, organizational capabilities, key achievements, and strategic vision. This document provides detailed insights into our consulting approach, sector expertise, and track record of delivering excellence.
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-3 mb-10">
                    {['Company Overview', 'Service Portfolio', 'Team & Expertise', 'Client Success Stories'].map((tag, i) => (
                      <span key={i} className="bg-brand-navy/8 text-brand-navy border border-brand-navy/20 px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-navy/15 transition-colors duration-200 cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className="group/btn relative flex items-center gap-3 overflow-hidden rounded-2xl bg-brand-teal px-10 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-brand-navy hover:shadow-2xl">
                    <Download size={22} className="relative z-10 group-hover/btn:animate-bounce" strokeWidth={2} />
                    <span className="relative z-10">View Company Brochure</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview Section */}
      <section className="relative overflow-hidden bg-white py-28 px-4 md:px-8">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-teal/4 rounded-full -mr-64 -mt-64 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/4 rounded-full -ml-48 -mb-48 blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-brand-navy/10 text-brand-navy px-6 py-2 rounded-full text-sm font-bold mb-5 border border-brand-navy/20 tracking-widest">
              OUR REACH
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-brand-navy mb-6">Market Overview</h2>
            <div className="w-24 h-1.5 bg-brand-teal mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Our geographic footprint and sector expertise across the Horn of Africa and beyond</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Geographic Presence */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-brand-navy/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white border-2 border-slate-100 group-hover:border-brand-navy/40 rounded-3xl overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                <div className="h-1.5 w-full bg-brand-navy"></div>
                <div className="p-10 lg:p-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-brand-navy/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Globe size={28} className="text-brand-navy" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-navy">Geographic Presence</h3>
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed mb-8">
                    Baraarug Consulting Firm operates across <span className="font-bold text-brand-teal">Somalia, Kenya, and Ethiopia</span>, bringing deep regional expertise and cross-border collaboration capabilities to every engagement.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['Mogadishu', 'Nairobi', 'Addis Ababa', 'Hargeisa', 'Garowe'].map((city, i) => (
                      <span key={i} className="bg-brand-navy/8 text-brand-navy border border-brand-navy/20 px-4 py-2 rounded-full text-sm font-semibold">{city}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sector Expertise */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-brand-teal/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white border-2 border-slate-100 group-hover:border-brand-teal/40 rounded-3xl overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                <div className="h-1.5 w-full bg-brand-teal"></div>
                <div className="p-10 lg:p-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-brand-teal/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Layers size={28} className="text-brand-teal" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-navy">Sector Expertise</h3>
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed mb-8">
                    We work across diverse sectors delivering strategic, evidence-based solutions that drive measurable impact at every level of public and private institutions.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['Strategic Policy & Governance', 'Audit & Risk Management', 'Human Capital Development', 'Research & Data Analysis', 'Tax & Financial Management', 'Monitoring & Evaluation', 'Education Consultancy', 'Environmental Consulting', 'Business Development'].map((tag, i) => (
                      <span key={i} className="bg-brand-teal/10 text-brand-teal border border-brand-teal/30 px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-teal/20 transition-colors duration-200">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AboutKeyClientsSection />

      <Footer />
    </main>
  );
}
