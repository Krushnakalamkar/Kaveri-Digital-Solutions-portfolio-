export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: 'Code2' | 'BrainCircuit' | 'Palette' | 'BarChart3' | 'PenLine' | 'LifeBuoy' | 'Box';
  description: string;
  order: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  active: boolean;
  description: string;
  deliverables?: string[];
  order: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  coverImage: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  published: boolean;
  featured: boolean;
  challenge: string;
  approach: string;
  development: string;
  result: string;
  createdAt: string;
}

export interface SkillItem {
  id: string;
  name: string;
  active: boolean;
  order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  service?: string;
  projectType?: string;
  message: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface VisitorIntakeEntry {
  id: string;
  name: string;
  age: number;
  state: string;
  stateOrUt: string;
  date: string;
  time: string;
  consent: boolean;
  submissionId: string;
  submittedAt: string; // Formatted in Asia/Kolkata
  isoTimestamp: string;
  syncedToSheet?: boolean;
}

export interface ProfileData {
  name: string;
  firstName: string;
  title: string;
  subtitleRole: string;
  experience: string;
  location: string;
  biography: string;
  primaryEmail: string;
  businessEmail: string;
  phone: string;
  instagramUrl: string;
  linkedinUrl: string;
  portraitUrl: string;
}

export interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  phone: string;
  instagramUrl: string;
  linkedinUrl: string;
  logoUrl: string;
  footerLightLogoUrl: string;
  footerDarkLogoUrl: string;
  resumePdfDataUrl: string;
  resumeFileName: string;
  googleSheetId: string;
  googleSheetName: string;
  googleSheetRange: string;
  googleAppsScriptWebhookUrl: string;
}

export interface CMSDatabase {
  profile: ProfileData;
  settings: SiteSettings;
  categories: ServiceCategory[];
  services: ServiceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  messages: ContactMessage[];
  visitorEntries: VisitorIntakeEntry[];
}

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const INDIAN_UNION_TERRITORIES: string[] = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const BUDGET_OPTIONS: string[] = [
  'Not sure yet',
  'Under 25,000 INR',
  '25,000 – 75,000 INR',
  '75,000 – 2,00,000 INR',
  'Above 2,00,000 INR',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const SEED_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-web-technology',
    name: 'Web & Technology',
    slug: 'web-technology',
    icon: 'Code2',
    description: 'Websites, software, apps and technology support.',
    order: 1,
  },
  {
    id: 'cat-ai-digital',
    name: 'AI & Digital',
    slug: 'ai-digital',
    icon: 'BrainCircuit',
    description: 'Practical AI, marketing and digital growth services.',
    order: 2,
  },
  {
    id: 'cat-creative',
    name: 'Creative',
    slug: 'creative',
    icon: 'Palette',
    description: 'Visual design, editing and creative digital content.',
    order: 3,
  },
  {
    id: 'cat-data-office',
    name: 'Data & Office',
    slug: 'data-office',
    icon: 'BarChart3',
    description: 'Structured data, documents and presentation support.',
    order: 4,
  },
  {
    id: 'cat-content',
    name: 'Content',
    slug: 'content',
    icon: 'PenLine',
    description: 'Writing, transcription and language support.',
    order: 5,
  },
  {
    id: 'cat-digital-support',
    name: 'Digital Support',
    slug: 'digital-support',
    icon: 'LifeBuoy',
    description: 'Research, publishing and day-to-day digital assistance.',
    order: 6,
  },
  {
    id: 'cat-3d-services',
    name: '3D Services',
    slug: '3d-services',
    icon: 'Box',
    description: '3D modeling, product visualization, rendering, animation, CAD and AR/VR development.',
    order: 7,
  },
];

