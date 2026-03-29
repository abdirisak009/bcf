'use client';

import ServicePageTemplate from '@/components/service-page-template';
import { Scale, Leaf, Map } from 'lucide-react';

const subServices = [
  {
    icon: Scale,
    title: 'Environmental Impact Assessments',
    description:
      'Comprehensive Environmental Impact Assessments (EIA) and environmental audits for sustainable development.',
  },
  {
    icon: Leaf,
    title: 'Climate Adaptation & Mitigation',
    description: 'Climate change adaptation and mitigation strategies for resilient communities and sectors.',
  },
  {
    icon: Map,
    title: 'Urban Resilience & Land Use',
    description: 'Urban resilience planning and sustainable land use for inclusive development.',
  },
];

const keyAreaItems = [
  {
    icon: Scale,
    text: 'Environmental Impact Assessments (EIAs) and environmental audits.',
  },
  {
    icon: Leaf,
    text: 'Climate change adaptation and mitigation strategies.',
  },
  {
    icon: Map,
    text: 'Urban resilience planning and sustainable land use.',
  },
];

export default function EnvironmentalClimatePage() {
  return (
    <ServicePageTemplate
      heroTitle="Environmental & Climate Change Consulting"
      heroSubtitle="Environmental assessments, climate change adaptation, and sustainable natural resource management"
      introTitle="Comprehensive Environmental Solutions"
      introBody="Our environmental and climate change consulting services provide organizations with sustainable solutions, impact assessments, and resilience strategies to address environmental challenges and promote sustainable development."
      subServices={subServices}
      keyAreaItems={keyAreaItems}
      keyAreaColumns={3}
      ctaTitle="Ready to Build a Sustainable Future?"
      ctaBody="Let&apos;s discuss how our environmental and climate change consulting services can help you implement sustainable solutions and build resilient communities."
    />
  );
}
