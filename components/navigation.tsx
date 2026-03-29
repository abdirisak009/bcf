'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Phone,
  Mail,
  Clock,
  MapPin,
  ChevronDown,
  LogIn,
  Award,
  Info,
  Briefcase,
  Users,
  BookOpen,
  Home,
  GraduationCap,
  CalendarDays,
  Newspaper,
  Library,
  MessageCircle,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';
import { OFFICE_ADDRESS, SITE_LOGO_SRC } from '@/lib/site-config';

type DropdownItem = { label: string; href: string; icon: LucideIcon };

type NavEntry =
  | {
      name: string;
      href: string;
      icon: LucideIcon;
      hasDropdown?: false;
      dropdownItems?: undefined;
    }
  | {
      name: string;
      href: string;
      icon: LucideIcon;
      hasDropdown: true;
      dropdownItems: DropdownItem[];
    };

const navItems: NavEntry[] = [
  { name: 'Home', href: '/', icon: Home },
  {
    name: 'About',
    href: '/about',
    icon: Info,
    hasDropdown: true,
    dropdownItems: [
      { label: 'About Us', icon: Info, href: '/about' },
      { label: 'Our Team', icon: Users, href: '/our-team' },
      { label: 'Career', icon: BookOpen, href: '/careers' },
    ],
  },
  {
    name: 'Services',
    href: '#services',
    icon: Briefcase,
    hasDropdown: true,
    dropdownItems: [
      { label: 'Strategic Policy & Governance', icon: Briefcase, href: '/services/strategic-policy' },
      { label: 'Audit Assurance & Risk Management', icon: Briefcase, href: '/services/audit-assurance' },
      { label: 'Institution and Human Capital Development', icon: Users, href: '/services/human-capital' },
      { label: 'Research & Analytics', icon: Briefcase, href: '/services/research-analytics' },
      { label: 'Tax & Financial Management', icon: Briefcase, href: '/services/tax-financial' },
      { label: 'Monitoring & Evaluation', icon: Briefcase, href: '/services/monitoring-evaluation' },
      { label: 'Business Development Services', icon: Briefcase, href: '/services/business-development' },
      { label: 'Education Consultancy', icon: BookOpen, href: '/services/education-consultancy' },
      { label: 'Environmental & Climate Change Consulting', icon: Briefcase, href: '/services/environmental-climate' },
    ],
  },
  { name: 'Training', href: '/training', icon: GraduationCap },
  {
    name: 'Events',
    href: '/publications',
    icon: CalendarDays,
    hasDropdown: true,
    dropdownItems: [
      { label: 'Publications', icon: Library, href: '/publications' },
      { label: 'News', icon: Newspaper, href: '/news' },
    ],
  },
  { name: 'Contact', href: '/contact', icon: MessageCircle },
];

