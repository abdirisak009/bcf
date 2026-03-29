'use client';

import ServicePageTemplate from '@/components/service-page-template';
import {
  LayoutDashboard,
  Target,
  ClipboardList,
  Monitor,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';

const subServices = [
  {
    icon: LayoutDashboard,
    title: 'M&E Systems Design',
    description:
      'Design and implementation of comprehensive Monitoring and Evaluation (M&E) systems for organizational effectiveness.',
  },
  {
    icon: Target,
    title: 'Results Frameworks',
    description:
      'Development of results frameworks, log frames, and performance indicators (KPIs) for strategic planning.',
  },
  {
    icon: ClipboardList,
    title: 'Project Evaluations',
    description:
      'Comprehensive baseline, mid-term, and final evaluations for projects and programs across sectors.',
  },
  {
    icon: Monitor,
    title: 'Digital Dashboards',
    description: 'Development of M&E tools and digital dashboards for real-time tracking and reporting.',
  },
  {
    icon: GraduationCap,
    title: 'Capacity Building',
    description:
      'Training and capacity building in M&E for staff and institutions to enhance organizational performance.',
  },
  {
    icon: RefreshCw,
    title: 'Adaptive Management',
    description: 'Learning, reporting, and adaptive management approaches for continuous improvement.',
  },
];

const keyAreaItems = [
  {
    icon: LayoutDashboard,
    text: 'Design and implementation of comprehensive Monitoring and Evaluation (M&E) systems for organizational effectiveness.',
  },
  {
    icon: Target,
    text: 'Development of results frameworks, log frames, and performance indicators (KPIs) for strategic planning.',
  },
  {
    icon: ClipboardList,
    text: 'Comprehensive baseline, mid-term, and final evaluations for projects and programs across sectors.',
  },
  {
    icon: Monitor,
    text: 'Development of M&E tools and digital dashboards for real-time tracking and reporting.',
  },
  {
    icon: GraduationCap,
    text: 'Training and capacity building in M&E for staff and institutions to enhance organizational performance.',
  },
  {
    icon: RefreshCw,
    text: 'Learning, reporting, and adaptive management approaches for continuous improvement.',
  },
];

export default function MonitoringEvaluationPage() {
  return (
    <ServicePageTemplate
      heroTitle="Monitoring & Evaluation"
      heroSubtitle="Design and implementation of comprehensive M&E systems with real-time tracking capabilities."
      introTitle="Comprehensive M&E Solutions"
      introBody="Our monitoring and evaluation services help you clarify results, track performance, and learn what works—so programs deliver measurable impact and accountability."
      subServices={subServices}
      keyAreaItems={keyAreaItems}
      keyAreaColumns={3}
      ctaTitle="Ready to Enhance Your M&E Systems?"
      ctaBody="Let&apos;s discuss how our monitoring and evaluation services can help you track progress, measure impact, and drive continuous improvement in your programs."
    />
  );
}