const rawServicesByCategory: Array<{ categoryId: string; names: string[] }> = [
  {
    categoryId: 'cat-web-technology',
    names: [
      'Website Development',
      'Web Design',
      'App Development',
      'Software Development',
      'WordPress Development',
      'UI/UX Design',
      'Website Bug Fixing',
      'Website Testing',
      'Website Security',
      'Database Management',
    ],
  },
  {
    categoryId: 'cat-ai-digital',
    names: [
      'AI Automation',
      'AI Content Creation',
      'SEO',
      'Digital Marketing',
      'Social Media Management',
      'Email Marketing',
      'E-commerce Store Setup',
    ],
  },
  {
    categoryId: 'cat-creative',
    names: [
      'Graphic Design',
      'Logo Design',
      'Photo Editing',
      'Video Editing',
      'Reels Editing',
      'Animation',
      'YouTube Thumbnail Design',
      'Social Media Design',
    ],
  },
  {
    categoryId: 'cat-data-office',
    names: [
      'Data Entry',
      'Excel Formatting',
      'PDF to Word',
      'PDF Formatting',
      'PowerPoint Presentation',
      'Copy-Paste Work',
      'Document Formatting',
      'Resume Formatting',
    ],
  },
  {
    categoryId: 'cat-content',
    names: [
      'Content Writing',
      'Blog Writing',
      'Copywriting',
      'Caption Writing',
      'Transcription',
      'Translation',
    ],
  },
  {
    categoryId: 'cat-digital-support',
    names: [
      'Web Research',
      'Product Listing',
      'Email Management',
      'Website Content Update',
      'Social Media Scheduling',
      'Audio Cleanup',
      'Subtitle/Captions',
      'Image Resize/Compress',
    ],
  },
  {
    categoryId: 'cat-3d-services',
    names: [
      '3D Model Designing',
      '3D Product Visualization',
      '3D Advertisement Design',
      '3D Banner & Billboard Design',
      '3D Packaging Design',
      '3D Logo & Branding Design',
      '3D Motion Graphics & Animation',
      '3D Product Rendering',
      '3D CAD & Mechanical Engineering',
      '3D Architectural Design & Visualization',
      '3D Game Development',
      '3D Animation & Visual Effects (VFX)',
      '3D Fashion & Clothing Design',
      '3D Jewelry Design',
      '3D Printing & Prototyping',
      '3D Medical & Scientific Visualization',
      '3D Automotive Design & Visualization',
      '3D VR / AR & Metaverse Development',
    ],
  },
];

let globalOrder = 1;
export const SEED_SERVICES: ServiceItem[] = rawServicesByCategory.flatMap((group) =>
  group.names.map((name) => {
    const slug = slugify(name);
    const item: ServiceItem = {
      id: `srv-${slug}`,
      name,
      slug,
      categoryId: group.categoryId,
      active: true,
      description: `${name} for individuals, startups and businesses.`,
      order: globalOrder++,
    };
    return item;
  })
);

export const DEFAULT_PORTRAIT_URL = '/images/krushna-kalamkar.png';
export const DEFAULT_EMBLEM_URL = '/images/kaveri-logo.png';
export const DEFAULT_FOOTER_DARK_URL = '/images/kaveri-footer-dark.png';
export const DEFAULT_FOOTER_LIGHT_URL = '/images/kaveri-footer-light.png';
export const DEFAULT_ICON_URL = '/images/kaveri-icon.png';

export const SEED_PROFILE: ProfileData = {
  name: 'Krushna Kalamkar',
  firstName: 'Krushna',
  title: 'Founder of KAVERI DIGITAL SOLUTIONS',
  subtitleRole: 'Developer & AI Engineer',
  experience: '3+ years',
  location: 'Maharashtra, India',
  biography:
    "I'm Krushna Kalamkar, Founder of KAVERI DIGITAL SOLUTIONS. I am a Developer & AI Engineer with 3+ years of experience working with digital technologies and creative solutions. I help individuals, startups and businesses turn ideas into functional, modern and professional digital experiences.",
  primaryEmail: 'kalamkarkrushna007@gmail.com',
  businessEmail: 'icondigital.pvt.ltd@gmail.com',
  phone: '+91 7620702591',
  instagramUrl: 'https://www.instagram.com/krushna_kalamkar_007/',
  linkedinUrl: 'https://www.linkedin.com/in/krushna-kalamkar-416895328/',
  portraitUrl: DEFAULT_PORTRAIT_URL,
};