function isItemActive(pathname: string, hash: string, item: NavEntry): boolean {
  if (item.name === 'Home') return pathname === '/';
  if (item.name === 'About') {
    return ['/about', '/our-team', '/careers'].some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  if (item.name === 'Services') return pathname.startsWith('/services');
  if (item.name === 'Training') return pathname.startsWith('/training');
  if (item.name === 'Events') {
    return pathname === '/publications' || pathname === '/news';
  }
  if (item.name === 'Contact') return pathname === '/contact';
  return false;
}

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hash, setHash] = useState('');

  useEffect(() => {
    const sync = () => setHash(typeof window !== 'undefined' ? window.location.hash : '');
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return (
    <header className="fixed top-0 z-[100] w-full pointer-events-auto">
      {/* Top Bar */}
      <div className="relative border-b border-white/10 bg-brand-navy text-sm text-white">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-teal/40" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-2.5 gap-2 sm:gap-0">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <a href="tel:+252613685943" className="flex items-center gap-2 hover:text-brand-teal transition-colors">
                <Phone size={14} className="shrink-0 opacity-90" />
                <span>+252-613-685-943</span>
              </a>
              <a href="mailto:info@bcf.so" className="flex items-center gap-2 hover:text-brand-teal transition-colors">
                <Mail size={14} className="shrink-0 opacity-90" />
                <span>info@bcf.so</span>
              </a>
              <div className="hidden md:flex items-center gap-2">
                <Clock size={14} className="shrink-0 opacity-90" />
                <span>Sat-Thu: 8.00 to 17.00</span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <MapPin size={14} className="shrink-0 opacity-90" />
                <span>{OFFICE_ADDRESS}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                  label: 'Facebook',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                  label: 'LinkedIn',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                  label: 'X',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  ),
                  label: 'Instagram',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                  label: 'YouTube',
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="hover:text-brand-teal hover:scale-110 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="border-b border-slate-200/90 bg-white/95 shadow-[0_8px_30px_-12px_rgba(23,94,126,0.18)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[4.5rem]">
            <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-90">
              <Image
                src={SITE_LOGO_SRC}
                alt="Baraarug Consulting Firm"
                width={200}
                height={56}
                className="h-12 w-auto max-w-[200px] object-contain"
                priority
              />
            </Link>

            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = isItemActive(pathname, hash, item);
                const NavIcon = item.icon;

                return (
                  <div key={item.name} className="relative group">
                    {!item.hasDropdown ? (
                      <Link
                        href={item.href}
                        className={`group/nav flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-all duration-300 relative ${
                          active ? 'text-brand-teal' : 'text-brand-navy hover:text-brand-teal'
                        }`}
                      >
                        <NavIcon
                          className={`h-[1.125rem] w-[1.125rem] shrink-0 transition-colors ${
                            active ? 'text-brand-teal' : 'text-brand-navy/85 group-hover/nav:text-brand-teal'
                          }`}
                          strokeWidth={2}
                          aria-hidden
                        />
                        <span>{item.name}</span>
                        <span
                          className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-brand-teal transition-all duration-300 ${
                            active ? 'w-[calc(100%-1.75rem)]' : 'w-0 group-hover/nav:w-[calc(100%-1.75rem)]'
                          }`}
                        />
                      </Link>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={`group/nav flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-all duration-300 relative ${
                            active ? 'text-brand-teal' : 'text-brand-navy hover:text-brand-teal'
                          }`}
                        >
                          <NavIcon
                            className={`h-[1.125rem] w-[1.125rem] shrink-0 transition-colors ${
                              active ? 'text-brand-teal' : 'text-brand-navy/85 group-hover/nav:text-brand-teal'
                            }`}
                            strokeWidth={2}
                            aria-hidden
                          />
                          <span>{item.name}</span>
                          <ChevronDown size={14} className="opacity-80 group-hover/nav:rotate-180 transition-transform duration-300" />
                          <span
                            className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-brand-teal transition-all duration-300 ${
                              active ? 'w-[calc(100%-2.25rem)]' : 'w-0 group-hover/nav:w-[calc(100%-2.25rem)]'
                            }`}
                          />
                        </button>

                        {item.dropdownItems && (
                          <div
                            className={`absolute left-0 top-full z-50 pt-1.5 rounded-xl border border-slate-100/80 bg-white py-2 shadow-xl shadow-slate-900/10 ring-1 ring-black/[0.03] transition-all duration-300 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 ${
                              item.name === 'Services' ? 'w-80' : 'w-64'
                            }`}
                          >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-xl bg-brand-teal" />
                            {item.dropdownItems.map((dropdownItem, index) => {
                              const IconComponent = dropdownItem.icon;
                              return (
                                <Link
                                  key={index}
                                  href={dropdownItem.href}
                                  className="flex items-center gap-3 px-4 py-3 text-brand-navy transition-all duration-200 hover:bg-brand-teal/[0.06] hover:text-brand-teal border-l-[3px] border-transparent hover:border-brand-teal group/item first:pt-3.5"
                                >
                                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/[0.06] text-brand-teal transition-colors group-hover/item:bg-brand-teal/10">
                                    <IconComponent size={18} strokeWidth={2} />
                                  </span>
                                  <span className="font-medium text-sm leading-snug">{dropdownItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              <Link
                href="/dashboard"
                className="mr-1 inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-brand-navy transition-colors hover:text-brand-teal"
              >
                <LayoutDashboard size={17} strokeWidth={2} aria-hidden />
                Dashboard
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-brand-navy/90 bg-white px-5 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-300 hover:border-brand-navy hover:bg-brand-navy hover:text-white hover:shadow-md"
              >
                <LogIn size={17} strokeWidth={2.25} aria-hidden />
                Sign In
              </Link>
              <Link
                href="/get-certificate"
                className="group/cert inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-teal px-5 text-sm font-semibold text-white shadow-lg shadow-brand-teal/35 ring-1 ring-white/25 transition-all duration-300 hover:bg-brand-teal-hover hover:shadow-xl hover:shadow-brand-teal/45 hover:scale-[1.02]"
              >
                <Award size={17} strokeWidth={2.25} className="transition-transform duration-300 group-hover/cert:rotate-12" aria-hidden />
                Get Certificate
              </Link>
            </div>

            <button
              className="lg:hidden w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-brand-navy hover:bg-brand-teal hover:text-white transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {isOpen && (
            <div className="lg:hidden pb-5 border-t border-slate-100 mt-1 max-h-[min(70vh,28rem)] overflow-y-auto">
              {navItems.map((item) => {
                const active = isItemActive(pathname, hash, item);
                const NavIcon = item.icon;

                return (
                  <div key={item.name}>
                    {!item.hasDropdown ? (
                      <Link
                        href={item.href}
                        className={`flex w-full items-center gap-3 border-b border-slate-50 py-3.5 px-1 font-medium transition-all ${
                          active ? 'text-brand-teal' : 'text-brand-navy hover:text-brand-teal'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <NavIcon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                        {item.name}
                      </Link>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                          className={`flex w-full items-center justify-between gap-2 border-b border-slate-50 py-3.5 px-1 font-medium transition-all ${
                            active ? 'text-brand-teal' : 'text-brand-navy hover:text-brand-teal'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <NavIcon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                            {item.name}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`shrink-0 transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {item.dropdownItems && activeDropdown === item.name && (
                          <div className="bg-slate-50/90 py-1 rounded-lg mb-1">
                            {item.dropdownItems.map((dropdownItem, index) => {
                              const IconComponent = dropdownItem.icon;
                              return (
                                <Link
                                  key={index}
                                  href={dropdownItem.href}
                                  className="flex items-center gap-3 px-5 py-2.5 text-sm text-brand-navy hover:text-brand-teal hover:bg-white transition-all rounded-md mx-1"
                                  onClick={() => setIsOpen(false)}
                                >
                                  <IconComponent size={17} className="text-brand-teal shrink-0" />
                                  <span>{dropdownItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              <div className="mt-4 flex flex-col gap-2.5">
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-brand-navy transition hover:border-brand-teal hover:text-brand-teal"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} strokeWidth={2} aria-hidden />
                  Dashboard
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-brand-navy bg-white text-sm font-semibold text-brand-navy transition hover:bg-brand-navy hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn size={18} strokeWidth={2.25} aria-hidden />
                  Sign In
                </Link>
                <Link
                  href="/get-certificate"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-teal text-sm font-semibold text-white shadow-lg shadow-brand-teal/30 hover:bg-brand-teal-hover"
                  onClick={() => setIsOpen(false)}
                >
                  <Award size={18} strokeWidth={2.25} aria-hidden />
                  Get Certificate
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
