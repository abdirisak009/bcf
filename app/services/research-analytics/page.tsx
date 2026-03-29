'use client';

import ServicePageTemplate from '@/components/service-page-template';
import {
  Scale,
  Building2,
  CalendarDays,
  BarChart3,
  Users,
  ClipboardList,
  LineChart,
  FileText,
} from 'lucide-react';

const subServices = [
  {
    icon: BarChart3,
    title: 'Market Research & Analysis',
    description:
      'In-depth market analysis and research to inform strategic decision-making and identify opportunities for growth and development.',
  },
  {
    icon: Building2,
    title: 'Data Analytics & Insights',
    description:
      'Advanced data analysis and insights to drive evidence-based decision-making and strategy development for various sectors.',
  },
  {
    icon: CalendarDays,
    title: 'Impact Assessment & Evaluation',
    description:
      'Comprehensive evaluation of program effectiveness and impact measurement for informed decision-making and policy development.',
  },
  {
    icon: Scale,
    title: 'Policy Research & Analysis',
    description:
      'Thorough policy research and analysis to support evidence-based policy development and implementation strategies.',
  },
  {
    icon: Users,
    title: 'Socio-economic Studies',
    description:
      'Comprehensive socio-economic research and analysis to understand community dynamics and development needs.',
  },
  {
    icon: ClipboardList,
    title: 'Baseline Surveys & Assessments',
    description:
      'Baseline surveys and assessments to establish benchmarks and measure progress over time for projects and programs.',
  },
  {
    icon: LineChart,
    title: 'Statistical Analysis & Modeling',
    description:
      'Advanced statistical analysis and modeling techniques to provide robust insights and predictive analytics.',
  },
  {
    icon: FileText,
    title: 'Research Report Development',
    description:
      'Professional research report development and presentation to communicate findings effectively to stakeholders.',
  },
];

const keyAreaItems = [
  {
    icon: BarChart3,
    text: 'In-depth market analysis and research to inform strategic decision-making and identify opportunities for growth and development.',
  },
  {
    icon: Building2,
    text: 'Advanced data analysis and insights to drive evidence-based decision-making and strategy development for various sectors.',
  },
  {
    icon: CalendarDays,
    text: 'Comprehensive evaluation of program effectiveness and impact measurement for informed decision-making and policy development.',
  },
  {
    icon: Scale,
    text: 'Thorough policy research and analysis to support evidence-based policy development and implementation strategies.',
  },
  {
    icon: Users,
    text: 'Comprehensive socio-economic research and analysis to understand community dynamics and development needs.',
  },
  {
    icon: ClipboardList,
    text: 'Baseline surveys and assessments to establish benchmarks and measure progress over time for projects and programs.',
  },
  {
    icon: LineChart,
    text: 'Advanced statistical analysis and modeling techniques to provide robust insights and predictive analytics.',
  },
  {
    icon: FileText,
    text: 'Professional research report development and presentation to communicate findings effectively to stakeholders.',
  },
];

export default function ResearchAnalyticsPage() {
  return (
    <ServicePageTemplate
      heroTitle="Research & Analytics"
      heroSubtitle="Comprehensive research and analytics solutions to drive informed decision-making and strategic planning"
      introTitle="Data-Driven Research & Analytics Solutions"
      introBody="Our research and analytics services provide organizations with the tools, methods, and support needed to generate evidence, interpret trends, and make confident, data-driven decisions across programs and portfolios."
      subServices={subServices}
      keyAreaItems={keyAreaItems}
      keyAreaColumns={3}
      ctaTitle="Ready to Drive Data-Driven Decisions?"
      ctaBody="Let our research and analytics experts help you gain valuable insights and make informed strategic decisions."
    />
  );
}
