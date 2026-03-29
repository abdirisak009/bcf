'use client';

import ServicePageTemplate from '@/components/service-page-template';
import { BookMarked, School, Layers, Laptop, BookOpen, Users, GraduationCap, Monitor } from 'lucide-react';

const subServices = [
  {
    icon: BookMarked,
    title: 'Curriculum Development',
    description:
      'Comprehensive curriculum reform for educational institutions, aligned to standards and learning outcomes.',
  },
  {
    icon: School,
    title: 'School Improvement',
    description:
      'Strategic school improvement planning and comprehensive teacher training programs.',
  },
  {
    icon: Layers,
    title: 'Multi-Level Education',
    description:
      'Support for TVET, higher education, and basic education across all educational levels.',
  },
  {
    icon: Laptop,
    title: 'Digital Transformation',
    description:
      'Digital transformation and e-learning strategies for modern educational systems.',
  },
];

const keyAreaItems = [
  {
    icon: BookOpen,
    text: 'Curriculum development and education policy reform.',
  },
  {
    icon: Users,
    text: 'School improvement planning and teacher training.',
  },
  {
    icon: GraduationCap,
    text: 'Support for TVET, higher education, and basic education.',
  },
  {
    icon: Monitor,
    text: 'Digital transformation and e-learning strategies.',
  },
];

export default function EducationConsultancyPage() {
  return (
    <ServicePageTemplate
      heroEyebrow="Education & learning"
      heroVariant="immersive"
      heroTitle="Education & Consultancy"
      heroSubtitle="Comprehensive education reform and development services for academic institutions"
      introTitle="Comprehensive Education Solutions"
      introBody="Our education consultancy services provide academic institutions with strategic planning, curriculum development, and digital transformation solutions to enhance learning outcomes and institutional effectiveness."
      subServices={subServices}
      keyAreaItems={keyAreaItems}
      serviceGridColumns={2}
      keyAreaColumns={2}
      ctaTitle="Ready to Transform Your Educational Institution?"
      ctaBody="Let&apos;s discuss how our education consultancy services can help you enhance curriculum, improve teaching methods, and implement digital learning strategies."
    />
  );
}
