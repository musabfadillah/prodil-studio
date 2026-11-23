import type {
  CVDocumentConfig,
  CoverLetterConfig,
  MasterProfile as ProdilMasterProfile,
  PersonalData,
  ProjectItem,
  SectionKey,
  SummaryItem,
  TemplateMeta,
  CustomSection,
} from './prodil';

export type PersonalInfo = PersonalData;

export interface LegacyExperience {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  period?: string;
  description?: string;
  bullets?: string[];
}

export interface LegacyEducation {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  gpa?: string;
  achievements?: string;
}

export interface LegacyProject extends Omit<ProjectItem, 'clientOrBrand'> {
  clientOrBrand?: string;
  client?: string;
}

export interface MasterProfile extends Omit<ProdilMasterProfile, 'experiences' | 'educations' | 'projectsAndWorks' | 'languages' | 'achievements' | 'careerObjective'> {
  experiences: LegacyExperience[];
  educations: LegacyEducation[];
  projects: LegacyProject[];
  languages: { name: string; level: string }[];
  certifications?: { name: string; issuer: string; year: string }[];
  achievements?: string[];
  careerObjective?: string;
}

export type LegacySectionKey = CVDocumentConfig['sectionOrder'][number] | 'languages' | 'certifications';

export interface CVDesignConfig {
  id?: number | string;
  title?: string;
  themeId: number;
  accentColor: string;
  fontFamily: string;
  fontSize: 'compact' | 'normal' | 'spacious';
  showPhoto: boolean;
  sectionOrder: LegacySectionKey[];
  hiddenSections: LegacySectionKey[];
  visibleSections: Record<SectionKey, boolean>;
  activeSummaryId: string;
}

export interface CoverLetterData extends Omit<CoverLetterConfig, 'id' | 'title' | 'targetRole' | 'bodyText' | 'templateAccent'> {
  id?: number | string;
  title?: string;
  targetRole?: string;
  bodyText?: string;
  templateAccent?: string;
  recipientTitle: string;
  companyAddress: string;
  jobTitle: string;
  date: string;
  letterBody: string;
  subject: string;
  accentColor: string;
}

export interface CVTemplateMeta extends Omit<TemplateMeta, 'id' | 'category' | 'shortName' | 'defaultAccent' | 'previewBg'> {
  id: number;
  category: 'ATS Clean' | 'Executive' | 'Creative' | 'Modern' | 'Technical';
  description: string;
  badge: string;
  recommendedRole: string;
  previewColor: string;
  shortName?: string;
  defaultAccent?: string;
  previewBg?: string;
}

export type { ProdilMasterProfile };
