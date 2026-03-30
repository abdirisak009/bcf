'use client';

import Link from 'next/link';
import { brand } from '@/lib/brand';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { PageHeroShell, pageHeroSubtitleClass, pageHeroTitleClass } from '@/components/page-hero';
import { TrendingUp, Users, Heart, Mail, ArrowRight } from 'lucide-react';

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <Navigation />

      <PageHeroShell innerClassName="max-w-4xl">
        <h1 className={pageHeroTitleClass}>Career Opportunities</h1>
        <p className={pageHeroSubtitleClass}>
          Join our team of experts and be part of transformative consulting solutions that make a difference.
        </p>
      </PageHeroShell>

      {/* ── COMING SOON ── */}
      <section className="relative overflow-hidden bg-slate-50 py-24 px-4 md:px-8">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-teal/4 rounded-full -mr-40 -mt-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-navy/4 rounded-full -ml-24 -mb-24 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-block bg-brand-teal/15 text-brand-teal px-6 py-2 rounded-full text-sm font-bold mb-6 border border-brand-teal/30 tracking-widest">
            POSITIONS OPENING SOON
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-6 text-balance">
            Coming Soon
          </h2>
          <div className="mx-auto mb-8 h-1.5 w-20 rounded-full bg-brand-teal" />
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl mx-auto">
            {"We're currently updating our career opportunities. Please check back soon for exciting positions across various departments."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-brand-navy hover:bg-brand-navy-mid text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-navy/20"
            >
              Contact Us
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-3 bg-white border-2 border-slate-200 hover:border-brand-navy text-brand-navy px-8 py-4 rounded-full font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3 FEATURE CARDS ── */}
      <section className="relative py-24 px-4 md:px-8 bg-white overflow-hidden">

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Professional Growth',
                desc: 'Continuous learning opportunities and career development programs to help you reach your full potential.',
                accent: brand.navy,
                bg: 'bg-brand-navy/8',
              },
              {
                icon: Users,
                title: 'Collaborative Culture',
                desc: 'Work with diverse, talented professionals in an environment that values teamwork and innovation.',
                accent: brand.green,
                bg: 'bg-brand-teal/8',
              },
              {
                icon: Heart,
                title: 'Meaningful Impact',
                desc: 'Contribute to projects that make a real difference in organizations and communities across the region.',
                accent: brand.navy,
                bg: 'bg-brand-navy/8',
              },
            ].map(({ icon: Icon, title, desc, accent, bg }, i) => (
              <div
                key={i}
                className="group relative bg-white border-2 border-slate-100 hover:border-brand-teal/40 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 rounded-b-3xl bg-brand-teal transition-transform duration-500 group-hover:scale-x-100" />
                <div
                  className={`${bg} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}
                  style={{ backgroundColor: `${accent}14` }}
                >
                  <Icon size={28} style={{ color: accent }} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-3">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAY CONNECTED ── */}
      <section className="relative overflow-hidden bg-brand-navy py-24 px-4 md:px-8">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-teal/10 rounded-full -mr-40 -mt-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2 rounded-full text-sm font-bold tracking-widest mb-8">
            <Mail size={14} />
            STAY CONNECTED
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Stay Connected
          </h2>
          <div className="mx-auto mb-8 h-1.5 w-20 rounded-full bg-brand-teal" />
          <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-xl mx-auto">
            Interested in joining our team? Contact us to learn more about upcoming opportunities and be notified when positions become available.
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 bg-brand-teal text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-brand-teal-hover hover:shadow-2xl hover:shadow-brand-teal/30"
          >
            Get In Touch
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
