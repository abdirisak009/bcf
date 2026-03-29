'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Linkedin, Twitter, Instagram, MapPin, Phone, Mail, Globe, ArrowRight } from 'lucide-react';
import { OFFICE_ADDRESS } from '@/lib/site-config';

export default function Footer() {
  return (
    <footer className="relative bg-brand-navy text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-brand-teal/10 blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-brand-teal/10 blur-3xl -ml-48 -mb-48"></div>

      <div className="relative z-10">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            {/* Brand section */}
            <div className="md:col-span-1">
              <div className="mb-6 group cursor-pointer">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-light-P0BU6tiM5ptby7QodAsAhFQEc478P5.png"
                  alt="Baraarug Logo"
                  className="h-16 w-auto transition-transform group-hover:scale-105"
                />
              </div>
              <p className="text-gray-300 leading-relaxed text-sm mb-6">
                Empowering organizations through innovative solutions and sustainable transformation.
              </p>
              {/* Social media icons */}
              <div className="flex gap-4">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Instagram, href: '#', label: 'Instagram' }
                ].map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={idx}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-teal flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                    >
                      <Icon size={18} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 w-8 h-1 bg-brand-teal rounded"></span>
              </h4>
              <ul className="space-y-3">
                {['Home', 'About Us', 'Services', 'Contacts'].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href="#"
                      className="text-gray-300 hover:text-brand-teal transition-all duration-300 inline-flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-brand-teal rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <h4 className="font-bold text-lg mb-6 relative inline-block">
                Our Services
                <span className="absolute bottom-0 left-0 w-8 h-1 bg-brand-teal rounded"></span>
              </h4>
              <ul className="space-y-3">
                {['Strategic Policy', 'Business Development', 'Research & Analysis', 'Education'].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href="#"
                      className="text-gray-300 hover:text-brand-teal transition-all duration-300 inline-flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-brand-teal rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-6 relative inline-block">
                Contact Us
                <span className="absolute bottom-0 left-0 w-8 h-1 bg-brand-teal rounded"></span>
              </h4>
              <ul className="space-y-4">
                <li className="flex gap-3 group">
                  <MapPin className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{OFFICE_ADDRESS}</span>
                </li>
                <li className="flex gap-3 group">
                  <Phone className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
                  <Link href="tel:+252613685943" className="text-gray-300 hover:text-brand-teal text-sm transition-colors">
                    +252-613-685-943
                  </Link>
                </li>
                <li className="flex gap-3 group">
                  <Mail className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
                  <Link href="mailto:info@bcf.so" className="text-gray-300 hover:text-brand-teal text-sm transition-colors">
                    info@bcf.so
                  </Link>
                </li>
                <li className="flex gap-3 group">
                  <Globe className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
                  <Link href="#" className="text-gray-300 hover:text-brand-teal text-sm transition-colors">
                    www.bcf.so
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-8 h-px bg-white/20"></div>

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-sm">
              © 2025 Baraarug Consulting Firm. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm">
              {['Privacy Policy', 'Terms of Services', 'Cookie Policy'].map((item, idx) => (
                <Link
                  key={idx}
                  href="#"
                  className="text-gray-400 hover:text-brand-teal transition-colors duration-300 inline-flex items-center gap-1 group"
                >
                  {item}
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll to top button area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-brand-teal hover:text-white transition-colors text-sm font-medium"
          >
            Back to top
            <ArrowRight size={16} className="rotate-90" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
