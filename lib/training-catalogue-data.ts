import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  LineChart,
  Wallet,
  Megaphone,
  Crown,
  Users,
  UsersRound,
  Cpu,
  Award,
  HeartHandshake,
  HandCoins,
} from 'lucide-react';

export type TrainingCourse = {
  code: string;
  title: string;
  duration: string;
  format: string;
  level: string;
  summary: string;
};

export type TrainingAcademy = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  courses: TrainingCourse[];
};

export const trainingEdition = '2024–2025';

export const trainingTagline =
  'Empowering Institutions · Strengthening Leadership · Driving Sustainable Growth';

export const trainingPhilosophy = {
  intro:
    "BCF's training division applies an immersive, practice-oriented learning methodology that bridges theory and real-world application. Every program is structured around four pillars: conceptual grounding in evidence-based frameworks, case analysis of sector-relevant scenarios, simulation and skills application, and participant implementation planning within their own organizational contexts.",
  peerLearning:
    'Collaborative peer learning, group problem-solving, and professional networking are embedded into every program. Post-training coaching, follow-up support, and digital certification are available to ensure learning translates into measurable institutional performance improvement.',
  pillars: [
    'Evidence-based conceptual grounding',
    'Sector-relevant case analysis',
    'Simulation & skills application',
    'Implementation planning in your context',
  ],
};

export const programFormats = [
  { label: 'Formats', value: 'In-person workshops · Virtual instructor-led · Blended · Executive retreats' },
  { label: 'Duration', value: '1-day intensive · 3-day workshop · 5-day comprehensive · Custom programs' },
  { label: 'Languages', value: 'English · Somali (selected programs)' },
  { label: 'Certification', value: 'BCF Certificate of Completion · Verified digital credentials' },
  { label: 'Schedule', value: 'Saturday – Thursday, 08:00 – 17:00 · Open & in-house enrollment' },
];

export const whoWeServe = [
  {
    title: 'Government Institutions',
    text: 'Ministries, regulatory bodies, local government, and public agencies seeking governance, fiscal, and policy capacity.',
  },
  {
    title: 'Financial Organizations',
    text: 'Commercial banks, microfinance institutions, development finance bodies, and insurance firms.',
  },
  {
    title: 'SMEs & Private Sector',
    text: 'Enterprises and startups seeking growth, operational improvement, and market competitiveness.',
  },
  {
    title: 'Universities & Research',
    text: 'Academic institutions and think tanks building analytical capacity in economics, research, and policy.',
  },
  {
    title: 'Development Partners & NGOs',
    text: 'International organizations, donors, and NGOs requiring M&E, project management, and governance programs.',
  },
  {
    title: 'Emerging Leaders & Graduates',
    text: 'Young professionals and graduates building career-readiness and professional competencies.',
  },
  {
    title: 'Women Professionals',
    text: 'Women in public and private sectors seeking leadership, financial literacy, and entrepreneurship programs.',
  },
];