export const GOOGLE_SPREADSHEET_ID = '1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg';
export const GOOGLE_SHEET_NAME = 'Sheet1';
export const GOOGLE_SHEET_RANGE = "'Sheet1'!A:G";
export const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg/edit';

export const SEED_SETTINGS: SiteSettings = {
  siteTitle: 'KAVERI DIGITAL SOLUTIONS',
  metaDescription:
    'KAVERI DIGITAL SOLUTIONS, founded by Krushna Kalamkar, offers web development, AI solutions, creative services and digital support.',
  phone: '+91 7620702591',
  instagramUrl: 'https://www.instagram.com/krushna_kalamkar_007/',
  linkedinUrl: 'https://www.linkedin.com/in/krushna-kalamkar-416895328/',
  logoUrl: DEFAULT_EMBLEM_URL,
  footerLightLogoUrl: DEFAULT_FOOTER_LIGHT_URL,
  footerDarkLogoUrl: DEFAULT_FOOTER_DARK_URL,
  resumePdfDataUrl: '',
  resumeFileName: 'Krushna-Kalamkar-Resume.html',
  googleSheetId: GOOGLE_SPREADSHEET_ID,
  googleSheetName: GOOGLE_SHEET_NAME,
  googleSheetRange: GOOGLE_SHEET_RANGE,
  googleAppsScriptWebhookUrl: '',
};

export const SEED_SKILLS: SkillItem[] = [
  { id: 'sk-1', name: 'Full-Stack Web Development', active: true, order: 1 },
  { id: 'sk-2', name: 'React, Next.js & TypeScript', active: true, order: 2 },
  { id: 'sk-3', name: 'AI Engineering & Workflow Automation', active: true, order: 3 },
  { id: 'sk-4', name: 'UI/UX Design & Design Systems', active: true, order: 4 },
  { id: 'sk-5', name: 'WordPress & E-Commerce Architecture', active: true, order: 5 },
  { id: 'sk-6', name: 'Database Design & API Integration', active: true, order: 6 },
  { id: 'sk-7', name: 'SEO & Digital Growth Strategy', active: true, order: 7 },
  { id: 'sk-8', name: 'Brand Identity & Video Production', active: true, order: 8 },
];

export const SEED_PROJECTS: ProjectItem[] = [];

export const INITIAL_CMS_DATABASE: CMSDatabase = {
  profile: SEED_PROFILE,
  settings: SEED_SETTINGS,
  categories: SEED_CATEGORIES,
  services: SEED_SERVICES,
  projects: SEED_PROJECTS,
  skills: SEED_SKILLS,
  messages: [
    {
      id: 'msg-seed-1',
      name: 'Aarav Deshmukh',
      email: 'aarav.deshmukh@example.com',
      phone: '+91 9823011223',
      budget: '75,000 – 2,00,000 INR',
      service: 'Website Development',
      projectType: 'New Business Website & SEO',
      message:
        'Hello Krushna, we are launching a specialty manufacturing firm in Pune and need a modern corporate website along with ongoing SEO and digital support. Would love to discuss timelines.',
      read: false,
      createdAt: '04 Nov 2026, 04:15 pm IST',
    },
  ],
  visitorEntries: [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Rohit Kulkarni',
      age: 28,
      state: 'Maharashtra',
      stateOrUt: 'Maharashtra',
      date: '04/11/2026',
      time: '06:30:12 PM IST',
      consent: true,
      submissionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      submittedAt: '04/11/2026, 06:30:12 PM IST',
      isoTimestamp: '2026-11-04T13:00:12.000Z',
      syncedToSheet: true,
    },
  ],
};

export function formatIndiaDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${map.day}/${map.month}/${map.year}`;
}

export function formatIndiaTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
    .format(date)
    .toUpperCase();
}

export function generateSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatIndiaDateTime(date: Date = new Date()): string {
  return `${formatIndiaDate(date)}, ${formatIndiaTime(date)}`;
}
