'use client';

import ServicePageTemplate from '@/components/service-page-template';
import { Scale, Building2, CalendarDays, ClipboardCheck, Calculator, HandCoins, BookMarked } from 'lucide-react';

const subServices = [
  {
    icon: Scale,
    title: 'Tax Compliance Advisory',
    description:
      'Comprehensive tax compliance advisory and tax return support for businesses and individuals.',
  },
  {
    icon: Building2,
    title: 'Accounting Systems',
    description: 'Accounting systems setup and financial reporting for organizational efficiency.',
  },
  {
    icon: CalendarDays,
    title: 'Grants Management',
    description: 'Grants and donor fund management for development projects and organizations.',
  },
  {
    icon: Scale,
    title: 'Bookkeeping Services',
    description: 'Bookkeeping and pre-audit services for financial transparency and compliance.',
  },
];

const keyAreaItems = [
  {
    icon: ClipboardCheck,
    text: 'Tax compliance advisory and tax return support.',
  },
  {
    icon: Calculator,
    text: 'Accounting systems setup and financial reporting.',
  },
  {
    icon: HandCoins,
    text: 'Grants and donor fund management.',
  },
  {
    icon: BookMarked,
    text: 'Bookkeeping and pre-audit services.',
  },
];

export default function TaxFinancialPage() {
  return (
    <ServicePageTemplate
      heroTitle="Tax & Financial Management"
      heroSubtitle="Tax compliance advisory, accounting systems, and comprehensive financial management services"
      introTitle="Comprehensive Financial Solutions"
      introBody="We deliver expert guidance on tax compliance, sound accounting practices, and financial management—helping you meet obligations, strengthen controls, and maintain fiscal responsibility."
      subServices={subServices}
      keyAreaItems={keyAreaItems}
      keyAreaColumns={2}
      ctaTitle="Ready to Optimize Your Financial Management?"
      ctaBody="Let&apos;s discuss how our tax and financial management services can help you ensure compliance, optimize operations, and achieve financial stability."
    />
  );
}
