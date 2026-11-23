// ============================================================================
// PRODIL STUDIO - UNIFIED MASTER DATA CONTRACT (SINGLE SOURCE OF TRUTH)
// Menggabungkan kontrak 15 Template CV lama + Arsitektur Workspace AI Studio
// ============================================================================

export type TemplateId =
  | 'ats-classic'
  | 'ats-executive'
  | 'corporate-letterhead'
  | 'emerald-minimal'
  | 'ivy-league'
  | 'hospitality-warm'
  | 'luxury-gold'
  | 'dark-sidebar'
  | 'creative-visual'
  | 'editorial-split'
  | 'right-sidebar'
  | 'vertical-monolith'
  | 'signature-edition'
  | 'tech-terminal'
  | 'dark-badge';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  shortName: string;
  category: 'ATS' | 'Sidebar' | 'Editorial' | 'Executive' | 'Tech';
  hasPhoto: boolean;
  defaultAccent: string;
  previewBg: string;
  legacyId?: number; // Mapping kompatibilitas untuk 15 template lama (1-15)
}

export const CV_TEMPLATES: TemplateMeta[] = [
  { id: 'ats-classic', legacyId: 1, name: '1. ATS Classic Professional', shortName: 'ATS Classic', category: 'ATS', hasPhoto: true, defaultAccent: '#1E293B', previewBg: '#F8FAFC' },
  { id: 'ats-executive', legacyId: 2, name: '2. ATS Executive Clean', shortName: 'ATS Executive', category: 'ATS', hasPhoto: true, defaultAccent: '#2563EB', previewBg: '#EFF6FF' },
  { id: 'corporate-letterhead', legacyId: 3, name: '3. Corporate Letterhead (No Photo)', shortName: 'Letterhead', category: 'ATS', hasPhoto: false, defaultAccent: '#0F172A', previewBg: '#F1F5F9' },
  { id: 'emerald-minimal', legacyId: 4, name: '4. Emerald Corporate Minimal', shortName: 'Emerald Minimal', category: 'ATS', hasPhoto: true, defaultAccent: '#059669', previewBg: '#ECFDF5' },
  { id: 'ivy-league', legacyId: 5, name: '5. Ivy League Classic (No Photo)', shortName: 'Ivy League', category: 'Executive', hasPhoto: false, defaultAccent: '#881337', previewBg: '#FFF1F2' },
  { id: 'hospitality-warm', legacyId: 6, name: '6. Hospitality Warm Amber', shortName: 'Warm Amber', category: 'Sidebar', hasPhoto: true, defaultAccent: '#78350F', previewBg: '#FEF3C7' },
  { id: 'luxury-gold', legacyId: 7, name: '7. Luxury Gold (Center Photo)', shortName: 'Luxury Gold', category: 'Executive', hasPhoto: true, defaultAccent: '#B45309', previewBg: '#FFFBEB' },
  { id: 'dark-sidebar', legacyId: 8, name: '8. Dark Sidebar Split (Modern)', shortName: 'Dark Sidebar', category: 'Sidebar', hasPhoto: true, defaultAccent: '#1E293B', previewBg: '#E2E8F0' },
  { id: 'creative-visual', legacyId: 9, name: '9. Creative Visual (Round Photo)', shortName: 'Creative Visual', category: 'Sidebar', hasPhoto: true, defaultAccent: '#1E3A8A', previewBg: '#DBEAFE' },
  { id: 'editorial-split', legacyId: 10, name: '10. Editorial Split (No Photo)', shortName: 'Editorial Split', category: 'Editorial', hasPhoto: false, defaultAccent: '#0F766E', previewBg: '#CCFBF1' },
  { id: 'right-sidebar', legacyId: 11, name: '11. Right Sidebar Accent', shortName: 'Right Sidebar', category: 'Sidebar', hasPhoto: true, defaultAccent: '#172554', previewBg: '#E0E7FF' },
  { id: 'vertical-monolith', legacyId: 12, name: '12. Vertical Monolith (No Photo)', shortName: 'Vertical Monolith', category: 'Editorial', hasPhoto: false, defaultAccent: '#18181B', previewBg: '#F4F4F5' },
  { id: 'signature-edition', legacyId: 13, name: '13. Signature Edition (Gold/Black)', shortName: 'Signature Gold', category: 'Executive', hasPhoto: true, defaultAccent: '#CA8A04', previewBg: '#FEF9C3' },
  { id: 'tech-terminal', legacyId: 14, name: '14. Tech Terminal (No Photo)', shortName: 'Tech Terminal', category: 'Tech', hasPhoto: false, defaultAccent: '#0284C7', previewBg: '#E0F2FE' },
  { id: 'dark-badge', legacyId: 15, name: '15. Dark Badge Specialist (Square Photo)', shortName: 'Dark Badge', category: 'Tech', hasPhoto: true, defaultAccent: '#1E293B', previewBg: '#E2E8F0' },
];

export type SectionKey =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'achievements'
  | 'objective'
  | 'languages'
  | 'certifications';

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  projects: 'Projects & Works',
  education: 'Education',
  skills: 'Skills & Languages',
  achievements: 'Achievements',
  objective: 'Career Objective',
  languages: 'Languages',
  certifications: 'Certifications',
};

export type CustomSectionLayout = 'timeline' | 'credentials' | 'list';

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  periodOrYear: string;
  description: string;
  link?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  layoutType: CustomSectionLayout;
  visible: boolean;
  items: CustomSectionItem[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface PersonalData {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photoUrl: string;
  socials: SocialLink[];
}

export interface SummaryItem {
  id: string;
  label: string;
  text: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  period: string;
  description?: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  period: string;
  gpa?: string;
  achievements?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  role: string;
  clientOrBrand: string;
  client?: string;
  metrics: string;
  description: string;
  link?: string;
  thumbnailUrl?: string;
}

export interface LanguageItem {
  name: string;
  level: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
}

export interface MasterProfile {
  personal: PersonalData;
  hiddenFields: Record<string, boolean>;
  visibleSections: Record<SectionKey, boolean>;
  sectionOrder: SectionKey[];
  customSections: CustomSection[];
  summaries: SummaryItem[];
  experiences: ExperienceItem[];
  educations: EducationItem[];
  projectsAndWorks: ProjectItem[];
  skills: string[];
  languages: string[];
  languageDetails?: LanguageItem[];
  certifications?: CertificationItem[];
  achievements: string[];
  careerObjective: string;
}

export interface CVDocumentConfig {
  id: number | string;
  title: string;
  templateId: TemplateId;
  accentColor: string;
  fontFamily: string;
  fontSize?: 'compact' | 'normal' | 'spacious';
  showPhoto?: boolean;
  sectionOrder: SectionKey[];
  visibleSections: Record<SectionKey, boolean>;
  hiddenSections: SectionKey[];
  activeSummaryId: string;
  isDefault?: boolean;
}

export interface CoverLetterConfig {
  id: number | string;
  title: string;
  recipientName: string;
  recipientTitle?: string;
  companyName: string;
  companyAddress?: string;
  targetRole: string;
  date?: string;
  subject?: string;
  bodyText: string;
  templateAccent: string;
}

export interface ATSAnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}
