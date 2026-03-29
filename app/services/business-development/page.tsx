'use client';

import ServicePageTemplate from '@/components/service-page-template';
import {
  Briefcase,
  TrendingUp,
  Store,
  Building2,
  Link2,
  HeartHandshake,
  Globe,
  Lightbulb,
} from 'lucide-react';

const subServices = [
  {
    icon: Briefcase,
    title: 'Tailored BDS Solutions',
    description:
      'Designed and delivered tailored Business Development Services (BDS) for micro, medium, and corporate-level enterprises.',
  },
  {
    icon: TrendingUp,
    title: 'Investment Readiness',
    description:
      'Strengthening investment readiness in financial, managerial, and market aspects for sustainable growth.',
  },
  {
    icon: Store,
    title: 'Micro-Enterprise Support',
    description:
      'Supporting micro-enterprises with foundational financial literacy, business planning, and market linkages.',
  },
  {
    icon: Building2,
    title: 'Medium Business Programs',
    description:
      'Developed capacity-building programs for medium-sized businesses focused on strategic planning and operational efficiency.',
  },
  {
    icon: Link2,
    title: 'Capital Access',
    description:
      'Bridged gaps between supply and demand sides of capital by aligning business needs with investor criteria.',
  },
  {
    icon: HeartHandshake,
    title: 'Inclusive Finance',
    description:
      'Promoted inclusive access to finance for underserved businesses, specifically women and youth-led enterprises.',
  },
  {
    icon: Globe,
    title: 'Market Linkage',
    description: 'Market linkage and access to finance facilitation to accelerate business growth.',
  },
  {
    icon: Lightbulb,
    title: 'Entrepreneur Mentoring',
    description: 'Mentoring and coaching for entrepreneurs to refine their business strategies.',
  },
];

const keyAreaItems = [
  {
    icon: Briefcase,
    text: 'Designed and delivered tailored Business Development Services (BDS) for micro, medium, and corporate-level enterprises to strengthen investment readiness in financial, managerial, and market aspects.',
  },
  {
    icon: Store,
    text: 'Supporting micro-enterprises with foundational financial literacy, business planning, and market linkages strategies to enable sustainable growth and access to seed funding.',
  },
  {
    icon: Building2,
    text: 'Developed capacity-building programs for medium-sized businesses focused on strategic planning, operational efficiency, and investment packaging to attract financing from banks and investors.',
  },
  {
    icon: Link2,
    text: 'Bridged gaps between the supply and demand sides of capital by aligning business needs with the investment criteria of donors, banks, and private sector actors.',
  },
  {
    icon: HeartHandshake,
    text: 'Promoted inclusive access to finance by equipping underserved businesses—especially women and youth-led enterprises—with practical tools and mentorship for scaling.',
  },
  {
    icon: Globe,
    text: 'Market linkage and access to finance facilitation.',
  },
  {
    icon: Lightbulb,
    text: 'Mentoring and coaching for entrepreneurs.',
  },
];

export default function BusinessDevelopmentPage() {
  return (
    <ServicePageTemplate
      heroTitle="Business & Development Services"
      heroSubtitle="Strategic business growth initiatives and comprehensive project management across development sectors"
      introTitle="Comprehensive Business Growth Solutions"
      introBody="Our business development services provide organizations with the tools, strategies, and support needed to achieve sustainable growth and access to finance across all business levels."
      subServices={subServices}
      keyAreaItems={keyAreaItems}
      keyAreaColumns={2}
      ctaTitle="Ready to Accelerate Your Business Growth?"
      ctaBody="Let&apos;s discuss how our business development services can help your organization achieve sustainable growth and access to finance."
    />
  );
}
