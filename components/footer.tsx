'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronUp,
} from 'lucide-react';
import { OFFICE_ADDRESS, SITE_LOGO_SRC } from '@/lib/site-config';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services/strategic-policy' },
  { label: 'Contact', href: '/contact' },
] as const;

const serviceLinks = [
  { label: 'Strategic Policy', href: '/services/strategic-policy' },
  { label: 'Business Development', href: '/services/business-development' },
  { label: 'Research & Analysis', href: '/services/research-analytics' },
  { label: 'Education', href: '/services/education-consultancy' },
] as const;

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Services', href: '#' },
  { label: 'Cookie Policy', href: '#' },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-brand-navy via-brand-navy to-[#0d2438] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-brand-teal/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-teal/[0.06] blur-3xl" />

      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main grid */}
          <div className="grid gap-12 border-b border-white/10 py-16 sm:gap-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:py-20">
            {/* Brand — same logo treatment as header */}
            <div className="lg:pr-4">
              <Link
                href="/"
                className="mb-6 inline-block transition-opacity duration-300 hover:opacity-90"
              >
                <Image
                  src={SITE_LOGO_SRC}
                  alt="Baraarug Consulting Firm"
                  width={200}
                  height={56}
                  className="h-12 w-auto max-w-[200px] object-contain"
                />
              </Link>
              <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/70">
                Empowering organizations through innovative solutions and sustainable transformation.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                ].map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={idx}
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90 transition-all duration-300 hover:scale-110 hover:border-brand-teal/50 hover:bg-brand-teal/20 hover:text-white hover:shadow-lg hover:shadow-brand-teal/20"
                    >
                      <Icon size={17} strokeWidth={1.75} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="mb-6 text-base font-bold tracking-tight">
                Quick Links
                <span className="mt-2 block h-1 w-10 rounded-full bg-brand-teal shadow-[0_0_12px_rgba(45,212,191,0.45)]" />
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2.5 text-sm text-white/70 transition-colors duration-300 hover:text-brand-teal"
                    >
                      <span className="h-1 w-1 rounded-full bg-brand-teal/0 transition-all duration-300 group-hover:bg-brand-teal" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-base font-bold tracking-tight">
                Our Services
                <span className="mt-2 block h-1 w-10 rounded-full bg-brand-teal shadow-[0_0_12px_rgba(45,212,191,0.45)]" />
              </h4>
              <ul className="space-y-3">
                {serviceLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2.5 text-sm text-white/70 transition-colors duration-300 hover:text-brand-teal"
                    >
                      <span className="h-1 w-1 rounded-full bg-brand-teal/0 transition-all duration-300 group-hover:bg-brand-teal" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-base font-bold tracking-tight">
                Contact Us
                <span className="mt-2 block h-1 w-10 rounded-full bg-brand-teal shadow-[0_0_12px_rgba(45,212,191,0.45)]" />
              </h4>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden />
                  <span className="leading-relaxed text-white/70">{OFFICE_ADDRESS}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden />
                  <a
                    href="tel:+252613685943"
                    className="text-white/70 transition-colors hover:text-brand-teal"
                  >
                    +252-613-685-943
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden />
                  <a
                    href="mailto:info@bcf.so"
                    className="text-white/70 transition-colors hover:text-brand-teal"
                  >
                    info@bcf.so
                  </a>
                </li>
                <li className="flex gap-3">
                  <Globe className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden />
                  <a
                    href="https://www.bcf.so"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 transition-colors hover:text-brand-teal"
                  >
                    www.bcf.so
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Single bottom bar: one row — copyright | legal | back to top */}
          <div className="flex items-center justify-between gap-3 border-t border-white/15 py-6 sm:gap-5 sm:py-7">
            <p className="min-w-0 flex-1 truncate text-[11px] leading-snug text-white/55 sm:text-sm">
              <span className="sm:hidden">© {year} Baraarug</span>
              <span className="hidden sm:inline">
                © {year} Baraarug Consulting Firm. All rights reserved.
              </span>
            </p>

            <nav
              aria-label="Legal"
              className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-5"
            >
              {legalLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="whitespace-nowrap text-[10px] text-white/55 transition-colors hover:text-brand-teal sm:text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-brand-teal transition-all duration-300 hover:border-brand-teal/40 hover:bg-brand-teal/10 hover:text-white sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm"
            >
              <span className="hidden min-[400px]:inline">Back to top</span>
              <span className="min-[400px]:hidden">Top</span>
              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
