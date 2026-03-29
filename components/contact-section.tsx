'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { OFFICE_ADDRESS } from '@/lib/site-config';
import {
  Building2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Headphones,
} from 'lucide-react';
import { useState } from 'react';

const SUBJECTS = [
  'General inquiry',
  'Training & capacity building',
  'Audit & assurance',
  'Policy & governance',
  'Partnership / media',
  'Other',
];

type ContactSectionProps = {
  id?: string;
  className?: string;
  /** When true, used on home — slightly tighter top spacing */
  embedded?: boolean;
};

export function ContactSection({ id = 'contact', className, embedded = false }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        subject: SUBJECTS[0],
        message: '',
      });
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const infoItems = [
    {
      icon: MapPin,
      label: 'Visit',
      value: OFFICE_ADDRESS,
      href: undefined as string | undefined,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+252-613-685-943',
      href: 'tel:+252613685943',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@bcf.so',
      href: 'mailto:info@bcf.so',
    },
    {
      icon: Clock,
      label: 'Hours',
      value: 'Saturday – Thursday · 08:00 – 17:00',
      href: undefined,
    },
  ];

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden scroll-mt-28',
        embedded ? 'py-20 md:py-28' : 'pb-24 pt-2 md:pb-32 md:pt-4',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-brand-mint/30" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-brand-teal/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-brand-navy/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {embedded ? (
          <div className="mb-14 text-center md:mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-teal">Get in touch</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-brand-navy md:text-5xl">
              Let&apos;s start a conversation
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Tell us about your goals — our consultants respond within one business day.
            </p>
            <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-brand-teal" />
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Left panel */}
          <div className="lg:col-span-5">
            <div className="relative h-full overflow-hidden rounded-3xl bg-brand-navy p-8 text-white shadow-[0_28px_60px_-28px_color-mix(in_srgb,var(--brand-navy)_55%,transparent)] md:p-10">
              <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-brand-teal/20 blur-3xl" />

              <div className="relative">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#b8f0d0] backdrop-blur-sm">
                  <Headphones className="h-3.5 w-3.5" />
                  Baraarug Consulting Firm
                </div>
                <h3 className="text-2xl font-bold leading-tight md:text-3xl">
                  We&apos;re here to help you move forward
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/85 md:text-base">
                  From strategy and policy to audit, M&amp;E, and training — partner with a team that combines
                  regional insight with international standards.
                </p>

                <ul className="mt-10 space-y-4">
                  {infoItems.map((item) => {
                    const Icon = item.icon;
                    const inner = (
                      <>
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                          <Icon className="h-5 w-5 text-[#7ee0a8]" strokeWidth={2} />
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b8f0d0]/90">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-sm font-medium leading-snug text-white">{item.value}</p>
                        </div>
                      </>
                    );
                    return (
                      <li key={item.label}>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.1]"
                          >
                            {inner}
                          </a>
                        ) : (
                          <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                            {inner}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-10 rounded-2xl border border-brand-teal/30 bg-brand-teal/10 px-4 py-3 text-center text-sm text-[#d4f5e3]">
                  <span className="font-semibold text-white">Typical response:</span> within 24 hours on business
                  days
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_24px_60px_-32px_rgba(23,94,126,0.28)] md:p-10">
              <div className="mb-8 flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
                  <MessageSquare className="h-6 w-6" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-brand-navy md:text-2xl">Send a message</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Required fields are marked. We&apos;ll only use your details to respond to this inquiry.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                      First name <span className="text-brand-teal">*</span>
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-brand-teal/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                      Last name <span className="text-brand-teal">*</span>
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-brand-teal/30"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                      Work email <span className="text-brand-teal">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@organization.org"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-brand-teal/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+252 …"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-brand-teal/30"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                      Organization
                    </label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company or institution"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/80 pl-10 focus-visible:ring-brand-teal/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                      Topic <span className="text-brand-teal">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 shadow-xs outline-none transition focus-visible:border-brand-teal focus-visible:ring-[3px] focus-visible:ring-brand-teal/25"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                    How can we help? <span className="text-brand-teal">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your project, timeline, or question…"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-brand-teal focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-teal/25"
                  />
                </div>

                {status === 'success' ? (
                  <p className="rounded-xl bg-brand-teal/10 px-4 py-3 text-sm font-medium text-[#0d5c2e] ring-1 ring-brand-teal/25">
                    Thank you — your message was sent. We&apos;ll get back to you shortly.
                  </p>
                ) : null}
                {status === 'error' ? (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-200">
                    Something went wrong. Please email info@bcf.so directly or try again.
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={status === 'sending'}
                  className="h-12 w-full rounded-full bg-brand-teal text-base font-semibold text-white shadow-lg shadow-brand-teal/30 transition hover:bg-brand-teal-hover disabled:opacity-70 sm:w-auto sm:min-w-[200px]"
                >
                  {status === 'sending' ? (
                    'Sending…'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
