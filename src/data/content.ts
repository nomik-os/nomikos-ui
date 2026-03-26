// ─── Stats ──────────────────────────────────────────────────────────────────
export const HERO_STATS = [
  { num: '60–70%', label: 'of filings face\nregistry defects' },
  { num: '15K+', label: 'pending matters\nin NCLT alone' },
  { num: '700+', label: 'hours lost per\nfirm, annually' },
  { num: '25d', label: 'average delay on\nrejected filing' },
];

export const PROBLEM_STATS = [
  { num: '60–70%', title: 'Filings face registry defects', sub: 'Across NCLT, NCLAT, HC & SC' },
  { num: '~15K', title: 'Pending matters in NCLT alone', sub: 'Each requiring perfect compliance' },
  { num: '12–15h', title: 'Lost per defective filing', sub: 'Rework, refiling, correspondence' },
  {
    num: '700+',
    title: 'Hours lost per firm, per year',
    sub: '4+ defectives/month × 60 hrs = 720 hrs/yr',
  },
];

// ─── Products ────────────────────────────────────────────────────────────────
export type TagVariant = 'live' | 'soon' | 'later';

export interface Product {
  tag: string;
  tagVariant: TagVariant;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

export const PRODUCTS: Product[] = [
  {
    tag: 'Live Now',
    tagVariant: 'live',
    icon: '📄',
    title: 'Transcribe Assist',
    description:
      'AI-powered OCR that extracts and structures handwritten and printed legal documents with professional-grade accuracy.',
    features: [
      'Handwritten & printed OCR',
      'Preserves formatting & structure',
      'PNG, JPG, PDF support (up to 20MB)',
      'Instant .txt export',
    ],
  },
  {
    tag: 'Coming Q3 2025',
    tagVariant: 'soon',
    icon: '⚖️',
    title: 'Vetting Assist',
    description:
      'Forum-specific pre-filing validation engine. Checks your draft against NCLT, NCLAT, SC, and HC registry rules before submission.',
    features: [
      'Forum & bench-specific rules',
      'Defect flagging in track-mode',
      'Companies Act, IBC, Competition Act',
      'Pre-submission compliance score',
    ],
  },
  {
    tag: 'Coming Q4 2025',
    tagVariant: 'soon',
    icon: '✏️',
    title: 'Draft Assist',
    description:
      'Intelligent legal document drafting with court-aware templates, AI clause suggestions, and compliance checking built in.',
    features: [
      'Forum-specific templates',
      'AI-powered clause suggestions',
      'Legal compliance checking',
      'Version control',
    ],
  },
  {
    tag: 'Coming 2026',
    tagVariant: 'later',
    icon: '📁',
    title: 'Filing Assist',
    description:
      'End-to-end automated court filing with deadline tracking, filing requirement validation, and electronic submission management.',
    features: [
      'Automated court submissions',
      'Deadline tracking & alerts',
      'Filing requirement validation',
      'Multi-forum management',
    ],
  },
];

// ─── How It Works ────────────────────────────────────────────────────────────
export const HOW_STEPS = [
  {
    num: '01',
    title: 'Select your forum & bench',
    body: 'Choose from Supreme Court, Delhi High Court, NCLAT, NCDRC, NCLT, or DRT. Each forum has its own rule engine.',
  },
  {
    num: '02',
    title: 'Specify the nature of filing',
    body: 'Appeal, Application, or Complete Appeal & Application. Select the relevant Act and applicable provision.',
  },
  {
    num: '03',
    title: 'Upload your draft',
    body: 'Upload your draft document along with any annexures, notes, or supporting materials. We handle all formats.',
  },
  {
    num: '04',
    title: 'Receive your vetting report',
    body: 'Get changes suggested in track mode — every defect identified, every fix suggested, before the registry sees it.',
  },
];

// ─── Audience ────────────────────────────────────────────────────────────────
export const AUDIENCE = [
  {
    icon: '⚖️',
    title: 'Advocates & Sole Practitioners',
    role: 'Solo & Small Firms',
    body: "You can't afford a full-time compliance clerk. Nomikos is your filing intelligence layer — always on, always current.",
    features: [
      'No clerk dependency for procedural rules',
      'Instant forum-specific validation',
      'Spend time on law, not paperwork',
    ],
  },
  {
    icon: '🏛️',
    title: 'Law Firms & Chambers',
    role: 'Mid-Tier Law Firms',
    body: 'Filing 4–8 matters a month means 4+ defective filings. Each one costs 60 hours. Nomikos eliminates that loss at scale.',
    features: [
      'Standardise compliance across all associates',
      'Reduce defective filings to near-zero',
      'Save 700+ hours per year per firm',
    ],
  },
  {
    icon: '🏢',
    title: 'In-House Counsel & CAs',
    role: 'Non-Lawyers & Businesses',
    body: 'IPs, CAs, Company Secretaries navigating NCLT or IBC filings without dedicated litigation staff. Nomikos guides every step.',
    features: [
      'Guided filing workflows for non-litigators',
      'IBC, Companies Act, Competition Act coverage',
      'Reduces dependency on external counsel',
    ],
  },
];

// ─── Testimonials ────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    initials: 'AS',
    quote:
      'We file 6–7 NCLT matters a month. Even one defective filing costs us weeks. A tool that validates before submission would be transformative for our practice.',
    name: 'Adv. Anurag Sharma',
    role: 'Senior Advocate, Delhi High Court',
  },
  {
    initials: 'PR',
    quote:
      'The registry rules differ bench to bench — my juniors get it wrong constantly. This kind of intelligence layer should have existed five years ago.',
    name: 'Priya Rajagopalan',
    role: 'Partner, Litigation — Mumbai Law Chambers',
  },
  {
    initials: 'VK',
    quote:
      'As an IP handling IBC filings, navigating NCLT rules without a litigation team is genuinely painful. This would completely change how we manage insolvency proceedings.',
    name: 'Vikram Khurana',
    role: 'Insolvency Professional, New Delhi',
  },
];

// ─── Pricing ─────────────────────────────────────────────────────────────────
export interface PricingPlan {
  tier: string;
  amount: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export const PRICING: PricingPlan[] = [
  {
    tier: 'Pay As You Go',
    amount: '₹499',
    period: '/ filing',
    desc: 'Full vetting, no commitment.',
    features: [
      'Full vetting for one matter',
      'Forum-specific rule check',
      'Defect report in track mode',
      'Transcribe Assist access',
      'Email support',
    ],
    cta: 'Get Started',
  },
  {
    tier: 'Professional',
    amount: '₹4,999',
    period: '/ month',
    desc: 'Billed annually. Unlimited filings.',
    features: [
      'Unlimited filings per month',
      'All forum & bench coverage',
      'Priority vetting (2hr turnaround)',
      'Draft Assist early access',
      'Dedicated support',
      'Usage analytics dashboard',
    ],
    cta: 'Login/signup',
    featured: true,
  },
  {
    tier: 'Enterprise',
    amount: 'Custom',
    period: '',
    desc: 'For law firms & institutions.',
    features: [
      'Multi-user firm access',
      'White-label option',
      'Custom forum rule integration',
      'API access',
      'SLA guarantee',
      'Dedicated account manager',
    ],
    cta: 'Contact Us',
  },
];

// ─── Nav links ────────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'The Problem', href: '#problem' },
  { label: 'Products', href: '#suite' },
  { label: 'How It Works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
];
