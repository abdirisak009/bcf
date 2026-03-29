export type ContentCard = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime?: string;
  /** Cover image for hub cards (from CMS). */
  featuredImageUrl?: string;
  /** Link to full article (CMS posts with UUID ids). */
  href?: string;
};

export const publications: ContentCard[] = [
  {
    id: 'p1',
    title: 'Governance & Public Sector Reform Outlook 2025',
    excerpt:
      'An analytical overview of institutional strengthening priorities, anti-corruption frameworks, and delivery models for public entities in the Horn of Africa.',
    category: 'Research Report',
    date: 'Jan 2025',
    readTime: '24 min read',
  },
  {
    id: 'p2',
    title: 'Monitoring & Evaluation Standards for Development Programs',
    excerpt:
      'Practical guidance on results frameworks, outcome indicators, and third-party verification aligned with international best practice.',
    category: 'Methodology Brief',
    date: 'Nov 2024',
    readTime: '18 min read',
  },
  {
    id: 'p3',
    title: 'Climate Resilience & Environmental Compliance',
    excerpt:
      'Key considerations for ESG reporting, environmental impact assessment, and climate adaptation planning for enterprises and agencies.',
    category: 'Policy Note',
    date: 'Sep 2024',
    readTime: '12 min read',
  },
  {
    id: 'p4',
    title: 'Tax & Financial Management in Emerging Markets',
    excerpt:
      'Insights on fiscal transparency, internal controls, and risk management for organizations operating across multiple jurisdictions.',
    category: 'Insight Paper',
    date: 'Jul 2024',
    readTime: '15 min read',
  },
  {
    id: 'p5',
    title: 'Human Capital & Leadership Development',
    excerpt:
      'Frameworks for competency mapping, executive coaching, and succession planning in high-growth institutions.',
    category: 'Practice Guide',
    date: 'May 2024',
    readTime: '20 min read',
  },
  {
    id: 'p6',
    title: 'Digital Transformation in Professional Services',
    excerpt:
      'How consulting firms leverage data analytics, secure collaboration, and client portals to scale quality delivery.',
    category: 'White Paper',
    date: 'Mar 2024',
    readTime: '16 min read',
  },
];

export const newsArticles: ContentCard[] = [
  {
    id: 'n1',
    title: 'Annual Consulting Summit 2025 — Save the date',
    excerpt:
      'Join leaders and practitioners for a full day of keynotes, workshops, and networking on innovation in consulting and public-sector delivery.',
    category: 'Events',
    date: 'Mar 15, 2025',
    readTime: '2 min read',
  },
  {
    id: 'n2',
    title: 'Expanded footprint across East Africa',
    excerpt:
      'Baraarug Consulting strengthens its regional presence to support more organizations with audit, M&E, and policy advisory.',
    category: 'Company',
    date: 'Feb 2, 2025',
    readTime: '3 min read',
  },
  {
    id: 'n3',
    title: 'New strategic partnership for capacity building',
    excerpt:
      'Collaboration with leading institutions to deliver blended training, executive education, and in-house programs.',
    category: 'Partnerships',
    date: 'Jan 18, 2025',
    readTime: '2 min read',
  },
  {
    id: 'n4',
    title: 'BCF Training Catalogue 2025 now available',
    excerpt:
      'Explore academies, course tracks, certification paths, and enrollment options for teams and individuals.',
    category: 'Training',
    date: 'Dec 8, 2024',
    readTime: '4 min read',
  },
  {
    id: 'n5',
    title: 'Somalia Economic Outlook — briefing notes',
    excerpt:
      'Short briefing on macro trends, sector opportunities, and risk factors for investors and development partners.',
    category: 'Insights',
    date: 'Nov 22, 2024',
    readTime: '6 min read',
  },
  {
    id: 'n6',
    title: 'Open enrollment: Policy & Governance intensive',
    excerpt:
      'Limited seats for our next public cohort — early registration recommended for teams and individuals.',
    category: 'Training',
    date: 'Oct 5, 2024',
    readTime: '2 min read',
  },
];