export const academies: TrainingAcademy[] = [
  {
    id: 'business',
    name: 'Business Academy',
    icon: Briefcase,
    description:
      'Prepares professionals and organizations to navigate competitive markets, drive innovation, and build resilient operations. Programs span strategic planning, transformation, process improvement, supply chain management, and entrepreneurship.',
    courses: [
      {
        code: '1.1',
        title: 'Strategic Business Planning and Execution',
        duration: '5 Days',
        format: 'Workshop / In-person',
        level: 'Intermediate – Advanced',
        summary:
          'Strategic planning competencies to set direction, allocate resources, and drive execution—environment analysis, objectives, competitive strategy, execution, KPIs, and adaptive review.',
      },
      {
        code: '1.2',
        title: 'Business Transformation and Innovation',
        duration: '5 Days',
        format: 'Workshop / Blended',
        level: 'Senior Managers & Executives',
        summary:
          'Frameworks for leading complex transformations, digital change, and innovation—drivers, digital architecture, agile experimentation, business model redesign, change management, and governance.',
      },
      {
        code: '1.3',
        title: 'Business Process Improvement',
        duration: '4 Days',
        format: 'Workshop / In-person',
        level: 'Operations & Mid-Level Managers',
        summary:
          'Identify inefficiencies, redesign workflows, and build continuous improvement cultures using Lean and Six Sigma—mapping, DMAIC, automation, productivity, and implementation roadmaps.',
      },
      {
        code: '1.4',
        title: 'Value Chain and Operations Management',
        duration: '4 Days',
        format: 'Workshop / In-person',
        level: 'Operations & Supply Chain Professionals',
        summary:
          'Value chain analysis and supply chain strategy—Porter’s value chain, inventory, procurement, logistics, cost management, risk, and performance metrics.',
      },
      {
        code: '1.5',
        title: 'Entrepreneurship and Startup Management',
        duration: '5 Days',
        format: 'Bootcamp',
        level: 'Entrepreneurs & SME Leaders',
        summary:
          'Launch and grow ventures—opportunity validation, business models, financing, scaling, risk, and exit strategies.',
      },
    ],
  },
  {
    id: 'economics',
    name: 'Economics Academy',
    icon: LineChart,
    description:
      'Builds analytical capacity for evidence-based policy design, fiscal management, and economic governance for government economists, policy analysts, and development professionals.',
    courses: [
      {
        code: '2.1',
        title: 'Applied Economic Policy Analysis',
        duration: '5 Days',
        format: 'Workshop / In-person',
        level: 'Policy Analysts & Economists',
        summary:
          'Design, analyze, and evaluate economic policies—institutional economics, data-driven policy, impact evaluation, cost-benefit, behavioral insights, and stakeholder communication.',
      },
      {
        code: '2.2',
        title: 'Public Sector Economics and Fiscal Management',
        duration: '5 Days',
        format: 'Workshop / In-person',
        level: 'Public Finance Officials & Budget Directors',
        summary:
          'Government finance, revenue mobilization, tax policy, MTEF and program budgeting, fiscal risk and debt sustainability, expenditure efficiency, and fiscal reform.',
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finance Academy',
    icon: Wallet,
    description:
      'Professional finance education for financial managers, CFOs, analysts, and governance professionals—strategic financial management, analysis, risk, and oversight.',
    courses: [
      {
        code: '3.1',
        title: 'Strategic Financial Management',
        duration: '5 Days',
        format: 'Executive Workshop',
        level: 'CFOs, Finance Directors & Senior Managers',
        summary:
          'Align financial strategy with objectives—value creation, capital structure, investment appraisal, risk management, governance, and strategic performance.',
      },
      {
        code: '3.2',
        title: 'Financial Analysis, Planning and Control',
        duration: '4 Days',
        format: 'Workshop / In-person',
        level: 'Financial Analysts & Planning Professionals',
        summary:
          'Interpret financial statements, build models, forecasting and scenarios, and management control systems for executive decisions.',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales Academy',
    icon: Megaphone,
    description:
      'Strategies and tools to build brands, engage customers, and drive revenue—from market analysis through acquisition, retention, and optimization.',
    courses: [
      {
        code: '4.1',
        title: 'Strategic Marketing Planning',
        duration: '5 Days',
        format: 'Workshop / Blended',
        level: 'Marketing Managers & Brand Strategists',
        summary:
          'Market segmentation, brand positioning, marketing mix, budgeting, analytics, and campaign evaluation.',
      },
      {
        code: '4.2',
        title: 'Sales Management and Revenue Growth',
        duration: '4 Days',
        format: 'Workshop / In-person',
        level: 'Sales Managers & Revenue Leaders',
        summary:
          'Sales funnel and pipeline, territories, forecasting, CRM, performance KPIs, and continuous improvement in sales organizations.',
      },
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership Academy',
    icon: Crown,
    description:
      'Adaptive, transformational, and strategic leadership for government, private sector, and civil society—to inspire teams, drive change, and build resilient organizations.',
    courses: [
      {
        code: '5.1',
        title: 'Transformational Leadership',
        duration: '5 Days',
        format: 'Executive Retreat / Workshop',
        level: 'Senior Leaders & Executives',
        summary:
          "BCF's flagship leadership program—vision and alignment, change leadership, motivation and trust, innovation culture, 360° impact, and organizational resilience.",
      },
    ],
  },
];

export type AdditionalProgram = {
  /** URL segment for /training/apply/additional/[slug] */
  slug: string;
  title: string;
  target: string;
  description: string;
  outcomes: string[];
  icon: LucideIcon;
};

/** e.g. 1.1 → 1-1 for clean URLs */
export function courseCodeToUrlParam(code: string): string {
  return code.replace(/\./g, '-');
}

export function urlParamToCourseCode(param: string): string {
  const m = param.match(/^(\d+)-(\d+)$/);
  if (m) return `${m[1]}.${m[2]}`;
  return param;
}

export function getTrainingApplyPathForCourse(academyId: string, courseCode: string): string {
  return `/training/apply/${academyId}/${courseCodeToUrlParam(courseCode)}`;
}

export function getTrainingApplyPathForAdditional(slug: string): string {
  return `/training/apply/additional/${slug}`;
}

export function getAcademyCourse(
  academyId: string,
  courseParam: string
): { academy: TrainingAcademy; course: TrainingCourse } | null {
  const code = urlParamToCourseCode(courseParam);
  const academy = academies.find((a) => a.id === academyId);
  if (!academy) return null;
  const course = academy.courses.find((c) => c.code === code);
  if (!course) return null;
  return { academy, course };
}

export const additionalPrograms: AdditionalProgram[] = [
  {
    slug: 'womens-leadership',
    title: "Women's Leadership Program",
    target: 'Emerging & mid-career women professionals, CSO leaders, public servants',
    description:
      'Leadership, communication, and decision-making for public and private sector roles; gender-inclusive leadership, confidence, and civic leadership.',
    outcomes: [
      'Gender-inclusive leadership practices',
      'Confidence and public speaking',
      'Civic and organizational leadership',
      'Professional networks and peer support',
    ],
    icon: HeartHandshake,
  },
  {
    slug: 'team-building',
    title: 'Team Building & Capacity Development',
    target: 'SME teams, NGO staff, startup founders',
    description:
      'Collaboration, motivation, and productivity—team dynamics, communication, conflict resolution, and alignment with vision.',
    outcomes: [
      'Team dynamics and conflict resolution',
      'Communication and task ownership',
      'Alignment with vision and strategy',
      'High-performing collaborative teams',
    ],
    icon: UsersRound,
  },
  {
    slug: 'erp-systems-training',
    title: 'ERP Systems Training (Digital & Data Skills)',
    target: 'SMEs, graduates in business/IT, NGOs',
    description:
      'Hands-on ERP for finance, HR, inventory, and operations—data-driven decisions, transparency, and efficiency.',
    outcomes: [
      'ERP for core business functions',
      'Data-driven decision-making',
      'Efficiency through digitization',
      'Reduced manual processes',
    ],
    icon: Cpu,
  },
  {
    slug: 'career-employability',
    title: 'Career & Employability Skills',
    target: 'Fresh graduates, final-year students',
    description:
      'CV writing, interviews, digital literacy, and professional workplace etiquette.',
    outcomes: [
      'CVs and interview preparation',
      'Digital literacy',
      'Professional communication',
      'Job market and career planning',
    ],
    icon: Briefcase,
  },
  {
    slug: 'professional-certifications',
    title: 'Professional Certifications Preparation',
    target: 'Working professionals seeking advancement',
    description:
      'Preparation for PMP, PRINCE2, CPA, ACCA, M&E, and HRM essentials.',
    outcomes: [
      'PMP and PRINCE2 foundations',
      'CPA and ACCA foundations',
      'M&E and HRM competencies',
      'Personal certification pathway',
    ],
    icon: Award,
  },
  {
    slug: 'women-inclusion-financing',
    title: 'Women Inclusion Financing Program',
    target: 'Women entrepreneurs, rural groups, cooperatives',
    description:
      'Financial literacy and access to credit—savings, credit, investment, and links to microfinance.',
    outcomes: [
      'Navigate formal financial services',
      'Savings, credit, investment, debt',
      'Bankable business plans',
      'Microfinance and funding networks',
    ],
    icon: HandCoins,
  },
];

export const enrollmentOptions = [
  {
    title: 'Open Enrollment',
    text: 'Register individuals or groups in scheduled public programs—ideal for peer learning across organizations.',
  },
  {
    title: 'In-House Training',
    text: 'Custom programs for your organization; content and cases tailored to your institutional context.',
  },
  {
    title: 'Virtual / Blended',
    text: 'Live online instructor-led sessions with interactive content—accessible across geographies.',
  },
  {
    title: 'Executive Programs',
    text: 'Bespoke retreats and leadership journeys for senior teams and boards.',
  },
  {
    title: 'Consulting + Training',
    text: 'Programs integrated with BCF advisory engagements during strategic transformation.',
  },
  {
    title: 'Certification',
    text: 'BCF Certificate of Completion for all programs; verified digital credentials via the Certificate Portal.',
  },
];

export function getAdditionalProgramBySlug(slug: string): AdditionalProgram | null {
  return additionalPrograms.find((p) => p.slug === slug) ?? null;
}
